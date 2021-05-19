// Dependencies
import React from "react";

// Components
import { AlbumCard } from "./AlbumCard";

// Types
import { Album } from "../types";

interface AlbumsContainerProps {
  albums: Album[];
  observer: IntersectionObserver; // Observes trigger to initiate infinite scroll
  triggerGetAlbumsRef: React.RefObject<HTMLSpanElement>; // Used as infinite scroll trigger
}

interface AlbumsContainerState {}

export class AlbumsContainer extends React.Component<
  AlbumsContainerProps,
  AlbumsContainerState
> {
  componentDidMount() {
    this.props.observer.observe(this.props.triggerGetAlbumsRef.current!);
  }

  componentDidUpdate() {
    this.props.observer.observe(this.props.triggerGetAlbumsRef.current!);
  }

  render() {
    return (
      <div className="justify-center overflow-visible mx-auto px-4 flex flex-wrap">
        {this.props.albums.map((album) => (
          <AlbumCard album={album} />
        ))}
        <span ref={this.props.triggerGetAlbumsRef}></span>
      </div>
    );
  }
}
