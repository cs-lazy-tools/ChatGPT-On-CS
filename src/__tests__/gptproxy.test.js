import 'openai/shims/node';
import fetch from 'node-fetch';

global.fetch = fetch;

// eslint-disable-next-line import/first
import { DifyAI } from '../main/gptproxy';

process.env.DEBUG = 'true';

// '{"code": "invalid_param", "message": "Missing required parameter in the JSON body", "params": "inputs"}

describe('DifyAI', () => {
  it('chat generation', async () => {
    const dify = new DifyAI({
      apiKey: 'app-5uPNxwQ6Q8bU6FzO3WZ72tqV',
      baseURL: 'https://api.dify.ai/v1',
    });
    const response = await dify.chat.completions.create({
      model: 'gpt-3.5-turbo',
      stream: true,
      messages: [
        // { role: 'user', content: 'Hello, how are you?' },
        // { role: 'assistant', content: 'I am fine, thank you.' },
        { role: 'user', content: 'Hi' },
      ],
    });
    expect(response).toBeDefined();
    // 打印返回结果
    console.log(response);
  });
});
