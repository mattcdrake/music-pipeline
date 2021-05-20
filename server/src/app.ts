// Dependencies
import cors from "cors";
import express from "express";
import { Datastore } from "@google-cloud/datastore";

// App data
const PORT = process.env.PORT || 8080;
const app = express();
app.enable("trust proxy");

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Datastore
export const datastore = new Datastore();

// Build album data on setup run
if (process.argv.includes("--setupModule")) {
  const setup = require("./setupModule");
  setup.initialSetup();
}

/*
// Route for reading album data
app.get("/api/albums/:pageNum", (req, res) => {
  let albums;
  if (req.query.genre) {
    // User has specified a genre
    albums = getAlbumsByGenre(
      req.query.genre.toString(),
      parseInt(req.params.pageNum, 10)
    );
  } else if (req.query.month) {
    // User has specified a month
    albums = getAlbumsByMonth(
      req.query.month.toString(),
      parseInt(req.params.pageNum, 10)
    );
  } else {
    // No filters
    albums = getAlbums(parseInt(req.params.pageNum, 10));
  }
  res.status(200).json(albums);
});
*/

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log("Press Ctrl+C to quit");
});

module.exports = app;
