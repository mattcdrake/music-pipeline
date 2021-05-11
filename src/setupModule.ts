// Dependencies
const http = require("http");
const faker = require("faker");
const albumQueries = require("./albumQueries");
const fakeAPI = require("./fakeAPI");

// Types
import { Album } from "./types";

const getAlbumsFromWiki = (url: string, callback: (arg: any) => void): any => {
  const getData = JSON.stringify({
    url,
    skiprows: 1,
  });

  const options = {
    hostname: "127.0.0.1",
    port: 5000,
    path: "/",
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(getData),
    },
  };

  const req = http.request(options, (res: any) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding("utf8");
    let rawData = "";
    res.on("data", (chunk: any) => {
      rawData += chunk;
    });
    res.on("end", () => {
      try {
        const parsedData = JSON.parse(rawData);
        callback(parsedData);
      } catch (e) {
        console.error(e.message);
      }
    });
  });

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

  let i = 1;
  while (true) {
    // Check to see if there is another row. If not, this will be undefined.
    if (!obj[i]) {
      break;
    }
    albums.push({
      artist: obj[i][1],
      title: obj[i][2],
      genre: obj[i][3],
      releaseDate: new Date(`${obj[i][0]}, 2021`),
      coverURL: new URL(faker.image.image(200, 200)),
    });
    i++;
  }

  return albums;
};

/**
 * Runs the initial setup process.
 *
 * @param {boolean} useDB Indicates whether processed albums are stored in memory or a database.
 */
const initialSetup = (useDB: boolean = true) => {
  if (!useDB) {
    tempSetup();
  }
};

/**
 * Runs the temporary setup that stores albums in memory instead of a db.
 */
const tempSetup = () => {
  getAlbumsFromWiki(
    "https://en.wikipedia.org/wiki/List_of_2021_albums",
    fakeAPI.processAlbumsObjRaw
  );
};

exports.albumObjToArray = albumObjToArray;
exports.initialSetup = initialSetup;
