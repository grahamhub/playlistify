# LS Music Club Discord Bot (playlistify)

A Discord bot to help manage the Launch School music club so that as leadership changes it will still be accessible and manageable.

## Initial PEDAC Process

### Application Architecture

```
                Token             Listen
               Refresh            Process
┌─────────────┐      ┌────────────┐     ┌─────────────┐
│             │◄─────┤            ├────►│             │
│ Spotify API │      │playlistify │     │ Discord API │
│             ├─────►│            │◄────┤             │
└─────┬───────┘      └──────┬─────┘     └──────┬──────┘
      │                     │                  │
      │                     │                  │
      │                     │                  │
      ▼                     │                  ▼
 LS Music Club              │              #some-channel
     (User)                 │                  │
      ▲                     ▼                  │
      │             ┌────────────────────┐     ▼
      │             │ 1. Parse URL       │
      └─────────────┤ 2. Get Resource    │ !weekly [url]
       User CRUD    │ 3. Add to Playlist │ !fresh [url]
                    └────────────────────┘
```

### Spotify Classes / Flow

```
               ┌───────────────────────────┐
               │           DB              │
               │                           │
               │ getCurrent()              │
               │                           │
               │ setWeekly(playlistId)     │
┌─────────────►│                           ├────────────┐
│              │ setFresh(playlistId)      │            │
│              │                           │            │
│              │ setUser(userId)           │            │
│              │                           │            │
│              │ getToken()                │            │
│              │                           │            │
│              │ setToken(refreshedToken)  │            │
│              └───────────────────────────┘            │
│                                                       │
│              ┌───────────────────────────┐            │
│              │      PlaylistManager      │            │
│              │                           │            │
└──────────────┤                           │            │
               │ create()                  │            │
┌──────────────┤                           │◄───────────┤
│              │ updateCurrent(details)    │            │
│              │                           │            │
│              │ addToCurrent(songUrl)     │            │
│              └───────────────────────────┘            │
│                                                       │
│              ┌───────────────────────────┐            │
│              │             API           │            │
│              │                           │            │
│              │ baseURI                   │            │
│              │                           │            │
│              │ get(endpoint)             │            │
└─────────────►│                           ├────────────┘
               │ post(endpoint, body)      │
               │                           │
               │ encode(body)              │
               └───────────────────────────┘
```

### Discord Classes / Flow

```
         ┌───────────────────────────┐
┌───────►│     PlaylistManager       ├────────┐
│        └───────────────────────────┘        │
│                                             │
│        ┌───────────────────────────┐        │
│        │           Client          │        │
│        │                           │        │
├────────┤ handleMessage()           │◄───────┤
│        │                           │        │
│        │ respond()                 │        │
│        └───────────────────────────┘        │
│                                             │
│        ┌───────────────────────────┐        │
│        │         Messenger         │        │
│        │                           │        │
│        │ parseCommand(message)     │        │
│        │                           │        │
│        │ sendSuccess()             │        │
└───────►│                           │        │
         │ sendError()               ├────────┘
         │                           │
         │ sendHelp()                │
         │                           │
         │ sendWeekly()              │
         │                           │
         │ sendFresh()               │
         └───────────────────────────┘
```
