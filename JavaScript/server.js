const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3000;

// Your YouTube API Key - REPLACE THIS WITH YOUR ACTUAL KEY
const YOUTUBE_API_KEY = 'AIzaSyB6n7KS7HGBNWiGImRw6hmY1RJWvzSXTBg';
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

// Enable CORS for your frontend
app.use(cors());
app.use(express.json());

// Search endpoint
app.get('/api/search', async (req, res) => {
    try {
        const { q, type = 'video', maxResults = 20 } = req.query;
        
        if (!q) {
            return res.status(400).json({ error: 'Query parameter "q" is required' });
        }

        const searchUrl = `${YOUTUBE_API_BASE}/search?part=snippet&q=${encodeURIComponent(q)}&type=${type}&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`;
        
        const response = await fetch(searchUrl);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `YouTube API returned ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data);
        
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ 
            error: 'Failed to search YouTube',
            message: error.message 
        });
    }
});

// Get video details
app.get('/api/video/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const videoUrl = `${YOUTUBE_API_BASE}/videos?part=snippet,contentDetails,statistics&id=${id}&key=${YOUTUBE_API_KEY}`;
        
        const response = await fetch(videoUrl);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `YouTube API returned ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data);
        
    } catch (error) {
        console.error('Video fetch error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch video',
            message: error.message 
        });
    }
});

// Get playlist details
app.get('/api/playlist/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const playlistUrl = `${YOUTUBE_API_BASE}/playlists?part=snippet,contentDetails&id=${id}&key=${YOUTUBE_API_KEY}`;
        
        const response = await fetch(playlistUrl);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `YouTube API returned ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data);
        
    } catch (error) {
        console.error('Playlist fetch error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch playlist',
            message: error.message 
        });
    }
});

// Get playlist items (videos in a playlist)
app.get('/api/playlist/:id/items', async (req, res) => {
    try {
        const { id } = req.params;
        const { maxResults = 50 } = req.query;
        
        const playlistItemsUrl = `${YOUTUBE_API_BASE}/playlistItems?part=snippet,contentDetails&playlistId=${id}&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`;
        
        const response = await fetch(playlistItemsUrl);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `YouTube API returned ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data);
        
    } catch (error) {
        console.error('Playlist items fetch error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch playlist items',
            message: error.message 
        });
    }
});

// Get channel details
app.get('/api/channel/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const channelUrl = `${YOUTUBE_API_BASE}/channels?part=snippet,statistics&id=${id}&key=${YOUTUBE_API_KEY}`;
        
        const response = await fetch(channelUrl);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `YouTube API returned ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data);
        
    } catch (error) {
        console.error('Channel fetch error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch channel',
            message: error.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`YouTube proxy server running on http://localhost:${PORT}`);
    console.log(`Test search: http://localhost:${PORT}/api/search?q=worship+music`);
    console.log(`Make sure to replace YOUR_YOUTUBE_API_KEY_HERE with your actual API key!`);
});