const pdfParse = require('pdf-parse');
const fs = require('fs');
const { GoogleGenerativeAI } = require("@google/generative-ai");

class PDFService {
  async extractTextsFromPDF(filePath) {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    return pdfData.text;
  }

  chunkTexts(text, chunkSize = 1000, overlapSize = 200) {
    const chunks = [];
    let start = 0;
    while (start < text.length) {
      const end = start + chunkSize;
      const chunk = text.slice(start, end);
      chunks.push(chunk);
      start += chunkSize - overlapSize;
    }
    return chunks;
  }

  async embedTexts(textChunks) {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });
    
    const embeddingsDataArr = [];
    for (const chunk of textChunks) {
      const result = await embeddingModel.embedContent(chunk);
      const embedding = result.embedding.values;
      embeddingsDataArr.push({ embedding, chunk });
    }
    return embeddingsDataArr;
  }
}

module.exports = new PDFService(); 