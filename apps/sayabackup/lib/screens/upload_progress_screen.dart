import 'package:flutter/material.dart';

class UploadProgressScreen extends StatelessWidget {
  const UploadProgressScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // Dummy upload data
    final uploads = [
      {'name': 'IMG_20231024_143022.jpg', 'progress': 0.8, 'size': '4.2 MB'},
      {'name': 'VID_20231024_150100.mp4', 'progress': 0.45, 'size': '128.5 MB'},
      {'name': 'IMG_20231024_162011.png', 'progress': 0.1, 'size': '2.1 MB'},
      {'name': 'IMG_20231024_162500.jpg', 'progress': 0.0, 'size': '3.8 MB', 'status': 'Waiting...'},
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Uploads'),
        actions: [TextButton(onPressed: () {}, child: const Text('Pause All'))],
      ),
      body: ListView.separated(
        padding: const EdgeInsets.all(16.0),
        itemCount: uploads.length,
        separatorBuilder: (context, index) => const Divider(),
        itemBuilder: (context, index) {
          final upload = uploads[index];
          final progress = upload['progress'] as double;
          final isWaiting = progress == 0.0 && upload.containsKey('status');

          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 8.0),
            child: Row(
              children: [
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(color: isDark ? Colors.grey[800] : Colors.grey[200], borderRadius: BorderRadius.circular(8)),
                  child: Icon(upload['name'].toString().endsWith('.mp4') ? Icons.video_file : Icons.image, color: Colors.grey[500]),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        upload['name'] as String,
                        style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 16),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            isWaiting ? upload['status'] as String : '${(progress * 100).toInt()}% • ${upload['size']}',
                            style: TextStyle(color: Colors.grey[600], fontSize: 14),
                          ),
                          if (!isWaiting)
                            Text(
                              'Uploading...',
                              style: TextStyle(color: Theme.of(context).colorScheme.primary, fontSize: 12, fontWeight: FontWeight.w500),
                            ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      LinearProgressIndicator(
                        value: isWaiting ? null : progress,
                        backgroundColor: isDark ? Colors.grey[800] : Colors.grey[200],
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(icon: const Icon(Icons.close), onPressed: () {}, color: Colors.grey[500]),
              ],
            ),
          );
        },
      ),
    );
  }
}
