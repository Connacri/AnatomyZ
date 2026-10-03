import 'dart:async';

import 'package:flutter/material.dart';
import 'package:interactive_3d/interactive_3d.dart';

import '../data/anatomy_catalog_repository.dart';
import '../data/remote_anatomy_catalog_repository.dart';
import '../data/remote_anatomy_relation_repository.dart';
import '../models/anatomy_relation.dart';
import '../data/anatomy_model_repository.dart';
import '../models/anatomy_structure.dart';
import '../models/anatomy_system.dart';

class AnatomyHomePage extends StatefulWidget {
  const AnatomyHomePage({super.key});

  @override
  State<AnatomyHomePage> createState() => _AnatomyHomePageState();
}

class _AnatomyHomePageState extends State<AnatomyHomePage> {
  final repository = AnatomyModelRepository();
  final catalog = AnatomyCatalogRepository();
  final remoteCatalog = RemoteAnatomyCatalogRepository();
  final relationRepository = RemoteAnatomyRelationRepository();
  final viewerController = Interactive3dController();

  AnatomySex sex = AnatomySex.male;
  AnatomySystem? selectedSystem;
  EntityData? selectedEntity;
  AnatomyStructure? selectedStructure;
  final searchController = TextEditingController();
  final structureSearchController = TextEditingController();
  Timer? _searchDebounce;
  List<AnatomyStructure> _remoteResults = const [];
  bool _remoteLoading = false;
  String? _remoteError;

  @override
  void dispose() {
    searchController.dispose();
    structureSearchController.dispose();
    _searchDebounce?.cancel();
    super.dispose();
  }

  void _searchRemoteStructures(String value) {
    _searchDebounce?.cancel();
    final query = value.trim();
    if (query.length < 2) {
      setState(() {
        _remoteResults = const [];
        _remoteLoading = false;
        _remoteError = null;
      });
      return;
    }
    setState(() {
      _remoteLoading = true;
      _remoteError = null;
    });
    _searchDebounce = Timer(const Duration(milliseconds: 350), () async {
      try {
        final results = await remoteCatalog.search(query);
        if (!mounted || structureSearchController.text.trim() != query) return;
        setState(() {
          _remoteResults = results;
          _remoteLoading = false;
        });
      } catch (error) {
        if (!mounted || structureSearchController.text.trim() != query) return;
        setState(() {
          _remoteResults = const [];
          _remoteLoading = false;
          _remoteError = 'Catalogue distant indisponible';
        });
      }
    });
  }

  List<AnatomyStructure> _structureResults() {
    final query = structureSearchController.text.trim();
    if (query.isEmpty) return const [];
    final local = catalog.search(query);
    final merged = <String, AnatomyStructure>{
      for (final item in local) item.id: item,
      for (final item in _remoteResults) item.id: item,
    };
    return merged.values.take(80).toList(growable: false);
  }

  String? _meshNodeFor(AnatomyStructure structure) {
    for (final variant in structure.meshVariants) {
      if (variant['sex'] == sex.name && (variant['node'] ?? '').isNotEmpty) {
        return variant['node'];
      }
    }
    if (structure.meshSex == sex.name && (structure.meshNode ?? '').isNotEmpty) {
      return structure.meshNode;
    }
    return null;
  }

