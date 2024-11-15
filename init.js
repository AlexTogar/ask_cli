const { writeJsonFile } = require('./helpers.js');
const fs = require('fs');
const path = require('path');

if (!fs.existsSync(`context.json`))
  writeJsonFile(`context.json`, { messages: [] });

if (!fs.existsSync(`config.json`))
  writeJsonFile(`config.json`, {
    endpoints: [
      {
        token: 'YOUR_TOKEN',
        defaultModel: 'qwen2.5-coder',
        serverIp: '192.168.0.187',
        port: '8080',
      },
      {
        token: 'YOUR_TOKEN',
        defaultModel: 'qwen2.5-coder',
        serverIp: '192.168.0.189',
        port: '8080',
      },
    ],
  });
