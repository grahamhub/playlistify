/* eslint-disable no-console */
const fs = require('fs');
// eslint-disable-next-line no-unused-vars
const dotenv = require('dotenv').config();

class Logger {
  constructor() {
    this.path = process.env.LOGPATH;
  }

  async log(err, className) {
    const timestamp = new Date().toISOString();
    const file = `${this.path}/${timestamp}.log`;
    let content = `Exception occurred via ${className} on ${new Date().toDateString()}:\n`;

    Object.keys(err).forEach((key) => {
      content += `${key}: ${err[key]}\n`;
    });

    return fs.writeFile(file, content, { flag: 'w+' }, (error) => {
      if (error) {
        console.log('there was an error writing the log');
        return false;
      }

      console.log('successfully wrote log');
      return true;
    });
  }
}

module.exports = new Logger();
