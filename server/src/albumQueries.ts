// Types
import { Album } from "./types";

// Default number of albums that are returned for a given request.
const pageSize = 20;

/**
 * Adds an array of albums to the database, if they don't already exist.
 *
 * @param {Album[]} albums An array of albums to add to the database.
 */
const addAlbums = (albums: Album[]) => {
  return true;
};

/**
 * Queries the database for albums from a given genre.  PageSize albums are
 * returned, starting at index (Page * PageSize).
 *
 * @param {string} genre
 * @param {number} page Used for pagination.
 */
const getAlbumsByGenre = (genre: string, page: number): Album[] => {
  return [];
};

/**
 * Queries the database for albums from a given month.  PageSize albums are
 * returned, starting at index (Page * PageSize).
 *
 * @param {string} month  "YYYY-MM"
 * @param {number} page Used for pagination.
 */
const getAlbumsByMonth = (monthYr: string, page: number): Album[] => {
  return [];
};

exports.addAlbums = addAlbums;
exports.getAlbumsByGenre = getAlbumsByGenre;
exports.getAlbumsByMonth = getAlbumsByMonth;
