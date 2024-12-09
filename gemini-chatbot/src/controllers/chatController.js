const chatService = require('../services/chatService');

class ChatController {
  async handleChat(req, res) {
    try {
      const { message } = req.body;
      const sessionId = req.session.id;
      
      const response = await chatService.generateResponse(message, sessionId);
      
      res.json({ success: true, message: response });
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Có lỗi xảy ra khi xử lý tin nhắn' 
      });
    }
  }
}

module.exports = new ChatController(); 