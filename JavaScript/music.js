// API Configuration - Using your backend server
const API_BASE_URL = 'http://localhost:3000/api/youtube';

// Default Playlist ID
const DEFAULT_PLAYLIST_ID = 'PLf-D8i92I2StkrJGNc-C3LI3NNoNbiNHY';

// Timer Variables
let timerInterval = null;
let remainingTime = 0;
let isTimerRunning = false;

// Music Player Variables
let player = null;
let currentTrackIndex = 0;
let playlistVideos = [];
let isPlaying = false;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeYouTubePlayer();
    initializeTimer();
    initializeAnimations();
});

// Load YouTube IFrame API
function initializeYouTubePlayer() {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

// YouTube API calls this function when ready
window.onYouTubeIframeAPIReady = function() {
    player = new YT.Player('youtube-player', {
        height: '0',
        width: '0',
        playerVars: {
            'autoplay': 0,
            'controls': 0,
            'rel': 0,
            'enablejsapi': 1,
            'origin': window.location.origin
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        }
    });
};

function onPlayerError(event) {
    console.error('YouTube player error:', event.data);
    const errorMessages = {
        2: 'Invalid video ID',
        5: 'HTML5 player error',
        100: 'Video not found or private',
        101: 'Video not allowed in embedded player',
        150: 'Video not allowed in embedded player'
    };
    const message = errorMessages[event.data] || 'Unknown error';
    console.log(`Player error: ${message}`);
}

function onPlayerReady(event) {
    console.log('YouTube player ready');
    loadDefaultPlaylist();
    
    // Start progress updater
    setInterval(updateProgress, 1000);
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        isPlaying = true;
        document.getElementById('playIcon').style.display = 'none';
        document.getElementById('pauseIcon').style.display = 'block';
    } else if (event.data === YT.PlayerState.PAUSED) {
        isPlaying = false;
        document.getElementById('playIcon').style.display = 'block';
        document.getElementById('pauseIcon').style.display = 'none';
    } else if (event.data === YT.PlayerState.ENDED) {
        playNext();
    }
}

// Load default playlist from YOUR backend server
async function loadDefaultPlaylist() {
    try {
        const response = await fetch(
            `${API_BASE_URL}/playlist/${DEFAULT_PLAYLIST_ID}?maxResults=50`
        );
        
        if (!response.ok) {
            throw new Error('Failed to load playlist from server');
        }
        
        const data = await response.json();
        
        if (!data.items || data.items.length === 0) {
            throw new Error('No videos in playlist');
        }
        
        // Transform server response to match expected format
        playlistVideos = data.items.map(item => ({
            snippet: {
                title: item.title,
                channelTitle: item.channelTitle,
                description: item.description,
                resourceId: {
                    videoId: item.videoId
                },
                thumbnails: {
                    default: { url: item.thumbnails.default },
                    medium: { url: item.thumbnails.medium },
                    high: { url: item.thumbnails.high }
                }
            }
        }));
        
        // Display playlist
        displayPlaylistTracks(playlistVideos);
        
        // Load first video info
        if (playlistVideos.length > 0) {
            loadVideoInfo(playlistVideos[0]);
            player.cueVideoById(playlistVideos[0].snippet.resourceId.videoId);
        }
        
        // Update UI
        document.getElementById('playlistTitle').textContent = 'Gospel Music Playlist';
        
    } catch (error) {
        console.error('Error loading YouTube playlist:', error);
        showFallbackMessage();
    }
}

// Show fallback message if server fails
function showFallbackMessage() {
    const playlistItems = document.getElementById('playlistItems');
    playlistItems.innerHTML = `
        <div class="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <p>Unable to load playlist. Make sure the server is running.</p>
            <p style="font-size: 0.9rem; margin-top: 1rem;">Run: <code>npm start</code> in the server folder</p>
            <a href="https://www.youtube.com/playlist?list=${DEFAULT_PLAYLIST_ID}" target="_blank" style="color: #10b981; text-decoration: underline;">Open Playlist on YouTube</a>
        </div>
    `;
}

// Display playlist tracks
function displayPlaylistTracks(videos) {
    const playlistItems = document.getElementById('playlistItems');
    playlistItems.innerHTML = '';

    videos.forEach((video, index) => {
        const item = document.createElement('div');
        item.className = 'playlist-item';
        if (index === 0) item.classList.add('active');
        
        item.innerHTML = `
            <div class="playlist-item-info">
                <h4>${video.snippet.title}</h4>
                <p>${video.snippet.channelTitle}</p>
            </div>
        `;
        
        item.addEventListener('click', () => {
            playVideoFromPlaylist(index);
            updateActiveTrack(index);
        });
        
        playlistItems.appendChild(item);
    });

    // Animate items
    gsap.from('.playlist-item', {
        duration: 0.5,
        y: 20,
        opacity: 0,
        stagger: 0.05,
        ease: 'power2.out'
    });
}

// Play video from playlist by index
function playVideoFromPlaylist(index) {
    if (playlistVideos[index]) {
        const videoId = playlistVideos[index].snippet.resourceId?.videoId;
        if (videoId) {
            player.loadVideoById(videoId);
            currentTrackIndex = index;
            loadVideoInfo(playlistVideos[index]);
        }
    }
}

