// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get chooseRole => 'Choose your role';

  @override
  String get authorizedSpace => 'Your Authorized Workspace';

  @override
  String get allSpacesAdmin => 'All Workspaces (Admin Supervision)';

  @override
  String get subtitle =>
      '3D human anatomical atlas, FMA/UBERON Knowledge Graph, and secure academic workspace.';

  @override
  String get professor => 'Professor';

  @override
  String get professorSub =>
      'Manage students (CRUD), create exams, and project the 3D Atlas';

  @override
  String get professorPendingSub =>
      'Restricted to 3D demonstrations only until validated by the administrator';

  @override
  String get student => 'Student';

  @override
  String get studentSub =>
      'View assigned exams, take assessments, and track grades';

  @override
  String get adminPanel => 'Institutional Administration';

  @override
  String get adminSub =>
      'Pending professors list to accept with profile details entry & supervision';

  @override
  String get exploreAtlas => 'Explore the 3D Atlas directly';

  @override
  String get pendingBannerTitle =>
      'Professor Account Pending Administrator Validation';

  @override
  String get pendingBannerDesc =>
      'Your Professor account is validated solely by the administrator. Until accepted, you only have access to 3D demonstrations and cannot interact with students or access other features.';

  @override
  String get themeAuto => 'Auto Schedule';

  @override
  String get themeLight => 'Light';

  @override
  String get themeDark => 'Dark';
}
