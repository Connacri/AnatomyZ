import 'package:flutter/material.dart';

import '../data/anatomy_model_repository.dart';
import '../models/anatomy_system.dart';

class AnatomyHomePage extends StatefulWidget {
  const AnatomyHomePage({super.key});

  @override
  State<AnatomyHomePage> createState() => _AnatomyHomePageState();
}

class _AnatomyHomePageState extends State<AnatomyHomePage> {
  final repository = AnatomyModelRepository();
  AnatomySex sex = AnatomySex.male;
  AnatomySystem? selectedSystem;

  @override
  Widget build(BuildContext context) {
    final selected = selectedSystem;
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
            onSelectionChanged: (value) => setState(() => sex = value.first),
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
                  leading: const Icon(Icons.view_in_ar_outlined),
                  title: Text(system.nameFr),
                  subtitle: Text(system.nameEn),
                  selected: selected == system,
                  onTap: () {
                    Navigator.pop(context);
                    setState(() => selectedSystem = system);
                  },
                ),
            ],
          ),
        ),
      ),
      body: selected == null
          ? Center(
              child: FilledButton.icon(
                onPressed: () => Scaffold.of(context).openDrawer(),
                icon: const Icon(Icons.category_outlined),
                label: const Text('Explore systems'),
              ),
            )
          : _SystemPlaceholder(
              system: selected,
              sex: sex,
              url: repository.modelFor(selected, sex).url,
            ),
    );
  }
}

class _SystemPlaceholder extends StatelessWidget {
  const _SystemPlaceholder({
    required this.system,
    required this.sex,
    required this.url,
  });

  final AnatomySystem system;
  final AnatomySex sex;
  final String url;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        ListTile(
          title: Text(system.nameFr),
          subtitle: Text(
            '${system.nameEn} • ${sex == AnatomySex.male ? 'Male' : 'Female'}',
          ),
        ),
        const Expanded(
          child: Center(
            child: Text(
              '3D viewer module ready for integration.\n'
              'The model is loaded only when this system is opened.',
              textAlign: TextAlign.center,
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.all(12),
          child: Text(url, textAlign: TextAlign.center),
        ),
      ],
    );
  }
}
