const { Pinecone } = require('@pinecone-database/pinecone');

const { embedTexts } = require('./embed-texts');

const DB_INDEX = 'rag-langchain-nodejs'
const NAMESPACE = 'test-namespace'

// https://docs.pinecone.io/guides/get-started/quickstart
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

/**
 * 
 * @param {*} embeddings Array of embedding & chunk: [{embedding: [], chunk: ''}]
 * @param {*} namespace 
 */
async function storeEmbeddings(embeddings, namespace = NAMESPACE) {
  const index = pc.index(DB_INDEX);

  for (let i = 0; i < embeddings.length; i++) {
    await index.namespace(namespace).upsert([{
      id: `chunk-${i}`,
      values: embeddings[i].embedding,
      metadata: { chunk: embeddings[i].chunk }
    }]);
  }
}

const createIndex = async () => {
  await pc.createIndex({
    name: DB_INDEX,
    dimension: 768,
    metric: 'cosine',
    spec: {
      serverless: {
        cloud: 'aws',
        region: 'us-east-1'
      }
    }
  });
  console.log('Index created', DB_INDEX)
}

async function checkIndexExists() {
  // List all indexes
  const response = await pc.listIndexes();
  const indexes = response.indexes;
  console.log('Available indexes:', indexes)

  // Check if the desired index is in the list
  return indexes.find(item => item.name === DB_INDEX);
}

const describeIndexStats = async () => {
  const index = pc.index(DB_INDEX);
  const stats = await index.describeIndexStats();
  return stats;
}

// https://docs.pinecone.io/guides/data/query-data
async function retrieveRelevantChunks(query, namespace = NAMESPACE) {
  const embeddingDataArr = await embedTexts([query]);
  const index = pc.index(DB_INDEX);
  const results = await index.namespace(namespace).query({
    vector: embeddingDataArr[0].embedding,
    topK: 5, // Number of relevant chunks to retrieve
    includeValues: true,
    includeMetadata: true,
  });
  return results.matches.map(match => match.metadata.chunk);
}

// Thêm hàm deleteIndex
const deleteIndex = async () => {
  try {
    await pc.deleteIndex(DB_INDEX);
    console.log('Index deleted successfully:', DB_INDEX);
  } catch (error) {
    console.error('Error deleting index:', error);
  }
};

// Storing embeddings in Pinecone
//await storeEmbeddings(embeddings, 'your-namespace');

module.exports = {
  storeEmbeddings,
  createIndex,
  describeIndexStats,
  retrieveRelevantChunks,
  checkIndexExists,
  deleteIndex
}