  void _showStructureSheet(AnatomyStructure structure) {
    showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      builder: (context) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(structure.nameFr,
                  style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800)),
              Text(structure.nameEn,
                  style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 12),
              FutureBuilder<List<AnatomyRelation>>(
                future: relationRepository.forConcept(structure.id),
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const LinearProgressIndicator();
                  }
                  if (snapshot.hasError) {
                    return const Text('Relations anatomiques indisponibles');
                  }
                  final relations = snapshot.data ?? const <AnatomyRelation>[];
                  if (relations.isEmpty) {
                    return const Text('Aucune relation publiée pour cette structure');
                  }
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Relations anatomiques (' + relations.length.toString() + ')',
                        style: Theme.of(context).textTheme.titleSmall,
                      ),
                      const SizedBox(height: 4),
                      ...relations.take(12).map(
                        (relation) => Padding(
                          padding: const EdgeInsets.symmetric(vertical: 2),
                          child: Text(
                            relation.predicate == 'xref'
                                ? relation.predicate + ': ' + relation.object
                                : relation.subject + ' — ' + relation.predicate + ' → ' + relation.object,
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                        ),
                      ),
                      if (relations.length > 12)
                        Text(
                          '+ ' + (relations.length - 12).toString() + ' autres relations',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                    ],
                  );
                },
              ),
              const SizedBox(height: 12),
              Text('ID : ${structure.id}'),
              Text('Système : ${structure.system}'),
              Text('Source : ${structure.source}'),
              const SizedBox(height: 8),
              if (_meshNodeFor(structure) != null)
                Text('Nœud GLB : ${_meshNodeFor(structure)}'),
              Chip(
                avatar: Icon(structure.meshAvailable
                    ? Icons.view_in_ar
                    : Icons.menu_book),
                label: Text(structure.meshAvailable
                    ? 'Structure 3D déclarée'
                    : 'Catalogue uniquement'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final selected = selectedSystem;
    final model = selected == null ? null : repository.modelFor(selected, sex);

    return Scaffold(
      appBar: AppBar(
        title: const Text('AnatomyZ'),
        actions: [
          SegmentedButton<AnatomySex>(
            segments: const [
              ButtonSegment(value: AnatomySex.male, label: Text('♂')),
              ButtonSegment(value: AnatomySex.female, label: Text('♀')),
            ],
            selected: {sex},
            onSelectionChanged: (value) {
              setState(() {
                sex = value.first;
                selectedEntity = null;
                selectedStructure = null;
                if (selectedSystem != null &&
                    !repository.hasModel(selectedSystem!, sex)) {
                  selectedSystem = null;
                }
              });
            },
          ),
          const SizedBox(width: 12),
        ],
      ),
      drawer: Drawer(
        child: SafeArea(
          child: ListView(
            padding: const EdgeInsets.symmetric(vertical: 16),
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
                child: SearchBar(
                  controller: searchController,
                  hintText: 'Rechercher un système…',
                  leading: const Icon(Icons.search),
                  onChanged: (_) => setState(() {}),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 4, 16, 8),
                child: SearchBar(
                  controller: structureSearchController,
                  hintText: 'Rechercher une structure (FR / EN / ID)…',
                  leading: const Icon(Icons.manage_search),
                  onChanged: _searchRemoteStructures,
                ),
              ),
              if (_remoteLoading)
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                  child: LinearProgressIndicator(),
                ),
              if (_remoteError != null)
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 4, 20, 8),
                  child: Text(
                    '$_remoteError • résultats locaux conservés',
                    style: TextStyle(color: Theme.of(context).colorScheme.error),
                  ),
                ),
              if (structureSearchController.text.trim().isNotEmpty)
                ..._structureResults().take(40).map(
                  (structure) => ListTile(
                    leading: Icon(structure.meshAvailable
                        ? Icons.accessibility_new
                        : Icons.menu_book_outlined),
                    title: Text(structure.nameFr),
                    subtitle: Text('${structure.nameEn} • ${structure.id}'),
                    trailing: Icon(structure.meshAvailable
                        ? Icons.view_in_ar_outlined
                        : Icons.info_outline),
                    onTap: () {
                      Navigator.pop(context);
                      setState(() => selectedStructure = structure);
                      _showStructureSheet(structure);
                    },
                  ),
                ),
              const Padding(
                padding: EdgeInsets.all(20),
                child: Text(
                  'ANATOMYZ\n3D HUMAN ANATOMY',
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800),
                ),
              ),
              for (final system in repository.systems.where((system) {
                final q = searchController.text.trim().toLowerCase();
                return q.isEmpty || system.nameFr.toLowerCase().contains(q) || system.nameEn.toLowerCase().contains(q);
              }))
                ListTile(
                  enabled: repository.hasModel(system, sex),
                  leading: Icon(
                    Icons.view_in_ar_outlined,
                    color: repository.hasModel(system, sex)
                        ? null
                        : Theme.of(context).disabledColor,
                  ),
                  title: Text(system.nameFr),
                  subtitle: Text(
                    repository.hasModel(system, sex)
                        ? system.nameEn
                        : '${system.nameEn} • 3D asset unavailable',
                  ),
                  selected: selected == system,
                  onTap: repository.hasModel(system, sex)
                      ? () {
                          Navigator.pop(context);
                          setState(() {
                            selectedSystem = system;
                            selectedEntity = null;
                            selectedStructure = null;
                          });
                        }
                      : null,
                ),
            ],
          ),
        ),
      ),
      body: selected == null || model == null
          ? const _EmptyState()
          : _AnatomyViewer(
              key: ValueKey('${model.system.id}-${model.sex.name}'),
              model: model,
              controller: viewerController,
              selectedEntity: selectedEntity,
              preselectedEntityName: selectedStructure == null
                  ? null
                  : _meshNodeFor(selectedStructure!),
              onSelectionChanged: (entities) {
                setState(() {
                  selectedEntity = entities.isEmpty ? null : entities.last;
                });
              },
            ),
    );
  }
}

