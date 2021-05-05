import { Album } from "../types";

const faker = require("faker");

export let albums: Album[] = [];
for (let i = 0; i < 30; ++i) {
  albums.push({
    artist: `${faker.name.firstName()} ${faker.name.lastName()}`,
    title: faker.lorem.words(Math.floor(Math.random() * 5)),
    releaseDate: faker.date.future(),
    coverURL: new URL(faker.image.image(200, 200)),
  });
}
