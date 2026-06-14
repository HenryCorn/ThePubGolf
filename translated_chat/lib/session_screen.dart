import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';
import 'chat_screen.dart';

class SessionScreen extends StatefulWidget {
  const SessionScreen({super.key});

  @override
  State<SessionScreen> createState() => _SessionScreenState();
}

class _SessionScreenState extends State<SessionScreen> {
  final TextEditingController _joinCodeController = TextEditingController();

  void _createSession() {
    final sessionId = const Uuid().v4().substring(0, 6).toUpperCase();
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ChatScreen(sessionId: sessionId),
      ),
    );
  }

  void _joinSession() {
    final code = _joinCodeController.text.trim().toUpperCase();
    if (code.isNotEmpty) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => ChatScreen(sessionId: code),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Translate Chat")),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            ElevatedButton(
              onPressed: _createSession,
              child: const Text("Create Session"),
            ),
            const SizedBox(height: 40),
            TextField(
              controller: _joinCodeController,
              decoration: const InputDecoration(
                labelText: "Enter Session Code",
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 10),
            ElevatedButton(
              onPressed: _joinSession,
              child: const Text("Join Session"),
            ),
          ],
        ),
      ),
    );
  }
}