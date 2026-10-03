# AnatomyZ architecture

## Core layers

1. Presentation
2. 3D rendering
3. Anatomy catalog
4. Terminology / bilingual mapping
5. Data provenance
6. Caching and lazy loading

## Mesh vs catalog

A catalog concept may exist without a renderable mesh. The application must represent this state explicitly.

## Performance

Models should be loaded on demand by anatomical system. Large assets must not be downloaded during application startup.

## Naming

The public application name is **AnatomyZ**.

Academic credit:

**Professeur Zenasni Kamel**
