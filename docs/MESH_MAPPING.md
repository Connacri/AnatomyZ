# AnatomyZ mesh mapping

AnatomyZ separates four kinds of evidence:

1. **Ontology evidence** — FMA/UBERON identifiers, xrefs and relations.
2. **Lexical evidence** — exact English names or synonyms matching the upstream mesh manifest.
3. **Physical verification** — the referenced node actually exists in the GLB scene.
4. **Semantic verification** — a reviewed mapping asserts that the ontology concept and GLB node represent the same anatomical structure.

Only a semantic review entry in `data/sources/mesh_mappings.jsonl` can produce `manual_verified` / `expert_verified`.

The verification pipeline therefore never upgrades a name match to an expert equivalence automatically.

## Mapping record

```json
{"concept_id":"FMA:...","sex":"male","mesh_file":"cardiovascular_male.glb","node":"...","match_type":"manual_verified","confidence":1.0,"semantic_status":"expert_verified","provenance":"..."}
```

## Verification lifecycle

```
FMA / UBERON
    |
    +-- xrefs / relations
    |
AnatomyZ concept
    |
    +-- lexical candidate
    |
Anatria manifest
    |
    +-- exact GLB node check
    |
    +-- optional expert/manual review
    |
VERIFIED MAPPING
```

This distinction is intentional: a GLB node can exist while its semantic identity is still uncertain.
