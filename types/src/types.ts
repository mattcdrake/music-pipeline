import { entity } from "@google-cloud/datastore/build/src/entity";

// Representation of an individual album
export interface Album {
  [entity.KEY_SYMBOL]?: entity.Key;
  id: string;
  artist: string;
  title: string;
  genres: string[];
  releaseDate: Date;
  coverURL: string;
}

// An individual album without meaningful types
export interface AlbumJSON {
  id: string;
  artist: string;
  title: string;
  genres: string[];
  releaseDate: string;
  coverURL: string;
}
