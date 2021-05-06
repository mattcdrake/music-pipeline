import { Album } from "./types";

const faker = require("faker");
const albumsMax = 100;
const pageSize = 10;

// Fake album data
const albums: Album[] = [];
albums.push({
  artist: `${faker.name.firstName()} ${faker.name.lastName()} ${faker.name.lastName()}`,
  title: faker.lorem.words(Math.floor(Math.random() * 10) + 1),
  releaseDate: faker.date.future(),
  coverURL: new URL(faker.image.image(200, 200)),
});
for (let i = 0; i < albumsMax; ++i) {
  albums.push({
    artist: `${faker.name.firstName()} ${faker.name.lastName()}`,
    title: faker.lorem.words(Math.floor(Math.random() * 5) + 1),
    releaseDate: faker.date.future(),
    coverURL: new URL(faker.image.image(200, 200)),
  });
}

const getAlbums = (page: number): Album[] => {
  const start = page * pageSize;
  const end = start + pageSize;
  return albums.slice(start, end);
};

exports.getAlbums = getAlbums;
