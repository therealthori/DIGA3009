import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// 🔒 KEEP YOUR API KEY SECRET - Never expose in client code!
const YOUTUBE_API_KEY = "AIzaSyCWH9dVCc88PD-Zkb0Rl5Q9ai5yQiL3FhE";

// Enable CORS for your frontend
app.use(cors());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// ========================================
// YOUTUBE API ENDPOINTS
// ========================================

// Get playlist items
app.get("/api/youtube/playlist/:playlistId", async (req, res) => {
  try {
    const { playlistId } = req.params;
    const maxResults = req.query.maxResults || 50;
    
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Return formatted data
    res.json({
      items: data.items.map(item => ({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        channelTitle: item.snippet.channelTitle,
        videoId: item.snippet.resourceId.videoId,
        thumbnails: {
          default: item.snippet.thumbnails.default?.url,
          medium: item.snippet.thumbnails.medium?.url,
          high: item.snippet.thumbnails.high?.url
        }
      })),
      totalResults: data.pageInfo.totalResults
    });
    
  } catch (error) {
    console.error("Error fetching playlist:", error);
    res.status(500).json({ 
      error: "Failed to fetch playlist",
      message: error.message 
    });
  }
});

// Search YouTube
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

// Get video details
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

// ========================================
// HEALTH CHECK
// ========================================

app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "SELAH API Server Running",
    timestamp: new Date().toISOString()
  });
});

// ========================================
// START SERVER
// ========================================

app.listen(PORT, () => {
  console.log(`✅ SELAH API Server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints available at /api/youtube/*`);
  console.log(`🌐 Frontend available at http://localhost:${PORT}`);
});