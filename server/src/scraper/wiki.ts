// Dependencies
import _, { last } from "lodash";
import cheerio from "cheerio";
import got from "got";

// Types
import { AlbumJSON } from "../../../types/src/types";

// Constants
const WIKI_ROOT = "https://en.wikipedia.org";
const WIKI_PAGE = "/wiki/List_of_2021_albums";
const DEFAULT_ALBUM_IMG = "https://i.imgur.com/R6q9ogr.png";
const CURRENT_YEAR = 2021;

/**
 * Strips out "//" from the beginning of a string. Used for removing relative
 * protocols from src attributes.
 *
 * @param {string} src
 * @param {string}
 */
const stripRelProto = (src: string): string => {
  if (src.length < 2 || src.substr(0, 2) !== "//") {
    return src;
  }

  return src.substr(2);
};

/**
 * Checks a page for an infobox image and returns it if present. Otherwise,
 * returns undefined.
 *
 * @param {string} html
 * @returns {string | undefined}
 */
const getInfoboxImage = (html: string): string | undefined => {
  let $, art;
  try {
    $ = cheerio.load(html);
    art = $(".infobox img").attr("src");
  } catch (e: any) {
    return undefined;
  }

  if (typeof art === "undefined") {
    return undefined;
  }

  return "https://" + stripRelProto(art);
};

/**
 * Parses a Cheerio element for a link and attempts to get its HTML.
 *
 * @param {cheerio.Root} $
 * @param {cheerio.Element} elem
 * @returns {Promise<string | undefined>}
 */
const getHTMLFromElement = async (
  $: cheerio.Root,
  elem: cheerio.Element
): Promise<string | undefined> => {
  let href;
  try {
    href = $("a", elem).attr().href;
  } catch (e: any) {
    return undefined;
  }

  let html;
  try {
    const res = await got(WIKI_ROOT + href);
    html = res.body;
  } catch (e: any) {
    return undefined;
  }

  return html;
};

/**
 * Gets the correct image for a given album. Prioritizes album art, falls back
 * to artist and then placeholder art.
 *
 * @param {cheerio.Root} $
 * @param {cheerio.Element} row
 * @returns {string}
 */
const getImage = (albumHTML: string, artistHTML: string): string => {
  // Does the album page have an image?
  const albumArtURL = getInfoboxImage(albumHTML);
  if (typeof albumArtURL !== "undefined") {
    return albumArtURL;
  }

  // Does the artist page have an image?
  const artistImgURL = getInfoboxImage(artistHTML);
  if (typeof artistImgURL !== "undefined") {
    return artistImgURL;
  }

  return DEFAULT_ALBUM_IMG;
};

/**
 * Get genres from an artist page.
 *
 * @param {string} html
 * @returns {string[]}
 */
const getGenres = (html: string): string[] => {
  let genres: string[] = [];

  let $: cheerio.Root;
  try {
    $ = cheerio.load(html);
  } catch (e: any) {
    return genres;
  }

  // Finds the "Genres" row from the infobox and strips out the genres from the
  // right side.
  const rows = $(".infobox tr");
  for (const row of rows) {
    const title = $("th", row).text().trim();

    if (title === "Genres") {
      const anchors = $("td a", row).toArray();
      let anchorStrs = anchors.map((anchor) => $(anchor).text());
      anchorStrs = anchorStrs.filter((str) => str.indexOf("[") === -1);
      anchorStrs = anchorStrs.map((str) => str.toLowerCase());
      genres = genres.concat(anchorStrs);
    }
  }

  return genres;
};

/**
 * Processes a row from a monthly table and adds it to the passed-in array.
 *
 * @param {cheerio.Root} $
 * @param {cheerio.Element} row
 * @returns {AlbumJSON}
 */
const processAlbum = async (
  $: cheerio.Root,
  row: cheerio.Element
): Promise<AlbumJSON> => {
  const cols = $(row).children().toArray().slice(0, 5);
  const colVals = cols.map((cell) => $(cell).text().trim());
  const albumHTML: string | undefined = await getHTMLFromElement($, cols[2]);
  const artistHTML: string | undefined = await getHTMLFromElement($, cols[1]);

  // Get genres from upcoming albums page and artist page, then combine them.
  let genres = colVals[3].split(",");
  for (let i = 0; i < genres.length; ++i) {
    genres[i] = genres[i].trim();
  }

  const addlGenres = getGenres(artistHTML);
  for (const genre of addlGenres) {
    genres.push(genre);
  }
  genres = genres.filter((genre) => genre !== "");

  // Convert release dates to a JS Date string or "TBA"
  let releaseDate =
    colVals[0] === "TBA" ? "TBA" : `${colVals[0]}, ${CURRENT_YEAR}`;

  if (releaseDate !== "TBA") {
    releaseDate = new Date(releaseDate).toString();
  }

  const coverURL = getImage(albumHTML, artistHTML);

  return {
    id: "",
    artist: colVals[1],
    title: colVals[2],
    genres,
    releaseDate,
    coverURL,
  };
};

