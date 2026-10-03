import 'package:flutter/material.dart';

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
    super.dispose();
  }

  void _addQuestion() {
    final text = questionController.text.trim();
    if (text.isEmpty) return;
    final options = optionsController.text.split(';').map((e) => e.trim()).where((e) => e.isNotEmpty).toList();
    if (type == ExamQuestionType.quiz && options.length < 2) return;
    setState(() {
      questions.add(AnatomyExamQuestion(
        id: 'q${questions.length + 1}',
        text: text,
        type: type,
        options: type == ExamQuestionType.quiz ? options : const [],
        correctOptionIndex: type == ExamQuestionType.quiz ? correctIndex.clamp(0, options.length - 1) : null,
        expectedAnswer: type == ExamQuestionType.question ? answerController.text.trim() : null,
      ));
      questionController.clear();
      answerController.clear();
      optionsController.clear();
      correctIndex = 0;
    });
  }

  void _saveExam() {
    if (titleController.text.trim().isEmpty || questions.isEmpty) return;
    AnatomyExamRepository.instance.add(AnatomyExam(
      id: 'exam-${DateTime.now().millisecondsSinceEpoch}',
      title: titleController.text.trim(),
      description: descriptionController.text.trim(),
      questions: List.unmodifiable(questions),
      hideAnatomy: true,
    ));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Examen publié en mode sécurisé.')),
    );
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final existing = AnatomyExamRepository.instance.exams;
    return Scaffold(
      appBar: AppBar(title: const Text('Créateur d’examen')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          TextField(controller: titleController, decoration: const InputDecoration(labelText: 'Titre')),
          TextField(controller: descriptionController, decoration: const InputDecoration(labelText: 'Description')),
          const SizedBox(height: 20),
          SegmentedButton<ExamQuestionType>(
            segments: const [
              ButtonSegment(value: ExamQuestionType.quiz, label: Text('Quiz QCM')),
              ButtonSegment(value: ExamQuestionType.question, label: Text('Question libre')),
            ],
            selected: {type},
            onSelectionChanged: (value) => setState(() => type = value.first),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: questionController,
            maxLines: 3,
            decoration: const InputDecoration(labelText: 'Question', border: OutlineInputBorder()),
          ),
          if (type == ExamQuestionType.quiz)
            TextField(
              controller: optionsController,
              decoration: const InputDecoration(labelText: 'Choix séparés par ;'),
            ),
          if (type == ExamQuestionType.question)
            TextField(
              controller: answerController,
              decoration: const InputDecoration(labelText: 'Réponse attendue (optionnelle)'),
            ),
          const SizedBox(height: 8),
          if (type == ExamQuestionType.quiz)
            DropdownButtonFormField<int>(
              initialValue: correctIndex,
              decoration: const InputDecoration(labelText: 'Bonne réponse'),
              items: List.generate(6, (i) => DropdownMenuItem(value: i, child: Text('Choix ${i + 1}'))),
              onChanged: (value) => setState(() => correctIndex = value ?? 0),
            ),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            onPressed: _addQuestion,
            icon: const Icon(Icons.add),
            label: const Text('Ajouter la question'),
          ),
          ...questions.asMap().entries.map((entry) => ListTile(
            leading: CircleAvatar(child: Text('${entry.key + 1}')),
            title: Text(entry.value.text),
            subtitle: Text(entry.value.type == ExamQuestionType.quiz ? 'QCM' : 'Question libre'),
          )),
          if (questions.isNotEmpty)
            FilledButton.icon(
              onPressed: _saveExam,
              icon: const Icon(Icons.lock),
              label: const Text('Publier l’examen sécurisé'),
            ),
          if (widget.showExisting) ...[
            const Divider(height: 32),
            const Text('Examens enregistrés', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            ...existing.map((exam) => ListTile(
              leading: const Icon(Icons.assignment),
              title: Text(exam.title),
              subtitle: Text('${exam.questions.length} question(s)'),
            )),
          ],
        ],
      ),
    );
  }
}
