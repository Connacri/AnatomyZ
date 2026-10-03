# AnatomyZ

An ultra-complete native 3D human anatomy atlas for Android and Web.

## Vision

AnatomyZ is designed as a professional educational anatomy platform combining interactive 3D models, a structured anatomical catalog, bilingual terminology, and a scalable data architecture.

**Application:** AnatomyZ  
**Academic credit:** Professeur Zenasni Kamel

## Goals

- Native Flutter Android application
- Interactive GLB/GLTF anatomy
- Male and female anatomy
- Smooth camera controls and structure selection
- Per-structure visibility and transparency
- Anatomical search
- French / English terminology
- Lazy loading and caching
- Extensible anatomical ontology/catalog
- APK and AAB CI builds
- Web deployment through GitHub Pages

## Architecture

```
AnatomyZ/
├── flutter_app/          # Native Flutter application
├── web/                  # Web atlas
├── data/                 # Anatomical metadata and mappings
├── docs/                 # Technical and anatomical documentation
├── .github/workflows/    # CI/CD
└── README.md
```

## Anatomical data

The project is designed to integrate validated public anatomical resources and to keep provenance and licensing explicit for every dataset.

Potential reference resources include FMA, Uberon, FIPAT Terminologia Anatomica, Human Reference Atlas, Wikidata and compatible openly licensed 3D assets.

A distinction is maintained between:

- structures that have an available 3D mesh;
- anatomical concepts available only as catalog/ontology entries.

The catalog must never invent a 3D representation where no compatible mesh exists.

## Disclaimer

AnatomyZ is an educational and visualization project. It is not a substitute for professional medical training, diagnosis or clinical advice.

## License

The license of each integrated dataset and model must be respected independently. Project code and bundled assets will receive explicit licensing information as the architecture is finalized.
