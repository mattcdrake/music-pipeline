// Dependencies
import _, { last } from "lodash";
import cheerio from "cheerio";
import got from "got";

// Types
import { AlbumJSON } from "../../../types/src/types";

// Constants
const WIKI_PAGE = "https://en.wikipedia.org/wiki/List_of_2021_albums";
const GET_HTML_ERROR_MSG = "Error retrieving HTML.";

/**
 * Gets HTML for a given url. Returns an error message if something went wrong.
 *
 * @param {string} url
 * @returns {Promise<string>} HTML string or error message
 */
const getHTML = async (url: string): Promise<string> => {
  try {
    const res = await got(url);
    return res.body;
  } catch (error: any) {
    return GET_HTML_ERROR_MSG;
  }
};

/**
 * Processes a row from a monthly table and adds it to the passed-in array.
 *
 * @param {cheerio.Root} $
 * @param {cheerio.Cheerio} row
 * @param {AlbumJSON[]} albums
 */
const processAlbum = (
  $: cheerio.Root,
  row: cheerio.Element,
  albums: AlbumJSON[]
) => {
  const cols = $(row).children().toArray().slice(0, 5);
  const colVals = cols.map((cell) => $(cell).text().trim());
  console.log(colVals);
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

  const wikiHTML = await getHTML(WIKI_PAGE);

  if (wikiHTML === GET_HTML_ERROR_MSG) {
    return albums;
  }

  const $ = cheerio.load(wikiHTML);
  const wikitables = $(".wikitable tbody").toArray();

  // This needs to be iterated for every table.
  {
    // Determine whether this is a month/quarter table
    const table = wikitables[0];
    const rows = $("tr", table).slice(1);
    const firstRow = rows.first();

    if (isMonthHeader($, firstRow)) {
      // Process each album in the table
      let elemRows = rows.slice(1);

      // Some rows in the table share a release date. I'm iterating through the
      // table and tracking which elements have a rowspan value. If it does,
      // save the date and the number of times it should be used. If the row
      // _uses_ a prior date value, prepend the element array with the last
      // date.
      let lastDate: cheerio.Cheerio;
      let dateIter = 0;

      for (const row of elemRows) {
        const rowspan = $(row).children().first().attr().rowspan;

        if (dateIter > 0) {
          $(lastDate).prependTo($(row));
          dateIter--;
          console.log(dateIter);
          console.log($(row).text());
        }

        if (typeof rowspan !== "undefined") {
          lastDate = $(row).children().first();
          dateIter = parseInt(rowspan);

          console.log(lastDate.text());
        }

        //processAlbum($, row, albums);
        console.log("------------------------------------------------------");
      }
    } else {
      console.log("checking for TBA albums");
    }
  }

  return albums;
};
