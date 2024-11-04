#!/usr/bin/env node

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(__dirname, filePath), 'utf8'));
}

function writeJsonFile(filePath, data) {
  const jsonData = JSON.stringify(data, null, 2);
  fs.writeFileSync(path.resolve(__dirname, filePath), jsonData, 'utf8');
}

const config = readJsonFile('./config.json');

async function ask({ question, flags }) {
  if (flags.c) {
    writeJsonFile('./context.json', {});
  }

  if (!question) return;

  const context = readJsonFile('./context.json');
  const messages = [
    ...(context.messages || []),
    { role: 'user', content: question },
  ];
  writeJsonFile('./context.json', { messages });

  try {
    const response = await fetch(
      `http://${config.serverIp}:8080/api/chat/completions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.defaultModel,
          messages,
        }),
      }
    );

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    const assistantMessage = {
      role: 'assistant',
      content: data.choices[0].message.content,
    };

    writeJsonFile('./context.json', {
      messages: [...messages, assistantMessage],
    });
    return assistantMessage.content;
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

const args = process.argv.slice(2);
const input = {
  question: '',
  flags: { c: false },
};

args.forEach((arg) => {
  if (!arg.startsWith('--')) {
    input.question = arg;
  } else {
    const flagKey = arg.replace('--', '');
    if (flagKey in input.flags) {
      input.flags[flagKey] = true;
    }
  }
});

ask(input).then((response) => console.log(response));
