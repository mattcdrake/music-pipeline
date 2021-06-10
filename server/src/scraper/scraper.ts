import { scrapeWiki } from "./wiki";
import { mergeAlbums } from "./merger";
import { AlbumJSON } from "../../../types/src/types";

const executeArgs = async () => {
  // Wikipedia scraping routine
  if (process.argv.includes("--wiki")) {
    const albums: AlbumJSON[] = await scrapeWiki();
    mergeAlbums(albums);
  }
};

executeArgs();
