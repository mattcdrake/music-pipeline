// Dependencies
import React from "react";
import { shortenPhrase } from "../helpers";

// Types
import { Album } from "../types";

interface AlbumCardProps {
  album: Album;
}

interface AlbumCardState {
  max_title_len: number; // Determines viewable length of the album title
  max_artist_len: number; // Determines viewable length of the artist name
}

export class AlbumCard extends React.Component<AlbumCardProps, AlbumCardState> {
  constructor(props: AlbumCardProps) {
    super(props);
    this.setState({
      max_title_len: 40,
      max_artist_len: 20,
    });
  }

  render() {
    return (
      <div className="border border-gray-300 hover:border-pink-600 cursor-pointer shadow-2xl rounded-lg m-4 py-4 w-60 h-84 bg-gray-200 relative flex">
        <div className="flex mx-auto px-2 h-36">
          <div className="m-auto">
            <p className="text-lg font-bold text-center">
              {shortenPhrase(this.props.album.title, this.state.max_title_len)}
            </p>
            <p className="italic text-xs text-center">by</p>
            <p className="text font-bold text-center">
              {shortenPhrase(
                this.props.album.artist,
                this.state.max_artist_len
              )}
            </p>
            <p className="text-center">
              {this.props.album.releaseDate.toDateString()}
            </p>
          </div>
        </div>
        <img
          alt="album cover"
          className="block mx-auto w-2/3 absolute bottom-4 left-0 right-0"
          src={this.props.album.coverURL.href}
        />
      </div>
    );
  }
}
