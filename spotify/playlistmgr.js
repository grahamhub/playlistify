const API = require('./api');
const Database = require('../db/database');

class PlaylistManager {
  constructor() {
    this.db = new Database();
  }

  static async jsonify(res) {
    return res.json();
  }

  static parse(res) {
    if (res.type === 'playlist') {
      return {
        id: res.id,
        type: res.type,
        name: res.name,
        description: res.description,
      };
    }

    return { error: res.error };
  }

  static extractID(url) {
    const reg = new RegExp('(?<=(track|album)/)([^?]*)', 'gm');

    return url.match(reg).pop();
  }

  static extractURIs(album) {
    return album.items.map((song) => song.uri);
  }

  static getSongURI(url) {
    return [`spotify:track:${PlaylistManager.extractID(url)}`];
  }

  async getSongsFromAlbum(url) {
    const endpoint = `albums/${PlaylistManager.extractID(url)}/tracks`;
    const current = await this.db.getCurrent();
    const album = await API.get(
      endpoint,
      current.access_token,
      PlaylistManager.jsonify,
    );

    return PlaylistManager.extractURIs(album);
  }

  async getSongsFromURL(url) {
    let songs;

    if (url.includes('album')) {
      songs = await this.getSongsFromAlbum(url);
    } else {
      songs = PlaylistManager.getSongURI(url);
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
      current.access_token,
      body,
      PlaylistManager.jsonify,
    );

    const parsed = PlaylistManager.parse(playlist);

    if (fresh) {
      await this.db.setFresh(parsed.id);
    } else {
      await this.db.setWeekly(parsed.id);
    }

    return parsed;
  }

  async updateCurrent(details, fresh = false) {
    const current = await this.db.getCurrent();
    const playlist = fresh ? current.fresh : current.weekly;

    const status = await API.put(
      `playlists/${playlist}`,
      current.access_token,
      details,
      (res) => res.status,
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
      current.access_token,
      body,
      PlaylistManager.jsonify,
    );

    return snapshot;
  }
}

module.exports = PlaylistManager;
