import { scrapeWiki } from "./wiki";
import { mergeAlbums } from "./merger";
import { AlbumJSON } from "../../../types/src/types";

const execute = async () => {
  // Wikipedia scraping routine
  if (process.argv.includes("--wiki")) {
    const albums: AlbumJSON[] = await scrapeWiki();
    mergeAlbums(albums);
  }
};

execute();
