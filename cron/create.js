const PlaylistManager = require('../spotify/playlistmgr');

const playlists = new PlaylistManager();
const args = process.argv.slice(2);

const create = async function createPlaylist() {
  let fresh;

  if (args[0] === 'weekly') {
    fresh = false;
  } else {
    fresh = true;
  }

  await playlists.create(fresh);
};

create();
