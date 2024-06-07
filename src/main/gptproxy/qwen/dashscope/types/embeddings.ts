export namespace DashscopeEmbeddings {
  export type EmbeddingModel =
    | 'text-embedding-v1'
    | 'text-embedding-async-v1'
    | 'text-embedding-v2'
    | 'text-embedding-async-v2';

  export interface EmbeddingCreateParams {
    /**
     * 模型
     */
    model: ({} & string) | EmbeddingModel;
    input: {
      /**
       * 输入文本
       */
      texts: string | Array<string> | Array<number> | Array<Array<number>>;
    };
    parameters: {
      /**
       * 文本转换为向量后可以应用于检索、聚类、分类等下游任务，对检索这类非对称任务为了达到更好的检索效果
       * 建议区分查询文本（query）和底库文本（document）类型,
       * 聚类、分类等对称任务可以不用特殊指定，采用系统默认值"document"即可
       *
       * @defaultValue 'query'
       */
      text_type?: 'query' | 'document';
    };
  }

  export type Embedding = {
    text_index: number;
    embedding: number[];
  };

  export type CreateEmbeddingResponse = {
    request_id: string;
    code: string;
    message: string;
    output: {
      embeddings: Embedding[];
    };
    usage: {
      total_tokens: number;
    };
  };
}
