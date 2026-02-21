import 'package:uuid/uuid.dart';

// Generate dummy albums
final List<Album> dummyAlbums = [
  Album(
    id: '1',
    title: 'Favorites',
    coverUrl: 'https://picsum.photos/seed/fav/400/400',
    photoCount: 12,
  ),
  Album(
    id: '2',
    title: 'Camera',
    coverUrl: 'https://picsum.photos/seed/cam/400/400',
    photoCount: 150,
  ),
  Album(
    id: '3',
    title: 'Screenshots',
    coverUrl: 'https://picsum.photos/seed/scr/400/400',
    photoCount: 45,
  ),
  Album(
    id: '4',
    title: 'Vacation 2023',
    coverUrl: 'https://picsum.photos/seed/vac/400/400',
    photoCount: 89,
  ),
];

// Generate dummy photos
final List<Photo> dummyPhotos = List.generate(50, (index) {
  final now = DateTime.now();
  // Distribute photos across the last 10 days
  final daysAgo = index ~/ 5;
  final date = now.subtract(Duration(days: daysAgo));

  return Photo(
    id: _uuid.v4(),
    url: 'https://picsum.photos/seed/${index + 100}/800/800',
    date: date,
    location: index % 3 == 0 ? 'San Francisco, CA' : null,
  );
});

final _uuid = const Uuid();

class Album {
  final String id;
  final String title;
  final String coverUrl;
  final int photoCount;

  Album({
    required this.id,
    required this.title,
    required this.coverUrl,
    required this.photoCount,
  });
}

class Photo {
  final String id;
  final String url;
  final DateTime date;
  final String? location;

  Photo({
    required this.id,
    required this.url,
    required this.date,
    this.location,
  });
}
