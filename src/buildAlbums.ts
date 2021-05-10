const http = require("http");
const faker = require("faker");
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

const albumObjToArray = (obj: any): Album[] => {
  const albums: Album[] = [];

  // Unscheduled albums appear like this. Those shouldn't be processed.
  if (obj["0"]["0"] !== "Release date") {
    return albums;
  }

  let i = 1;
  while (true) {
    const index = `${i}`;
    // Check to see if there is another row. If not, this will be undefined.
    if (!obj["0"][index]) {
      break;
    }
    albums.push({
      artist: obj["1"][index],
      title: obj["2"][index],
      genre: obj["3"][index],
      releaseDate: new Date(`${obj["0"][index]}, 2021`),
      coverURL: new URL(faker.image.image(200, 200)),
    });
    i++;
  }

  return albums;
};

exports.getAlbumsFromWiki = getAlbumsFromWiki;
exports.albumObjToArray = albumObjToArray;
