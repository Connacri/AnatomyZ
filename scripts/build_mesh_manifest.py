#!/usr/bin/env python3
"""Generate a verified mesh manifest from the Anatria-3D upstream manifests.

This does not copy GLB files into AnatomyZ. It records provenance and exact
upstream model filenames/counts so the app can distinguish ontology concepts
from structures that actually have a 3D mesh.
"""
from __future__ import annotations

import json
import urllib.request
from pathlib import Path

BASE = "https://raw.githubusercontent.com/Connacri/Anatria-3D/main/public/anatomy"
SYSTEM_FILES = {
    "articular": {"male": "articular_male.glb"},
    "cardiovascular": {"male": "cardiovascular_male.glb", "female": "cardiovascular_female.glb"},
    "digestive": {"male": "digestive_male.glb", "female": "digestive_female.glb"},
    "endocrine": {"male": "endocrine_male.glb"},
    "integumentary": {"female": "integumentary_female.glb"},
    "lymphatic": {"male": "lymphatic_male.glb", "female": "lymphatic_female.glb"},
    "muscular": {"male": "muscular_male.glb"},
    "nervous": {"male": "nervous_male.glb"},
    "regional": {"male": "regional_male.glb"},
    "renal": {"male": "renal_male.glb", "female": "renal_female.glb"},
    "reproductive": {"male": "reproductive_male.glb", "female": "reproductive_female.glb"},
    "respiratory": {"male": "respiratory_male.glb"},
    "skeletal": {"male": "skeletal_male.glb", "female": "skeletal_female.glb"},
    "visceral": {"male": "visceral_male.glb"},
}

def fetch_json(name: str) -> dict:
    with urllib.request.urlopen(f"{BASE}/{name}", timeout=60) as response:
        return json.load(response)

def main() -> None:
    out = Path("data/generated")
    out.mkdir(parents=True, exist_ok=True)
    manifests = {
        "male": fetch_json("manifest.json"),
        "female": fetch_json("manifest_female.json"),
    }

    systems = []
    organs = []
    for system, sexes in SYSTEM_FILES.items():
        systems.append({
            "system": system,
            "assets": [
                {
                    "sex": sex,
                    "file": file_name,
                    "url": f"{BASE}/{file_name}",
                }
                for sex, file_name in sexes.items()
            ],
        })

    for sex, manifest in manifests.items():
        for organ in manifest.get("organs", []):
            organs.append({
                "sex": sex,
                "organ_id": organ.get("organ_id", ""),
                "name_en": organ.get("name_en", ""),
                "ta2_latin": organ.get("ta2_latin", ""),
                "system": organ.get("system", ""),
                "mesh_file": organ.get("mesh_file", ""),
                "node": organ.get("node", ""),
                "path": organ.get("path", []),
            })

    result = {
        "version": 1,
        "source": "Connacri/Anatria-3D",
        "source_url": "https://github.com/Connacri/Anatria-3D",
        "mesh_attribution": manifests["male"].get("attribution"),
        "license": manifests["male"].get("license"),
        "systems": systems,
        "organs": organs,
        "organ_counts": {
            sex: [
                {"system": item["system"], "count": item["organ_count"]}
                for item in manifest.get("systems", [])
            ]
            for sex, manifest in manifests.items()
        },
    }
    (out / "anatria_mesh_manifest.json").write_text(
        json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

if __name__ == "__main__":
    main()
