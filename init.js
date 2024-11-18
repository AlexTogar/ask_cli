const { writeJsonFile } = require('./helpers.js');
const fs = require('fs');

function init() {
  // Create context.json if it doesn't exist
  if (!fs.existsSync('context.json')) {
    writeJsonFile('context.json', {
      messages: [],
    });
  }

  // Create config.json with default endpoints if it doesn't exist
  if (!fs.existsSync('config.json')) {
    const defaultConfig = {
      endpoints: [
        {
          token: 'YOUR_TOKEN',
          defaultModel: 'qwen2.5-coder',
          serverIp: '192.168.0.187',
          port: '8080',
          priority: 1,
        },
        {
          token: 'YOUR_TOKEN',
          defaultModel: 'qwen2.5-coder',
          serverIp: '192.168.0.189',
          port: '8080',
          priority: 2,
        },
      ],
    };

    writeJsonFile('config.json', defaultConfig);
  }
}

init();
