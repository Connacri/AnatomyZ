// File generated for AnatomyZ Firebase Configuration.
// ignore_for_file: type=lint
import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for ios.',
        );
      case TargetPlatform.macOS:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for macos.',
        );
      case TargetPlatform.windows:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for windows.',
        );
      case TargetPlatform.linux:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for linux.',
        );
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyAhQIRfoN39v_5xuESaacbsZmgMlmdqz5U',
    appId: '1:986358610101:web:c5207407fb1477d666a6fc',
    messagingSenderId: '986358610101',
    projectId: 'gen-lang-client-0479958060',
    authDomain: 'gen-lang-client-0479958060.firebaseapp.com',
    storageBucket: 'gen-lang-client-0479958060.firebasestorage.app',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyClZG48rgZGfB9t3MEyE6ua_egmQMBDLQE',
    appId: '1:986358610101:android:500be7a53116953666a6fc',
    messagingSenderId: '986358610101',
    projectId: 'gen-lang-client-0479958060',
    storageBucket: 'gen-lang-client-0479958060.firebasestorage.app',
  );
}
