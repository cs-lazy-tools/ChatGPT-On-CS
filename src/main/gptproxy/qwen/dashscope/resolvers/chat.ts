import OpenAI, { APIError } from 'openai';
import { _iterSSEMessages, Stream } from 'openai/streaming';

import { DashscopeChat, OpenAIChatCompatibility } from '../types';
import { isMultiModal, toCompletionUsage } from './completions';

export function fromChatCompletionMessages(
  messages: OpenAI.ChatCompletionMessageParam[],
): OpenAI.ChatCompletionMessageParam[] {
  return messages.map((message) => {
    if (Array.isArray(message.content)) {
      message.content.forEach((part) => {
        if (part.type === 'image_url') {
          // @ts-expect-error
          part.image = part.image_url.url;

          // @ts-expect-error
          delete part.image_url;
        }

        // @ts-expect-error
        delete part.type;
      });
    } else {
      message.content = [
        // @ts-expect-error
        { text: message.content! },
      ];
    }

    return message;
  });
}

export function fromChatCompletionTextMessages(
  messages: OpenAI.ChatCompletionMessageParam[],
): OpenAI.ChatCompletionMessageParam[] {
  return messages.map((message) => {
    if (Array.isArray(message.content)) {
      const part = message.content.find(
        (c) => c.type === 'text',
      ) as OpenAI.ChatCompletionContentPartText;
      return {
        role: message.role,
        content: part.text,
      } as OpenAI.ChatCompletionMessageParam;
    }

    return message;
  });
}

export function fromChatCompletionCreateParams(
  params: OpenAIChatCompatibility.ChatCompletionCreateParams,
): DashscopeChat.ChatCompletionCreateParams {
  const {
    model,
    messages,
    raw,
    response_format,
    stream_options = {},
    ...parameters
  } = params;

  const result: DashscopeChat.ChatCompletionCreateParams = {
    model,
    input: {
      messages: [],
    },
    parameters,
  };

  if (raw === true) {
    result.input.messages = messages;
  } else if (isMultiModal(model)) {
    result.input.messages = fromChatCompletionMessages(messages);
  } else {
    result.input.messages = fromChatCompletionTextMessages(messages);
  }

  if (params.tools) {
    result.parameters!.result_format = 'message';
  } else {
    if (response_format && response_format.type) {
      result.parameters!.result_format = response_format.type;
    }

    if (params.stream) {
      const incremental_output = stream_options?.incremental_output ?? true;
      result.parameters!.incremental_output = incremental_output;
    }
  }

  return result;
}

export function toChatCompletionFinishReason(
  reason?: DashscopeChat.ResponseFinish | null,
  stream?: boolean,
) {
  if (reason === 'null' || !reason) {
    return (stream ? null : 'stop') as 'stop';
  }

  return reason;
}

export function toChatCompletion(
  params: DashscopeChat.ChatCompletionCreateParams,
  response: DashscopeChat.ChatCompletion,
): OpenAI.ChatCompletion {
  const { model } = params;
  const { output, usage } = response;

  const choice: OpenAI.ChatCompletion.Choice = {
    index: 0,
    message: {
      role: 'assistant',
      content: '',
    },
    logprobs: null,
    finish_reason: 'stop',
  };

  // Note: `params.parameters.result_format=message`
  if (output.choices) {
    const { message, finish_reason } = output.choices[0];

    choice.message = {
      role: message.role,
      content: message.content,
    };

    if (finish_reason === 'tool_calls') {
      choice.finish_reason = 'tool_calls';

      choice.message.tool_calls = message.tool_calls;
    } else {
      choice.finish_reason = toChatCompletionFinishReason(finish_reason, true);
    }
  } else {
    choice.message.content = output.text;
    choice.finish_reason = toChatCompletionFinishReason(output.finish_reason);
  }

  return {
    id: response.request_id,
    model,
    choices: [choice],
    created: Math.floor(Date.now() / 1000),
    object: 'chat.completion',
    usage: toCompletionUsage(usage),
  };
}

function toCompletionChunk(
  params: DashscopeChat.ChatCompletionCreateParams,
  chunk: DashscopeChat.ChatCompletion,
): OpenAI.ChatCompletionChunk {
  const { output } = chunk;

  const choice: OpenAI.ChatCompletionChunk.Choice = {
    index: 0,
    delta: {
      role: 'assistant',
      content: '',
    },
    finish_reason: null,
  };

  // Note: work in `params.parameters.result_format=message`
  if (output.choices) {
    const { message, finish_reason } = output.choices[0];

    choice.delta = {
      role: message.role,
      content: message.content,
    };

    if (finish_reason === 'tool_calls') {
      choice.finish_reason = 'tool_calls';
      choice.delta.tool_calls =
        message.tool_calls as OpenAI.ChatCompletionChunk.Choice.Delta.ToolCall[];
    } else {
      choice.finish_reason = toChatCompletionFinishReason(finish_reason, true);
    }
  } else {
    choice.delta.content = output.text;
    choice.finish_reason = toChatCompletionFinishReason(
      output.finish_reason,
      true,
    );
  }

  return {
    id: chunk.request_id,
    model: params.model,
    choices: [choice],
    object: 'chat.completion.chunk',
    created: Math.floor(Date.now() / 1000),
  };
}

export function toChatCompletionStream(
  params: DashscopeChat.ChatCompletionCreateParams,
  response: Response,
  controller: AbortController,
): Stream<OpenAI.ChatCompletionChunk> {
  let consumed = false;
  async function* iterator(): AsyncIterator<
    OpenAI.ChatCompletionChunk,
    any,
    undefined
  > {
    if (consumed) {
      throw new Error(
        'Cannot iterate over a consumed stream, use `.tee()` to split the stream.',
      );
    }
    consumed = true;
    let done = false;
    try {
      // eslint-disable-next-line no-restricted-syntax
      for await (const sse of _iterSSEMessages(response, controller)) {
        if (done) continue;

        if (sse.data.startsWith('[DONE]')) {
          done = true;
          continue;
        }

        if (sse.event === 'result') {
          let message;

          try {
            message = JSON.parse(sse.data);
          } catch (e) {
            console.error(`Could not parse message into JSON:`, sse.data);
            console.error(`From chunk:`, sse.raw);
            throw e;
          }

          if (message && message.code) {
            throw new APIError(undefined, message, undefined, undefined);
          }

          yield toCompletionChunk(params, message);
        }
      }
      done = true;
    } catch (e) {
      // If the user calls `stream.controller.abort()`, we should exit without throwing.
      if (e instanceof Error && e.name === 'AbortError') return;
      throw e;
    } finally {
      // If the user `break`s, abort the ongoing request.
      if (!done) controller.abort();
    }
  }

  return new Stream(iterator, controller);
}
