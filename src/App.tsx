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
  dateFilter?: Date;
  triggerGetAlbumsRef: React.RefObject<HTMLSpanElement>;
  observer: IntersectionObserver;
}

class App extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.getNextPage = this.getNextPage.bind(this);
    this.handleObserver = this.handleObserver.bind(this);
    this.updateDateFilter = this.updateDateFilter.bind(this);
    this.state = {
      apiURL: config.serverURL,
      page: 0,
      albums: [],
      triggerGetAlbumsRef: React.createRef(),
      observer: new IntersectionObserver(this.handleObserver),
    };
  }

  handleObserver(entries: IntersectionObserverEntry[]) {
    if (entries[0].isIntersecting) {
      this.getNextPage();
    }
  }

  updateDateFilter(date: Date) {
    this.setState(() => ({
      dateFilter: date,
    }));
  }

  appendAlbums(albums: Album[]) {
    this.setState((prevState) => ({
      albums: prevState.albums.concat(albums),
    }));
  }

  async getNextPage() {
    const albums = await this.getAlbums(this.state.page);
    this.appendAlbums(albums);
    this.setState((prevState) => ({
      page: prevState.page + 1,
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
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 pt-8">
          <Header />
          <FilterBar updateDateFilter={this.updateDateFilter} />
        </div>
        <AlbumsContainer
          // Only include albums that are beyond the date filter
          albums={this.state.albums.filter((album) => {
            if (this.state.dateFilter) {
              return album.releaseDate > this.state.dateFilter;
            } else {
              return true;
            }
          })}
          observer={this.state.observer}
          triggerGetAlbumsRef={this.state.triggerGetAlbumsRef}
        />
      </div>
    );
  }
}

export default App;
