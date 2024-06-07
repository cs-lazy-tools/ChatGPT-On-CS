import { OpenAI } from 'openai';

import { DashscopeEmbeddings, OpenAIEmbeddingsCompatibility } from '../types';

export function fromEmbeddingCreatePrams(
  params: OpenAIEmbeddingsCompatibility.EmbeddingCreateParams,
): DashscopeEmbeddings.EmbeddingCreateParams {
  return {
    model: params.model,
    input: {
      texts: params.input,
    },
    parameters: {
      text_type: params.type || 'query',
    },
  };
}

export function toEmbedding(
  params: OpenAIEmbeddingsCompatibility.EmbeddingCreateParams,
  response: DashscopeEmbeddings.CreateEmbeddingResponse,
): OpenAI.CreateEmbeddingResponse {
  const { output, usage } = response;

  return {
    object: 'list',
    model: params.model,
    data: output.embeddings.map(({ text_index, embedding }) => ({
      index: text_index,
      embedding,
      object: 'embedding',
    })),
    usage: {
      prompt_tokens: usage.total_tokens,
      total_tokens: usage.total_tokens,
    },
  };
}
