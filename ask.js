#!/usr/bin/env node
import dotenv from 'dotenv';
import fetch from 'node-fetch'; // You need to install node-fetch if you don't have it yet: npm install node-fetch

dotenv.config({ path: './config.env' });

const TOKEN = process.env.TOKEN;
const SERVER_IP = '192.168.0.189';
const DEFAULT_MODEL = process.env.DEFAULT_MODEL;

async function ask(question) {
  const url = `http://${SERVER_IP}:8080/api/chat/completions`;
  const headers = {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  };

  const model = process.env.argv[3] || DEFAULT_MODEL;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: question,
          },
        ],
      }),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Check if the script is run directly and get the argument passed in.
const question = process.argv[2];
if (!question) {
  console.error('Please provide a question.');
  process.exit(1);
}

ask(question).then((response) => {
  console.log(response);
});
