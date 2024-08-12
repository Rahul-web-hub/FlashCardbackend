// Import necessary modules
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Create the Express app
const app = express();

// Enable CORS for all routes (or specify your frontend's URL)
app.use(cors({
  origin: 'http://localhost:5173'
}));

// Parse JSON requests
app.use(bodyParser.json());

// Initialize Sequelize connection
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// Define the Flashcard model
const Flashcard = sequelize.define('Flashcard', {
  question: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  answer: {
    type: DataTypes.TEXT,
    allowNull: false
  }
});

// Sync database and handle connection
sequelize.sync()
  .then(() => console.log('Connected to the database!'))
  .catch((error) => console.error('Database error:', error));

// Define API routes
app.get('/flashcards', async (req, res) => {
  try {
    const flashcards = await Flashcard.findAll();
    res.json(flashcards);
  } catch (error) {
    res.status(500).json({ message: 'Error getting flashcards', error: error });
  }
});

app.post('/flashcards', async (req, res) => {
  try {
    const newFlashcard = await Flashcard.create({
      question: req.body.question,
      answer: req.body.answer
    });
    res.json(newFlashcard);
  } catch (error) {
    res.status(400).json({ message: 'Error adding flashcard', error: error });
  }
});

app.put('/flashcards/:id', async (req, res) => {
  try {
    const flashcard = await Flashcard.findByPk(req.params.id);
    if (flashcard) {
      flashcard.question = req.body.question;
      flashcard.answer = req.body.answer;
      await flashcard.save();
      res.json(flashcard);
    } else {
      res.status(404).json({ message: 'Flashcard not found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Error updating flashcard', error: error });
  }
});

app.delete('/flashcards/:id', async (req, res) => {
  try {
    const flashcard = await Flashcard.findByPk(req.params.id);
    if (flashcard) {
      await flashcard.destroy();
      res.json({ message: 'Flashcard deleted' });
    } else {
      res.status(404).json({ message: 'Flashcard not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting flashcard', error: error });
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
