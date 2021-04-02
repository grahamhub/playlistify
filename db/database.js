const sqlite3 = require('sqlite3').verbose();

class Database {
  constructor() {
    this.db = new sqlite3.Database(process.env.DATABASE);
    this.db.run('CREATE TABLE IF NOT EXISTS current (user PRIMARY KEY, weekly, fresh, token)');
    this._initCurrent();
  }

  _handleErr(err) {
    if (err) console.log(err);
  }

  _updateSql(col) {
    return `UPDATE CURRENT SET ${col} = ? WHERE user = ?`;
  }

  _exec(col, val) {
    this.getCurrent((current) => {
      this.db.run(this.updateSql(col), [val, current.user], this._handleErr);
    });
  }

  _initCurrent() {
    this.getCurrent((current) => {
      if (current === undefined) {
        this.db.run(`INSERT INTO current (user, weekly, fresh, token) VALUES ('user', '', '', '')`, this._handleErr);
      }
    });
  }

  getCurrent(callback) {
    this.db.get('SELECT * FROM current', (err, row) => {
      if (err) {
        console.log(err);
      } else {
        callback(row);
      }
    });
  }

  setWeekly(playlistId) {
    this._exec('weekly', playlistId);
  }

  setFresh(playlistId) {
    this._exec('fresh', playlistId);
  }

  setUser(userId) {
    this._exec('user', userId);
  }

  setToken(refreshedToken) {
    this._exec('token', refreshedToken);
  }
}