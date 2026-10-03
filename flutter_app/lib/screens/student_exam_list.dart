import 'package:flutter/material.dart';

import '../data/exam_repository.dart';
import 'student_exam.dart';

class StudentExamList extends StatelessWidget {
  const StudentExamList({super.key});

  @override
  Widget build(BuildContext context) {
    final exams = AnatomyExamRepository.instance.exams;
    return Scaffold(
      appBar: AppBar(title: const Text('Examens disponibles')),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: exams.length,
        itemBuilder: (context, index) {
          final exam = exams[index];
          return Card(
            child: ListTile(
              leading: const Icon(Icons.assignment_outlined),
              title: Text(exam.title),
              subtitle: Text('${exam.questions.length} question(s) • ${exam.durationMinutes} min'),
              trailing: const Icon(Icons.arrow_forward_ios),
              onTap: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => StudentExamPage(exam: exam)),
              ),
            ),
          );
        },
      ),
    );
  }
}
