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
    return function requestWithForm({
      endpoint,
      token = null,
      body,
      callback,
      json = true,
    }) {
      if (!json) {
        body.client_id = process.env.SPOTIFY_CLIENT_ID;
        body.client_secret = process.env.SPOTIFY_CLIENT_SECRET;
      }

      const opts = {
        method,
        body: json ? JSON.stringify(body) : API.encodeJson(body),
        headers: {
          'Content-Type': json
            ? 'application/json'
            : 'application/x-www-form-urlencoded',
        },
      };

      if (json) {
        opts.headers.Authorization = `Bearer ${token}`;
      }

      return API.request(endpoint, opts, callback);
    };
  }

  static get(endpoint, token, callback) {
    const opts = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    return API.request(endpoint, opts, callback);
  }

  // { endpoint, token, body, callback, json = true }
  static post(endpoint, token, body, callback) {
    const postForm = API.withForm('POST');

    return postForm({
      endpoint,
      token,
      body,
      callback,
    });
  }

  static put(endpoint, token, body, callback) {
    const putForm = API.withForm('PUT');

    return putForm({
      endpoint,
      token,
      body,
      callback,
    });
  }

  static authorize(code, callback) {
    const postForm = API.withForm('POST');
    const body = {
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    };

    return postForm({
      endpoint: 'https://accounts.spotify.com/api/token',
      body,
      callback,
      json: false,
    });
  }

  static refresh(refreshToken, callback) {
    const postForm = API.withForm('POST');
    const body = {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    };

    return postForm({
      endpoint: 'https://accounts.spotify.com/api/token',
      body,
      callback,
      json: false,
    });
  }
}

module.exports = API;
