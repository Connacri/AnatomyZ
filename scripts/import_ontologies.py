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
        xrefs = text_values(graph, subject, [URIRef("http://www.geneontology.org/formats/oboInOwl#hasDbXref")])
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
            "xrefs": xrefs,
        })
    return rows

RELATION_NAMES = {
    "subClassOf": "is_a",
    "part_of": "part_of",
    "has_part": "has_part",
    "develops_from": "develops_from",
    "derives_from": "derives_from",
    "connected_to": "connected_to",
    "regional_part_of": "regional_part_of",
}


def relation_rows(path: Path, source: str) -> list[dict]:
    graph = Graph()
    graph.parse(path)
    rows: list[dict] = []
    for subject in graph.subjects():
        if not isinstance(subject, URIRef):
            continue
        subject_id = local_id(str(subject))
        for predicate, object_ in graph.predicate_objects(subject):
            if not isinstance(object_, URIRef):
                continue
            local = str(predicate).rsplit("#", 1)[-1].rsplit("/", 1)[-1]
            relation = RELATION_NAMES.get(local)
            if relation is None:
                continue
            rows.append({
                "source": source,
                "subject": subject_id,
                "predicate": relation,
                "object": local_id(str(object_)),
                "subject_iri": str(subject),
                "object_iri": str(object_),
            })
    return rows


def crossref_rows(rows: list[dict]) -> list[dict]:
    result: list[dict] = []
    for row in rows:
        for xref in row.get("xrefs", []):
            if xref.startswith("FMA:") or xref.startswith("UBERON:"):
                result.append({
                    "source": row["source"],
                    "subject": row["id"],
                    "predicate": "xref",
                    "object": xref,
                })
    return result

def normalize(value: str) -> str:
    return re.sub(r"\s+", " ", value.lower().strip())


def mesh_terms(organ: dict) -> set[str]:
    terms = {
        normalize(organ.get("name_en", "")),
        normalize(organ.get("ta2_latin", "")),
        normalize(organ.get("organ_id", "")),
        normalize(organ.get("node", "")),
    }
    return {term for term in terms if term}


def ontology_terms(row: dict) -> set[str]:
    terms = {
        normalize(row.get("name_en", "")),
        normalize(row.get("name_fr", "")),
        normalize(row.get("id", "")),
    }
    terms.update(normalize(value) for value in row.get("synonyms_en", []))
    terms.update(normalize(value) for value in row.get("synonyms_fr", []))
    terms.update(normalize(value) for value in row.get("xrefs", []))
    return {term for term in terms if term}


def load_mesh_index(path: Path) -> dict[str, list[dict]]:
    if not path.exists():
        return {}
    payload = json.loads(path.read_text(encoding="utf-8"))
    index: dict[str, list[dict]] = {}
    for organ in payload.get("organs", []):
        for term in mesh_terms(organ):
            index.setdefault(term, []).append(organ)
    return index


