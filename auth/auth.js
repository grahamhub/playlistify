/* eslint-disable no-console */
/* eslint-disable no-plusplus */
// eslint-disable-next-line no-unused-vars
const dotenv = require('dotenv').config();
const express = require('express');
const cors = require('cors');
const querystring = require('querystring');
const API = require('../spotify/api');

const app = express();

app.use(express.static(`${__dirname}/public`)).use(cors());

app.get('/auth', (_, res) => {
  const query = {
    response_type: 'code',
    scope: 'playlist-modify-public playlist-read-public playlist-read-private',
    client_id: process.env.SPOTIFY_CLIENT_ID,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    state: process.env.SPOTIFY_STATE,
  };

  res.redirect(
    `https://accounts.spotify.com/authorize?${querystring.stringify(query)}`,
  );
});

app.get('/callback', (req, res) => {
  const code = req.query.code || null;
  const state = req.query.state || null;

  if (state === null || state !== process.env.SPOTIFY_STATE) {
    res.redirect(`/#${querystring.stringify({ error: 'state_mismatch' })}`);
  } else {
    API.authorize(code, (response) => response.json()).then((data) => {
      API.refresh(data.refresh_token, (refreshed) => refreshed.json()).then(
        (refreshData) => {
          console.log(refreshData);
        },
      );
    });
  }
});

app.listen(3000, () => {
  console.log('Listening on http://localhost:3000');
});
