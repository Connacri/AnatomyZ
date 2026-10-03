# AnatomyZ — architecture pédagogique

AnatomyZ sépare les données, la logique pédagogique et l'interface. Cette organisation suit les recommandations d'architecture Flutter : séparation UI/data, repositories comme source de vérité, ViewModels et flux de données unidirectionnel.

## Domaines

### 1. Espace professeur
- classes
- étudiants
- banque de questions
- examens
- assignations
- calendrier
- correction
- notes
- statistiques
- historique des activités

### 2. Espace étudiant
- classes inscrites
- examens assignés
- résultats et notes
- historique
- progression pédagogique
- parcours recommandés
- révision libre

### 3. Quiz anatomique
Le moteur de quiz doit pouvoir cibler :
- un concept FMA/UBERON ;
- un système anatomique ;
- une région ;
- une relation ("part_of", "has_part", "connected_to", etc.) ;
- un nœud GLB/GLTF ;
- une image ou une vue 3D.

Types prévus :
- QCM ;
- réponse libre ;
- vrai/faux ;
- identification d'une structure 3D ;
- sélection de la bonne structure dans la scène ;
- relation anatomique ;
- question progressive.

### 4. Dissection numérique
Une session de dissection est indépendante du catalogue :
- sélection d'une région ;
- sélection d'un système ;
- isolement d'une structure ;
- masquage/affichage ;
- transparence ;
- exploration couche par couche ;
- caméra mémorisée ;
- annotations ;
- retour à l'état initial.

La session pourra devenir une activité pédagogique enregistrée dans l'historique.

### 5. Navigation relationnelle
Le graphe anatomique relie :
- FMA ;
- UBERON ;
- synonymes ;
- cross-references ;
- relations anatomiques ;
- concepts associés ;
- nœuds GLB/GLTF vérifiés.

Exemple :

"Cœur → part_of → système cardiovasculaire"

puis :

"Cœur → connected_to → gros vaisseaux"

et enfin :

"Cœur → mesh GLB → node vérifié"

Une correspondance lexicale seule ne doit jamais être présentée comme une équivalence sémantique validée.

### 6. Recherche sémantique
La recherche doit combiner :
1. nom français ;
2. nom anglais ;
3. synonymes ;
4. identifiants FMA/UBERON ;
5. cross-references ;
6. système ;
7. relations ;
8. disponibilité du maillage ;
9. correspondance avec un nœud GLB/GLTF.

L'index distant reste partitionné et chargé à la demande pour éviter de charger tout le catalogue en mémoire.

### 7. Parcours pédagogiques
Un parcours est une séquence de compétences :

"objectif → leçon → exploration 3D → dissection → quiz → examen → résultat → recommandation"

Le système pourra calculer les prochaines activités à partir :
- des scores ;
- des erreurs ;
- des structures non maîtrisées ;
- du temps passé ;
- des relations anatomiques étudiées.

## Architecture de données

Repository est la source de vérité de chaque type de donnée. Les implémentations locales actuelles servent de prototype ; elles seront remplacées par une implémentation distante/authentifiée lorsque les comptes professeur/étudiant seront introduits.

UI
 |
 v
ViewModel / commands
 |
 v
Domain / use cases
 |
 +-- AcademicRepository
 +-- ExamRepository
 +-- AnatomyCatalogRepository
 +-- RelationRepository
 +-- SemanticSearchRepository
 +-- LearningPathRepository
 |
 v
Remote / local data sources

## Sécurité des examens

Le mode examen doit rester séparé du mode révision :
- atlas masqué ;
- FLAG_SECURE côté Android ;
- navigation contrôlée ;
- durée ;
- état de tentative ;
- soumission ;
- journalisation ;
- correction séparée.

La protection ne doit pas être présentée comme absolue : un second appareil ou une caméra externe ne peut pas être empêché par l'application.

## Backend

La prochaine étape de production est un backend authentifié pour synchroniser :
- comptes ;
- classes ;
- inscriptions ;
- examens ;
- assignations ;
- tentatives ;
- réponses ;
- résultats ;
- historique ;
- parcours.

Le modèle local actuel permet de construire l'UI et les règles métier sans bloquer le développement sur le backend.
