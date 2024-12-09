class ChatHistory {
  constructor() {
    this.conversations = new Map(); // key: sessionId, value: array of messages
  }

  addMessage(sessionId, role, content) {
    if (!this.conversations.has(sessionId)) {
      this.conversations.set(sessionId, []);
    }
    this.conversations.get(sessionId).push({ role, content, timestamp: new Date() });
  }

  getConversation(sessionId) {
    return this.conversations.get(sessionId) || [];
  }
}

module.exports = new ChatHistory(); 