// Dependencies
import cors from "cors";
import express from "express";
import path from "path";
import { Datastore } from "@google-cloud/datastore";

// Types
import { Album } from "../../types/src/types";
import { entity } from "@google-cloud/datastore/build/src/entity";

// App data
const PORT = process.env.PORT || 8080;
const app = express();
const DEFAULT_PAGE_SIZE = 30;
const STATIC_DIR = path.resolve(__dirname, "../../../build/");

// Middleware
app.enable("trust proxy");
app.use(express.static(STATIC_DIR));
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Datastore
export const datastore = new Datastore();

// Return React front-end
app.get("/", (req, res) => {
  res.sendFile(STATIC_DIR + "/index.html");
});

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

  let albums: Album[] = await datastore
    .runQuery(query)
    .then((entities) => entities[0]);

  albums = albums.map((album) => ({
    ...album,
    id: album[entity.KEY_SYMBOL].id.toString(),
  }));

  res.status(200).json(albums);
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log("Press Ctrl+C to quit");
});

module.exports = app;
