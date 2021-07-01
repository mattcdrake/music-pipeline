// Dependencies
import React from "react";

// Components
import { AlbumCard } from "./AlbumCard";

// Types
import { Album } from "../../../types/src/types";

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
    let emptyMessage;
    if (this.props.albums.length === 0) {
      emptyMessage = <p className="text-5xl my-20">No albums to display :(</p>;
    }

    return (
      <div className="border-t border-black justify-center h-screen overflow-scroll mx-auto mt-4 px-4 flex flex-wrap">
        {this.props.albums.map((album) => (
          <AlbumCard key={album.id} album={album} />
        ))}

        {emptyMessage}
        <span ref={this.props.triggerGetAlbumsRef}></span>
      </div>
    );
  }
}
