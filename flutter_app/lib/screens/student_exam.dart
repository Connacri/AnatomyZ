import 'dart:async';

import 'package:flutter/material.dart';

import '../models/anatomy_exam.dart';
import '../services/exam_security.dart';

class StudentExamPage extends StatefulWidget {
  const StudentExamPage({super.key, required this.exam});
  final AnatomyExam exam;

  @override
  State<StudentExamPage> createState() => _StudentExamPageState();
}

class _StudentExamPageState extends State<StudentExamPage> {
  final answers = <String, String>{};
  Timer? timer;
  late int remainingSeconds;
  int current = 0;

  @override
  void initState() {
    super.initState();
    remainingSeconds = widget.exam.durationMinutes * 60;
    ExamSecurity.enable();
    timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!mounted) return;
      if (remainingSeconds <= 1) {
        _submit();
      } else {
        setState(() => remainingSeconds--);
      }
    });
  }

  @override
  void dispose() {
    timer?.cancel();
    ExamSecurity.disable();
    super.dispose();
  }

  void _submit() {
    timer?.cancel();
    ExamSecurity.disable();
    final correct = widget.exam.questions.where((question) {
      final answer = answers[question.id];
      if (question.type == ExamQuestionType.quiz) {
        return question.options.indexOf(answer ?? '') == question.correctOptionIndex;
      }
      return answer != null && question.expectedAnswer != null &&
          answer.trim().toLowerCase() == question.expectedAnswer!.trim().toLowerCase();
    }).length;
    showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (_) => AlertDialog(
        title: const Text('Examen terminé'),
        content: Text('Résultat : $correct / ${widget.exam.questions.length}'),
        actions: [
          FilledButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pop(context);
            },
            child: const Text('Terminer'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final question = widget.exam.questions[current];
    final minutes = remainingSeconds ~/ 60;
    final seconds = remainingSeconds % 60;
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.exam.title),
        automaticallyImplyLeading: false,
        actions: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Center(child: Text('$minutes:${seconds.toString().padLeft(2, '0')}')),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const Card(
            child: ListTile(
              leading: Icon(Icons.lock),
              title: Text('Mode examen sécurisé'),
              subtitle: Text('L’atlas anatomique est masqué pendant cette épreuve.'),
            ),
          ),
          const SizedBox(height: 20),
          Text('Question ${current + 1} / ${widget.exam.questions.length}'),
          const SizedBox(height: 12),
          Text(question.text, style: Theme.of(context).textTheme.headlineSmall),
          const SizedBox(height: 24),
          if (question.type == ExamQuestionType.quiz)
            RadioGroup<String>(
              groupValue: answers[question.id],
              onChanged: (value) =>
                  setState(() => answers[question.id] = value ?? ''),
              child: Column(
                children: question.options
                    .map(
                      (option) => RadioListTile<String>(
                        value: option,
                        title: Text(option),
                      ),
                    )
                    .toList(growable: false),
              ),
            )
          else
            TextField(
              onChanged: (value) => answers[question.id] = value,
              maxLines: 4,
              decoration: const InputDecoration(
                border: OutlineInputBorder(),
                labelText: 'Votre réponse',
              ),
            ),
          const SizedBox(height: 24),
          FilledButton(
            onPressed: current + 1 < widget.exam.questions.length
                ? () => setState(() => current++)
                : _submit,
            child: Text(current + 1 < widget.exam.questions.length ? 'Question suivante' : 'Terminer l’examen'),
          ),
        ],
      ),
    );
  }
}
