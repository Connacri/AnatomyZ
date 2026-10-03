# AnatomyZ anatomical catalog

The catalog is intentionally independent from the 3D renderer.

## Two availability states

- Mesh available: the structure can be linked to a named GLTF/GLB entity.
- Catalog only: the anatomical concept exists in the ontology/terminology layer but a local 3D mesh has not yet been integrated.

A future manifest will map catalog_id to exact GLTF node/entity names. This prevents fragile matching based only on translated display names.

## Canonical identifiers

AnatomyZ should prefer stable identifiers from established sources such as FMA, Uberon and Wikidata. Display labels remain bilingual (French/English), while identifiers are language-neutral.

## Search

The Flutter catalog repository already supports accent-insensitive French/English matching and synonyms. The seed entries are deliberately small; production data should be generated from versioned source manifests with provenance and licensing metadata.
