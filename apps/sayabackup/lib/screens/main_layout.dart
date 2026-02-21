import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

class DesktopLayout extends StatelessWidget {
  final int selectedIndex;
  final ValueChanged<int> onItemTapped;
  final VoidCallback onUploadMedia;
  final Widget child;

  const DesktopLayout({super.key, required this.selectedIndex, required this.onItemTapped, required this.onUploadMedia, required this.child});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Row(
        children: [
          NavigationRail(
            extended: true,
            selectedIndex: selectedIndex,
            onDestinationSelected: onItemTapped,
            destinations: const [
              NavigationRailDestination(icon: Icon(Icons.photo_outlined), selectedIcon: Icon(Icons.photo), label: Text('Photos')),
              NavigationRailDestination(icon: Icon(Icons.photo_album_outlined), selectedIcon: Icon(Icons.photo_album), label: Text('Albums')),
              NavigationRailDestination(icon: Icon(Icons.cloud_upload_outlined), selectedIcon: Icon(Icons.cloud_upload), label: Text('Uploads')),
              NavigationRailDestination(icon: Icon(Icons.settings_outlined), selectedIcon: Icon(Icons.settings), label: Text('Settings')),
            ],
          ),
          const VerticalDivider(thickness: 1, width: 1),
          Expanded(
            child: Center(
              child: ConstrainedBox(constraints: const BoxConstraints(maxWidth: 1200), child: child),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(onPressed: onUploadMedia, icon: const Icon(Icons.add), label: const Text('Upload')),
    );
  }
}

class MainLayout extends StatefulWidget {
  final Widget child;
  const MainLayout({super.key, required this.child});

  @override
  State<MainLayout> createState() => _MainLayoutState();
}

class MobileLayout extends StatelessWidget {
  final int selectedIndex;
  final ValueChanged<int> onItemTapped;
  final VoidCallback onUploadMedia;
  final Widget child;

  const MobileLayout({super.key, required this.selectedIndex, required this.onItemTapped, required this.onUploadMedia, required this.child});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      floatingActionButton: FloatingActionButton(onPressed: onUploadMedia, child: const Icon(Icons.add)),
      bottomNavigationBar: NavigationBar(
        selectedIndex: selectedIndex,
        onDestinationSelected: onItemTapped,
        destinations: const [
          NavigationDestination(icon: Icon(Icons.photo_outlined), selectedIcon: Icon(Icons.photo), label: 'Photos'),
          NavigationDestination(icon: Icon(Icons.photo_album_outlined), selectedIcon: Icon(Icons.photo_album), label: 'Albums'),
          NavigationDestination(icon: Icon(Icons.cloud_upload_outlined), selectedIcon: Icon(Icons.cloud_upload), label: 'Uploads'),
          NavigationDestination(icon: Icon(Icons.settings_outlined), selectedIcon: Icon(Icons.settings), label: 'Settings'),
        ],
      ),
    );
  }
}

class _MainLayoutState extends State<MainLayout> {
  int _selectedIndex = 0;
  final ImagePicker _picker = ImagePicker();

  @override
  Widget build(BuildContext context) {
    final isDesktop = MediaQuery.of(context).size.width > 800;

    if (isDesktop) {
      return DesktopLayout(
        selectedIndex: _selectedIndex,
        onItemTapped: (index) => _onItemTapped(index, context),
        onUploadMedia: _uploadMedia,
        child: widget.child,
      );
    } else {
      return MobileLayout(
        selectedIndex: _selectedIndex,
        onItemTapped: (index) => _onItemTapped(index, context),
        onUploadMedia: _uploadMedia,
        child: widget.child,
      );
    }
  }

  void _onItemTapped(int index, BuildContext context) {
    setState(() {
      _selectedIndex = index;
    });
    switch (index) {
      case 0:
        context.go('/home');
        break;
      case 1:
        context.go('/albums');
        break;
      case 2:
        context.go('/uploads');
        break;
      case 3:
        context.go('/settings');
        break;
    }
  }

  Future<void> _uploadMedia() async {
    // Show bottom sheet to choose photo or video
    showModalBottomSheet(
      context: context,
      builder: (BuildContext context) {
        return SafeArea(
          child: Wrap(
            children: <Widget>[
              ListTile(
                leading: const Icon(Icons.photo_library),
                title: const Text('Upload Photo'),
                onTap: () async {
                  Navigator.of(context).pop();
                  final XFile? image = await _picker.pickImage(source: ImageSource.gallery);
                  if (image != null) {
                    // Handle upload
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Uploading ${image.name}...')));
                  }
                },
              ),
              ListTile(
                leading: const Icon(Icons.video_library),
                title: const Text('Upload Video'),
                onTap: () async {
                  Navigator.of(context).pop();
                  final XFile? video = await _picker.pickVideo(source: ImageSource.gallery);
                  if (video != null) {
                    // Handle upload
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Uploading ${video.name}...')));
                  }
                },
              ),
            ],
          ),
        );
      },
    );
  }
}
