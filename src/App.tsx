import React from "react";
import "./App.css";

// Components
import { AlbumsContainer } from "./components/AlbumsContainer";
import { FilterBar } from "./components/FilterBar";
import { Header } from "./components/Header";
import { Navbar } from "./components/Navbar";

// Types
import { Album, RawAlbum } from "./types";

// Config
import { config } from "./config";

interface IProps {}

interface IState {
  apiURL: URL;
  page: number;
  albums: Album[];
}

class App extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      apiURL: config.serverURL,
      page: 0,
      albums: [],
    };
  }

  async componentDidMount() {
    const albums = await this.getAlbums(this.state.page);
    this.appendAlbums(albums);
  }

  appendAlbums(albums: Album[]) {
    this.setState((prevState) => ({
      albums: prevState.albums.concat(albums),
    }));
  }

  async getAlbums(page: number): Promise<Album[]> {
    const res = await fetch(
      this.state.apiURL.href + `/albums/${this.state.page}`
    );
    const data = await res.json();
    const albums = data.map((rawAlbum: RawAlbum) => ({
      artist: rawAlbum.artist,
      title: rawAlbum.title,
      releaseDate: new Date(rawAlbum.releaseDate),
      coverURL: new URL(rawAlbum.coverURL),
    }));

    return albums;
  }

  render() {
    console.log(this.state.albums);
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 pt-8">
          <Header />
          <FilterBar />
        </div>
        <AlbumsContainer albums={this.state.albums} />
      </div>
    );
  }
}

export default App;
