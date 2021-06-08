import { entity } from "@google-cloud/datastore/build/src/entity";

// Representation of an individual album
export interface Album {
  [entity.KEY_SYMBOL]?: entity.Key;
  id: string;
  artist: string;
  title: string;
  genre: string;
  releaseDate: Date;
  coverURL: URL;
}

// An individual album without meaningful types
export interface AlbumJSON {
  id: string;
  artist: string;
  title: string;
  genre: string;
  releaseDate: string;
  coverURL: string;
}
