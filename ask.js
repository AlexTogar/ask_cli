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
  checkMessagesAfterTimeout,
  isEndpointReachable,
} = helpers;

const config = readJsonFile('./config.json');

// This function sends a question to the AI chat API and handles the response
const ask = async ({ question, flags }) => {
  checkMessagesAfterTimeout();

  if (flags.c) {
    clearMessages();
  }

  if (!question) return;

  const userMessage = createUserMessage(question);
  pushMessage(userMessage);

  try {
    let response;
    for (let endpoint of config.endpoints) {
      if (!(await isEndpointReachable(endpoint))) {
        continue;
      }

      response = await fetch(
        `http://${endpoint.serverIp}:${endpoint.port}/api/chat/completions`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${endpoint.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: endpoint.defaultModel,
            messages: readContext().messages,
          }),
        }
      );

      if (response.ok) break;
    }

    if (!response?.ok) throw new Error(`No reachable endpoint`);

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
    // Set the question from the first non-flag argument
    input.question = arg;
  } else {
    const key = arg.replace('--', '');
    if (key in input.flags) {
      input.flags[key] = true;
    }
  }
});

ask(input).then((response) => console.log(response));
