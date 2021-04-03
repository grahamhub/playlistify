const { expect } = require('chai');
const Database = require('../db/database');
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
