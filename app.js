const Client = require('./discord/client');
const PlaylistManager = require('./spotify/playlistmgr');

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

client.on('message', (message) => {
  const cmd = client.parseCommand(message);

  if (!cmd) return;

  switch (cmd.command) {
    case 'help':
      client.messenger.sendHelp();
      break;
    case 'weekly':
      addSong(cmd.args[0]);
      break;
    case 'fresh':
      addSong(cmd.args[0], true);
      break;
    default:
      break;
  }
});

client.login(process.env.DISCORD_TOKEN);
