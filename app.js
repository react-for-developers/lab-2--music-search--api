const express = require("express");
const path = require("path");
const logger = require("morgan");
const cors = require("cors");

const lastfm = require("./lib/lastfm");
const PlaylistDB = require("./lib/playlist");

const playlistDb = new PlaylistDB(process.env.GOOGLE_DRIVE_SPREADSHEET_ID, {
  credentials: {
    email: process.env.GOOGLE_DRIVE_EMAIL,
    privateKey: process.env.GOOGLE_DRIVE_PRIVATE_KEY.split("\\n").join("\n")
  }
});

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

app.get("/playlists/:playlistId", async (req, res) => {
  const { playlistId } = req.params;
  let data;

  try {
    data = await playlistDb.getPlaylist(playlistId);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

  res.json(data);
});

app.post("/playlists/:playlistId", async (req, res) => {
  const { playlistId } = req.params;
  const { track } = req.body;
  let data;

  try {
    data = await playlistDb.addTrackToPlaylist(playlistId, track);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

  res.json(data);
});

module.exports = app;
