import fs from "fs";
import { scrapeWiki } from "./wiki";
import { mergeAlbums } from "./merger";
import { AlbumJSON } from "../../../types/src/types";

/**
 * Finds the command line argument that comes after the supplied string.
 * If the string isn't found, return "undefined".
 *
 * @param {string} arg
 * @returns {string}
 */
const getNextArg = (arg: string): string => {
  const i = process.argv.indexOf(arg);
  const path = process.argv[i + 1];

  if (typeof path === "undefined") {
    return "undefined";
  }

  return path;
};

const execute = async () => {
  // Wikipedia scraping routine
  if (process.argv.includes("--wiki")) {
    const albums: AlbumJSON[] = await scrapeWiki();
    mergeAlbums(albums);
  }

  // Loads albums from local file
  if (process.argv.includes("--local")) {
    const path = getNextArg("--local");

    let albums: AlbumJSON[];
    try {
      const buf = fs.readFileSync(path);
      albums = JSON.parse(buf.toString());
    } catch (e: any) {
      console.log(
        `Error parsing file at ${path}. Are you sure that contains an array of AlbumJSON[]?`
      );
      return;
    }

    mergeAlbums(albums);
  }
};

execute();
