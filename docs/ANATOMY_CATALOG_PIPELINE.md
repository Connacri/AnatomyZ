# AnatomyZ anatomical catalog pipeline

## Goal

Build the anatomy catalog as a versioned data pipeline rather than embedding a huge ontology directly in Flutter.

## Sources

- **FMA 5.1.0** — BioPortal currently reports 104,721 classes, 168 properties and maximum depth 23.
- **Uberon** — complementary cross-species anatomical vocabulary.
- **Human Reference Atlas (HRA)** — human anatomical and cell-level reference data.
- **FIPAT / Terminologia Anatomica** — controlled anatomical terminology.

## Important distinction

104,721 FMA classes means **catalog concepts**, not 104,721 3D meshes. AnatomyZ must explicitly distinguish:

- catalog-only structure
- verified 3D structure
- verified GLTF entity/node mapping

## Generated production data

Use streamable JSONL artifacts:

```
data/
  sources/
  generated/
    anatomy_catalog.jsonl
    anatomy_relations.jsonl
    anatomy_mesh_map.jsonl
```

Every record should preserve its source identifier, source/version, English preferred label, controlled French label when available, synonyms, relationships, mesh status and GLTF mapping.

## Runtime architecture

Flutter should load:

**search index → structure metadata → verified mesh mapping → GLTF entity → 3D selection**

Large catalogs must be lazy-loaded and indexed; they should not be hard-coded into Dart source.

## Licensing/provenance

Every imported dataset must retain source, version, license and transformation metadata. A source is never assumed to grant rights to redistribute its 3D meshes merely because its terminology is usable.
