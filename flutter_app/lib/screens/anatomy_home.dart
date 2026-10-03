import 'package:flutter/material.dart';
import 'package:interactive_3d/interactive_3d.dart';

import '../data/anatomy_model_repository.dart';
import '../models/anatomy_system.dart';

class AnatomyHomePage extends StatefulWidget {
  const AnatomyHomePage({super.key});

  @override
  State<AnatomyHomePage> createState() => _AnatomyHomePageState();
}

class _AnatomyHomePageState extends State<AnatomyHomePage> {
  final repository = AnatomyModelRepository();
  final viewerController = Interactive3dController();

  AnatomySex sex = AnatomySex.male;
  AnatomySystem? selectedSystem;
  EntityData? selectedEntity;

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
              const Padding(
                padding: EdgeInsets.all(20),
                child: Text(
                  'ANATOMYZ\n3D HUMAN ANATOMY',
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800),
                ),
              ),
              for (final system in repository.systems)
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
  });

  final AnatomyModelRef model;
  final Interactive3dController controller;
  final EntityData? selectedEntity;
  final ValueChanged<List<EntityData>> onSelectionChanged;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Material(
          child: ListTile(
            title: Text(model.system.nameFr),
            subtitle: Text(
              '${model.system.nameEn} • '
              '${model.sex == AnatomySex.male ? 'Male' : 'Female'}',
            ),
            trailing: IconButton(
              tooltip: 'Reset selection',
              onPressed: () async {
                await controller.clearSelections();
                onSelectionChanged(const []);
              },
              icon: const Icon(Icons.clear_all),
            ),
          ),
        ),
        Expanded(
          child: Interactive3d(
            key: ValueKey(model.url),
            controller: controller,
            modelUrl: model.url,
            defaultZoom: 1.15,
            enableCache: true,
            selectionColor: const [0.1, 0.55, 1.0, 1.0],
            backgroundColor: Colors.black,
            solidBackgroundColor: const [0.025, 0.035, 0.055, 1.0],
            loadingWidget: const Center(
              child: CircularProgressIndicator(),
            ),
            onSelectionChanged: onSelectionChanged,
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
