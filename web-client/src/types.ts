// An individual album
export interface Album {
  artist: string;
  title: string;
  genre: string;
  releaseDate: Date;
  coverURL: URL;
}

// An individual album without meaningful types
export interface RawAlbum {
  artist: string;
  title: string;
  genre: string;
  releaseDate: string;
  coverURL: string;
}
