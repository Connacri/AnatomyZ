import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_en.dart';
import 'app_localizations_fr.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
      : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
    delegate,
    GlobalMaterialLocalizations.delegate,
    GlobalCupertinoLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
  ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('en'),
    Locale('fr')
  ];

  /// No description provided for @chooseRole.
  ///
  /// In fr, this message translates to:
  /// **'Choisissez votre rôle'**
  String get chooseRole;

  /// No description provided for @authorizedSpace.
  ///
  /// In fr, this message translates to:
  /// **'Votre espace autorisé'**
  String get authorizedSpace;

  /// No description provided for @allSpacesAdmin.
  ///
  /// In fr, this message translates to:
  /// **'Tous les espaces (Supervision Admin)'**
  String get allSpacesAdmin;

  /// No description provided for @subtitle.
  ///
  /// In fr, this message translates to:
  /// **'Atlas anatomique humain 3D, Knowledge Graph FMA/UBERON et espace pédagogique sécurisé.'**
  String get subtitle;

  /// No description provided for @professor.
  ///
  /// In fr, this message translates to:
  /// **'Professeur'**
  String get professor;

  /// No description provided for @professorSub.
  ///
  /// In fr, this message translates to:
  /// **'Gérer les étudiants (CRUD), créer des examens et projeter l’Atlas 3D'**
  String get professorSub;

  /// No description provided for @professorPendingSub.
  ///
  /// In fr, this message translates to:
  /// **'Accès limité aux démonstrations 3D jusqu’à validation par l’administrateur'**
  String get professorPendingSub;

  /// No description provided for @student.
  ///
  /// In fr, this message translates to:
  /// **'Étudiant'**
  String get student;

  /// No description provided for @studentSub.
  ///
  /// In fr, this message translates to:
  /// **'Consulter les examens assignés, les passer et suivre ses notes'**
  String get studentSub;

  /// No description provided for @adminPanel.
  ///
  /// In fr, this message translates to:
  /// **'Administration Institutionnelle'**
  String get adminPanel;

  /// No description provided for @adminSub.
  ///
  /// In fr, this message translates to:
  /// **'Liste des professeurs à accepter avec entrée détail profil et supervision'**
  String get adminSub;

  /// No description provided for @exploreAtlas.
  ///
  /// In fr, this message translates to:
  /// **'Explorer directement l’atlas 3D'**
  String get exploreAtlas;

  /// No description provided for @pendingBannerTitle.
  ///
  /// In fr, this message translates to:
  /// **'Compte Professeur en attente de validation par l’Administrateur'**
  String get pendingBannerTitle;

  /// No description provided for @pendingBannerDesc.
  ///
  /// In fr, this message translates to:
  /// **'Votre compte Professeur est validé uniquement par l’administrateur. En attendant son acceptation, vous avez uniquement accès aux démonstrations 3D et ne pouvez ni interagir avec vos étudiants ni accéder aux autres fonctionnalités.'**
  String get pendingBannerDesc;

  /// No description provided for @themeAuto.
  ///
  /// In fr, this message translates to:
  /// **'Horaire Auto'**
  String get themeAuto;

  /// No description provided for @themeLight.
  ///
  /// In fr, this message translates to:
  /// **'Clair'**
  String get themeLight;

  /// No description provided for @themeDark.
  ///
  /// In fr, this message translates to:
  /// **'Sombre'**
  String get themeDark;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['en', 'fr'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'en':
      return AppLocalizationsEn();
    case 'fr':
      return AppLocalizationsFr();
  }

  throw FlutterError(
      'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
      'an issue with the localizations generation tool. Please file an issue '
      'on GitHub with a reproducible sample app and the gen-l10n configuration '
      'that was used.');
}
