import 'package:flutter_test/flutter_test.dart';

import 'package:anatomyz/main.dart';

void main() {
  testWidgets('AnatomyZ starts on role selection', (WidgetTester tester) async {
    await tester.pumpWidget(const AnatomyZApp());

    expect(find.text('AnatomyZ'), findsOneWidget);
    expect(find.text('Professeur'), findsOneWidget);
    expect(find.text('Étudiant'), findsOneWidget);
  });
}
