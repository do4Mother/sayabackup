import 'package:flutter/material.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        children: [
          const ListTile(
            leading: CircleAvatar(child: Icon(Icons.person)),
            title: Text('John Doe'),
            subtitle: Text('john.doe@example.com'),
            trailing: Icon(Icons.chevron_right),
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.cloud_upload_outlined),
            title: const Text('Backup & sync'),
            subtitle: const Text('Backing up to john.doe@example.com'),
            trailing: Switch(value: true, onChanged: (bool value) {}),
          ),
          const ListTile(
            leading: Icon(Icons.storage_outlined),
            title: Text('Account storage'),
            subtitle: Text('15 GB of 100 GB used'),
            trailing: Icon(Icons.chevron_right),
          ),
          const Divider(),
          const ListTile(
            leading: Icon(Icons.notifications_none),
            title: Text('Notifications'),
            subtitle: Text('Manage alerts and updates'),
            trailing: Icon(Icons.chevron_right),
          ),
          const ListTile(
            leading: Icon(Icons.sd_storage_outlined),
            title: Text('Free up space'),
            subtitle: Text('Remove items backed up to your account'),
            trailing: Icon(Icons.chevron_right),
          ),
          const ListTile(leading: Icon(Icons.info_outline), title: Text('About Google Photos'), trailing: Icon(Icons.chevron_right)),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.logout, color: Colors.red),
            title: const Text('Sign out', style: TextStyle(color: Colors.red)),
            onTap: () {
              // Handle sign out
            },
          ),
        ],
      ),
    );
  }
}
