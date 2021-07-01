// Dependencies
import React from "react";
import "./App.css";
import _ from "lodash";

// Components
import { AlbumsContainer } from "./components/AlbumsContainer";
import { FilterBar } from "./components/FilterBar";
import { Header } from "./components/Header";
import { Navbar } from "./components/Navbar";

// Types
import { Album, AlbumJSON } from "../../types/src/types";

// Config
import { config } from "./config";

interface IPageCache {
  [key: string]: number;
}

interface IProps {}

interface IState {
  apiURL: URL;
  pageCache: IPageCache; // Used to efficiently request new albums with infinite scroll + filters
  albums: Album[];
  dateFilter: Date | undefined;
  genreFilter: string | undefined;
  searchFilter: string;
  genreList: string[];
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
    this.updateSearchFilter = this.updateSearchFilter.bind(this);
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
      searchFilter: "",
      genreList: [],
      albums: [],
      triggerGetAlbumsRef: React.createRef(),
      observer: new IntersectionObserver(this.handleObserver),
    };
  }

  componentDidMount() {
    document.title = "Music Pipeline";
  }

  /**
   * Takes an array of albums and merges them into the array of albums in state.
   * Removes duplicates and sorts them in ascending order by time.
   *
   * @param {Album[]} albums The array of albums to add to state.
   */
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
    this.setState({ albums: newAlbums }, this.updateGenreList);
  }

  /**
   * Applies active date & genre filters to an album array.
   *
   * @param {Album[]} albums The album array to filter
   * @returns {Album[]} The filtered array
   */
  applyFilters(albums: Album[]): Album[] {
    // Only include albums that are beyond the date filter
    albums = albums.filter((album) => {
      if (this.state.dateFilter) {
        return album.releaseDate > this.state.dateFilter;
      }
      return true;
    });

    // Only include albums that are in the selected genre
    albums = albums.filter((album) => {
      if (this.state.genreFilter) {
        return album.genres.includes(this.state.genreFilter);
      }
      return true;
    });

    // Only include albums that pass the search string filter.
    albums = albums.filter((album) => {
      return (
        album.artist.toLowerCase().includes(this.state.searchFilter) ||
        album.title.toLowerCase().includes(this.state.searchFilter)
      );
    });

    return albums;
  }

  /**
   * Takes a date and returns a string that matches the date filter format "YYYY-MM".
   * This format is based on the "month" input element.
   *
   * @param {Date} date
   * @returns {string}
   */
  dateToFilterStr(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth() + 1}`;
  }

  /**
   * Gets the next page from the API based on what the active filters are. Then records
   * the requested page in pageCache.
   */
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

  /**
   * Creates a string of active filters. For use in getting albums and caching page numbers.
   *
   * @returns {string} Active filters
   */
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

  /**
   * Gets the next page of albums from the API, based on active filters.
   *
   * @returns {Promise<Album[]>}
   */
  async getAlbums(): Promise<Album[]> {
    // If there hasn't been a request for this filter yet, save the filter with page 0.
    // Otherwise, find the correct page for a given filter.
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

    let apiURL: string = `${this.state.apiURL.href}albums?`;

    // Append genre query param
    if (this.state.genreFilter) {
      apiURL += `genre=${this.state.genreFilter}&`;
    }

    // Append date query param
    if (this.state.dateFilter) {
      apiURL += `date=${this.state.dateFilter.toISOString()}&`;
    }

    // Append page query param
    apiURL += `p=${filterPg}&`;

    const res = await fetch(apiURL);
    const data = await res.json();
    const albums = data.map((rawAlbum: AlbumJSON) => ({
      id: rawAlbum.id,
      artist: rawAlbum.artist,
      title: rawAlbum.title,
      genres: rawAlbum.genres,
      releaseDate: new Date(rawAlbum.releaseDate),
      coverURL: rawAlbum.coverURL === "" ? "" : new URL(rawAlbum.coverURL),
    }));
    return albums;
  }

  /**
   * Gets next page whenever the observed element is on the page. Enables infinite scrolling.
   *
   * @param {IntersectionObserverEntry[]} entries Contains event info
   */
  handleObserver(entries: IntersectionObserverEntry[]) {
    if (entries[0].isIntersecting) {
      this.getNextPage();
    }
  }

  /**
   * Setter for active date filter.
   *
   * @param {Date | undefined} date
   */
  updateDateFilter(date: Date | undefined) {
    this.setState({
      dateFilter: date,
    });
  }

  /**
   * Setter for active genre filter.
   *
   * @param {string | undefined} genre
   */
  updateGenreFilter(genre: string | undefined) {
    let newFilter: string | undefined = undefined;
    if (genre) {
      newFilter = escape(genre);
    }

    this.setState({
      genreFilter: newFilter,
    });
  }

  /**
   * Iterate through albums and build a list of represented genres
   */
  updateGenreList() {
    let newGenreList: string[] = [];
    for (const album of this.state.albums) {
      if (typeof album.genres === "undefined") {
        continue;
      }

      for (const genre of album.genres) {
        if (!newGenreList.includes(genre)) {
          newGenreList.push(genre);
        }
      }
    }
    this.setState({
      genreList: newGenreList,
    });
  }

  /**
   * Setter for active search string.
   *
   * @param {string} newFilter
   */
  updateSearchFilter(newFilter: string) {
    this.setState({
      searchFilter: newFilter,
    });
  }

  /**
   * Refreshes infinite scroll trigger reference and removes the old one
   * from observer.
   */
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
          <FilterBar
            updateDateFilter={this.updateDateFilter}
            updateGenreFilter={this.updateGenreFilter}
            updateSearchFilter={this.updateSearchFilter}
            genreList={this.state.genreList}
          />
        </div>
        <AlbumsContainer
          albums={this.applyFilters(this.state.albums)}
          observer={this.state.observer}
          triggerGetAlbumsRef={this.state.triggerGetAlbumsRef}
        />
      </div>
    );
  }
}

export default App;
