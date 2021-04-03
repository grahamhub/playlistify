/* eslint-disable no-param-reassign */
/* eslint-disable arrow-body-style */
// eslint-disable-next-line no-unused-vars
const dotenv = require('dotenv').config();
const fetch = require('node-fetch');
const logger = require('../exceptions/logger');

class API {
  static getURI(endpoint) {
    return `https://api.spotify.com/v1/${endpoint}`;
  }

  static handleError(err) {
    logger.log(err, 'API');
  }

  static encodeJson(data) {
    // eslint-disable-next-line arrow-body-style
    return Object.entries(data)
      .map((keyPair) => {
        return keyPair.map((val) => encodeURIComponent(val)).join('=');
      })
      .join('&');
  }

  static request(endpoint, opts, callback) {
    let url;

    if (endpoint.includes('http')) {
      url = endpoint;
    } else {
      url = API.getURI(endpoint);
    }

    return fetch(url, opts).then(callback).catch(API.handleError);
  }

  static withForm(method) {
    return function requestWithForm(endpoint, body, callback) {
      body.client_id = process.env.SPOTIFY_CLIENT_ID;
      body.client_secret = process.env.SPOTIFY_CLIENT_SECRET;
      const opts = {
        method,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: API.encodeJson(body),
      };

      return API.request(endpoint, opts, callback);
    };
  }

  static get(endpoint, token, callback) {
    const opts = {
      method: 'GET',
      headers: {
        Authorization: token,
      },
    };

    return API.request(endpoint, opts, callback);
  }

  static post(endpoint, body, callback) {
    const postForm = API.withForm('POST');

    return postForm(endpoint, body, callback);
  }

  static put(endpoint, body, callback) {
    const putForm = API.withForm('PUT');

    return putForm(endpoint, body, callback);
  }

  static authorize(code, callback) {
    const postForm = API.withForm('POST');
    const body = {
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    };

    return postForm('https://accounts.spotify.com/api/token', body, callback);
  }

  static refresh(refreshToken, callback) {
    const postForm = API.withForm('POST');
    const body = {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    };

    return postForm('https://accounts.spotify.com/api/token', body, callback);
  }
}

module.exports = API;
