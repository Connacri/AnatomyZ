#!/usr/bin/env python3
"""Fast sync of existing deployed AnatomyZ catalog from GitHub Pages.

Avoids re-running the 40-minute OWL ontology import on UI/web/mobile pushes
when the ontology sources and scripts have not changed.
"""

from __future__ import annotations

import json
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

BASE_URL = "https://connacri.github.io/AnatomyZ/catalog"
OUT_DIR = Path("site/catalog")


def fetch_file(rel_path: str) -> None:
    url = f"{BASE_URL}/{rel_path}"
    dest = OUT_DIR / rel_path
    dest.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(url, headers={"User-Agent": "AnatomyZ-CI/1.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        dest.write_bytes(resp.read())


def main() -> int:
    try:
        print("Syncing existing catalog index from GitHub Pages...")
        fetch_file("index.json")
        fetch_file("mesh-mappings.jsonl")
        fetch_file("relations/index.json")

        index_data = json.loads((OUT_DIR / "index.json").read_text(encoding="utf-8"))
        chunk_files: list[str] = []
        for prefix_info in (index_data.get("prefixes") or {}).values():
            for chunk in prefix_info.get("chunks") or []:
                file_path = chunk.get("file")
                if file_path:
                    chunk_files.append(file_path)

        print(f"Downloading {len(chunk_files)} prefix chunks in parallel...")
        with ThreadPoolExecutor(max_workers=32) as pool:
            futures = [pool.submit(fetch_file, f) for f in chunk_files]
            for fut in as_completed(futures):
                fut.result()

        print("Catalog sync completed in fast mode.")
        return 0
    except Exception as exc:
        print(f"Fast catalog sync unavailable ({exc}), falling back to full build.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