class _AnatomyViewer extends StatelessWidget {
  const _AnatomyViewer({
    super.key,
    required this.model,
    required this.controller,
    required this.selectedEntity,
    required this.onSelectionChanged,
    this.preselectedEntityName,
  });

  final AnatomyModelRef model;
  final Interactive3dController controller;
  final EntityData? selectedEntity;
  final ValueChanged<List<EntityData>> onSelectionChanged;
  final String? preselectedEntityName;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Material(
          child: Column(
            children: [
              ListTile(
                title: Text(model.system.nameFr),
                subtitle: Text(
                  '${model.system.nameEn} • '
                  '${model.sex == AnatomySex.male ? 'Male' : 'Female'}',
                ),
                trailing: IconButton(
                  tooltip: 'Réinitialiser',
                  onPressed: () async {
                    await controller.clearSelections();
                    await controller.resetAllMaterialOverrides();
                    onSelectionChanged(const []);
                  },
                  icon: const Icon(Icons.clear_all),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(12, 0, 12, 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    IconButton(
                      tooltip: 'Zoom arrière',
                      onPressed: () => controller.setCameraZoomLevel(0.85),
                      icon: const Icon(Icons.zoom_out),
                    ),
                    IconButton(
                      tooltip: 'Zoom avant',
                      onPressed: () => controller.setCameraZoomLevel(1.35),
                      icon: const Icon(Icons.zoom_in),
                    ),
                  ],
                ),
              ),
              if (selectedEntity != null)
                Padding(
                  padding: const EdgeInsets.fromLTRB(12, 0, 12, 8),
                  child: Wrap(
                    alignment: WrapAlignment.center,
                    spacing: 8,
                    children: [
                      OutlinedButton.icon(
                        icon: const Icon(Icons.visibility_off_outlined),
                        label: const Text('Masquer'),
                        onPressed: () async {
                          final name = selectedEntity!.name;
                          await controller.updatePartGroupConfig(
                            group: ModelPartGroup(title: 'Sélection', names: [name]),
                            isVisible: false,
                          );
                        },
                      ),
                      OutlinedButton.icon(
                        icon: const Icon(Icons.visibility_outlined),
                        label: const Text('Afficher'),
                        onPressed: () async {
                          await controller.updatePartGroupConfig(
                            group: ModelPartGroup(
                              title: 'Sélection',
                              names: [selectedEntity!.name],
                            ),
                            isVisible: true,
                          );
                        },
                      ),
                      OutlinedButton.icon(
                        icon: const Icon(Icons.opacity),
                        label: const Text('Transparence'),
                        onPressed: () async {
                          await controller.setEntityMaterial(
                            name: selectedEntity!.name,
                            color: const [0.15, 0.65, 1.0, 0.35],
                            roughness: 0.7,
                          );
                        },
                      ),
                      OutlinedButton.icon(
                        icon: const Icon(Icons.restore),
                        label: const Text('Matériau original'),
                        onPressed: () => controller.resetEntityMaterial(selectedEntity!.name),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),
        Expanded(
          child: Interactive3d(
            key: ValueKey('${model.url}|${preselectedEntityName ?? ''}'),
            controller: controller,
            modelUrl: model.url,
            preselectedEntities: preselectedEntityName == null
                ? null
                : [preselectedEntityName!],
            defaultZoom: 1.15,
            enableCache: true,
            selectionColor: const [0.1, 0.55, 1.0, 1.0],
            backgroundColor: Colors.black,
            solidBackgroundColor: const [0.025, 0.035, 0.055, 1.0],
            loadingWidget: const Center(
              child: CircularProgressIndicator(),
            ),
            onSelectionChanged: (entities) async {
              if (entities.isNotEmpty) {
                final entity = entities.last;
                await controller.setEntityMaterial(
                  name: entity.name,
                  color: const [0.15, 0.65, 1.0, 1.0],
                  roughness: 0.55,
                );
              }
              onSelectionChanged(entities);
            },
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
          child: AnimatedSwitcher(
            duration: const Duration(milliseconds: 180),
            child: selectedEntity == null
                ? const Text(
                    'Touchez une structure anatomique • pincez pour zoomer • '
                    'glissez pour tourner/déplacer',
                    key: ValueKey('hint'),
                    textAlign: TextAlign.center,
                  )
                : Text(
                    selectedEntity!.name,
                    key: ValueKey(selectedEntity!.id),
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontWeight: FontWeight.w700),
                  ),
          ),
        ),
      ],
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Builder(
        builder: (context) => FilledButton.icon(
          onPressed: () => Scaffold.of(context).openDrawer(),
          icon: const Icon(Icons.category_outlined),
          label: const Text('Explorer les systèmes'),
        ),
      ),
    );
  }
}
