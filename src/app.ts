import express = require("express");

// Fake API
const fakeAPI = require("./fakeAPI");

const app = express();
app.enable("trust proxy");

// App data
const PORT = process.env.PORT || 8080;
const url = "https://localhost:8080";

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send("HW5 Boat API").end();
});

app.get("/api/albums/:pageNum", async (req, res) => {
  const albums = await fakeAPI.getAlbums(parseInt(req.params.pageNum, 10));
  res.status(200).json(albums);
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log("Press Ctrl+C to quit");
});

module.exports = app;
