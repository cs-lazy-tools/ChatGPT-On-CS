import OpenAI, { APIError } from 'openai';
import { _iterSSEMessages, Stream } from 'openai/streaming';

import type {
  DashscopeCompletions,
  OpenAICompletionsCompatibility,
} from '../types';

export function isMultiModal(model: string): boolean {
  return model.startsWith('qwen-vl');
}

export function getCompletionCreateEndpoint(model: string) {
  return isMultiModal(model)
    ? '/services/aigc/multimodal-generation/generation'
    : '/services/aigc/text-generation/generation';
}

export function fromCompletionCreateParams(
  params: OpenAICompletionsCompatibility.CompletionCreateParams,
): DashscopeCompletions.CompletionCreateParams {
  const { model, prompt, response_format, stream_options, ...parameters } =
    params;

  const result: DashscopeCompletions.CompletionCreateParams = {
    model,
    input: { prompt },
    parameters,
  };

  if (response_format && response_format.type) {
    result.parameters!.result_format = response_format.type;
  }

  if (params.stream) {
    const { incremental_output } = stream_options || {};
    result.parameters!.incremental_output = incremental_output ?? true;
  }

  return result;
}

export function toCompletionFinishReason(
  reason?: DashscopeCompletions.ResponseFinish | null,
  stream?: boolean,
) {
  if (reason === 'null' || !reason) {
    return (stream ? null : 'stop') as 'stop';
  }

  return reason;
}

export function toCompletionUsage(
  usage: DashscopeCompletions.CompletionUsage,
): OpenAI.CompletionUsage {
  // hack: 部分模型不存在 total tokens?
  // 如：llama2-7b-chat-v2
  const {
    output_tokens,
    input_tokens,
    total_tokens = output_tokens + input_tokens,
  } = usage;

  return {
    completion_tokens: output_tokens,
    prompt_tokens: input_tokens,
    total_tokens,
  };
}

export function toCompletion(
  params: DashscopeCompletions.CompletionCreateParams,
  response: DashscopeCompletions.Completion,
  stream?: boolean,
): OpenAI.Completion {
  const { model } = params;
  const { output, usage } = response;

  const choice: OpenAI.CompletionChoice = {
    index: 0,
    text: output.text,
    logprobs: null,
    finish_reason: toCompletionFinishReason(output.finish_reason, stream),
  };

  return {
    id: response.request_id,
    model,
    choices: [choice],
    created: Math.floor(Date.now() / 1000),
    object: 'text_completion',
    usage: toCompletionUsage(usage),
  };
}

export function toCompletionStream(
  params: DashscopeCompletions.CompletionCreateParams,
  response: Response,
  controller: AbortController,
): Stream<OpenAI.Completion> {
  let consumed = false;
  async function* iterator(): AsyncIterator<OpenAI.Completion, any, undefined> {
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

          yield toCompletion(params, message, true);
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
