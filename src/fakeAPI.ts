import { Album } from "./types";

const faker = require("faker");
const albumsMax = 1000;
const pageSize = 10;
const fakeGenres: string[] = faker.lorem.words(5).split(" ");

// Fake album data
let albums: Album[] = [];
albums.push({
  artist: `${faker.name.firstName()} ${faker.name.lastName()} ${faker.name.lastName()}`,
  title: faker.lorem.words(Math.floor(Math.random() * 10) + 7),
  genre: fakeGenres[Math.floor(Math.random() * 5)],
  releaseDate: faker.date.future(),
  coverURL: new URL(faker.image.image(200, 200)),
});
for (let i = 0; i < albumsMax; ++i) {
  albums.push({
    artist: `${faker.name.firstName()} ${faker.name.lastName()}`,
    title: faker.lorem.words(Math.floor(Math.random() * 5) + 1),
    genre: fakeGenres[Math.floor(Math.random() * 5)],
    releaseDate: faker.date.future(),
    coverURL: new URL(faker.image.image(200, 200)),
  });
}

albums = albums.sort((a: Album, b: Album) => {
  if (a.releaseDate < b.releaseDate) {
    return -1;
  } else if (a.releaseDate === b.releaseDate) {
    return 0;
  } else {
    return 1;
  }
});

// HACK: sort albums into buckets by genre
const albumsByGenre: Album[][] = [[], [], [], [], []];
for (let i = 0; i < 5; ++i) {
  for (let j = 0; j < albums.length; ++j) {
    if (albums[j].genre === fakeGenres[j]) {
      albumsByGenre[i].push(albums[j]);
    }
  }
}

const getAlbums = (page: number): Album[] => {
  const start = page * pageSize;
  const end = start + pageSize;
  return albums.slice(start, end);
};

const getGenres = (genre: string, page: number): Album[] => {
  // Find bucket by looking up index in fakeGenres
  const bucket = fakeGenres.indexOf(genre);
  if (bucket === -1) {
    return [];
  }

  const start = page * pageSize;
  const end = start + pageSize;
  return albumsByGenre[bucket].slice(start, end);
};

exports.getAlbums = getAlbums;
