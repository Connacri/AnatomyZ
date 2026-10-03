import 'package:flutter/material.dart';

import '../data/anatomy_question_bank_repository.dart';
import '../data/exam_repository.dart';
import '../models/anatomy_exam.dart';

class ProfessorExamEditor extends StatefulWidget {
  const ProfessorExamEditor({super.key, this.showExisting = false});
  final bool showExisting;

  @override
  State<ProfessorExamEditor> createState() => _ProfessorExamEditorState();
}

class _ProfessorExamEditorState extends State<ProfessorExamEditor> {
  final titleController = TextEditingController();
  final descriptionController = TextEditingController();
  final questionController = TextEditingController();
  final answerController = TextEditingController();
  final optionsController = TextEditingController();
  final conceptIdController = TextEditingController();
  final conceptFrController = TextEditingController();
  final conceptEnController = TextEditingController();
  final meshFileController = TextEditingController();
  final meshNodeController = TextEditingController();

  ExamQuestionType type = ExamQuestionType.quiz;
  int correctIndex = 0;
  final questions = <AnatomyExamQuestion>[];

  @override
  void dispose() {
    titleController.dispose();
    descriptionController.dispose();
    questionController.dispose();
    answerController.dispose();
    optionsController.dispose();
    conceptIdController.dispose();
    conceptFrController.dispose();
    conceptEnController.dispose();
    meshFileController.dispose();
    meshNodeController.dispose();
    super.dispose();
  }

