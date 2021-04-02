const fetch = require('node-fetch');
const logger = require('../exceptions/logger');

class API {
  constructor() {
    this.baseURI = 'https://api.spotify.com/v1/';
  }

  static handleError(err) {
    logger.log(err, 'API');
  }

  request(endpoint, opts, callback) {
    return fetch(endpoint, opts).then(callback).catch(this.handleError);
  }

  static withForm(method) {
    return function requestWithForm(endpoint, body, token, callback) {
      const opts = {
        method,
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      };

      return this.request(endpoint, opts, callback);
    };
  }

  get(endpoint, token, callback) {
    const opts = {
      method: 'GET',
      headers: {
        Authorization: token,
      },
    };

    return this.request(endpoint, opts, callback);
  }

  post(endpoint, body, token, callback) {
    const postForm = this.withForm('POST');

    return postForm(endpoint, body, token, callback);
  }

  put(endpoint, body, token, callback) {
    const putForm = this.withForm('PUT');

    return putForm(endpoint, body, token, callback);
  }
}

module.exports = API;
