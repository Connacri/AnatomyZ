# AnatomyZ anatomical catalog pipeline

AnatomyZ uses a generated, versioned ontology catalog instead of embedding thousands of concepts in Dart.

## Sources

- FMA 5.1.0
- Uberon

The current FMA release indexed by BioPortal contains 104,721 classes. This is **catalog scale**, not a claim that AnatomyZ has 104,721 3D meshes.

## Build

```bash
python -m pip install -r scripts/requirements.txt
python scripts/import_ontologies.py
```

Output:

```
site/catalog/index.json
site/catalog/0000.jsonl
site/catalog/0001.jsonl
...
```

The catalog is chunked into 1,000 records per file so the future mobile client can load only the required portions.

## Record contract

Each record contains:

- source identifier and IRI
- English preferred label
- French label when a controlled mapping exists
- synonyms
- source/version
- mesh availability
- verified GLTF entity mapping

A concept without a verified mesh remains searchable as **catalog-only**.

## Licensing and provenance

FMA and Uberon are terminology/ontology sources; their metadata and licensing must remain attached to generated data. A terminology license does not automatically grant redistribution rights for third-party 3D meshes.

3D assets therefore require a separate provenance and license record.
