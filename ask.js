#!/usr/bin/env node
const helpers = require('./helpers.js');
const {
  // File Operations
  readJsonFile,
  writeContext,

  // Context Management
  pushMessage,
  clearMessages,
  createUserMessage,
  checkMessagesAfterTimeout,
  createAiMessage,

  // Endpoint Management
  getResponseFromEndpoints,
  processResponse,

  // Command Line Argument Parsing
  parseCommandLineArgs,

  // Error Handling
  handleError,
} = helpers;

const config = readJsonFile('./config.json');

// This function sends a question to the AI chat API and handles the response
const ask = async ({ question, flags }) => {
  try {
    checkMessagesAfterTimeout();

    if (flags.c) {
      clearMessages();
    }

    if (!question) return;

    const userMessage = createUserMessage(question);
    pushMessage(userMessage);

    const response = await getResponseFromEndpoints(config.endpoints);

    if (!response) throw new Error(`No reachable endpoint`);

    const answer = await processResponse(response);

    pushMessage(createAiMessage(answer));
    writeContext((context) => ({ ...context, lastAnswerTs: Date.now() }));

    return answer;
  } catch (error) {
    handleError(error);
  }
};

const input = parseCommandLineArgs();

ask(input).then((response) => console.log(response));
