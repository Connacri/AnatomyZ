import 'dart:async';

import 'package:flutter/material.dart';
import 'package:interactive_3d/interactive_3d.dart';

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
  bool submitted = false;

  @override
  void initState() {
    super.initState();
    remainingSeconds = widget.exam.durationMinutes * 60;
    ExamSecurity.enable();
    timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!mounted || submitted) return;
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

  bool _isCorrect(AnatomyExamQuestion question) {
    final answer = answers[question.id];
    if (question.type == ExamQuestionType.quiz) {
      return question.options.indexOf(answer ?? '') == question.correctOptionIndex;
    }
    if (question.type == ExamQuestionType.identify3d) {
      return answer != null && answer == question.meshNode;
    }
    return answer != null &&
        question.expectedAnswer != null &&
        answer.trim().toLowerCase() ==
            question.expectedAnswer!.trim().toLowerCase();
  }

  void _submit() {
    if (submitted) return;
    submitted = true;
    timer?.cancel();
    ExamSecurity.disable();
    final earned = widget.exam.questions
        .where(_isCorrect)
        .fold<int>(0, (sum, question) => sum + question.points);
    final total = widget.exam.totalPoints;
    showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (_) => AlertDialog(
        title: const Text('Examen terminé'),
        content: Text('Résultat : $earned / $total points'),
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
    if (widget.exam.questions.isEmpty) {
      return const Scaffold(
        body: Center(child: Text('Cet examen ne contient aucune question.')),
      );
    }

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
            child: Center(
              child: Text('$minutes:${seconds.toString().padLeft(2, '0')}'),
            ),
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
              subtitle: Text(
                'L’atlas anatomique est masqué pendant cette épreuve.',
              ),
            ),
          ),
          const SizedBox(height: 20),
          Text('Question ${current + 1} / ${widget.exam.questions.length}'),
          const SizedBox(height: 8),
          Row(
            children: [
              Chip(label: Text('${question.points} pt')),
              const SizedBox(width: 8),
              Chip(
                label: Text(
                  question.type == ExamQuestionType.identify3d
                      ? 'Identification 3D'
                      : question.type == ExamQuestionType.quiz
                          ? 'QCM'
                          : 'Réponse libre',
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            question.text,
            style: Theme.of(context).textTheme.headlineSmall,
          ),
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
          else if (question.type == ExamQuestionType.identify3d)
            _ThreeDIdentificationQuestion(
              question: question,
              selectedNode: answers[question.id],
              onSelected: (node) =>
                  setState(() => answers[question.id] = node),
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
            child: Text(
              current + 1 < widget.exam.questions.length
                  ? 'Question suivante'
                  : 'Terminer l’examen',
            ),
          ),
        ],
      ),
    );
  }
}

class _ThreeDIdentificationQuestion extends StatefulWidget {
  const _ThreeDIdentificationQuestion({
    required this.question,
    required this.selectedNode,
    required this.onSelected,
  });

  final AnatomyExamQuestion question;
  final String? selectedNode;
  final ValueChanged<String> onSelected;

  @override
  State<_ThreeDIdentificationQuestion> createState() =>
      _ThreeDIdentificationQuestionState();
}

class _ThreeDIdentificationQuestionState
    extends State<_ThreeDIdentificationQuestion> {
  final controller = Interactive3dController();
  EntityData? selected;

  String get modelUrl =>
      'https://raw.githubusercontent.com/Connacri/Anatria-3D/main/public/anatomy/${widget.question.meshFile}';

  @override
  Widget build(BuildContext context) {
    final validConfiguration = widget.question.meshFile != null &&
        widget.question.meshFile!.isNotEmpty &&
        widget.question.meshNode != null &&
        widget.question.meshNode!.isNotEmpty;

    if (!validConfiguration) {
      return const Card(
        child: ListTile(
          leading: Icon(Icons.warning_amber),
          title: Text('Cible 3D non configurée'),
          subtitle: Text(
            'Cette question doit être reliée à un fichier GLB et à un nœud vérifié.',
          ),
        ),
      );
    }

    final viewerHeight =
        (MediaQuery.sizeOf(context).height * 0.42).clamp(260.0, 420.0);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text(
          'Touchez directement la structure demandée dans le modèle.',
          style: TextStyle(fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 10),
        SizedBox(
          height: viewerHeight,
          child: ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: Interactive3d(
              key: ValueKey(modelUrl),
              controller: controller,
              modelUrl: modelUrl,
              enableCache: true,
              defaultZoom: 1.15,
              selectionColor: const [1.0, 0.25, 0.1, 1.0],
              backgroundColor: Colors.black,
              solidBackgroundColor: const [0.025, 0.035, 0.055, 1.0],
              onSelectionChanged: (entities) {
                if (entities.isEmpty) return;
                final entity = entities.last;
                setState(() => selected = entity);
                widget.onSelected(entity.name);
              },
              loadingWidget: const Center(
                child: CircularProgressIndicator(),
              ),
            ),
          ),
        ),
        const SizedBox(height: 10),
        Card(
          child: ListTile(
            leading: Icon(
              selected?.name == widget.question.meshNode
                  ? Icons.check_circle
                  : Icons.touch_app,
            ),
            title: Text(selected?.name ?? 'Aucune structure sélectionnée'),
            subtitle: Text(
              widget.question.conceptNameFr == null
                  ? 'Sélectionnez une structure'
                  : 'Concept cible : ${widget.question.conceptNameFr}',
            ),
          ),
        ),
      ],
    );
  }
}
