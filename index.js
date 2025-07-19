const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

//Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

//Gemini setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

//Endpoint POST api/chat
app.post('/api/chat', async (req, res) => {
  const { message } = req.body; // Use destructuring for clarity

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const result = await model.generateContent(message); // Pass the message directly
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (err) {
    console.error('Error calling Gemini API:', err);
    res.status(500).json({ error: 'Something went wrong while contacting the AI.' }); // More specific error
  }
});

app.listen(port, () => {
console.log(`Gemini Chatbot is running on http://localhost:${port}`);
});
