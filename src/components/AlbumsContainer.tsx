import React from "react";

// Components
import { AlbumCard } from "./AlbumCard";

// Types
import { Album } from "../types";

interface AlbumsContainerProps {
  albums: Album[];
}

export const AlbumsContainer = (props: AlbumsContainerProps) => {
  return (
    <div className="justify-center overflow-visible mx-auto px-4 flex flex-wrap">
      {props.albums.map((album) => (
        <AlbumCard album={album} />
      ))}
    </div>
  );
};