def enrich_mesh(rows: list[dict], mesh_index: dict[str, list[dict]]) -> None:
    """Attach only lexical mesh candidates; preserve match provenance.

    Exact ontology xrefs/IDs are treated as stronger evidence than names.
    A name-only match is marked lexical and is never presented as an
    authoritative ontology equivalence.
    """
    for row in rows:
        candidates: dict[tuple[str, str, str], dict] = {}
        row_terms = ontology_terms(row)
        for term in row_terms:
            for match in mesh_index.get(term, []):
                mesh_terms_set = mesh_terms(match)
                if term in {
                    normalize(row.get("id", "")),
                    *(normalize(value) for value in row.get("xrefs", [])),
                }:
                    match_type = "ontology_xref"
                    confidence = 1.0
                elif term == normalize(row.get("name_en", "")):
                    match_type = "exact_name"
                    confidence = 0.90
                else:
                    match_type = "synonym"
                    confidence = 0.80

                key = (
                    match.get("sex", ""),
                    match.get("mesh_file", ""),
                    match.get("node", ""),
                )
                candidate = {
                    "sex": match.get("sex", ""),
                    "mesh_file": match.get("mesh_file", ""),
                    "node": match.get("node", ""),
                    "match_type": match_type,
                    "confidence": confidence,
                    "matched_term": term,
                    "provenance": "Connacri/Anatria-3D manifest",
                }
                existing = candidates.get(key)
                if existing is None or confidence > existing["confidence"]:
                    candidates[key] = candidate

        if candidates:
            matched_systems = {
                match.get("system", "")
                for term in row_terms
                for match in mesh_index.get(term, [])
                if match.get("system", "")
            }
            if row.get("system") == "unknown" and len(matched_systems) == 1:
                row["system"] = next(iter(matched_systems))
            variants = sorted(
                candidates.values(),
                key=lambda item: (-item["confidence"], item["sex"], item["node"]),
            )
            row["mesh_available"] = True
            row["mesh_variants"] = variants
            row["mesh_mapping_status"] = (
                "verified_xref" if variants[0]["match_type"] == "ontology_xref"
                else "lexical_candidate"
            )

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

    fma_rows = parse_ontology(fma_path, "FMA 5.1.0")
    uberon_rows = parse_ontology(uberon_path, "Uberon")
    rows = fma_rows + uberon_rows
    relations = relation_rows(fma_path, "FMA 5.1.0") + relation_rows(uberon_path, "Uberon")
    relations += crossref_rows(rows)

    mesh_index = load_mesh_index(Path("data/generated/anatria_mesh_manifest.json"))
    enrich_mesh(rows, mesh_index)
    rows.sort(key=lambda x: (x["name_en"].lower(), x["id"]))
    out.mkdir(parents=True, exist_ok=True)
    relations_dir = out / "relations"
    relations_dir.mkdir(parents=True, exist_ok=True)
    with (relations_dir / "all.jsonl").open("w", encoding="utf-8") as handle:
        for relation in relations:
            handle.write(json.dumps(relation, ensure_ascii=False, separators=(",", ":")) + "\n")

    # Build endpoint-indexed relation chunks. Each concept points to one small
    # JSONL chunk, so Flutter never needs to download the complete relation graph.
    adjacency: dict[str, list[dict]] = {}
    for relation in relations:
        adjacency.setdefault(relation["subject"], []).append(relation)
        if relation["object"] != relation["subject"]:
            inverse = dict(relation)
            inverse["direction"] = "inverse"
            adjacency.setdefault(relation["object"], []).append(inverse)

    relation_index: dict[str, dict] = {}
    relation_rows_sorted = sorted(adjacency.items())
    relation_chunk_size = 250
    for start in range(0, len(relation_rows_sorted), relation_chunk_size):
        chunk = relation_rows_sorted[start:start + relation_chunk_size]
        name = f"{start // relation_chunk_size:05d}.jsonl"
        with (relations_dir / name).open("w", encoding="utf-8") as handle:
            for concept_id, concept_relations in chunk:
                handle.write(json.dumps({
                    "concept": concept_id,
                    "relations": concept_relations,
                }, ensure_ascii=False, separators=(",", ":")) + "\n")
                relation_index[concept_id] = {
                    "file": f"relations/{name}",
                    "count": len(concept_relations),
                }

    (out / "relations" / "index.json").write_text(
        json.dumps({
            "version": 1,
            "concept_count": len(relation_index),
            "chunk_size": relation_chunk_size,
            "concepts": relation_index,
        }, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

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
        "version": 3,
        "sources": ["FMA 5.1.0", "Uberon"],
        "count": len(rows),
        "relation_count": len(relations),
        "chunk_size": chunk_size,
        "prefixes": prefix_index,
    }
    (out / "index.json").write_text(
        json.dumps(index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"Generated {len(rows)} concepts across {sum(len(v['chunks']) for v in prefix_index.values())} chunks.")

if __name__ == "__main__":
    main()
