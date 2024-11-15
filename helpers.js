const fs = require('fs');
const path = require('path');

const readJsonFile = (filePath) => {
  return JSON.parse(fs.readFileSync(path.resolve(__dirname, filePath), 'utf8'));
};

const writeJsonFile = (filePath, data) => {
  const jsonData = JSON.stringify(data, null, 2);
  fs.writeFileSync(path.resolve(__dirname, filePath), jsonData, 'utf8');
};

const readContext = () => readJsonFile('./context.json');

const writeContext = (callback) => {
  const context = readContext();
  const newContext = callback(context);
  writeJsonFile('./context.json', newContext);
};

const pushMessage = (newMessage) => {
  writeContext((context) => ({
    ...context,
    messages: [...context.messages, newMessage],
  }));
};

const clearMessages = () => {
  writeContext((context) => ({ ...context, messages: [] }));
};

const createUserMessage = (message) => ({
  role: 'user',
  content: message,
});

const createAiMessage = (message) => ({
  role: 'assistant',
  content: message,
});

const checkMessagesAfterTimeout = () => {
  const { lastAnswerTs } = readContext();
  const currentTime = Date.now();
  const diffSeconds = (currentTime - lastAnswerTs) / 1000;
  const diffMinutes = diffSeconds / 60;

  if (diffMinutes > 5) {
    clearMessages();
  }
};

// Function to check the reachability of an endpoint
const isEndpointReachable = async (endpoint) => {
  console.log('check ' + JSON.stringify(endpoint));
  try {
    const response = await fetch(
      `http://${endpoint.serverIp}:${endpoint.port}`,
      { method: 'HEAD', timeout: 5000 }
    );
    return response.ok;
  } catch {
    return false;
  }
};

module.exports = {
  readJsonFile,
  writeJsonFile,
  readContext,
  writeContext,
  pushMessage,
  clearMessages,
  createUserMessage,
  createAiMessage,
  checkMessagesAfterTimeout,
  isEndpointReachable,
};
