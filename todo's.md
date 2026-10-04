# Todo's — AnatomyZ

Tâches du 04/10/2026 (à refaire après l'écrasement du commit `1daab18` sur `master`) :

- [ ] **Lint Flutter** : corriger `prefer_const_constructors` dans `flutter_app/lib/screens/role_selection.dart:275` (rendre le `Row` `const`).
- [ ] **Favicon website** :
  - `index.html` (racine) : utiliser `/favicon.png` pour l'icône + `<link rel="shortcut icon" href="/favicon.png">`
  - `site/index.html` : ajouter `<link rel="icon" type="image/png" href="./favicon.png">` et apple-touch-icon
  - `site/404.html` : ajouter la même balise `<link rel="icon">`
  - copier `public/favicon.png` et `public/icon.png` vers `site/`
- [ ] **Google Sign-In Flutter** :
  - `flutter pub add firebase_core firebase_auth google_sign_in`
  - réécrire `lib/firebase_options.dart` avec `firebase_core`'s `FirebaseOptions`
  - `main.dart` : `await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);`
  - réécrire `lib/services/firebase_auth_service.dart` : `GoogleSignIn.instance.initialize(serverClientId: ...)` + `authenticate(scopeHint: ['email','profile'])` + `FirebaseAuth.instance.signInWithCredential(...)`, listener `authStateChanges`, gérer `GoogleSignInExceptionCode.canceled`
  - vérifier `flutter analyze` → No issues
- [ ] **Google Sign-In site (React)** (`src/firebase.ts`) :
  - importer `signInWithRedirect`, `getRedirectResult`
  - `googleProvider.setCustomParameters({ prompt: 'select_account' })`
  - `getRedirectResult(auth)` au chargement
  - `loginWithGoogle` : popup, fallback redirect si `auth/popup-blocked`, `null` si annulation
  - `npm install` puis `npm run lint` OK
- [x] **Secrets GitHub** : `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_PASSWORD`, `ANDROID_KEY_ALIAS` (déjà en place, vérifier avec `gh secret list --repo Connacri/AnatomyZ`)
