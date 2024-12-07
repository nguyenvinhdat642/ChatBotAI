document.querySelector('.send-btn').addEventListener('click', () => {
    const inputField = document.querySelector('.chat-input');
    const chatArea = document.querySelector('.chat-area');
  
    if (inputField.value.trim()) {
      // Tạo tin nhắn người dùng
      const userMessage = document.createElement('div');
      userMessage.className = 'chat-message user';
      userMessage.textContent = inputField.value;
      chatArea.appendChild(userMessage);
  
      // Tạo tin nhắn bot (dạng phản hồi cơ bản)
      const botMessage = document.createElement('div');
      botMessage.className = 'chat-message bot';
      botMessage.textContent = 'Cảm ơn bạn đã nhắn tin! 😊';
      chatArea.appendChild(botMessage);
  
      // Cuộn xuống cuối chat
      chatArea.scrollTop = chatArea.scrollHeight;
  
      // Xóa nội dung trong input
      inputField.value = '';
    }
  });
  