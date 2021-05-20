// Dependencies
import cors from "cors";
import express from "express";
import { Datastore } from "@google-cloud/datastore";

// App data
const PORT = process.env.PORT || 8080;
const app = express();
const DEFAULT_PAGE_SIZE = 30;

// Middleware
app.enable("trust proxy");
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
app.get("/api/albums/", async (req, res) => {
  const query = datastore.createQuery("album").limit(DEFAULT_PAGE_SIZE);

  if (req.query.genre) {
    query.filter("genre", "=", req.query.genre.toString());
  }

  if (req.query.date) {
    query.filter("releaseDate", ">=", new Date(req.query.date.toString()));
  }

  if (req.query.p) {
    const page = parseInt(req.query.p.toString(), 10);
    query.offset(page * DEFAULT_PAGE_SIZE);
  }

  const albums = await datastore
    .runQuery(query)
    .then((entities) => entities[0]);

  res.status(200).json(albums);
});
*/

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log("Press Ctrl+C to quit");
});

module.exports = app;
