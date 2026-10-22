import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notes-app')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Note Schema
const noteSchema = new mongoose.Schema({
  title: { type: String, required: true, default: 'Untitled Note' },
  content: { type: String, required: false, default: '' },
  correctedContent: String,
  corrections: [
    {
      type: { type: String, enum: ['grammar', 'punctuation', 'spelling'] },
      original: String,
      suggestion: String,
      explanation: String
    }
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Note = mongoose.model('Note', noteSchema);

// --- Helper: Retry Logic for 503 Errors ---
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function callGeminiWithRetry(url, data, retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await axios.post(url, data);
    } catch (error) {
      const isTemporaryError = error.response?.status === 503 || error.response?.status === 429;
      if (isTemporaryError && i < retries - 1) {
        console.warn(`⚠️ Gemini busy or rate-limited. Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
        await wait(delay);
        delay *= 2; 
        continue;
      }
      throw error;
    }
  }
}

// --- Routes ---

app.get('/api/notes', async (req, res) => {
  try {
    const notes = await Note.find().sort({ updatedAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/notes', async (req, res) => {
  const note = new Note({
    title: req.body.title || 'Untitled Note',
    content: req.body.content || ''
  });
  try {
    const newNote = await note.save();
    res.status(201).json(newNote);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/notes/:id', async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(
      req.params.id, 
      { ...req.body, updatedAt: Date.now() }, 
      { new: true }
    );
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/notes/:id', async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- Grammar Correction Endpoint ---
app.post('/api/notes/:id/correct-grammar', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (!note.content) return res.status(400).json({ message: 'Note is empty' });

    const API_KEY = process.env.GEMINI_API_KEY;
    // Using gemini-1.5-flash as the most compatible stable endpoint
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

    const requestBody = {
      contents: [{
        parts: [{
          text: `Correct grammar/spelling for this note. Return ONLY valid JSON:
          {
            "correctedText": "string",
            "changes": [{"type": "grammar|punctuation|spelling", "original": "string", "suggestion": "string", "explanation": "string"}]
          }
          Note: "${note.content}"`
        }]
      }],
      generationConfig: { responseMimeType: "application/json" }
    };

    const response = await callGeminiWithRetry(url, requestBody);
    const result = JSON.parse(response.data.candidates[0].content.parts[0].text);
    
    note.correctedContent = result.correctedText;
    note.corrections = result.changes || [];
    note.updatedAt = Date.now();

    const updatedNote = await note.save();
    res.json(updatedNote);

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      message: 'AI Service currently unavailable',
      error: error.message 
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));