/**
 * Processes a month table and produces an array of albums.
 *
 * @param {cheerio.Root} $
 * @param {cheerio.Cheerio} rows
 * @returns {AlbumJSON[]}
 */
const processMonthTable = async (
  $: cheerio.Root,
  rows: cheerio.Cheerio
): Promise<AlbumJSON[]> => {
  // Some rows in the table share a release date. I'm iterating through the
  // table and tracking which elements have a rowspan value. If it does,
  // save the date and the number of times it should be used. If the row
  // _uses_ a prior date value, prepend the element array with the last
  // date.
  let albums: AlbumJSON[] = [];
  let firstDate: cheerio.Cheerio | undefined = undefined;
  let lastDate: cheerio.Cheerio;
  let lastDateCt = 0;

  //for (const row of rows) {
  for (const row of rows.slice(-11)) {
    const rowspan = $(row).children().first().attr().rowspan;

    if (lastDateCt > 0) {
      $(lastDate).prependTo($(row));
      lastDateCt--;
    }

    if (typeof rowspan !== "undefined") {
      lastDate = $(row).children().first();
      lastDateCt = parseInt(rowspan) - 1;
    }

    if (typeof firstDate === "undefined") {
      firstDate = $(row).children().first();
    }

    const album = await processAlbum($, row);
    albums.push(album);
  }

  // Converting release date to string rep. of JS date object
  albums
    .filter((album) => album.releaseDate !== "TBA")
    .forEach((album) => {
      const date = new Date(album.releaseDate);
      album.releaseDate = date.toString();
    });

  // Setting albums with "TBA" release dates to have a date at the last day of
  // the current month.
  albums
    .filter((album) => album.releaseDate === "TBA")
    .forEach((album) => {
      const date = new Date($(firstDate).text().trim());
      const newDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      album.releaseDate = newDate.toString();
    });

  return albums;
};

/**
 * Takes a "tr" element and determines whether it's the top row of a given month's table.
 *
 * @param {cheerio.Cheerio} row
 * @returns {boolean}
 */
const isMonthHeader = ($: cheerio.Root, row: cheerio.Cheerio): boolean => {
  const cols = row.children().toArray().slice(0, 5);
  const monthTitles = ["Release date", "Artist", "Album", "Genre", "Label"];
  let rowTitles = [];

  try {
    rowTitles = cols.map((cell) => $(cell).text().trim());
  } catch {
    return false;
  }

  return _.isEqual(monthTitles, rowTitles);
};

/**
 * Parses the Wikipedia annual album releases page and converts the list of
 * albums to JSON.
 *
 * @returns {Promise<AlbumJSON[]}
 */
export const scrapeWiki = async (): Promise<AlbumJSON[]> => {
  let albums: AlbumJSON[] = [];

  let wikiHTML;
  try {
    const res = await got(WIKI_ROOT + WIKI_PAGE);
    wikiHTML = res.body;
  } catch (e: any) {
    return albums;
  }

  const $ = cheerio.load(wikiHTML);
  const wikitables = $(".wikitable tbody").toArray();

  // REMOVE AFTER UNCOMMENTING BELOW
  const table = wikitables[7];
  const rows = $("tr", table).slice(1);
  const firstRow = rows.first();

  if (isMonthHeader($, firstRow)) {
    const tableAlbums = await processMonthTable($, rows.slice(1));
    albums = albums.concat(tableAlbums);
  } else {
    console.log("checking for TBA albums");
  }
  // END REMOVE

  /*
  for (const table of wikitables) {
    const rows = $("tr", table).slice(1);
    const firstRow = rows.first();

    if (isMonthHeader($, firstRow)) {
      const tableAlbums = await processMonthTable($, rows.slice(1));
      albums = albums.concat(tableAlbums);
    } else {
      console.log("checking for TBA albums");
    }
  }
  */

  console.log(albums);
  return albums;
};

export const testFuncs = {
  stripRelProto,
};
