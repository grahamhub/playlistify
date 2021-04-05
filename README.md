# LS Music Club Discord Bot (playlistify)

A Discord bot to help manage the Launch School music club so that as leadership changes playlists will still be accessible and manageable.

If you want to fork and host your own version of playlistify, here's what you should do (I'm assuming some level of development/devops proficiency):

- get API credentials for both (Spotify)[https://developer.spotify.com] and (Discord)[https://discord.com/developers]
  - for naming your application, please use something along the lines of `playlistify-someIdentifier`
- clone this repo onto the machine you'll use for hosting
- run `npm install`
- authorize the Spotify account you wish to link with playlistify
  - on your machine, run `npm run auth`
  - navigate to `http://localhost:3000` and follow the directions (make sure you have (whitelisted http://localhost:3000/callback)[https://developer.spotify.com/documentation/general/guides/app-settings/] for spotify)
  - you should get a message that says `Updated database for {username}`
    - if you get `null` as the username, that means it most likely failed. if you can't figure out what your issue is, feel free to (email me)[mailto:grammar@hey.com] or open an issue
- after ensuring that you've added your bot to the desired server, run `npm start` and it should show up in the users list

# Configuration

playlistify uses the `dotenv` package for managing environment variables used by the application. Here's an example `.env` file, which should exist at the top of the `playlistify/` directory:

```
DISCORD_ID=<your discord app id>
DISCORD_TOKEN=<your discord app token>
SPOTIFY_CLIENT_ID=<your spotify app id>
SPOTIFY_CLIENT_SECRET=<your spotify app secret>
SPOTIFY_REDIRECT_URI=http://localhost:3000/callback (you can change this if you'd like, but it really only needs to happen locally during config)
SPOTIFY_STATE=<this can be anything, see link in cron task section for auth flow info>
DATABASE=<name of sqlite database>
TEST_DB=<name of testing database>
CHANNEL=<discord channel id that you want playlistify to listen to>
LOGPATH=<path where you want logs stored>
```

# Testing

After configuring and authorizing your local playlistify, you can run `npm test` to make sure everything is functional. This tests everything but the Discord client.

This _will_ create test playlists on whichever Spotify account you authorized and update the prod DB to reflect this. Unfortunately the Spotify API does not allow for playlist deletion, sorry :/

# Cron tasks

To continue accessing the Spotify API, you will need to refresh the access token for that user ~every hour (see auth details (here)[https://developer.spotify.com/documentation/general/guides/authorization-guide/]).

If you've gotten this far, I trust you enough to research cron tasks. For playlistify, there are 3 main cron tasks:

- refreshing access token (`npm run refresh`) -> run this every 55 minutes or so as long as your access token is still valid (re-run auth flow if it's invalid)
- creating weekly playlist (`npm run weekly`) -> schedule this on whatever weekday you want it created
- creating monthly/fresh playlist (`npm create monthly`) -> schedule this on whatever month-date you want it created

# and you're done!

You should be able to issue commands in the configured channel for playlistify. If you don't know what to tell it to do, the help command is `!helpme`.
