"""
space_anchor_pipeline.py
Minimal but functional multi-instrument telemetry anchoring for the
Nancy Grace Roman Space Telescope Provenance Gateway.

Produces a self-describing anchor record containing:
  - Canonical content hash of the telemetry
  - Post-quantum signature (ML-DSA-65 or whatever alg the caller supplies)
  - Structural metadata suitable for audit / verification
"""

from __future__ import annotations

import hashlib
import json
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List

import base64


def _canonical_json(obj: Any) -> bytes:
    """Deterministic JSON serialization used for hashing and signing."""
    return json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")


def _sha256_hex(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def space_anchor_multi_instrument(
    instruments_telemetry: List[Dict[str, Any]],
    payload_mass_kg: float,
    body: str,
    signer,          # oqs.Signature instance (already has a keypair)
    sig_alg: str,
) -> Dict[str, Any]:
    """
    Build a cryptographically anchored provenance record for one or more
    instrument telemetry streams.

    Parameters
    ----------
    instruments_telemetry :
        List of dicts, each containing at least:
            - instrument_name (str)
            - raw_stream_bytes (bytes)
            - data_level (str)
            - exposure_time_sec (float)
            - filter_or_mask (str)
    payload_mass_kg : float
        Spacecraft / payload mass in kilograms.
    body : str
        Target body or reference frame (e.g. "sun", "L2").
    signer :
        An initialized oqs.Signature object that already holds a keypair.
    sig_alg : str
        Algorithm identifier (e.g. "ML-DSA-65").

    Returns
    -------
    dict
        Complete anchor record ready for audit logging and API response.
        Raw telemetry bytes are intentionally omitted; only their hashes
        are retained so the record stays compact and safe to return.
    """
    if not instruments_telemetry:
        raise ValueError("At least one instrument telemetry entry is required.")

    # ------------------------------------------------------------------
    # 1. Per-instrument digests (never put raw bytes into the final record)
    # ------------------------------------------------------------------
    instrument_summaries = []
    combined_hasher = hashlib.sha256()

    for idx, inst in enumerate(instruments_telemetry):
        raw = inst.get("raw_stream_bytes")
        if not isinstance(raw, (bytes, bytearray)):
            raise ValueError(f"Instrument[{idx}] missing or invalid raw_stream_bytes")

        stream_hash = _sha256_hex(raw)
        combined_hasher.update(raw)          # order-preserving aggregate
        combined_hasher.update(b"|")         # separator

        summary = {
            "instrument_name": inst["instrument_name"],
            "data_level": inst.get("data_level", "Level_0"),
            "exposure_time_sec": float(inst["exposure_time_sec"]),
            "filter_or_mask": inst.get("filter_or_mask", "UNKNOWN"),
            "stream_sha256": stream_hash,
            "stream_size_bytes": len(raw),
        }
        instrument_summaries.append(summary)

    aggregate_content_hash = combined_hasher.hexdigest()

    # ------------------------------------------------------------------
    # 2. Build the canonical payload that will be signed
    # ------------------------------------------------------------------
    now = datetime.now(timezone.utc)
    anchor_id = str(uuid.uuid4())

    signable_payload = {
        "anchor_id": anchor_id,
        "created_at": now.isoformat(),
        "target_body": body,
        "payload_mass_kg": float(payload_mass_kg),
        "aggregate_content_sha256": aggregate_content_hash,
        "instruments": instrument_summaries,
        "sig_alg": sig_alg,
    }

    # ------------------------------------------------------------------
    # 3. Sign the canonical form
    # ------------------------------------------------------------------
    message = _canonical_json(signable_payload)
    try:
        signature_bytes = signer.sign(message)
    except Exception as exc:
        raise RuntimeError(f"PQC signing failed: {exc}") from exc

    signature_b64 = base64.b64encode(signature_bytes).decode("ascii")

    # ------------------------------------------------------------------
    # 4. Assemble the final anchor record returned to the caller
    # ------------------------------------------------------------------
    # Note: mission_metadata is attached by the gateway *after* this
    # function returns, so it is deliberately not present here.
    anchor_record = {
        **signable_payload,
        "signature": signature_b64,
        "signature_encoding": "base64",
        "message_sha256": _sha256_hex(message),   # hash of the exact bytes that were signed
        "status": "anchored",
    }

    return anchor_record
