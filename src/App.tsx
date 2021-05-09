import React from "react";
import "./App.css";
import _ from "lodash";

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
  dateFilter: Date;
  triggerGetAlbumsRef: React.RefObject<HTMLSpanElement>;
  observer: IntersectionObserver;
}

class App extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.getNextPage = this.getNextPage.bind(this);
    this.handleObserver = this.handleObserver.bind(this);
    this.updateDateFilter = this.updateDateFilter.bind(this);
    this.replaceTrigger = this.replaceTrigger.bind(this);
    this.state = {
      apiURL: config.serverURL,
      page: 0,
      dateFilter: new Date(),
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
    this.setState({
      dateFilter: date,
    });
  }

  appendAlbums(albums: Album[]) {
    let newAlbums: Album[] = this.state.albums.concat(albums);
    newAlbums = _.uniqBy(newAlbums, (album) => `${album.title}${album.artist}`);
    newAlbums = newAlbums.sort((a: Album, b: Album) => {
      // Sort albums in ascending order
      if (a.releaseDate < b.releaseDate) {
        return -1;
      } else if (a.releaseDate === b.releaseDate) {
        return 0;
      } else {
        return 1;
      }
    });
    this.setState({ albums: newAlbums });
  }

  async getNextPage() {
    const albums = await this.getAlbums();
    if (albums.length === 0) {
      return;
    }
    this.appendAlbums(albums);
    this.setState(
      (prevState) => ({
        page: prevState.page + 1,
      }),
      this.replaceTrigger
    );
  }

  async getAlbums(): Promise<Album[]> {
    const res = await fetch(
      `${this.state.apiURL.href}/albums/${this.state.page}`
    );
    const data = await res.json();
    const albums = data.map((rawAlbum: RawAlbum) => ({
      artist: rawAlbum.artist,
      title: rawAlbum.title,
      genre: rawAlbum.genre,
      releaseDate: new Date(rawAlbum.releaseDate),
      coverURL: new URL(rawAlbum.coverURL),
    }));
    console.log(albums);
    return albums;
  }

  replaceTrigger() {
    this.state.observer.unobserve(this.state.triggerGetAlbumsRef.current!);
    this.setState({ triggerGetAlbumsRef: React.createRef() });
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
            return album.releaseDate > this.state.dateFilter;
          })}
          observer={this.state.observer}
          triggerGetAlbumsRef={this.state.triggerGetAlbumsRef}
        />
      </div>
    );
  }
}

export default App;
