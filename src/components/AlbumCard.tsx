import React from "react";

import { Album } from "../types";

interface AlbumCardProps {
  album: Album;
}

export const AlbumCard = (props: AlbumCardProps) => {
  return (
    <div className="border border-gray-400 shadow-2xl rounded-lg m-4 py-4 w-56 bg-gray-300">
      <p className="text-xl font-bold text-center">{props.album.title}</p>
      <p className="italic text-xs text-center">by</p>
      <p className="text-lg font-bold text-center">{props.album.artist}</p>
      <p className="text-center">{props.album.releaseDate.toDateString()}</p>
      <img
        alt="album cover"
        className="pt-4 mx-auto w-2/3"
        src={props.album.coverURL.href}
      />
    </div>
  );
};
