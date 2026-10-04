import 'dart:convert';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../data/academic_repository.dart';
import '../services/firebase_auth_service.dart';

class ProfileHistoryPage extends StatefulWidget {
  const ProfileHistoryPage({super.key});

  @override
  State<ProfileHistoryPage> createState() => _ProfileHistoryPageState();
}

class _ProfileHistoryPageState extends State<ProfileHistoryPage> {
  final _auth = FirebaseAuthService.instance;
  int _tab = 0;
  bool _photoLoading = false;
  final _picker = ImagePicker();

  Future<void> _pickPhoto() async {
    setState(() => _photoLoading = true);
    try {
      final XFile? file = await _picker.pickImage(source: ImageSource.gallery);
      if (file == null) return;
      final bytes = await file.readAsBytes();
      final ext = (file.name.split('.').last).toLowerCase();
      final dataUrl = 'data:image/${ext == 'png' ? 'png' : 'jpeg'};base64,${base64Encode(bytes)}';
      await _auth.updatePhotoUrl(dataUrl);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur de la photo : $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _photoLoading = false);
    }
  }

  Future<void> _removePhoto() async {
    await _auth.updatePhotoUrl('');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Mon espace')),
      body: Column(
        children: [
          Material(
            color: Theme.of(context).colorScheme.surface,
            child: Row(
              children: [
                Expanded(
                  child: InkWell(
                    onTap: () => setState(() => _tab = 0),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      child: Center(
                        child: Text(
                          'Profil',
                          style: TextStyle(
                            fontWeight: _tab == 0 ? FontWeight.bold : FontWeight.normal,
                            color: _tab == 0
                                ? Theme.of(context).colorScheme.primary
                                : Theme.of(context).colorScheme.onSurface,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
                Expanded(
                  child: InkWell(
                    onTap: () => setState(() => _tab = 1),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      child: Center(
                        child: Text(
                          'Historique & Notes',
                          style: TextStyle(
                            fontWeight: _tab == 1 ? FontWeight.bold : FontWeight.normal,
                            color: _tab == 1
                                ? Theme.of(context).colorScheme.primary
                                : Theme.of(context).colorScheme.onSurface,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: ValueListenableBuilder<AnatomyUser?>(
              valueListenable: _auth.currentUserNotifier,
              builder: (context, user, _) {
                if (user == null) {
                  return const Center(
                    child: Text('Connectez-vous avec Google pour voir votre profil.'),
                  );
                }
                final hasPhoto = user.photoUrl != null && user.photoUrl!.isNotEmpty;
                final photoBlock = Center(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        CircleAvatar(
                          radius: 40,
                          backgroundColor: const Color(0xFF2A323D),
                          backgroundImage: hasPhoto
                              ? MemoryImage(_dataUrlToBytes(user.photoUrl!))
                              : null,
                          child: hasPhoto
                              ? null
                              : Text(
                                  (user.displayName.isNotEmpty
                                          ? user.displayName[0]
                                          : 'U')
                                      .toUpperCase(),
                                  style: const TextStyle(fontSize: 28),
                                ),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            OutlinedButton.icon(
                              onPressed: _photoLoading ? null : _pickPhoto,
                              icon: _photoLoading
                                  ? const SizedBox(
                                      width: 14,
                                      height: 14,
                                      child: CircularProgressIndicator(strokeWidth: 2),
                                    )
                                  : const Icon(Icons.upload_file, size: 16),
                              label: const Text('Choisir une photo'),
                            ),
                            if (hasPhoto) ...[
                              const SizedBox(width: 8),
                              OutlinedButton(
                                onPressed: _removePhoto,
                                child: const Text('Supprimer',
                                    style: TextStyle(color: Colors.redAccent)),
                              ),
                            ],
                          ],
                        ),
                      ],
                    ),
                  ),
                );

                if (_tab == 0) {
                  return ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      photoBlock,
                      const SizedBox(height: 8),
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(user.displayName,
                                  style: const TextStyle(
                                      fontSize: 18, fontWeight: FontWeight.bold)),
                              const SizedBox(height: 4),
                              Text(user.email),
                              const SizedBox(height: 4),
                              Text('Rôle : ${user.role}'),
                              Text('Niveau : ${user.academicYear}'),
                              Text('Spécialité : ${user.specialty}'),
                              Text('Université : ${user.university}'),
                            ],
                          ),
                        ),
                      ),
                    ],
                  );
                }

                final results = AcademicRepository.instance.resultsForStudent(user.uid);
                return Column(
                  children: [
                    photoBlock,
                    Expanded(
                      child: results.isEmpty
                          ? const Center(child: Text('Aucun examen passé pour le moment.'))
                          : ListView.builder(
                              padding: const EdgeInsets.all(16),
                              itemCount: results.length,
                              itemBuilder: (context, index) {
                                final r = results[index];
                                return Card(
                                  child: ListTile(
                                    title: Text('Examen ${r.examId}'),
                                    subtitle: Text(
                                        '${r.submittedAt.toLocal().toIso8601String().substring(0, 10)} · ${r.score}/${r.maxScore}'),
                                    trailing: Text('${r.percentage.toStringAsFixed(0)}%',
                                        style: const TextStyle(
                                            fontWeight: FontWeight.bold)),
                                  ),
                                );
                              },
                            ),
                    ),
                  ],
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Uint8List _dataUrlToBytes(String dataUrl) {
    try {
      final b64 = dataUrl.split(',').last;
      return base64Decode(b64);
    } catch (_) {
      return Uint8List(0);
    }
  }
}
