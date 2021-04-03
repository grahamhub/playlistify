/* eslint-disable function-paren-newline */
/* eslint-disable implicit-arrow-linebreak */
const sqlite3 = require('sqlite3').verbose();
const logger = require('../exceptions/logger');

class Database {
  constructor(dbName = process.env.DATABASE) {
    this.db = new sqlite3.Database(`./db/${dbName}`);
  }

  run(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(query, params, function cb(err) {
        if (err) {
          logger.log(err, 'Database');
          reject(err);
        } else {
          resolve({ value: this.changes });
        }
      });
    });
  }

  get(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(query, params, (err, result) => {
        if (err) {
          logger.log(err, 'Database');
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  static updateSql(col) {
    return `UPDATE current SET ${col} = ? WHERE user = ?`;
  }

  clear() {
    return this.run('DROP TABLE IF EXISTS current');
  }

  init() {
    return this.run(
      'CREATE TABLE IF NOT EXISTS current (user PRIMARY KEY, weekly, fresh, access_token, refresh_token)',
    );
  }

  initCurrent() {
    const user = process.env.SPOTIFY_CLIENT_ID;

    return this.run(
      "INSERT INTO current (user, weekly, fresh, access_token, refresh_token) VALUES (?, '', '', '', '')",
      [user],
    );
  }

  getCurrent() {
    return this.get('SELECT * FROM current');
  }

  async setWeekly(playlistId) {
    const current = await this.getCurrent();
    return this.run(Database.updateSql('weekly'), [playlistId, current.user]);
  }

  async setFresh(playlistId) {
    const current = await this.getCurrent();
    return this.run(Database.updateSql('fresh'), [playlistId, current.user]);
  }

  async setUser(userId) {
    const current = await this.getCurrent();
    return this.run(Database.updateSql('user'), [userId, current.user]);
  }

  async setRefresh(token) {
    const current = await this.getCurrent();
    return this.run(Database.updateSql('refresh_token'), [token, current.user]);
  }

  async setAccess(token) {
    const current = await this.getCurrent();
    return this.run(Database.updateSql('access_token'), [token, current.user]);
  }
}

module.exports = Database;
