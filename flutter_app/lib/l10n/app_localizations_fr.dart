// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for French (`fr`).
class AppLocalizationsFr extends AppLocalizations {
  AppLocalizationsFr([String locale = 'fr']) : super(locale);

  @override
  String get chooseRole => 'Choisissez votre rôle';

  @override
  String get authorizedSpace => 'Votre espace autorisé';

  @override
  String get allSpacesAdmin => 'Tous les espaces (Supervision Admin)';

  @override
  String get subtitle =>
      'Atlas anatomique humain 3D, Knowledge Graph FMA/UBERON et espace pédagogique sécurisé.';

  @override
  String get professor => 'Professeur';

  @override
  String get professorSub =>
      'Gérer les étudiants (CRUD), créer des examens et projeter l’Atlas 3D';

  @override
  String get professorPendingSub =>
      'Accès limité aux démonstrations 3D jusqu’à validation par l’administrateur';

  @override
  String get student => 'Étudiant';

  @override
  String get studentSub =>
      'Consulter les examens assignés, les passer et suivre ses notes';

  @override
  String get adminPanel => 'Administration Institutionnelle';

  @override
  String get adminSub =>
      'Liste des professeurs à accepter avec entrée détail profil et supervision';

  @override
  String get exploreAtlas => 'Explorer directement l’atlas 3D';

  @override
  String get pendingBannerTitle =>
      'Compte Professeur en attente de validation par l’Administrateur';

  @override
  String get pendingBannerDesc =>
      'Votre compte Professeur est validé uniquement par l’administrateur. En attendant son acceptation, vous avez uniquement accès aux démonstrations 3D et ne pouvez ni interagir avec vos étudiants ni accéder aux autres fonctionnalités.';

  @override
  String get themeAuto => 'Horaire Auto';

  @override
  String get themeLight => 'Clair';

  @override
  String get themeDark => 'Sombre';
}
