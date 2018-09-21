const request = require("axios");

const baseURL = "https://ws.audioscrobbler.com/2.0";

function getImage(images) {
  for (let index = images.length - 1; index >= 0; index--) {
    const image = images[index];
    if (image && image["#text"] && image["size"]) {
      return image["#text"];
    }
  }
}

const callAPICache = {};
async function callAPI(method, params) {
  const cacheKey = JSON.stringify({ method, ...params });
  const cacheValue = callAPICache[cacheKey];
  if (cacheValue) {
    return cacheValue;
  }

  const response = await request({
    method: "get",
    baseURL,
    params: {
      format: "json",
      api_key: process.env.LAST_FM_API_KEY,
      method,
      ...params
    }
  });

  callAPICache[cacheKey] = response.data;

  return response.data;
}

async function searchArtists(query) {
  const data = await callAPI("artist.search", { artist: query });
  const response = {
    data: data.results.artistmatches.artist.map(artist => ({
      id: artist.mbid,
      name: artist.name,
      listeners: artist.listeners,
      imageUrl: getImage(artist.image)
    }))
  };

  return response;
}

async function getArtistAlbums(artistId) {
  const { topalbums } = await callAPI("artist.getTopAlbums", {
    mbid: artistId
  });

  const response = {
    data: topalbums.album.map(album => ({
      id: album.mbid,
      name: album.name,
      imageUrl: getImage(album.image),
      artist: {
        id: album.artist.id,
        name: album.artist.name
      }
    }))
  };

  return response;
}

async function getArtist(artistId) {
  const { artist } = await callAPI("artist.getInfo", { mbid: artistId });

  const response = {
    data: {
      id: artist.mbid,
      name: artist.name,
      imageUrl: getImage(artist.image),
      bio: artist.bio.summary,
      albums: (await getArtistAlbums(artistId)).data
    }
  };

  return response;
}

async function getAlbum(albumId) {
  const { album } = await callAPI("album.getInfo", { mbid: albumId });
  const response = {
    data: {
      id: album.mbid,
      name: album.name,
      artist: {
        id: album.tracks.track[0] && album.tracks.track[0].artist.mbid,
        name: album.artist
      },
      imageUrl: getImage(album.image),
      tracks: album.tracks.track.map((track, index) => ({
        trackNumber: index + 1,
        name: track.name,
        durationInSeconds: Number.parseInt(track.duration, 10)
      }))
    }
  };

  return response;
}

module.exports = {
  searchArtists,
  getArtist,
  getAlbum
};
