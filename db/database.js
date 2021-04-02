const sqlite3 = require('sqlite3').verbose();
const logger = require('../exceptions/logger');

class Database {
  constructor(dbName = process.env.DATABASE) {
    this.db = new sqlite3.Database(dbName);
    this.db.run(
      'CREATE TABLE IF NOT EXISTS current (user PRIMARY KEY, weekly, fresh, token)',
    );

    this.initCurrent();
  }

  static handleErr(err) {
    if (err) logger.log(err, 'Database');
  }

  static updateSql(col) {
    return `UPDATE CURRENT SET ${col} = ? WHERE user = ?`;
  }

  exec(col, val) {
    this.getCurrent((current) => {
      this.db.run(this.updateSql(col), [val, current.user], this.handleErr);
    });
  }

  initCurrent() {
    const current = this.getCurrent();
    const isEmpty = Object.keys(current).length === 0;
    const user = `'${process.env.SPOTIFY_CLIENT_ID}'`;
    const weekly = "''";
    const fresh = "''";
    const token = `'${process.env.SPOTIFY_CLIENT_SECRET}'`;

    if (isEmpty) {
      this.db.run(
        `INSERT INTO current (user, weekly, fresh, token) VALUES (${user}, ${weekly}, ${fresh}, ${token})`,
        this.handleErr,
      );
    }
  }

  getCurrent() {
    let current;

    this.db.get('SELECT * FROM current', (err, row) => {
      if (err) {
        logger.log(err, 'Database');
      } else {
        current = row;
      }
    });

    return current || {};
  }

  setWeekly(playlistId) {
    this.exec('weekly', playlistId);
  }

  setFresh(playlistId) {
    this.exec('fresh', playlistId);
  }

  setUser(userId) {
    this.exec('user', userId);
  }

  setToken(refreshedToken) {
    this.exec('token', refreshedToken);
  }
}

module.exports = Database;
