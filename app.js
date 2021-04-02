const Database = require('./db/database');
const Client = require('./discord/client');
const PlaylistManager = require('./spotify/playlistmgr');

const db = new Database();
const client = new Client();
const playlists = new PlaylistManager();

const addSong = async function addSongToPlaylist(url, isFresh = false) {
  const songAdded = await playlists.addToCurrent(url, isFresh);

  if (songAdded.error) {
    const msg = songAdded.error.message || songAdded.error;

    client.messenger.sendError(msg);
  } else {
    client.messenger.sendSuccess();
  }
};

const getPlaylist = function getCurrentPlaylist(type) {
  let playlist = db.getCurrent()[type];

  if (!playlist) playlist = 'Could not fetch playlist';

  client.messenger.send(playlist);
};

client.on('message', (message) => {
  const cmd = client.parseCommand(message);

  if (!cmd) return;

  switch (cmd.command) {
    case 'help':
      client.messenger.sendHelp();
      break;
    case 'weekly':
      if (cmd.args) {
        addSong(cmd.args[0]);
      } else {
        getPlaylist(cmd.command);
      }
      break;
    case 'fresh':
      if (cmd.args) {
        addSong(cmd.args[0], true);
      } else {
        getPlaylist(cmd.command);
      }
      break;
    default:
      break;
  }
});

client.login(process.env.DISCORD_TOKEN);
