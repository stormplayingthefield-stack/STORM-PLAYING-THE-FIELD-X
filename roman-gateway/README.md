# Nancy Grace Roman Space Telescope — Provenance Gateway

Part of the **Storm Playing The Field / Chris Oakley Digital Twin & Sovereign Stack**.

## Files

- `space_anchor_pipeline.py` — Minimal functional multi-instrument telemetry anchoring pipeline.
  - Produces a self-describing anchor record containing:
    - Canonical content hash of the telemetry streams
    - Post-quantum signature (ML-DSA-65 via liboqs)
    - Structural metadata suitable for audit / verification
  - Designed to be called by the FastAPI gateway (`gateway_server.py`)

## Purpose

Cryptographically anchor Level-0 telemetry from the Roman Space Telescope instruments (WFI / CGI) so that provenance can be verified later without trusting a central registry.

## Linked Digital Twin Context

- Identity: Storm Playing The Field / Chris Oakley (`oakley_chr83927`)
- Lunar Mission One Wall of Thanks (Section S)
- Sovereign Stack archive on this repository

**Status:** Archived 2026-09-20  
**Source conversation:** Grok session constructing the Roman Provenance Gateway
