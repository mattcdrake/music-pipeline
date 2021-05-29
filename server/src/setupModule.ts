// Dependencies
import fs from "fs";
import http from "http";
import { datastore } from "./app";

// Types
import { Album } from "./types";

// Bad album images
const badAlbumURLs = [
  "https://upload.wikimedia.org/wikipedia/en/thumb/6/6c/Wiki_letter_w.svg/40px-Wiki_letter_w.svg.png",
  "https://upload.wikimedia.org/wikipedia/en/thumb/9/99/Question_book-new.svg/50px-Question_book-new.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Text_document_with_red_question_mark.svg/40px-Text_document_with_red_question_mark.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Ambox_current_red_Asia_Australia.svg/42px-Ambox_current_red_Asia_Australia.svg.png",
  "https://upload.wikimedia.org/wikipedia/en/thumb/8/8a/OOjs_UI_icon_edit-ltr-progressive.svg/10px-OOjs_UI_icon_edit-ltr-progressive.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Gnome-dev-cdrom-audio.svg/32px-Gnome-dev-cdrom-audio.svg.png",
  "https://upload.wikimedia.org/wikipedia/en/thumb/b/b4/Ambox_important.svg/40px-Ambox_important.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Musical_notes.svg/30px-Musical_notes.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Unbalanced_scales.svg/45px-Unbalanced_scales.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Wiktionary-logo-en-v2.svg/40px-Wiktionary-logo-en-v2.svg.png",
  "https://en.wikipedia.org/wiki/Special:CentralAutoLogin/start?type=1x1",
];

const buildDefaultHTTPOptions = (contentLen: number) => {
  return {
    hostname: "python-build-app.ue.r.appspot.com",
    path: "/",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": contentLen,
    },
  };
};

const buildRequest = (options: any): http.ClientRequest => {
  // Make request and parse response
  return http.request(options, (res: any) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding("utf8");
    let rawData = "";

    // Build JSON response
    res.on("data", (chunk: any) => {
      rawData += chunk;
    });

    // Parse JSON and pass it to processAlbumsObjRaw.
    res.on("end", () => {
      try {
        const parsedData = JSON.parse(rawData);
        processAlbumsObjRaw(parsedData);
      } catch (e) {
        console.error(e.message);
      }
    });
  });
};

/**
 * Sends a request to table-scraping service asking for tables at url. Used to
 * parse Wikipedia tables.
 *
 * JSON returned from table-scraper is passed into the "callback" function
 * provided as an argument.
 *
 * @param {string} url The page to pull tables from.
 * @param {callback} function The function that will be called with returned JSON.
 */
const getAlbumsFromWiki = (url: string) => {
  // Parameters for table-scraping API
  const getData = JSON.stringify({
    url,
    skiprows: 1,
  });

  const options = buildDefaultHTTPOptions(Buffer.byteLength(getData));
  const req: http.ClientRequest = buildRequest(options);

  // Bad request
  req.on("error", (e: any) => {
    console.error(`problem with request: ${e.message}`);
  });

  req.write(getData);
  req.end();
};

/**
 * Takes an array of objects and converts them into an array of albums.
 * This is called after getting the table JSON from the wikitable service.
 *
 * @param {any} obj Array of raw album data
 * @returns Album[]
 */
const albumObjToArray = (obj: any): Album[] => {
  const albums: Album[] = [];

  // Unscheduled albums appear like this. Those shouldn't be processed.
  if (typeof obj[0]["Release date"] === "undefined") {
    return albums;
  }

  for (const album of obj) {
    const albumImage = badAlbumURLs.includes(album.images) ? "" : album.images;

    albums.push({
      artist: album.Artist,
      title: album.Album,
      genre: album.Genre,
      releaseDate: new Date(`${album["Release date"]}, 2021`),
      coverURL: albumImage,
    });
  }
  return albums;
};

/**
 * Converts a 2d array of raw album data into a 1d array of albums.
 *
 * @param {any} albumsRaw 2d array
 * @returns Album[]
 */
const processAlbumsObjRaw = (albumsRaw: any) => {
  // Process arrays of raw objects from scraper into albums
  const albums2d: Album[][] = Object.keys(albumsRaw).map((key) => {
    if (key === "bad_tables") {
      return [];
    }
    return albumObjToArray(albumsRaw[key]);
  });
  let albumsFull: Album[] = [];

  for (const albumsTemp of albums2d) {
    albumsFull = albumsFull.concat(albumsTemp);
  }

  saveAlbums(albumsFull);
};

/**
 * Takes an Album[] and saves each album to datastore.
 *
 * @param {Album[]} albums to save
 */
const saveAlbums = (albums: Album[]) => {
  albums.forEach((album) => saveAlbum(album));
};

/**
 * Saves a single album to datastore.
 *
 * @param {Album} album
 */
const saveAlbum = (album: Album) => {
  const entity = {
    key: datastore.key("album"),
    data: {
      artist: album.artist,
      title: album.title,
      genre: album.genre,
      releaseDate: album.releaseDate,
      coverURL: album.coverURL.toString(),
    },
  };
  datastore.save(entity);
};

/**
 * Runs the initial setup process.
 *
 * @param {boolean} useDB Indicates whether processed albums are stored in memory or a database.
 */
const initialSetup = () => {
  const data = JSON.parse(fs.readFileSync("dist/data.json", "utf8"));
  processAlbumsObjRaw(data);
};

exports.initialSetup = initialSetup;
