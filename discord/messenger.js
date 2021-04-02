class Messenger {
  constructor(channel) {
    this.channel = channel;
  }

  routeMessage(type) {
    switch (type) {
      case 'help':
        this.sendHelp();
        break;
      case 'success':
        this.sendSuccess();
        break;
      case 'error':
        this.sendError();
        break;
      case 'weekly':
        this.sendWeekly();
        break;
      case 'fresh':
        this.sendFresh();
        break;
      default:
        break;
    }
  }

  sendHelp() {
    const help = `Command structure:
- !<command> <url>

Available commands:
- weekly: accepts album or track URLs (or no argument for the link)
- fresh: accepts only track URLs (or no argument for the link)

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

  sendError() {
    const error = 'I ran into an error!';

    this.channel.send(error);
  }

  sendWeekly() {
    const weekly = 'placeholder';

    this.channel.send(weekly);
  }

  sendFresh() {
    const fresh = 'placeholder';

    this.channel.send(fresh);
  }
}

module.exports = Messenger;
