import React from "react";

import { Album } from "../types";

// Magic numbers
const MAX_TITLE_LEN = 40;
const MAX_ARTIST_LEN = 20;

const shortenPhrase = (phrase: string, cap: number) => {
  if (phrase.length < cap) {
    return phrase;
  }

  const shortened = phrase.slice(0, cap) + "...";
  return shortened;
};

interface AlbumCardProps {
  album: Album;
}

export const AlbumCard = (props: AlbumCardProps) => {
  return (
    <div className="border border-gray-300 hover:border-pink-600 cursor-pointer shadow-2xl rounded-lg m-4 py-4 w-60 h-84 bg-gray-200 relative flex">
      <div className="flex mx-auto px-2 h-36">
        <div className="m-auto">
          <p className="text-lg font-bold text-center">
            {shortenPhrase(props.album.title, MAX_TITLE_LEN)}
          </p>
          <p className="italic text-xs text-center">by</p>
          <p className="text font-bold text-center">
            {shortenPhrase(props.album.artist, MAX_ARTIST_LEN)}
          </p>
          <p className="text-center">
            {props.album.releaseDate.toDateString()}
          </p>
          <p>{props.album.genre}</p>
        </div>
      </div>
      <img
        alt="album cover"
        className="block mx-auto w-2/3 absolute bottom-4 left-0 right-0"
        src={props.album.coverURL.href}
      />
    </div>
  );
};
