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
  client.messenger.bindChannel(message.channel);

  const cmd = Client.parseCommand(message);

  if (!cmd) return;

  switch (cmd.command) {
    case 'helpme':
      client.messenger.sendHelp();
      break;
    case 'weekly':
      if (cmd.args.length) {
        await addSong(cmd.args[0]);
      } else {
        await getPlaylist(cmd.command);
      }
      break;
    case 'fresh':
      if (cmd.args.length) {
        await addSong(cmd.args[0], true);
      } else {
        await getPlaylist(cmd.command);
      }
      break;
    default:
      break;
  }
});

client.login(process.env.DISCORD_TOKEN);
