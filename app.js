const Database = require('./db/database');
const Client = require('./discord/client');
const PlaylistManager = require('./spotify/playlistmgr');

const db = new Database();
const client = new Client();
const playlists = new PlaylistManager();

const ERRORS = {
  invalidArgs(type) {
    return `this command takes a maximum of one argument, and it should be a valid Spotify ${type} link.`;
  },
};

const addSong = async function addSongToPlaylist(url, isFresh = false) {
  const songAdded = await playlists.addToCurrent(url, isFresh);

  if (songAdded.error) {
    const msg = songAdded.error.message || songAdded.error;

    client.messenger.sendError(msg);
  } else {
    client.messenger.sendSuccess();
  }
};

const getPlaylist = async function getCurrentPlaylist(type) {
  const playlist = await db.getCurrent();
  const which = playlist[type];
  let msg;

  if (!playlist) {
    msg = 'Could not fetch playlist';
  } else {
    msg = `Here you go: https://open.spotify.com/playlist/${which}`;
  }

  client.messenger.send(msg);
};

client.on('message', async (message) => {
  const cmd = Client.parseCommand(message);

  if (!cmd) return;

  switch (cmd.command) {
    case 'helpme':
      client.messenger.sendHelp();
      break;
    case 'weekly':
      if (Client.invalidArgs(cmd.args)) {
        client.messenger.sendError(ERRORS.invalidArgs('album/song'));
      } else if (cmd.args.length) {
        await addSong(cmd.args[0]);
      } else {
        await getPlaylist(cmd.command);
      }
      break;
    case 'fresh':
      if (Client.invalidArgs(cmd.args)) {
        client.messenger.sendError(ERRORS.invalidArgs('song'));
      } else if (cmd.args.length && cmd.args[0].includes('track')) {
        await addSong(cmd.args[0], true);
      } else if (cmd.args.length) {
        client.messenger.sendError('this playlist only accepts songs.');
      } else {
        await getPlaylist(cmd.command);
      }
      break;
    default:
      break;
  }
});

client.login(process.env.DISCORD_TOKEN);
