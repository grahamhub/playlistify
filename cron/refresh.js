const API = require('../spotify/api');
const Database = require('../db/database');

const db = new Database();

const handleResponse = async function handleTokenResponse(res) {
  const json = await res.json();

  await db.setAccess(json.access_token);
};

const refreshToken = async function refreshAccessToken() {
  const current = await db.getCurrent();
  const token = current.refresh_token;

  API.refresh(token, handleResponse);
};

refreshToken();
