import 'dotenv/config';
import * as readline from 'node:readline';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ChatbotService } from '../modules/chatbot/chatbot.service';

async function main(): Promise<void> {
  const cellphone = process.argv[2];
  if (!cellphone) {
    console.error('Usage: node dist/scripts/chat-repl.js <cellphone>');
    process.exit(1);
  }

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });
  const chatbot = app.get(ChatbotService);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  console.log(`\nChatting as ${cellphone}. Type a message, Ctrl+C to quit.\n`);
  rl.setPrompt('you> ');
  rl.prompt();

  rl.on('line', (line) => {
    const text = line.trim();
    if (!text) {
      rl.prompt();
      return;
    }
    void (async () => {
      const { reply } = await chatbot.handleIncomingMessage({
        cellphone,
        text,
      });
      console.log(`\nbot> ${reply}\n`);
      rl.prompt();
    })();
  });

  rl.on('close', () => {
    void app.close().then(() => process.exit(0));
  });
}

void main();
