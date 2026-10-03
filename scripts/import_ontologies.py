#!/usr/bin/env python3
"""Build a large AnatomyZ JSONL catalog from public ontology releases.

The generated catalog is deliberately kept outside Flutter source code.
Requires: rdflib
"""

from __future__ import annotations
import argparse, json, re, urllib.request
from pathlib import Path
from rdflib import Graph, URIRef, Literal

FMA_URL = "http://purl.org/sig/ont/fma.owl"
UBERON_URL = "http://purl.obolibrary.org/obo/uberon.owl"

LABEL_PREDICATES = [
    URIRef("http://www.w3.org/2004/02/skos/core#prefLabel"),
    URIRef("http://www.w3.org/2000/01/rdf-schema#label"),
]
SYNONYM_PREDICATES = [
    URIRef("http://www.geneontology.org/formats/oboInOwl#hasExactSynonym"),
    URIRef("http://www.geneontology.org/formats/oboInOwl#hasRelatedSynonym"),
]

def download(url: str, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists() and path.stat().st_size > 0:
        return
    print(f"Downloading {url}")
    urllib.request.urlretrieve(url, path)

def text_values(g: Graph, subject: URIRef, predicates: list[URIRef]) -> list[str]:
    values: list[str] = []
    for predicate in predicates:
        for value in g.objects(subject, predicate):
            if isinstance(value, Literal):
                text = str(value).strip()
                if text and text not in values:
                    values.append(text)
    return values

def local_id(uri: str) -> str:
    match = re.search(r"(?:/|#)(FMA_|UBERON_)([^/#]+)$", uri)
    if match:
        return match.group(1).replace("_", ":") + match.group(2)
    if "#" in uri:
        return uri.rsplit("#", 1)[1]
    return uri.rsplit("/", 1)[-1]

def parse_ontology(path: Path, source: str) -> list[dict]:
    graph = Graph()
    graph.parse(path)
    rows: list[dict] = []
    for subject in graph.subjects():
        if not isinstance(subject, URIRef):
            continue
        labels = text_values(graph, subject, LABEL_PREDICATES)
        if not labels:
            continue
        synonyms = text_values(graph, subject, SYNONYM_PREDICATES)
        rows.append({
            "id": local_id(str(subject)),
            "iri": str(subject),
            "name_en": labels[0],
            "name_fr": "",
            "synonyms_en": synonyms,
            "synonyms_fr": [],
            "system": "unknown",
            "source": source,
            "mesh_available": False,
            "mesh_entity": None,
        })
    return rows

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", default="site/catalog")
    parser.add_argument("--cache", default="data/sources/cache")
    args = parser.parse_args()

    out = Path(args.out)
    cache = Path(args.cache)
    fma_path = cache / "fma.owl"
    uberon_path = cache / "uberon.owl"
    download(FMA_URL, fma_path)
    download(UBERON_URL, uberon_path)

    rows = parse_ontology(fma_path, "FMA 5.1.0")
    rows += parse_ontology(uberon_path, "Uberon")

    rows.sort(key=lambda x: (x["name_en"].lower(), x["id"]))
    out.mkdir(parents=True, exist_ok=True)

    # Build prefix-partitioned chunks so the Flutter client can fetch only
    # the relevant portion of the ontology for a search query.
    prefix_index: dict[str, dict] = {}
    chunk_size = 1000
    grouped: dict[str, list[dict]] = {}
    for row in rows:
        first = next((ch for ch in row["name_en"].lower() if ch.isalnum()), "_")
        grouped.setdefault(first, []).append(row)

    for prefix, prefix_rows in sorted(grouped.items()):
        prefix_dir = out / "prefixes" / prefix
        prefix_dir.mkdir(parents=True, exist_ok=True)
        files = []
        for start in range(0, len(prefix_rows), chunk_size):
            chunk = prefix_rows[start:start + chunk_size]
            name = f"{start // chunk_size:04d}.jsonl"
            with (prefix_dir / name).open("w", encoding="utf-8") as handle:
                for row in chunk:
                    handle.write(json.dumps(row, ensure_ascii=False, separators=(",", ":")) + "\n")
            files.append({"file": f"prefixes/{prefix}/{name}", "count": len(chunk)})
        prefix_index[prefix] = {"count": len(prefix_rows), "chunks": files}

    index = {
        "version": 2,
        "sources": ["FMA 5.1.0", "Uberon"],
        "count": len(rows),
        "chunk_size": chunk_size,
        "prefixes": prefix_index,
    }
    (out / "index.json").write_text(
        json.dumps(index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"Generated {len(rows)} concepts across {sum(len(v['chunks']) for v in prefix_index.values())} chunks.")

if __name__ == "__main__":
    main()
