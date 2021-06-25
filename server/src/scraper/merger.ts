// Dependencies
import _, { update } from "lodash";
import { Datastore, Entity } from "@google-cloud/datastore";

// Types
import { Album, AlbumJSON } from "../../../types/src/types";
import { RunQueryResponse } from "@google-cloud/datastore/build/src/query";

const datastore = new Datastore();

/**
 * Gets an album from datastore or returns undefined.
 *
 * @param {AlbumJSON} album
 * @returns {boolean}
 */
const getAlbum = async (album: AlbumJSON): Promise<Album | undefined> => {
  const query = datastore
    .createQuery("album")
    .filter("artist", "=", album.artist)
    .filter("title", "=", album.title);

  const result: Album | undefined = await datastore
    .runQuery(query)
    .then((entities: RunQueryResponse) => entities[0][0]);

  return result;
};

/**
 * Adds an album to the datastore.
 *
 * @param {AlbumJSON} album
 */
const addAlbum = (album: AlbumJSON) => {
  const entity = {
    key: datastore.key("album"),
    data: {
      artist: album.artist,
      title: album.title,
      genres: album.genres,
      releaseDate: new Date(album.releaseDate),
      coverURL: album.coverURL,
    },
  };

  datastore.save(entity);
};

/**
 * Updates a datastore entity based on a new album.
 *
 * @param {Album} entity
 * @param {AlbumJSON} album
 */
const updateAlbum = (entity: Album, album: AlbumJSON) => {
  entity.artist = album.artist;
  entity.title = album.title;
  entity.genres = album.genres;
  entity.releaseDate = new Date(album.releaseDate);
  entity.coverURL = album.coverURL;

  datastore.save(entity);
};

/**
 * Compares an album entity with an album's JSON representation and determines
 * if all their properties have the same values.
 *
 * @param {Album} album1
 * @param {AlbumJSON} album2
 * @returns {boolean}
 */
const isSameAlbum = (album1: Album, album2: AlbumJSON): boolean => {
  if (
    album1.artist !== album2.artist ||
    album1.title !== album2.title ||
    album1.releaseDate.toString() !== album2.releaseDate ||
    album1.coverURL !== album2.coverURL
  ) {
    return false;
  }

  return _.isEqual(album1.genres, album2.genres);
};

/**
 * Takes a list of albums and adds them to (or updates) the datastore as
 * necessary.
 *
 * @param {AlbumJSON[]} albums
 */
export const mergeAlbums = async (albums: AlbumJSON[]) => {
  for (const album of albums) {
    let entity = await getAlbum(album);

    if (typeof entity === "undefined") {
      addAlbum(album);
    } else if (!isSameAlbum(entity, album)) {
      updateAlbum(entity, album);
    }
  }
};
