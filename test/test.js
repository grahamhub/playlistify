const { expect } = require('chai');
const Database = require('../db/database');
const API = require('../spotify/api');
const dotenv = require('dotenv').config();

// DATABASE
describe('Database', function () {
  const db = new Database(process.env.TEST_DB);

  before(async function () {
    await db.clear();
    await db.init();
    await db.initCurrent();
  });

  describe('#run()', function () {
    it('should resolve to object with value property', async function () {
      const result = await db.run('SELECT * FROM current');

      expect(result).to.have.property('value');
    });
  });

  describe('#get()', function () {
    it('should resolve to object representing result row', async function () {
      const result = await db.get('SELECT * FROM current');

      expect(result).to.have.property('user');
      expect(result).to.have.property('weekly');
      expect(result).to.have.property('fresh');
      expect(result).to.have.property('access_token');
      expect(result).to.have.property('refresh_token');
    });
  });

  describe('#setUser()', function () {
    it('should run the query without an error', async function () {
      const result = await db.setUser('test');

      expect(result.value).to.equal(1);
    });
  });

  describe('#setFresh()', function () {
    it('should run the query without an error', async function () {
      const result = await db.setFresh('test');

      expect(result.value).to.equal(1);
    });
  });

  describe('#setWeekly()', function () {
    it('should run the query without an error', async function () {
      const result = await db.setWeekly('test');

      expect(result.value).to.equal(1);
    });
  });

  describe('#setRefresh()', function () {
    it('should run the query without an error', async function () {
      const result = await db.setRefresh('test');

      expect(result.value).to.equal(1);
    });
  });

  describe('#setAccess()', function () {
    it('should run the query without an error', async function () {
      const result = await db.setAccess('test');

      expect(result.value).to.equal(1);
    });
  });

  describe('#getCurrent()', function () {
    it('should contain updated values', async function () {
      const result = await db.getCurrent();

      expect(result.user).to.equal('test');
      expect(result.fresh).to.equal('test');
      expect(result.weekly).to.equal('test');
      expect(result.refresh_token).to.equal('test');
      expect(result.access_token).to.equal('test');
    });
  });
});

// SPOTIFY
describe('API', function () {
  const db = new Database();

  describe('#getURI()', function () {
    it('should append endpoint to base URI', function () {
      expect(API.getURI('me')).to.equal('https://api.spotify.com/v1/me');
    });
  });

  describe('#encodeJson()', function () {
    it('should encode JSON to URI components', function () {
      expect(API.encodeJson({ key: 'value', test: 1 })).to.equal(
        'key=value&test=1',
      );
    });
  });

  describe('#request()', function () {
    it('should get data from Spotify (via /me endpoint)', async function () {
      const current = await db.getCurrent();
      const url = API.getURI('me');
      const opts = {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${current.access_token}`,
        },
      };

      const callback = async (res) => await res.json();

      const response = await API.request(url, opts, callback);

      expect(response.id).to.equal(current.user);
    });
  });

  describe('#withForm()', function () {
    it('should return a function', function () {
      expect(API.withForm('POST')).to.be.a('function');
    });
  });

  describe('#get()', function () {
    it('should get data from Spotify (via /me endpoint)', async function () {
      const current = await db.getCurrent();

      const callback = async (res) => await res.json();

      const response = await API.get('me', current.access_token, callback);

      expect(response.id).to.equal(current.user);
    });
  });

  describe('playlist manipulation', function () {
    let playlist;

    describe('#post()', function () {
      it('should create a playlist for current user', async function () {
        const current = await db.getCurrent();
        const endpoint = `users/${current.user}/playlists`;
        const body = {
          name: 'Test Playlist',
          description: 'This is a test playlist',
        };

        const callback = async (res) => await res.json();

        const response = await API.post(
          endpoint,
          current.access_token,
          body,
          callback,
        );

        playlist = response.id;

        expect(response.type).to.equal('playlist');
      });
    });

    describe('#put()', function () {
      it('should already have playlist id', function () {
        expect(playlist).to.be.a('string');
      });

      it('should update playlist', async function () {
        const current = await db.getCurrent();
        const endpoint = `playlists/${playlist}`;
        const body = {
          name: 'Updated playlist!',
        };

        const callback = (res) => res;

        const response = await API.put(
          endpoint,
          current.access_token,
          body,
          callback,
        );

        expect(response.status).to.equal(200);
      });
    });
  });

  describe('#refresh()', function () {
    it('should refresh access token', async function () {
      const current = await db.getCurrent();
      const callback = async (res) => res.json();
      const response = await API.refresh(current.refresh_token, callback);

      expect(response).to.have.property('access_token');
      expect(response).to.have.property('token_type', 'Bearer');

      if (response.access_token) await db.setAccess(response.access_token);
    });
  });
});
