export interface Album {
  artist: string;
  title: string;
  releaseDate: Date;
  coverURL: URL;
}

export interface RawAlbum {
  artist: string;
  title: string;
  releaseDate: string;
  coverURL: string;
}
