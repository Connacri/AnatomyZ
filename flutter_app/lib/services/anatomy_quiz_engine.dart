import 'dart:math';

import '../models/anatomy_exam.dart';
import '../models/anatomy_quiz_session.dart';

class AnatomyQuizEngine {
  AnatomyQuizEngine._();

  static final AnatomyQuizEngine instance = AnatomyQuizEngine._();

  AnatomyQuizSession createSession(
    AnatomyExam exam, {
    bool shuffleQuestions = true,
    int? seed,
  }) {
    final questions = exam.questions.toList(growable: true);
    if (shuffleQuestions) {
      questions.shuffle(Random(seed));
    }
    return AnatomyQuizSession(exam: exam, questions: questions);
  }
}
