const express = require('express');
const cors = require('cors');
const path = require('path');
const OpenAI = require('openai');
const app = express();
const PORT = 3000;

// API Keys
const OPENAI_KEY = "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";
const TMDB_API_KEY = 'f535b3af53df71c58b7219a11606a186';

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: OPENAI_KEY
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Movie recommendation endpoint
app.post('/api/recommend-movies', async (req, res) => {
    const { answers, category } = req.body;
    
    //prompt
    const prompt = `Based on these movie preferences: "${answers.join(', ')}", recommend exactly 3 movies with brief reasons. Format: Movie Title - reason`;
    
    // Get recommendations from OpenAI
    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: "Recommend 3 movies with brief reasons." },
            { role: "user", content: prompt }
        ],
        max_tokens: 150,
        temperature: 0.7
    });

    const aiResponse = completion.choices[0].message.content;
    
    //parsing
    const movieRecommendations = parseMovies(aiResponse);
    
    // Get movie details
    const moviesWithDetails = await Promise.all(
        movieRecommendations.map(async (movie) => {
            const movieDetails = await getMovieDetails(movie.title);
            return {
                ...movieDetails,
                aiReason: movie.reason
            };
        })
    );

    res.json({
        success: true,
        movies: moviesWithDetails,
        category: category
    });
});

//movie parsing
function parseMovies(response) {
    const recommendations = [];
    const lines = response.split('\n').filter(line => line.trim());
    
    lines.slice(0, 3).forEach(line => {
        const parts = line.split(' - ');
        if (parts.length >= 2) {
            recommendations.push({
                title: parts[0].replace(/^\d+\.\s*/, '').trim(),
                reason: parts[1].trim()
            });
        }
    });
    
    return recommendations;
}

// Get movie details
async function getMovieDetails(movieTitle) {
    // Search for movie
    const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(movieTitle)}`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    const movie = searchData.results[0];
    
    return {
        id: movie.id,
        title: movie.title,
        overview: movie.overview,
        poster_path: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
        vote_average: movie.vote_average,
        year: movie.release_date ? movie.release_date.split('-')[0] : 'Unknown'
    };
}

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;