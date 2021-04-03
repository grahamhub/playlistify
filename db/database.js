const sqlite3 = require('sqlite3').verbose();
const util = require('util');
const logger = require('../exceptions/logger');

class Database {
  constructor(dbName = process.env.DATABASE) {
    this.db = new sqlite3.Database(dbName);
    this.db.run(
      'CREATE TABLE IF NOT EXISTS current (user PRIMARY KEY, weekly, fresh, access_token, refresh_token)',
    );
    this.promisify();
  }

  static updateSql(col) {
    return `UPDATE CURRENT SET ${col} = ? WHERE user = ?`;
  }

  promisify() {
    this.db.get = util.promisify(this.db.get);
    this.db.run = util.promisify(this.db.run);
  }

  async exec(col, val) {
    const previous = this.getCurrent();

    const cb = (err) => {
      if (err) {
        logger.log(err, 'Database');
      }

      return this.changes;
    };

    const changes = await this.db.run(
      Database.updateSql(col),
      [val, previous.user],
      cb,
    );

    return !!changes;
  }

  async initCurrent() {
    const current = this.getCurrent();
    const isEmpty = Object.keys(current).length === 0;
    const user = process.env.SPOTIFY_CLIENT_ID;
    let initialized = isEmpty;

    const cb = (err) => {
      if (err) {
        logger.log(err, 'Database');
      }

      return true;
    };

    if (isEmpty) {
      initialized = await this.db.run(
        "INSERT INTO current (user, weekly, fresh, access_token, refresh_token) VALUES (?, '', '', '', '')",
        [user],
        cb,
      );
    }

    return initialized;
  }

  async getCurrent() {
    const cb = (err, row) => {
      if (err) {
        logger.log(err, 'Database');
      }

      return row;
    };

    const test = await this.db.get('SELECT * FROM current', cb);

    return test || {};
  }

  setWeekly(playlistId) {
    return this.exec('weekly', playlistId);
  }

  setFresh(playlistId) {
    return this.exec('fresh', playlistId);
  }

  setUser(userId) {
    return this.exec('user', userId);
  }

  setTokens(refreshToken, accessToken) {
    const refreshed = this.exec('refresh_token', refreshToken);
    const accessed = this.exec('access_token', accessToken);
    return refreshed && accessed;
  }
}

module.exports = Database;
