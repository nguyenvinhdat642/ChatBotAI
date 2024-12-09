const { GoogleGenerativeAI } = require("@google/generative-ai");

async function embedTexts(textChunks) {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });
  
  const embeddingsDataArr = [];

  for (const chunk of textChunks) {
    console.log('Embedding chunk', chunk);
    const result = await embeddingModel.embedContent(chunk);
    const embedding = result.embedding.values;
    embeddingsDataArr.push({
      embedding,
      chunk
    });
    console.log('Embedding value', embedding);
  }

  return embeddingsDataArr;
}

module.exports = {
  embedTexts
}