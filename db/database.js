const sqlite3 = require('sqlite3').verbose();
const logger = require('../exceptions/logger');

class Database {
  constructor(dbName = process.env.DATABASE) {
    this.db = new sqlite3.Database(dbName);
    this.db.run(
      'CREATE TABLE IF NOT EXISTS current (user PRIMARY KEY, weekly, fresh, token)',
    );

    this.initialized = this.initCurrent();
  }

  static updateSql(col) {
    return `UPDATE CURRENT SET ${col} = ? WHERE user = ?`;
  }

  exec(col, val) {
    const previous = this.getCurrent();
    let changes;

    this.db.run(this.updateSql(col), [val, previous.user], (err) => {
      if (err) {
        logger.log(err, 'Database');
      } else {
        changes = this.changes;
      }
    });

    return !!changes;
  }

  initCurrent() {
    const current = this.getCurrent();
    const isEmpty = Object.keys(current).length === 0;
    const user = `'${process.env.SPOTIFY_CLIENT_ID}'`;
    const weekly = "''";
    const fresh = "''";
    const token = `'${process.env.SPOTIFY_CLIENT_SECRET}'`;
    let initialized = isEmpty;

    if (isEmpty) {
      this.db.run(
        `INSERT INTO current (user, weekly, fresh, token) VALUES (${user}, ${weekly}, ${fresh}, ${token})`,
        (err) => {
          if (err) {
            logger.log(err, 'Database');
          } else {
            initialized = true;
          }
        },
      );
    }

    return initialized;
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
    return this.exec('weekly', playlistId);
  }

  setFresh(playlistId) {
    return this.exec('fresh', playlistId);
  }

  setUser(userId) {
    return this.exec('user', userId);
  }

  setToken(refreshedToken) {
    return this.exec('token', refreshedToken);
  }
}

module.exports = Database;
