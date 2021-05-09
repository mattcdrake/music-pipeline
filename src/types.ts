export interface Album {
  artist: string;
  title: string;
  genre: string;
  releaseDate: Date;
  coverURL: URL;
}

export interface RawAlbum {
  artist: string;
  title: string;
  genre: string;
  releaseDate: string;
  coverURL: string;
}
