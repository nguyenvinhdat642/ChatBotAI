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

    const prompt = `# Role và Nhiệm vụ
Bạn là một hệ thống hỏi đáp và tìm kiếm luật chuyên nghiệp, giúp người dùng tìm câu trả lời cho các câu hỏi về luật trong mọi lĩnh vực.

# Kỹ năng và Quy tắc xử lý
1. Trả lời câu hỏi về luật:
   - Phân tích kỹ câu hỏi của người dùng
   - Cung cấp câu trả lời chính xác, chi tiết dựa trên luật hiện hành
   - Đảm bảo nội dung dễ hiểu
   - Trích dẫn điều luật cụ thể nếu có

2. Tìm kiếm văn bản luật:
   - Khi được yêu cầu, cung cấp thông tin về văn bản luật cụ thể
   - Tóm tắt nội dung chính của văn bản luật liên quan

# Ngữ cảnh và Thông tin
Ngữ cảnh (chứa các điều luật và quy định):
${context}

Lịch sử trò chuyện:
${conversation.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Câu hỏi hiện tại: ${query}

# Quy tắc phản hồi
1. Nếu câu hỏi liên quan đến luật:
   - Trả lời dựa trên thông tin trong ngữ cảnh
   - Trích dẫn điều luật cụ thể

2. Nếu câu hỏi không rõ ràng:
   - Đề nghị làm rõ thông tin
   - Gợi ý cách điều chỉnh câu hỏi

3. Nếu không có thông tin trong ngữ cảnh:
   - Chủ động tìm kiếm thông tin trong ngữ cảnh dựa trên sự hiểu biết của riêng bạn
   - Tìm thông tin trên internet hoặc các nguồn khác

4. Nếu câu hỏi không liên quan đến luật:
   - Từ chối trả lời một cách lịch sự
   - Giải thích lý do và hướng dẫn đặt câu hỏi phù hợp

Hãy trả lời một cách chuyên nghiệp, chính xác và hữu ích.`;

    const result = await this.model.generateContent(prompt);
    const response = result.response.text();

    chatHistory.addMessage(sessionId, "user", query);
    chatHistory.addMessage(sessionId, "assistant", response);

    return response;
  }
}

module.exports = new ChatService(); 