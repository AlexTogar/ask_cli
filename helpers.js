const fs = require('fs');
const path = require('path');

// ===== File Operations =====
const readJsonFile = (filePath) => {
  return JSON.parse(fs.readFileSync(path.resolve(__dirname, filePath), 'utf8'));
};

const writeJsonFile = (filePath, data) => {
  const jsonData = JSON.stringify(data, null, 2);
  fs.writeFileSync(path.resolve(__dirname, filePath), jsonData, 'utf8');
};

// ===== Context Management =====
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

// ===== Endpoint Management =====
const isEndpointReachable = async (endpoint) => {
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

const sortEndpointsByPriority = (endpoints) =>
  endpoints.sort((a, b) => {
    a.priority > b.priority ? 1 : 0;
  });

const getResponseFromEndpoints = async (endpoints) => {
  const sortedEndpoints = sortEndpointsByPriority(endpoints);
  for (let endpoint of sortedEndpoints) {
    if (!(await isEndpointReachable(endpoint))) {
      continue;
    }

    const response = await fetchEndpoint(endpoint);
    if (response.ok) return response;
  }
  return null;
};

const fetchEndpoint = async (endpoint) => {
  return await fetch(
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
};

const processResponse = async (response) => {
  const data = await response.json();
  const answer = data.choices[0].message.content;
  return answer;
};

// ===== Command Line Argument Parsing =====
const parseCommandLineArgs = () => {
  const args = process.argv.slice(2);
  const input = {
    question: '',
    flags: { c: false, model: '' },
  };

  // Process command line arguments
  args.forEach((arg) => {
    const isFlag = arg.startsWith('--');

    if (!isFlag) {
      // Set the question from the first non-flag argument
      input.question = arg;
      return;
    }

    // Handle flag arguments
    const flagName = arg.replace('--', '');
    if (flagName in input.flags && typeof input.flags[flagName] === 'boolean') {
      input.flags[flagName] = true;
    } else if (flagName in input.flags) {
      // Set the value of the string flag from the next argument
      const valueIndex = args.indexOf(arg) + 1;
      input.flags[flagName] = args[valueIndex];
    }
  });

  return input;
};

// ===== Error Handling =====
const handleError = (error) => {
  console.error('Error:', error);
  process.exit(1);
};

module.exports = {
  // File Operations
  readJsonFile,
  writeJsonFile,

  // Context Management
  readContext,
  writeContext,
  pushMessage,
  clearMessages,
  createUserMessage,
  createAiMessage,
  checkMessagesAfterTimeout,

  // Endpoint Management
  isEndpointReachable,
  sortEndpointsByPriority,
  getResponseFromEndpoints,
  processResponse,

  // Command Line Argument Parsing
  parseCommandLineArgs,

  // Error Handling
  handleError,
};
