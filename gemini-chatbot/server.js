require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const chatRoutes = require('./src/routes/chatRoutes');
const chatService = require('./src/services/chatService');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Initialize Vector DB and process PDF if needed
const init = async () => {
  const indexExists = await chatService.initializeVectorDB();
  if (!indexExists) {
    await chatService.processPDF('./pdfs/VanBanGoc_91.2015.QH13.P1.pdf');
  }
};

// Routes
app.get('/', (req, res) => {
  res.render('index', {
    userName: 'Nguyễn Vinh Đạt' // Có thể truyền từ database hoặc session
  });
});
app.use('/api', chatRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await init();
});