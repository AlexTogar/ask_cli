#!/usr/bin/env node
const fetch = require('node-fetch');

const helpers = require('./helpers.js');
const {
  readJsonFile,
  pushMessage,
  clearMessages,
  createUserMessage,
  createAiMessage,
  readContext,
  writeContext,
} = helpers;

const config = readJsonFile('./config.json');

const ask = async ({ question, flags }) => {
  if (flags.c) {
    clearMessages();
  }

  if (!question) return;

  const userMessage = createUserMessage(question);
  pushMessage(userMessage);

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
          messages: readContext().messages,
        }),
      }
    );

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    const answer = data.choices[0].message.content;
    pushMessage(createAiMessage(answer));
    writeContext((context) => ({ ...context, lastAnswerTs: Date.now() }));

    return answer;
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

const args = process.argv.slice(2);
const input = {
  question: '',
  flags: { c: false },
};

args.forEach((arg) => {
  if (!arg.startsWith('--')) {
    input.question = arg;
  } else {
    const key = arg.replace('--', '');
    if (key in input.flags) {
      input.flags[key] = true;
    }
  }
});

ask(input).then((response) => console.log(response));
