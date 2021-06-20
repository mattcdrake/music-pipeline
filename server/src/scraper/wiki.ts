// Dependencies
import _, { last } from "lodash";
import cheerio from "cheerio";
import got from "got";

// Types
import { AlbumJSON } from "../../../types/src/types";

// Constants
const WIKI_ROOT = "https://en.wikipedia.org";
const WIKI_PAGE = "/wiki/List_of_2021_albums";

/**
 * Checks a page for album artwork and returns it if present. Otherwise, returns
 * an empty string.
 *
 * @param {cheerio.Root}
 * @param {cheerio.Element} album
 * @returns {Promise<string | null>}
 */
const getAlbumArt = async (
  $: cheerio.Root,
  album: cheerio.Element
): Promise<string | null> => {
  const href = $("a", album).attr().href;
  const url = WIKI_ROOT + href;

  let page;
  try {
    const res = await got(url);
    page = res.body;
  } catch (e: any) {
    return null;
  }
  console.log(page);

  return null;
};

/**
 * Gets the correct image for a given album. Prioritizes album art, falls back
 * to artist and then placeholder art.
 *
 * @param {cheerio.Root} $
 * @param {cheerio.Element} row
 * @returns {Promise<string | null>}
 */
const getImage = async (
  $: cheerio.Root,
  row: cheerio.Element
): Promise<string | null> => {
  // Does the album page have an image?
  const cols = $(row).children().toArray().slice(0, 5);
  const albumArtURL = getAlbumArt($, cols[2]);

  /**
   * 1) There is an album page, and it has an image
   *      - Get image
   * 2) There is an album page, but it doens't have an image
   * 3) There isn't an album page
   */

  // Does the artist page have an image?

  return null;
};

/**
 * Processes a row from a monthly table and adds it to the passed-in array.
 *
 * @param {cheerio.Root} $
 * @param {cheerio.Element} row
 * @returns {AlbumJSON}
 */
const processAlbum = ($: cheerio.Root, row: cheerio.Element): AlbumJSON => {
  const cols = $(row).children().toArray().slice(0, 5);
  const colVals = cols.map((cell) => $(cell).text().trim());
  const genres = colVals[3].split(",");

  for (let i = 0; i < genres.length; ++i) {
    genres[i] = genres[i].trim();
  }

  if (colVals[2] === "Sympathetic Magic") {
    getImage($, row);
  }

  return {
    id: "",
    artist: colVals[1],
    title: colVals[2],
    genres,
    releaseDate: colVals[0],
    coverURL: "",
  };
};

/**
 * Processes a month table and produces an array of albums.
 *
 * @param {cheerio.Root} $
 * @param {cheerio.Cheerio} rows
 * @returns {AlbumJSON[]}
 */
const processMonthTable = (
  $: cheerio.Root,
  rows: cheerio.Cheerio
): AlbumJSON[] => {
  // Some rows in the table share a release date. I'm iterating through the
  // table and tracking which elements have a rowspan value. If it does,
  // save the date and the number of times it should be used. If the row
  // _uses_ a prior date value, prepend the element array with the last
  // date.
  let albums: AlbumJSON[] = [];
  let lastDate: cheerio.Cheerio;
  let lastDateCt = 0;

  for (const row of rows) {
    const rowspan = $(row).children().first().attr().rowspan;

    if (lastDateCt > 0) {
      $(lastDate).prependTo($(row));
      lastDateCt--;
    }

    if (typeof rowspan !== "undefined") {
      lastDate = $(row).children().first();
      lastDateCt = parseInt(rowspan) - 1;
    }

    albums.push(processAlbum($, row));
  }

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

  for (const table of wikitables) {
    const rows = $("tr", table).slice(1);
    const firstRow = rows.first();

    if (isMonthHeader($, firstRow)) {
      const tableAlbums = processMonthTable($, rows.slice(1));
      albums = albums.concat(tableAlbums);
    } else {
      console.log("checking for TBA albums");
    }
  }

  return albums;
};
