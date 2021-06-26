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
 * @param {string} artist
 * @param {string} title
 * @returns {boolean}
 */
const getAlbumsByNameTitle = async (
  artist: string,
  title: string
): Promise<Album[] | undefined> => {
  const query = datastore
    .createQuery("album")
    .filter("artist", "=", artist)
    .filter("title", "=", title);

  const result: Album[] | undefined = await datastore
    .runQuery(query)
    .then((entities: RunQueryResponse) => entities[0]);

  return result;
};

/**
 * Takes an album and an array of albums. Returns the album in the array with a
 * release date closest to the supplied album.
 *
 * Empty arrays will return undefined.
 *
 * @param {Album} album
 * @param {Album[]} comparedAlbums
 * @returns {Album | undefined}
 */
const getClosestDatedAlbum = (
  album: Album,
  comparedAlbums: Album[]
): Album | undefined => {
  let res = undefined;
  let minTime = Infinity;

  if (typeof album === "undefined") {
    return comparedAlbums[0];
  }

  for (const comp of comparedAlbums) {
    const delta = Math.abs(
      album.releaseDate.getTime() - comp.releaseDate.getTime()
    );
    if (delta < minTime) {
      res = comp;
      minTime = delta;
    }
  }

  return res;
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
const areEqualAlbums = (album1: Album, album2: AlbumJSON): boolean => {
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
    const albumEntities = await getAlbumsByNameTitle(album.artist, album.title);
    const firstAlbum = albumEntities[0];

    const tbaEntities = await getAlbumsByNameTitle(album.artist, "TBA");
    const tbaToUpdate = getClosestDatedAlbum(firstAlbum, tbaEntities);

    if (
      typeof firstAlbum === "undefined" &&
      typeof tbaToUpdate !== "undefined"
    ) {
      // This album hasn't been seen before and there is a "TBA" album
      updateAlbum(tbaToUpdate, album);
    } else if (typeof firstAlbum === "undefined") {
      // This album hasn't been seen before and there isn't a "TBA" album
      addAlbum(album);
    } else if (!areEqualAlbums(firstAlbum, album)) {
      // This album is already present and needs to be updated
      updateAlbum(firstAlbum, album);
    }
  }
};