// Load video info without playing
function loadVideoInfo(video) {
    const title = video.snippet.title;
    const channel = video.snippet.channelTitle;
    const thumbnail = video.snippet.thumbnails?.high?.url || 
                     video.snippet.thumbnails?.medium?.url || 
                     video.snippet.thumbnails?.default?.url ||
                     'https://via.placeholder.com/200';
    
    document.getElementById('trackTitle').textContent = title;
    document.getElementById('artistName').textContent = channel;
    
    const albumImage = document.getElementById('albumImage');
    albumImage.src = thumbnail;
}

// Update active track in playlist
function updateActiveTrack(index) {
    document.querySelectorAll('.playlist-item').forEach((item, i) => {
        if (i === index) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Player Controls
document.getElementById('playPauseBtn').addEventListener('click', (e) => {
    e.preventDefault();
    if (player && player.getPlayerState) {
        const state = player.getPlayerState();
        if (state === YT.PlayerState.PLAYING) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
    }
});

document.getElementById('prevBtn').addEventListener('click', (e) => {
    e.preventDefault();
    playPrevious();
});

document.getElementById('nextBtn').addEventListener('click', (e) => {
    e.preventDefault();
    playNext();
});

function playPrevious() {
    if (currentTrackIndex > 0) {
        currentTrackIndex--;
        playVideoFromPlaylist(currentTrackIndex);
        updateActiveTrack(currentTrackIndex);
    }
}

function playNext() {
    if (currentTrackIndex < playlistVideos.length - 1) {
        currentTrackIndex++;
        playVideoFromPlaylist(currentTrackIndex);
        updateActiveTrack(currentTrackIndex);
    }
}

// Progress bar click
document.getElementById('progressBar').addEventListener('click', (e) => {
    if (player && player.getDuration) {
        const progressBar = e.currentTarget;
        const clickX = e.offsetX;
        const width = progressBar.offsetWidth;
        const percentage = clickX / width;
        const seekTime = player.getDuration() * percentage;
        
        player.seekTo(seekTime, true);
    }
});

// Update progress
function updateProgress() {
    if (player && player.getCurrentTime && player.getDuration) {
        try {
            const currentTime = player.getCurrentTime();
            const duration = player.getDuration();
            
            if (duration > 0) {
                const percentage = (currentTime / duration) * 100;
                document.getElementById('progressFill').style.width = `${percentage}%`;
                
                document.getElementById('currentTime').textContent = formatTime(currentTime);
                document.getElementById('duration').textContent = formatTime(duration);
            }
        } catch (error) {
            // Player not ready yet
        }
    }
}

// Timer Functions
function initializeTimer() {
    const setTimeBtn = document.getElementById('setTimeBtn');
    const modal = document.getElementById('timerModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const confirmBtn = document.getElementById('confirmBtn');

    setTimeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        modal.classList.add('active');
        gsap.from('.modal-content', {
            scale: 0.8,
            opacity: 0,
            duration: 0.3,
            ease: 'back.out(1.7)'
        });
    });

    cancelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        modal.classList.remove('active');
    });

    confirmBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const minutes = parseInt(document.getElementById('minutesInput').value) || 0;
        const seconds = parseInt(document.getElementById('secondsInput').value) || 0;
        
        remainingTime = (minutes * 60) + seconds;
        updateTimerDisplay();
        startTimer();
        
        modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

function startTimer() {
    if (isTimerRunning) {
        clearInterval(timerInterval);
    }

    isTimerRunning = true;
    
    timerInterval = setInterval(() => {
        remainingTime--;
        
        if (remainingTime <= 0) {
            clearInterval(timerInterval);
            isTimerRunning = false;
            remainingTime = 0;
            timerComplete();
        }
        
        updateTimerDisplay();
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

function timerComplete() {
    gsap.to('.timer-display', {
        scale: 1.1,
        duration: 0.3,
        yoyo: true,
        repeat: 3,
        ease: 'power2.inOut'
    });
    
    if (player) {
        player.pauseVideo();
    }
    alert('Prayer time complete!');
}

// Utility Functions
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
}

// GSAP Animations
function initializeAnimations() {
    gsap.from('.prayer-title', {
        duration: 1,
        y: -50,
        opacity: 0,
        ease: 'power3.out'
    });

    gsap.from('.prayer-subtitle', {
        duration: 1,
        y: -30,
        opacity: 0,
        ease: 'power3.out',
        delay: 0.2
    });

    gsap.from('.timer-section', {
        duration: 1,
        scale: 0.8,
        opacity: 0,
        ease: 'back.out(1.7)',
        delay: 0.4
    });

    gsap.from('.player-card', {
        duration: 1,
        y: 50,
        opacity: 0,
        ease: 'power3.out',
        delay: 0.6
    });

    gsap.from('.playlist', {
        duration: 1,
        y: 50,
        opacity: 0,
        ease: 'power3.out',
        delay: 0.8
    });
}