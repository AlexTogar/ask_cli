const { writeJsonFile } = require('./helpers.js');
const fs = require('fs');
const path = require('path');

if (!fs.existsSync(`context.json`))
  writeJsonFile(`context.json`, { messages: [] });

if (!fs.existsSync(`config.json`))
  writeJsonFile(`config.json`, {
    token: 'YOUR_TOKEN',
    defaultModel: 'YOUR_MODEL',
    serverIp: 'YOUR_IP',
  });
