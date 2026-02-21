import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import 'screens/albums_screen.dart';
import 'screens/login_screen.dart';
import 'screens/main_layout.dart';
import 'screens/photo_detail_screen.dart';
import 'screens/photos_screen.dart';
import 'screens/settings_screen.dart';
import 'screens/upload_progress_screen.dart';

void main() {
  runApp(const GooglePhotosCloneApp());
}

final _rootNavigatorKey = GlobalKey<NavigatorState>();
final GoRouter _router = GoRouter(
  navigatorKey: _rootNavigatorKey,
  initialLocation: '/login',
  routes: [
    GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
    ShellRoute(
      navigatorKey: _shellNavigatorKey,
      builder: (context, state, child) {
        return MainLayout(child: child);
      },
      routes: [
        GoRoute(path: '/home', builder: (context, state) => const PhotosScreen()),
        GoRoute(path: '/albums', builder: (context, state) => const AlbumsScreen()),
        GoRoute(path: '/uploads', builder: (context, state) => const UploadProgressScreen()),
        GoRoute(path: '/settings', builder: (context, state) => const SettingsScreen()),
      ],
    ),
    GoRoute(
      path: '/photo/:index',
      parentNavigatorKey: _rootNavigatorKey,
      builder: (context, state) {
        final indexStr = state.pathParameters['index'];
        final index = int.tryParse(indexStr ?? '0') ?? 0;
        return PhotoDetailScreen(initialIndex: index);
      },
    ),
  ],
);

final _shellNavigatorKey = GlobalKey<NavigatorState>();

class GooglePhotosCloneApp extends StatelessWidget {
  const GooglePhotosCloneApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Google Photos Clone',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue, brightness: Brightness.light),
        textTheme: GoogleFonts.openSansTextTheme(ThemeData.light().textTheme),
      ),
      darkTheme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue, brightness: Brightness.dark),
        textTheme: GoogleFonts.openSansTextTheme(ThemeData.dark().textTheme),
      ),
      themeMode: ThemeMode.system,
      routerConfig: _router,
    );
  }
}