  void _addQuestion() {
    final text = questionController.text.trim();
    if (text.isEmpty) return;

    final options = optionsController.text
        .split(';')
        .map((e) => e.trim())
        .where((e) => e.isNotEmpty)
        .toList(growable: false);

    if (type == ExamQuestionType.quiz && options.length < 2) return;
    if (type == ExamQuestionType.identify3d &&
        (conceptIdController.text.trim().isEmpty ||
            meshFileController.text.trim().isEmpty ||
            meshNodeController.text.trim().isEmpty)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Une question 3D exige concept ID, fichier GLB et nœud.'),
        ),
      );
      return;
    }

    setState(() {
      questions.add(
        AnatomyExamQuestion(
          id: 'q${questions.length + 1}',
          text: text,
          type: type,
          options: type == ExamQuestionType.quiz ? options : const [],
          correctOptionIndex: type == ExamQuestionType.quiz
              ? correctIndex.clamp(0, options.length - 1)
              : null,
          expectedAnswer: type == ExamQuestionType.question
              ? answerController.text.trim()
              : null,
          conceptId: conceptIdController.text.trim().isEmpty
              ? null
              : conceptIdController.text.trim(),
          conceptNameFr: conceptFrController.text.trim().isEmpty
              ? null
              : conceptFrController.text.trim(),
          conceptNameEn: conceptEnController.text.trim().isEmpty
              ? null
              : conceptEnController.text.trim(),
          meshFile: type == ExamQuestionType.identify3d
              ? meshFileController.text.trim()
              : null,
          meshNode: type == ExamQuestionType.identify3d
              ? meshNodeController.text.trim()
              : null,
          points: type == ExamQuestionType.identify3d ? 2 : 1,
        ),
      );
      _clearQuestionForm();
    });
  }

  void _clearQuestionForm() {
    questionController.clear();
    answerController.clear();
    optionsController.clear();
    conceptIdController.clear();
    conceptFrController.clear();
    conceptEnController.clear();
    meshFileController.clear();
    meshNodeController.clear();
    correctIndex = 0;
  }

  void _importBankQuestion(AnatomyExamQuestion question) {
    setState(() => questions.add(question));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Question ajoutée : ${question.conceptNameFr ?? question.text}')),
    );
  }

  void _saveExam() {
    if (titleController.text.trim().isEmpty || questions.isEmpty) return;

    AnatomyExamRepository.instance.add(
      AnatomyExam(
        id: 'exam-${DateTime.now().millisecondsSinceEpoch}',
        title: titleController.text.trim(),
        description: descriptionController.text.trim(),
        questions: List.unmodifiable(questions),
        hideAnatomy: true,
      ),
    );

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Examen publié en mode sécurisé.')),
    );
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final existing = AnatomyExamRepository.instance.exams;
    final bank = AnatomyQuestionBankRepository.instance.all;

    return Scaffold(
      appBar: AppBar(title: const Text('Créateur d’examen')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          TextField(
            controller: titleController,
            decoration: const InputDecoration(labelText: 'Titre'),
          ),
          TextField(
            controller: descriptionController,
            decoration: const InputDecoration(labelText: 'Description'),
          ),
          const SizedBox(height: 20),
          SegmentedButton<ExamQuestionType>(
            segments: const [
              ButtonSegment(
                value: ExamQuestionType.quiz,
                label: Text('QCM'),
              ),
              ButtonSegment(
                value: ExamQuestionType.question,
                label: Text('Libre'),
              ),
              ButtonSegment(
                value: ExamQuestionType.identify3d,
                label: Text('3D'),
              ),
            ],
            selected: {type},
            onSelectionChanged: (value) => setState(() => type = value.first),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: questionController,
            maxLines: 3,
            decoration: const InputDecoration(
              labelText: 'Question',
              border: OutlineInputBorder(),
            ),
          ),
          if (type == ExamQuestionType.quiz)
            TextField(
              controller: optionsController,
              decoration: const InputDecoration(
                labelText: 'Choix séparés par ;',
              ),
            ),
          if (type == ExamQuestionType.question)
            TextField(
              controller: answerController,
              decoration: const InputDecoration(
                labelText: 'Réponse attendue (optionnelle)',
              ),
            ),
          if (type == ExamQuestionType.identify3d) ...[
            const SizedBox(height: 12),
            const Text(
              'Cible anatomique',
              style: TextStyle(fontWeight: FontWeight.w700),
            ),
            TextField(
              controller: conceptIdController,
              decoration: const InputDecoration(
                labelText: 'ID FMA / UBERON',
                hintText: 'ex. FMA:55675',
              ),
            ),
            TextField(
              controller: conceptFrController,
              decoration: const InputDecoration(labelText: 'Nom français'),
            ),
            TextField(
              controller: conceptEnController,
              decoration: const InputDecoration(labelText: 'Nom anglais'),
            ),
            TextField(
              controller: meshFileController,
              decoration: const InputDecoration(
                labelText: 'Fichier GLB',
                hintText: 'ex. cardiovascular_male.glb',
              ),
            ),
            TextField(
              controller: meshNodeController,
              decoration: const InputDecoration(
                labelText: 'Nœud GLB vérifié',
                hintText: 'nom exact du nœud glTF/GLB',
              ),
            ),
            const Padding(
              padding: EdgeInsets.only(top: 8),
              child: Text(
                'Le nœud doit provenir d’un mapping physiquement vérifié ; '
                'la vérification physique ne suffit pas à prouver l’équivalence '
                'sémantique.',
                style: TextStyle(fontSize: 12),
              ),
            ),
          ],
          const SizedBox(height: 8),
          if (type == ExamQuestionType.quiz)
            DropdownButtonFormField<int>(
              initialValue: correctIndex,
              decoration: const InputDecoration(labelText: 'Bonne réponse'),
              items: List.generate(
                6,
                (i) => DropdownMenuItem(
                  value: i,
                  child: Text('Choix ${i + 1}'),
                ),
              ),
              onChanged: (value) => setState(() => correctIndex = value ?? 0),
            ),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            onPressed: _addQuestion,
            icon: const Icon(Icons.add),
            label: const Text('Ajouter la question'),
          ),
          const Divider(height: 32),
          const Text(
            'Banque de questions',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          const Text(
            'Questions déjà liées à des concepts FMA/UBERON.',
          ),
          ...bank.map(
            (question) => ListTile(
              leading: Icon(
                question.type == ExamQuestionType.identify3d
                    ? Icons.view_in_ar
                    : Icons.quiz,
              ),
              title: Text(question.text),
              subtitle: Text(
                '${question.conceptNameFr ?? 'Concept non renseigné'}'
                ' • ${question.conceptId ?? 'sans ID'}',
              ),
              trailing: IconButton(
                tooltip: 'Ajouter à l’examen',
                onPressed: () => _importBankQuestion(question),
                icon: const Icon(Icons.add_circle_outline),
              ),
            ),
          ),
          const Divider(height: 32),
          ...questions.asMap().entries.map(
            (entry) => ListTile(
              leading: CircleAvatar(child: Text('${entry.key + 1}')),
              title: Text(entry.value.text),
              subtitle: Text(
                entry.value.type == ExamQuestionType.identify3d
                    ? 'Identification 3D • ${entry.value.conceptId ?? 'sans concept'}'
                    : entry.value.type == ExamQuestionType.quiz
                        ? 'QCM • ${entry.value.conceptId ?? 'sans concept'}'
                        : 'Question libre • ${entry.value.conceptId ?? 'sans concept'}',
              ),
            ),
          ),
          if (questions.isNotEmpty)
            FilledButton.icon(
              onPressed: _saveExam,
              icon: const Icon(Icons.lock),
              label: const Text('Publier l’examen sécurisé'),
            ),
          if (widget.showExisting) ...[
            const Divider(height: 32),
            const Text(
              'Examens enregistrés',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            ...existing.map(
              (exam) => ListTile(
                leading: const Icon(Icons.assignment),
                title: Text(exam.title),
                subtitle: Text('${exam.questions.length} question(s)'),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
