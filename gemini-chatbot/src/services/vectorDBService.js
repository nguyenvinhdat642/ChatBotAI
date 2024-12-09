const { Pinecone } = require('@pinecone-database/pinecone');
const pdfService = require('./pdfService');

class VectorDBService {
  constructor() {
    this.pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    this.DB_INDEX = 'rag-langchain-nodejs';
    this.NAMESPACE = 'test-namespace';
  }

  async storeEmbeddings(embeddings, namespace = this.NAMESPACE) {
    const index = this.pc.index(this.DB_INDEX);
    for (let i = 0; i < embeddings.length; i++) {
      await index.namespace(namespace).upsert([{
        id: `chunk-${i}`,
        values: embeddings[i].embedding,
        metadata: { chunk: embeddings[i].chunk }
      }]);
    }
  }

  async createIndex() {
    await this.pc.createIndex({
      name: this.DB_INDEX,
      dimension: 768,
      metric: 'cosine',
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1'
        }
      }
    });
  }

  async checkIndexExists() {
    const response = await this.pc.listIndexes();
    return response.indexes.find(item => item.name === this.DB_INDEX);
  }

  async retrieveRelevantChunks(query, namespace = this.NAMESPACE) {
    const embeddingDataArr = await pdfService.embedTexts([query]);
    const index = this.pc.index(this.DB_INDEX);
    const results = await index.namespace(namespace).query({
      vector: embeddingDataArr[0].embedding,
      topK: 5,
      includeValues: true,
      includeMetadata: true,
    });
    return results.matches.map(match => match.metadata.chunk);
  }
}

module.exports = { VectorDBService }; 