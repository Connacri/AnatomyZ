import 'package:flutter_test/flutter_test.dart';

import 'package:anatomyz/data/anatomy_question_bank_repository.dart';
import 'package:anatomyz/models/anatomy_exam.dart';

void main() {
  test('question bank exposes ontology-linked questions', () {
    final questions = AnatomyQuestionBankRepository.instance.all;

    expect(questions, isNotEmpty);
    expect(questions.every((question) => question.conceptId != null), isTrue);
  });

  test('3D question requires an ontology concept and mesh node', () {
    const question = AnatomyExamQuestion(
      id: '3d-test',
      text: 'Identifiez la structure.',
      type: ExamQuestionType.identify3d,
      conceptId: 'FMA:55675',
      meshNode: 'Heart',
      meshFile: 'cardiovascular_male.glb',
    );

    expect(question.has3dTarget, isTrue);
  });

  test('exam total points includes 3D questions', () {
    const exam = AnatomyExam(
      id: 'exam-test',
      title: 'Test',
      description: '',
      questions: [
        AnatomyExamQuestion(
          id: 'q1',
          text: 'QCM',
          type: ExamQuestionType.quiz,
          options: ['A', 'B'],
          correctOptionIndex: 0,
        ),
        AnatomyExamQuestion(
          id: 'q2',
          text: '3D',
          type: ExamQuestionType.identify3d,
          points: 2,
          conceptId: 'FMA:55675',
          meshNode: 'Heart',
          meshFile: 'cardiovascular_male.glb',
        ),
      ],
    );

    expect(exam.totalPoints, 3);
  });
}
