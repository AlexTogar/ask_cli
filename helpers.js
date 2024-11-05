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

module.exports = {
  readJsonFile,
  writeJsonFile,
  readContext,
  writeContext,
  pushMessage,
  clearMessages,
  createUserMessage,
  createAiMessage,
};
