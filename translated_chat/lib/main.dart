import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'session_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Translated Chat',
      theme: ThemeData(primarySwatch: Colors.teal),
      home: const SessionScreen(),
    );
  }
}