const API = require('./api');
const Database = require('../db/database');

class PlaylistManager {
  constructor() {
    this.db = new Database();
  }

  static parse(res) {
    if (res.ok) {
      return res.body || res.status;
    }

    return { error: res.body.error };
  }

  static extractID(url) {
    const reg = new RegExp('(?<=(track|album)/)([^?]*)', 'gm');

    return url.match(reg).pop();
  }

  static extractURIs(album) {
    return album.items.map((song) => song.uri);
  }

  getSongsFromAlbum(url) {
    const endpoint = `albums/${this.extractID(url)}/tracks`;

    return API.get(endpoint, this.appToken, this.parse).then(this.extractURIs);
  }

  getSongURI(url) {
    return [`spotify:track:${this.extractID(url)}`];
  }

  async getSongsFromURL(url) {
    let songs;

    if (url.includes('album')) {
      songs = await this.getSongsFromAlbum(url);
    } else {
      songs = this.getSongURI(url);
    }

    return songs;
  }

  async create(fresh = false) {
    const today = new Date();
    const dateArr = today.toDateString().split(' ');
    const day = dateArr.slice(1).join(' ');
    const month = dateArr.filter((_, idx) => idx % 2 !== 0).join(' ');

    const current = await this.db.getCurrent();
    const endpoint = `users/${current.user}/playlists`;
    const body = {
      name: fresh ? month : day,
      description: fresh
        ? `LS' Fresh Finds for ${month}`
        : `LS Weekly Meeting playlist for ${day}`,
    };

    const playlist = await API.post(
      endpoint,
      body,
      current.access_token,
      this.parse,
    );

    return playlist;
  }

  async updateCurrent(details, fresh = false) {
    const current = await this.db.getCurrent();
    const playlist = fresh ? current.fresh : current.weekly;

    const status = await API.put(
      `playlists/${playlist}`,
      details,
      current.access_token,
      this.parse,
    );

    return status;
  }

  async addToCurrent(url, fresh = false) {
    const songs = await this.getSongsFromURL(url);
    const current = await this.db.getCurrent();
    const playlist = fresh ? current.fresh : current.weekly;
    const endpoint = `playlists/${playlist}/tracks`;
    const body = {
      uris: songs,
    };

    const snapshot = await API.post(
      endpoint,
      body,
      current.access_token,
      this.parse,
    );

    return snapshot;
  }
}

module.exports = PlaylistManager;
