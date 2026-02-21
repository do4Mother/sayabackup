import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  static const _steps = [
    _OnboardingStep(
      title: 'Back up your memories in a snap ✨',
      description: 'Save photos and videos in seconds, then keep them cozy and protected in your private cloud.',
      illustrationPath: 'assets/illustrations/step_secure_backup.svg',
    ),
    _OnboardingStep(
      title: 'Find every moment super fast 🔎',
      description: 'Your gallery stays neatly grouped and searchable, so favorite memories are always one tap away.',
      illustrationPath: 'assets/illustrations/step_smart_organize.svg',
    ),
    _OnboardingStep(
      title: 'Share happy albums with anyone 💌',
      description: 'Build beautiful collections and share them with family, friends, or your team instantly.',
      illustrationPath: 'assets/illustrations/step_share_anywhere.svg',
    ),
  ];
  static const _stepAccents = [Color(0xFF7A8CFF), Color(0xFFFF8A66), Color(0xFF8B7BFF)];

  late final PageController _pageController;

  int _currentStep = 0;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final currentAccent = _stepAccents[_currentStep];

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          child: Column(
            children: [
              Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(color: colorScheme.primaryContainer, borderRadius: BorderRadius.circular(14)),
                    child: Icon(Icons.photo_library_rounded, color: colorScheme.primary),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text('SayaBackup', style: GoogleFonts.openSans(fontSize: 20, fontWeight: FontWeight.w700)),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                'Let’s make your memories sparkle',
                style: TextStyle(fontSize: 13, color: colorScheme.onSurfaceVariant, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 16),

              Expanded(
                child: PageView.builder(
                  controller: _pageController,
                  itemCount: _steps.length,
                  onPageChanged: (index) => setState(() => _currentStep = index),
                  itemBuilder: (context, index) {
                    final step = _steps[index];
                    return Column(
                      children: [
                        const SizedBox(height: 8),
                        Expanded(
                          child: Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                                colors: [currentAccent.withValues(alpha: 0.22), colorScheme.surfaceContainerHighest.withValues(alpha: 0.45)],
                              ),
                              borderRadius: BorderRadius.circular(28),
                            ),
                            child: SvgPicture.asset(step.illustrationPath, fit: BoxFit.contain),
                          ),
                        ),
                        const SizedBox(height: 24),
                        Text(
                          step.title,
                          textAlign: TextAlign.center,
                          style: GoogleFonts.openSans(fontSize: 27, fontWeight: FontWeight.w700),
                        ),
                        const SizedBox(height: 12),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 8),
                          child: Text(
                            step.description,
                            textAlign: TextAlign.center,
                            style: TextStyle(fontSize: 16, height: 1.5, color: colorScheme.onSurfaceVariant),
                          ),
                        ),
                        const SizedBox(height: 24),
                      ],
                    );
                  },
                ),
              ),

              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(
                  _steps.length,
                  (index) => AnimatedContainer(
                    duration: const Duration(milliseconds: 250),
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    height: 8,
                    width: _currentStep == index ? 24 : 8,
                    decoration: BoxDecoration(
                      color: _currentStep == index ? _stepAccents[index] : colorScheme.outlineVariant,
                      borderRadius: BorderRadius.circular(999),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),

              Row(
                children: [
                  if (_currentStep > 0)
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => _goToStep(_currentStep - 1),
                        style: OutlinedButton.styleFrom(minimumSize: const Size.fromHeight(52)),
                        child: const Text('Back'),
                      ),
                    ),
                  if (_currentStep > 0) const SizedBox(width: 12),
                  Expanded(
                    flex: _currentStep > 0 ? 1 : 2,
                    child: FilledButton(
                      onPressed: _currentStep == _steps.length - 1 ? () => context.go('/home') : () => _goToStep(_currentStep + 1),
                      style: FilledButton.styleFrom(minimumSize: const Size.fromHeight(52), backgroundColor: currentAccent),
                      child: Text(_currentStep == _steps.length - 1 ? 'Let’s go' : 'Next'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              SizedBox(
                width: double.infinity,
                height: 56,
                child: FilledButton.icon(
                  onPressed: () => context.go('/home'),
                  icon: const Icon(Icons.g_mobiledata_rounded, size: 28),
                  label: const Text('Jump in with Google', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                  style: FilledButton.styleFrom(
                    backgroundColor: currentAccent,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                ),
              ),
              const SizedBox(height: 4),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
  }

  void _goToStep(int index) {
    _pageController.animateToPage(index, duration: const Duration(milliseconds: 300), curve: Curves.easeOut);
  }
}

class _OnboardingStep {
  final String title;

  final String description;
  final String illustrationPath;
  const _OnboardingStep({required this.title, required this.description, required this.illustrationPath});
}
