const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
const PORT = 3000;

// API Key
const OPENAI_KEY = "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";

// Initialize OpenAI
const openai = new OpenAI({ apiKey: OPENAI_KEY });

// Middleware
app.use(cors());
app.use(express.json());

// Minimal movie recommendation endpoint
app.post('/api/recommend-movies', async (req, res) => {
    try {
        const { answers } = req.body;

        if (!answers || !Array.isArray(answers) || answers.length !== 3) {
            return res.status(400).json({ error: 'Please provide exactly 3 answers' });
        }

        const prompt = `Based on these responses: "${answers.join('", "')}", recommend exactly 3 movies. Return titles with a short reason.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are a movie recommendation expert. Suggest exactly 3 movies with brief reasons." },
                { role: "user", content: prompt }
            ],
            max_tokens: 200,
            temperature: 0.7
        });

        const aiResponse = completion.choices[0].message.content;

        // Simple parsing: split by commas or newlines, take first 3
        const movies = aiResponse.split(/[\n,]/).slice(0, 3).map(line => ({
            title: line.trim(),
            reason: 'Recommended for your current mood'
        }));

        res.json({ success: true, movies });

    } catch (error) {
        res.status(500).json({ error: 'Failed to get movie recommendations' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;