import 'package:flutter/services.dart';

class ExamSecurity {
  ExamSecurity._();

  static const MethodChannel _channel = MethodChannel('anatomyz/exam_security');

  static Future<void> enable() async {
    try {
      await _channel.invokeMethod<void>('enableSecureMode');
    } on MissingPluginException {
      // Web and platforms without the native Android channel remain functional.
    } on PlatformException {
      // Security is an enhancement; the exam UI still hides the atlas.
    }
  }

  static Future<void> disable() async {
    try {
      await _channel.invokeMethod<void>('disableSecureMode');
    } on MissingPluginException {
      // No native channel on this platform.
    } on PlatformException {
      // Ignore when the native host is unavailable.
    }
  }
}
