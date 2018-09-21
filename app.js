const express = require("express");
const path = require("path");
const logger = require("morgan");
const cors = require("cors");

const lastfm = require("./lib/lastfm");

const app = express();

app.use(logger("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/search", async (req, res) => {
  const { query } = req.query;
  let data;

  try {
    data = await lastfm.searchArtists(query);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

  res.json(data);
});

app.get("/artists/:artistId", async (req, res) => {
  const { artistId } = req.params;
  let data;

  try {
    data = await lastfm.getArtist(artistId);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

  res.json(data);
});

app.get("/albums/:albumId", async (req, res) => {
  const { albumId } = req.params;
  let data;

  try {
    data = await lastfm.getAlbum(albumId);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

  res.json(data);
});

module.exports = app;
