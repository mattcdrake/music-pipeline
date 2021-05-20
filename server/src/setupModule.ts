// Dependencies
import http from "http";
import faker from "faker";
import { datastore } from "./app";

// Types
import { Album } from "./types";

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

  // Request options
  const options = {
    hostname: "python-build-app.ue.r.appspot.com",
    path: "/",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(getData),
    },
  };

  // Make request and parse response
  const req = http.request(options, (res: any) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding("utf8");
    let rawData = "";

    // Build JSON response
    res.on("data", (chunk: any) => {
      rawData += chunk;
    });

    // Parse JSON and pass it to the callback function.
    res.on("end", () => {
      try {
        const parsedData = JSON.parse(rawData);
        processAlbumsObjRaw(parsedData);
      } catch (e) {
        console.error(e.message);
      }
    });
  });

  // Bad request
  req.on("error", (e: any) => {
    console.error(`problem with request: ${e.message}`);
  });

  // Write data to request body
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
  if (obj[0][0] !== "Release date") {
    return albums;
  }

  // Start at 1 to pass over column titles.
  let i = 1;
  while (true) {
    // Check to see if there is another row. If not, this will be undefined.
    if (typeof obj[i] === "undefined") {
      break;
    }
    albums.push({
      artist: obj[i][1],
      title: obj[i][2],
      genre: obj[i][3],
      releaseDate: new Date(`${obj[i][0]}, 2021`),
      coverURL: new URL(faker.image.imageUrl(200, 200, "abstract")),
    });
    i++;
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
  getAlbumsFromWiki("https://en.wikipedia.org/wiki/List_of_2021_albums");
};

exports.initialSetup = initialSetup;
