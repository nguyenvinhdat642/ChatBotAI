async function sendMessage() {
  try {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value.trim();
    
    if (!message) {
      console.log("Tin nhắn trống");
      return;
    }

    console.log("Đang gửi tin nhắn:", message);
    
    const response = await fetch('/sendMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.details || 'Có lỗi xảy ra');
    }

    const data = await response.json();
    console.log("Nhận được response:", data);

    // Xử lý response
    // ... rest of the code ...

  } catch (error) {
    console.error("Lỗi khi gửi tin nhắn:", error);
    // Hiển thị lỗi cho người dùng
    displayError(error.message);
  }
}

function displayError(message) {
  // Thêm code hiển thị lỗi cho người dùng
  const chatMessages = document.getElementById('chat-messages');
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = `Lỗi: ${message}`;
  chatMessages.appendChild(errorDiv);
}
  