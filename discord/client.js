const Discord = require('discord.js');
const Messenger = require('./messenger');

class Client extends Discord.Client {
  constructor() {
    super();
    this.messenger = new Messenger(process.env.CHANNEL);
    this.readyState = 'not ready';
    this.on('ready', this.setState);
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

  setState() {
    this.readyState = 'ready';
  }

  static parseCommand(message) {
    if (Client.shouldHandle(message)) {
      return Client.buildCommand(message.content);
    }

    return null;
  }
}

module.exports = Client;
