const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();
const express = require("express");
const app = express();

// Cấu hình EJS
app.set("view engine", "ejs");
app.set("views", "./views");

// Middleware để xử lý dữ liệu JSON
app.use(express.json());

// Thêm middleware để serve static files
app.use(express.static('public'));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Lưu trữ các kết nối của client
const clients = [];

// Lưu trữ lịch sử chat cho mỗi phiên
const chatHistory = new Map();

// Route cho trang chủ
app.get("/", (req, res) => {
  res.render("index");
});

// Route để xử lý tin nhắn và thiết lập SSE
app.post("/sendMessage", async (req, res) => {
  const userMessage = req.body.message;
  const sessionId = req.sessionID || 'default'; // Nếu không có session thì dùng 'default'
  
  // Khởi tạo lịch sử chat nếu chưa có
  if (!chatHistory.has(sessionId)) {
    chatHistory.set(sessionId, [
      {
        role: "user",
        parts: [{ text: "Xin chào" }],
      },
      {
        role: "model",
        parts: [{ text: "Chào bạn! Tôi có thể giúp gì cho bạn?" }],
      },
    ]);
  }

  console.log(`[User]: ${userMessage}`);

  const chat = model.startChat({
    history: chatHistory.get(sessionId),
    generationConfig: {
      maxOutputTokens: 3000,
      temperature: 0.9,
      topK: 30,
    },
  });

  try {
    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    const fullResponse = response.text();
    
    // Cập nhật lịch sử chat
    const currentHistory = chatHistory.get(sessionId);
    currentHistory.push(
      {
        role: "user",
        parts: [{ text: userMessage }],
      },
      {
        role: "model",
        parts: [{ text: fullResponse }],
      }
    );
    
    // Giới hạn lịch sử để tránh quá tải
    if (currentHistory.length > 20) {
      currentHistory.splice(2, 2); // Xóa cặp tin nhắn cũ nhất (giữ lại tin nhắn chào hỏi ban đầu)
    }
    
    console.log(`[Gemini]: ${fullResponse}`);
    console.log("[Usage Metadata]:", response.usageMetadata);

    res.json({ 
      message: fullResponse,
      history: currentHistory 
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});