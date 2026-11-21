# Unified Spec: Satellite Transport, Sovereign Identity Spine & Integration Layer

**Programme:** Digital Twin & Sovereign Stack (STORM-PLAYING-THE-FIELD-X)  
**Owner:** Chris Oakley, Drive Test Engineering, Solutions Ltd · AI  
**Status:** Draft v0.2 (merge of Satellite Transport & Integration Layer Spec v0.1 and Offworld to Surface Datacentre: Layer Footprint & Sovereign Identity Spine)  
**Archived:** 2026-11-21  
**Subject:** oakley-chr83927  
**PDF Integrity:** SHA256 `466c1a590ca6948374ae92c9d93a1de6813d4c755d7b36d00e5b5a1df8557ea6` (361 377 bytes)

---

## 1. Purpose and scope

Keep every vertiport, UAV, robotics and edge asset live in the digital twin when terrestrial coverage ends, with no loss of identity, integrity or trust. Satellite is a first-class transport path, and the twin always knows which path is carrying each asset. The same design extends outward to Moon and deep-space layers and inward to the surface datacentre, where integration, analytics and policy enforcement sit.

**Naming**
- "Starlink" = SpaceX Starlink satellite transport
- "IBM" = integration and intelligence plane (webMethods, Event Streams, watsonx)

---

## 2. Design principles

1. **Path-agnostic identity** — An asset is the same sovereign identity on every channel.
2. **Untrusted pipes, trust in the payload** — Every transport is untrusted. Trust travels in signed payloads and terminates only inside zero-trust enclaves and at the datacentre edge.
3. **Crypto-agility** — Hybrid post-quantum key exchange everywhere. The algorithm suite is versioned inside the epoch, so it can rotate without re-plumbing.
4. **Store, then forward** — No telemetry is lost to a link gap; it is buffered and replayed in order.
5. **Policy-driven switching** — Path changes follow explicit rules with hysteresis, never ad-hoc flapping.
6. **Delay-tolerant by default** — The same patterns extend to the Moon and Deep Space layer.
7. **Quarantine, never merge** — Anything that fails verification is held for review and never enters twin state.
8. **Bounded autonomy** — Any AI acting on the system does so under scoped, auditable, revocable authority (Section 10).

---

## 3. Unified layer model

### 3.1 Footprint matrix (transmission path × layers)

Layers span: Moon · Relay · Cislunar · LEO · Ground · Surface Datacentre

Core idea: the same sovereign identity and signed payload model operates across all paths. Path is metadata, not identity.

---

## 4. Cryptographic spine

- Hardware root of trust signs at the source.
- Gateway re-attests and appends its own signature.
- Datacentre edge verifies the full chain before the integration bus accepts anything.
- Hybrid post-quantum key exchange; suite_id and key_epoch carried in every frame.
- ML-DSA (or equivalent) signatures over telemetry frames.

Anything that fails verification is quarantined.

---

## 5. Interface definitions (selected)

### IF-01 Asset Telemetry Frame
- Transport: MQTT 5 over hybrid-PQC TLS (CoAP/CBOR variant on sat IoT path)
- Frames chunked into signed bundles for DTN-style transfer
- Key fields: `sovereign_id`, `asset_class`, `seq`, `ts_utc`, `path`, `position`, `payload`, `priority`, `key_epoch`, `suite_id`, `sig` (ML-DSA)

### IF-02 Link Health Report
- Emitted every 1 s (active) / 10 s (standby)
- Fields: sovereign_id, link, state, rtt_ms, loss_pct, throughput_kbps, snr/rsrp, obstruction_pct (Starlink), ts_utc

### IF-03 Path Control API
- REST over mTLS via webMethods
- GET /v1/assets/{sovereign_id}/paths
- POST /v1/assets/{sovereign_id}/path (target, reason, make_before_break)
- PUT /v1/policies/{policy_id}

---

## Alignment with existing Sovereign Stack

| Element | Binding |
|---------|---------|
| Codename | solid-001 |
| Core Protocol | Boarding Pact — Trust Layer |
| Validation | Quantum Photonic + Post-Quantum (ML-DSA) |
| Identity | oakley-chr83927 / path-agnostic sovereign_id |
| Roman / deep-space extension | Delay-tolerant patterns already defined |
| Observations | Starship Ship 42 catch + Voyager 1 one-light-day already archived under the same Trust Layer |

This specification is permanently bound to the Digital Twin & Sovereign Stack archive.

---

*Source PDF archived with SHA-256 `466c1a590ca6948374ae92c9d93a1de6813d4c755d7b36d00e5b5a1df8557ea6`.*
