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

interface IPageCache {
  [key: string]: number;
}

interface IProps {}

interface IState {
  apiURL: URL;
  pageCache: IPageCache;
  albums: Album[];
  dateFilter: Date | undefined;
  genreFilter: string | undefined;
  triggerGetAlbumsRef: React.RefObject<HTMLSpanElement>;
  observer: IntersectionObserver;
}

class App extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.getNextPage = this.getNextPage.bind(this);
    this.handleObserver = this.handleObserver.bind(this);
    this.updateDateFilter = this.updateDateFilter.bind(this);
    this.updateGenreFilter = this.updateGenreFilter.bind(this);
    this.replaceTrigger = this.replaceTrigger.bind(this);

    // Initialize page cache using current date as filter and page number 0
    const initialDate = new Date();
    const dateFilterStr = this.dateToFilterStr(initialDate);
    let pageCache: IPageCache = {};
    pageCache[dateFilterStr] = 0;

    this.state = {
      apiURL: config.serverURL,
      pageCache: pageCache,
      dateFilter: undefined,
      genreFilter: undefined,
      albums: [],
      triggerGetAlbumsRef: React.createRef(),
      observer: new IntersectionObserver(this.handleObserver),
    };
  }

  dateToFilterStr(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth() + 1}`;
  }

  handleObserver(entries: IntersectionObserverEntry[]) {
    if (entries[0].isIntersecting) {
      this.getNextPage();
    }
  }

  updateDateFilter(date: Date | undefined) {
    console.log(date);
    this.setState({
      dateFilter: date,
    });
  }

  updateGenreFilter(genre: string) {
    this.setState({
      genreFilter: genre,
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

    let filterStr = this.getActiveFilterStr();
    this.setState(
      {
        pageCache: {
          ...this.state.pageCache,
          // Update active filter page
          [filterStr]: this.state.pageCache[filterStr] + 1,
        },
      },
      this.replaceTrigger
    );
  }

  // Creates a string of active filters. For use in getting albums and caching page numbers.
  getActiveFilterStr(): string {
    let filterStr = "";
    if (this.state.dateFilter) {
      filterStr += `${this.dateToFilterStr(this.state.dateFilter)}`;
    }

    if (this.state.genreFilter) {
      filterStr += this.state.genreFilter;
    }

    return filterStr;
  }

  async getAlbums(): Promise<Album[]> {
    // If there hasn't been a request for this filter yet, save the page/filter in cache
    const filterStr = this.getActiveFilterStr();
    let filterPg = 0;
    if (filterStr in this.state.pageCache) {
      filterPg = this.state.pageCache[filterStr];
    } else {
      this.setState({
        pageCache: {
          ...this.state.pageCache,
          [filterStr]: 0,
        },
      });
    }

    let apiURL: string = `${this.state.apiURL.href}/albums/${filterPg}?`;

    // Find the correct page for a given filter

    if (this.state.genreFilter) {
      apiURL += `genre=${this.state.genreFilter}&`;
    }

    if (this.state.dateFilter) {
      apiURL += `month=${this.dateToFilterStr(this.state.dateFilter)}`;
    }

    const res = await fetch(apiURL);
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
            if (this.state.dateFilter) {
              return album.releaseDate > this.state.dateFilter;
            }
            return true;
          })}
          observer={this.state.observer}
          triggerGetAlbumsRef={this.state.triggerGetAlbumsRef}
        />
      </div>
    );
  }
}

export default App;
