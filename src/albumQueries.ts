import { Album } from "./types";

const pageSize = 20;

const addAlbums = (albums: Album[]): boolean => {
  return true;
};

const getAlbumsByGenre = (genre: string, page: number): Album[] => {
  return [];
};

const getAlbumsByMonth = (monthYr: string, page: number): Album[] => {
  return [];
};

exports.addAlbums = addAlbums;
exports.getAlbumsByGenre = getAlbumsByGenre;
exports.getAlbumsByMonth = getAlbumsByMonth;
