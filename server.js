import express from "express";
import fetch from "node-fetch";
import cors from 'cors';
app.use(cors());
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

const YOUTUBE_API_KEY = "AIzaSyBjd7YmOiknB5CiiBfxgP4HLpXt69n9UQk";

app.use(cors());

app.use(express.static(path.join(__dirname, '../public')));

app.get('/api/youtube/playlist/:id', async (req, res) => {
  const playlistId = req.params.id;
  const maxResults = Math.min(req.query.maxResults || 20, 50);
  
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`
    );
    const data = await response.json();

    if (data.error) {
      console.error("YouTube API error:", data.error.message);
      return res.status(400).json({
        error: "Failed to fetch playlist",
        message: `YouTube API error: ${data.error.message}`
      });
    }

    const items = data.items.map(item => ({
      videoId: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.videoOwnerChannelTitle,
      thumbnails: item.snippet.thumbnails
    }));

    res.json({ items });
  } catch (error) {
      console.error("Error fetching playlist:", error);
      res.status(500).json({ error: error.message });
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }

  if (!playlistId) return res.status(400).json({ error: "Playlist ID required" });
});

app.get("/api/youtube/search", async (req, res) => {
  try {
    const { q, type = "video", maxResults = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: "Search query required" });
    }
    
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(q)}&type=${type}&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    res.json({
      items: data.items.map(item => ({
        id: item.id,
        kind: item.id.kind,
        title: item.snippet.title,
        description: item.snippet.description,
        channelTitle: item.snippet.channelTitle,
        thumbnails: {
          default: item.snippet.thumbnails.default?.url,
          medium: item.snippet.thumbnails.medium?.url,
          high: item.snippet.thumbnails.high?.url
        }
      })),
      totalResults: data.pageInfo?.totalResults || 0
    });
    
  } catch (error) {
    console.error("Error searching YouTube:", error);
    res.status(500).json({ 
      error: "Failed to search YouTube",
      message: error.message 
    });
  }
});

app.get("/api/youtube/video/:videoId", async (req, res) => {
  try {
    const { videoId } = req.params;
    
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.items.length === 0) {
      return res.status(404).json({ error: "Video not found" });
    }
    
    const video = data.items[0];
    res.json({
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      channelTitle: video.snippet.channelTitle,
      duration: video.contentDetails.duration,
      thumbnails: video.snippet.thumbnails
    });
    
  } catch (error) {
    console.error("Error fetching video:", error);
    res.status(500).json({ 
      error: "Failed to fetch video",
      message: error.message 
    });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "SELAH API Server Running",
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`SELAH API Server running on http://localhost:${PORT}`);
  console.log(`API endpoints available at /api/youtube/*`);
  console.log(`Frontend available at http://localhost:${PORT}`);
});