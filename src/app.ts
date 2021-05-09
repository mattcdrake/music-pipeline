import express = require("express");

// Fake API
const fakeAPI = require("./fakeAPI");

const app = express();
app.enable("trust proxy");

// App data
const PORT = process.env.PORT || 8080;
const url = "https://localhost:8080";

// CORS
const cors = require("cors");
app.use(cors());

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/api/albums/:pageNum", async (req, res) => {
  let albums;
  if (req.query.genre) {
    // User has specified a genre
    albums = await fakeAPI.getAlbumsByGenre(
      req.query.genre,
      parseInt(req.params.pageNum, 10)
    );
  } else if (req.query.month) {
    // User has specified a month
    albums = await fakeAPI.getAlbumsByMonth(
      req.query.month,
      parseInt(req.params.pageNum, 10)
    );
  } else {
    // No filters
    albums = await fakeAPI.getAlbums(parseInt(req.params.pageNum, 10));
  }
  res.status(200).json(albums);
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log("Press Ctrl+C to quit");
});

module.exports = app;
