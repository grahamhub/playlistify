const Discord = require('discord.js');
const Messenger = require('./messenger');

class Client extends Discord.Client {
  constructor() {
    super();
    this.messenger = new Messenger();
    this.readyState = false;
    this.on('ready', this.setState);
  }

  static invalidArgs(args) {
    return args.length > 1 || !args[0].includes('spotify');
  }

  static shouldHandle(message) {
    return (
      // eslint-disable-next-line operator-linebreak
      message.channel.id === process.env.CHANNEL &&
      message.content.startsWith('!')
    );
  }

  static buildCommand(content) {
    const contArr = content.split(' ');

    const command = contArr.shift().slice(1);
    const args = [...contArr];

    return {
      command,
      args,
    };
  }

  async bindChannel(channelId = process.env.CHANNEL) {
    const channel = await this.channels.fetch(String(channelId));

    this.messenger.setChannel(channel);
  }

  async setState() {
    await this.bindChannel();

    this.readyState = true;
  }

  static parseCommand(message) {
    if (Client.shouldHandle(message)) {
      return Client.buildCommand(message.content);
    }

    return null;
  }
}

module.exports = Client;
