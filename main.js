import { input } from '@inquirer/prompts';
import OpenAI from 'openai';
import { OPENAI_API_KEY } from './config.js';
import { initMessage, addMessage, getMessages } from './db/messages.js';

const client = new OpenAI({ apiKey: OPENAI_API_KEY });

await initMessage(
  '你是⼀位台灣夜市小吃達人-專門介紹夜市美食和推薦攤位，然後盡量推薦健康的美食，請⽤繁體中⽂回答。請⽤幽默有趣的⽅式回應。'
);

try {
  while (true) {
    const userQuestion = (await input({ message: '請輸入你的問題：' })).trim();

    if (userQuestion === '') continue;
    if (userQuestion.toLowerCase() === 'exit') {
      console.log('再會~');
      break;
    }

    await addMessage(userQuestion);

    const response = await client.chat.completions.create({
      model: 'gpt-5-mini',
      messages: getMessages(),
    });

    const content = response.choices[0].message.content;
    console.log(content);

    await addMessage(content, 'assistant');
  }
} catch (err) {
  if (err.name === 'ExitPromptError') {
    console.log('\n再會~');
  } else {
    throw err;
  }
}
