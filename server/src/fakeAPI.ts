import { Album } from "./types";

const pageSize = 20;

const helpers = require("./setupModule");

const processAlbumsObjRaw = (albumsRaw: any) => {
  // Process arrays of raw objects from scraper into albums
  const albums2d: Album[][] = Object.keys(albumsRaw).map((key) => {
    if (key === "bad_tables") {
      return [];
    }
    return helpers.albumObjToArray(albumsRaw[key]);
  });
  let albumsFull: Album[] = [];

  for (const albumsTemp of albums2d) {
    albumsFull = albumsFull.concat(albumsTemp);
  }

  setAlbums(albumsFull);
};

// Store Albums by genre/date
interface GenreMap {
  [key: string]: Album[];
}

interface MonthMap {
  [key: string]: Album[];
}

let albums: Album[] = [];

const albumsByGenre: GenreMap = {};
const albumsByMonth: MonthMap = {};

const setAlbums = (albumsNew: Album[]) => {
  albums = albumsNew;

  // Are albums guaranteed to be processed at this point?
  albums = albums.sort((a: Album, b: Album) => {
    if (a.releaseDate < b.releaseDate) {
      return -1;
    } else if (a.releaseDate === b.releaseDate) {
      return 0;
    } else {
      return 1;
    }
  });

  for (const album of albums) {
    const genre = `${album.genre}`;
    if (genre in albumsByGenre) {
      albumsByGenre[genre].push(album);
    } else {
      // Otherwise, create a new array with this album as the only element.
      albumsByGenre[genre] = [album];
    }
  }

  for (const album of albums) {
    // If "YYYY-MM" is already a key in albumsByMonth, then push this album into that array.
    const monthStr = `${album.releaseDate.getFullYear()}-${
      album.releaseDate.getMonth() + 1
    }`;
    if (monthStr in albumsByMonth) {
      albumsByMonth[monthStr].push(album);
    } else {
      // Otherwise, create a new array with this album as the only element.
      albumsByMonth[monthStr] = [album];
    }
  }
};

export const getAlbums = (page: number): Album[] => {
  const start = page * pageSize;
  const end = start + pageSize;
  return albums.slice(start, end);
};

export const getAlbumsByGenre = (genre: string, page: number): Album[] => {
  if (!(genre in albumsByGenre)) {
    return [];
  }

  const start = page * pageSize;
  const end = start + pageSize;
  return albumsByGenre[genre].slice(start, end);
};

export const getAlbumsByMonth = (monthYr: string, page: number): Album[] => {
  if (!(monthYr in albumsByMonth)) {
    return [];
  }

  const start = page * pageSize;
  const end = start + pageSize;
  return albumsByMonth[monthYr].slice(start, end);
};

exports.processAlbumsObjRaw = processAlbumsObjRaw;
