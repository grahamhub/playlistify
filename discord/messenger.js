class Messenger {
  setChannel(channel) {
    this.channel = channel;
  }

  sendHelp() {
    const help = `Command structure:
- !<command> <url>

Available commands:
- weekly: accepts album or track URLs (or no argument for the link)
- fresh: accepts only track URLs (or no argument for the link)
- helpme: responds with this message \u{1f917}

To get a proper URL:
- Open your Spotify client
- Navigate to the resource you want to add
- Click \`...\` -> Share -> Copy {Resource} Link`;

    this.channel.send(help);
  }

  sendSuccess() {
    const success = 'I successfully added that to the playlist!';

    this.channel.send(success);
  }

  sendError(message) {
    const error = `I ran into an error: ${message}`;

    this.channel.send(error);
  }

  send(msg) {
    this.channel.send(msg);
  }
}

module.exports = Messenger;
