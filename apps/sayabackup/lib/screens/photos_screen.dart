import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../models/photo.dart';

class PhotosScreen extends StatelessWidget {
  const PhotosScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Group photos by date
    final Map<String, List<Photo>> groupedPhotos = {};
    for (var photo in dummyPhotos) {
      final dateStr = DateFormat('MMM d, yyyy').format(photo.date);
      if (!groupedPhotos.containsKey(dateStr)) {
        groupedPhotos[dateStr] = [];
      }
      groupedPhotos[dateStr]!.add(photo);
    }

    final sortedDates = groupedPhotos.keys.toList()..sort((a, b) => DateFormat('MMM d, yyyy').parse(b).compareTo(DateFormat('MMM d, yyyy').parse(a)));

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            floating: true,
            title: const Text('Google Photos'),
            actions: [IconButton(icon: const Icon(Icons.account_circle), onPressed: () {})],
          ),
          ...sortedDates.map((date) {
            final photos = groupedPhotos[date]!;
            return SliverMainAxisGroup(
              slivers: [
                SliverPersistentHeader(
                  pinned: true,
                  delegate: _DateHeaderDelegate(date: date, location: photos.first.location),
                ),
                SliverPadding(
                  padding: const EdgeInsets.all(2.0),
                  sliver: SliverGrid(
                    gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                      maxCrossAxisExtent: 150,
                      mainAxisSpacing: 2.0,
                      crossAxisSpacing: 2.0,
                    ),
                    delegate: SliverChildBuilderDelegate((context, index) {
                      final photo = photos[index];
                      return GestureDetector(
                        onTap: () {
                          // Find index in flat list
                          final flatIndex = dummyPhotos.indexOf(photo);
                          context.push('/photo/$flatIndex');
                        },
                        child: Hero(
                          tag: photo.id,
                          child: CachedNetworkImage(
                            imageUrl: photo.url,
                            fit: BoxFit.cover,
                            placeholder: (context, url) => Container(color: Colors.grey[300]),
                            errorWidget: (context, url, error) => const Icon(Icons.error),
                          ),
                        ),
                      );
                    }, childCount: photos.length),
                  ),
                ),
              ],
            );
          }),
        ],
      ),
    );
  }
}

class _DateHeaderDelegate extends SliverPersistentHeaderDelegate {
  final String date;
  final String? location;

  _DateHeaderDelegate({required this.date, this.location});

  @override
  double get maxExtent => 40.0;

  @override
  double get minExtent => 40.0;

  @override
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) {
    return Container(
      color: Theme.of(context).scaffoldBackgroundColor,
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      alignment: Alignment.centerLeft,
      child: Row(
        children: [
          Text(date, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          if (location != null) ...[
            const SizedBox(width: 8),
            const Icon(Icons.location_on, size: 16, color: Colors.grey),
            const SizedBox(width: 4),
            Text(location!, style: const TextStyle(color: Colors.grey, fontSize: 14)),
          ],
        ],
      ),
    );
  }

  @override
  bool shouldRebuild(covariant SliverPersistentHeaderDelegate oldDelegate) {
    return false;
  }
}
