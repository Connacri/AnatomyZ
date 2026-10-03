#!/usr/bin/env python3
"""Verify that AnatomyZ mesh mappings point to real GLB nodes.

This validates the physical mapping (concept -> upstream manifest -> GLB node).
It does not claim semantic equivalence beyond the mapping evidence already stored
by the ontology importer.
"""

from __future__ import annotations

import json
import struct
import urllib.request
from pathlib import Path

BASE = "https://raw.githubusercontent.com/Connacri/Anatria-3D/main/public/anatomy"


def glb_nodes(url: str) -> set[str]:
    with urllib.request.urlopen(url, timeout=120) as response:
        data = response.read()

    if len(data) < 12 or data[:4] != b"glTF":
        raise ValueError(f"Invalid GLB header: {url}")

    offset = 12
    while offset + 8 <= len(data):
        length, chunk_type = struct.unpack_from("<II", data, offset)
        offset += 8
        chunk = data[offset:offset + length]
        offset += length
        if chunk_type == 0x4E4F534A:
            document = json.loads(chunk.decode("utf-8"))
            return {
                node["name"]
                for node in document.get("nodes", [])
                if isinstance(node, dict) and isinstance(node.get("name"), str)
            }

    raise ValueError(f"GLB JSON chunk not found: {url}")


def main() -> None:
    catalog = Path("site/catalog")
    output = catalog / "mesh-mappings.jsonl"
    cache: dict[str, set[str]] = {}
    rows: list[dict] = []

    for path in sorted((catalog / "prefixes").glob("*/*.jsonl")):
        for line in path.read_text(encoding="utf-8").splitlines():
            if not line.strip():
                continue
            concept = json.loads(line)
            for variant in concept.get("mesh_variants", []):
                mesh_file = variant.get("mesh_file", "")
                node = variant.get("node", "")
                if not mesh_file or not node:
                    continue

                url = f"{BASE}/{mesh_file}"
                try:
                    nodes = cache.setdefault(url, glb_nodes(url))
                    node_verified = node in nodes
                    error = None
                except Exception as exc:
                    node_verified = False
                    error = str(exc)

                rows.append({
                    "concept_id": concept.get("id", ""),
                    "concept_name_en": concept.get("name_en", ""),
                    "concept_name_fr": concept.get("name_fr", ""),
                    "source": concept.get("source", ""),
                    "sex": variant.get("sex", ""),
                    "mesh_file": mesh_file,
                    "node": node,
                    "match_type": variant.get("match_type", ""),
                    "confidence": variant.get("confidence", 0.0),
                    "node_verified": node_verified,
                    "verification": "glb_node_exists" if node_verified else "unverified",
                    "error": error,
                    "provenance": variant.get(
                        "provenance", "Connacri/Anatria-3D manifest"
                    ),
                })

    output.write_text(
        "".join(
            json.dumps(row, ensure_ascii=False, separators=(",", ":")) + "\n"
            for row in rows
        ),
        encoding="utf-8",
    )

    verified = sum(1 for row in rows if row["node_verified"])
    print(f"Verified {verified}/{len(rows)} mesh node mappings.")


if __name__ == "__main__":
    main()
