/* eslint-disable no-console */
/* eslint-disable no-plusplus */
// eslint-disable-next-line no-unused-vars
const dotenv = require('dotenv').config();
const express = require('express');
const cors = require('cors');
const querystring = require('querystring');
const API = require('../spotify/api');
const Database = require('../db/database');

const app = express();
const db = new Database();

const jsonify = function jsonifyResponse(res) {
  return res.json();
};

const authFlow = function authorizationFlow(code, res) {
  const parseUser = async (payload) => {
    const user = await jsonify(payload);

    return user.id;
  };

  API.authorize(code, jsonify).then((data) => {
    API.get('me', data.access_token, parseUser).then(async (user) => {
      await db.setUser(user);
      await db.setAccess(data.access_token);
      await db.setRefresh(data.refresh_token);
      const current = await db.getCurrent();

      res.send(`Database updated for ${current.user}`);
    });
  });
};

app.use(express.static(`${__dirname}/public`)).use(cors());

app.get('/auth', (_, res) => {
  const query = {
    response_type: 'code',
    scope:
      'playlist-modify-public playlist-read-collaborative playlist-read-private',
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
    authFlow(code, res);
  }
});

app.listen(3000, () => {
  console.log('Listening on http://localhost:3000');
});
