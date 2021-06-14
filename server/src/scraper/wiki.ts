// Dependencies
import fs from "fs";
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
    const table = wikitables;
    const rows = $("tr", table).slice(1);
    const topRow = $("th", rows);
    topRow.each((i, elem: cheerio.TagElement) => {
      console.log(elem.children);
    });
  }

  return albums;
};
