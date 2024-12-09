const { GoogleGenerativeAI } = require("@google/generative-ai");
const { VectorDBService } = require("./vectorDBService");
const chatHistory = require("../models/chatModel");

class ChatService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    this.vectorDB = new VectorDBService();
  }

  async initializeVectorDB() {
    const indexExists = await this.vectorDB.checkIndexExists();
    if (!indexExists) {
      await this.vectorDB.createIndex();
    }
    return indexExists;
  }

  async processPDF(pdfPath) {
    const pdfService = require('./pdfService');
    const pdfTexts = await pdfService.extractTextsFromPDF(pdfPath);
    const pdfChunks = pdfService.chunkTexts(pdfTexts);
    const embeddings = await pdfService.embedTexts(pdfChunks);
    await this.vectorDB.storeEmbeddings(embeddings);
  }

  async generateResponse(query, sessionId) {
    const relevantChunks = await this.vectorDB.retrieveRelevantChunks(query);
    const context = relevantChunks.join(' ');
    const conversation = chatHistory.getConversation(sessionId);

    const prompt = `Bạn là một trợ lý AI chuyên nghiệp, có kiến thức sâu rộng về luật pháp. 

Ngữ cảnh (chứa các điều luật và quy định): 
${context}

Lịch sử cuộc trò chuyện:
${conversation.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Câu hỏi hiện tại: ${query}

Hướng dẫn:
1. Sử dụng ngữ cảnh và lịch sử trò chuyện để đưa ra câu trả lời nhất quán
2. Nếu có điều luật liên quan:
   - Trích dẫn chính xác
   - Giải thích dễ hiểu
    // Lưu lại lịch sử
3. Nếu câu hỏi không rõ:
   - Hỏi lại để làm rõ
   - Đề xuất hướng điều chỉnh
4. Nếu thiếu thông tin:
   - Sử dụng kiến thức chung
   - Đề xuất tham khảo thêm
5. Luôn giữ giọng điệu chuyên nghiệp và thân thiện

Hãy trả lời một cách có cấu trúc và hữu ích.`;

    const result = await this.model.generateContent(prompt);
    const response = result.response.text();

    // Lưu lại lịch sử
    // Lưu lại lịch sử
    chatHistory.addMessage(sessionId, "user", query);
    chatHistory.addMessage(sessionId, "assistant", response);

    return response;
  }
}

module.exports = new ChatService(); 