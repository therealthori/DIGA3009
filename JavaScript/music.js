// Backend API URL
const API_BASE_URL = 'http://localhost:3000/api';

// Default Playlist ID (YouTube Gospel Music Playlist)
// Replace with your preferred playlist ID
const DEFAULT_PLAYLIST_ID = 'PLqjAF6eK3VZ8qJYoLxVXqH8qGx5vZvLrJ';

// Timer Variables
let timerInterval = null;
let remainingTime = 0;
let isTimerRunning = false;

// Music Player Variables
let player = null;
let currentTrackIndex = 0;
let searchResults = [];
let filteredResults = [];
let currentFilter = 'all';
let isPlaying = false;
let playlistVideos = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeYouTubePlayer();
    initializeTimer();
    initializeSearch();
    initializeAnimations();
});

// Load YouTube IFrame API
function initializeYouTubePlayer() {
    // Load YouTube IFrame API
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
            'rel': 0
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
};

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

// Load default playlist
async function loadDefaultPlaylist() {
    try {
        const response = await fetch(`${API_BASE_URL}/playlist/${DEFAULT_PLAYLIST_ID}/items`);
        
        if (!response.ok) {
            throw new Error('Failed to load playlist');
        }
        
        const data = await response.json();
        playlistVideos = data.items || [];
        searchResults = playlistVideos;
        filteredResults = playlistVideos;
        
        // Display playlist
        displayPlaylistTracks(playlistVideos);
        
        // Load first video info
        if (playlistVideos.length > 0) {
            loadVideoInfo(playlistVideos[0]);
            player.cueVideoById(playlistVideos[0].contentDetails.videoId);
        }
        
        // Update UI
        document.getElementById('playlistTitle').textContent = 'Gospel Music Playlist';
        document.getElementById('resultsInfo').style.display = 'block';
        document.getElementById('resultsText').textContent = `${playlistVideos.length} videos loaded`;
        
        // Enable controls
        enablePlayerControls();
        
    } catch (error) {
        console.error('Error loading playlist:', error);
        showError('Failed to load default playlist');
    }
}

// Initialize Search Functionality
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const clearBtn = document.getElementById('clearBtn');
    const filterBtns = document.querySelectorAll('.filter-btn');

    // Update placeholder
    searchInput.placeholder = 'Search for worship music, artists, or playlists...';

    // Search button click
    searchBtn.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            performSearch(query);
        }
    });

    // Enter key to search
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                performSearch(query);
            }
        }
    });

    // Show/hide clear button
    searchInput.addEventListener('input', (e) => {
        if (e.target.value.length > 0) {
            clearBtn.style.display = 'flex';
        } else {
            clearBtn.style.display = 'none';
        }
    });

    // Clear search
    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearBtn.style.display = 'none';
        searchInput.focus();
        clearResults();
    });

    // Filter buttons - update for YouTube types
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            applyFilter();
            displaySearchResults();
            updateResultsInfo();
        });
    });
}

// Perform YouTube Search
async function performSearch(query) {
    const searchBtn = document.getElementById('searchBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');
    
    // Show loading state
    searchBtn.disabled = true;
    loadingSpinner.style.display = 'block';

    try {
        // Determine search type based on filter
        let searchType = 'video,playlist,channel';
        if (currentFilter === 'tracks') searchType = 'video';
        if (currentFilter === 'playlists') searchType = 'playlist';
        if (currentFilter === 'users') searchType = 'channel';
        
        const response = await fetch(
            `${API_BASE_URL}/search?q=${encodeURIComponent(query)}&type=${searchType}&maxResults=20`
        );

        if (!response.ok) {
            throw new Error(`Search failed: ${response.status}`);
        }

        const data = await response.json();
        searchResults = data.items || [];
        
        // Apply current filter
        applyFilter();
        
        // Update UI
        displaySearchResults();
        updateResultsInfo();

    } catch (error) {
        console.error('Search error:', error);
        showError(`Search failed: ${error.message}`);
    } finally {
        searchBtn.disabled = false;
        loadingSpinner.style.display = 'none';
    }
}

// Apply filter to search results
function applyFilter() {
    if (currentFilter === 'all') {
        filteredResults = searchResults;
    } else {
        const filterMap = {
            'tracks': 'youtube#video',
            'playlists': 'youtube#playlist',
            'users': 'youtube#channel'
        };
        
        const kindToFilter = filterMap[currentFilter];
        filteredResults = searchResults.filter(item => 
            item.id?.kind === kindToFilter || item.kind === kindToFilter
        );
    }
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
        const videoId = playlistVideos[index].contentDetails?.videoId || playlistVideos[index].id?.videoId;
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
    const thumbnail = video.snippet.thumbnails.high?.url || 
                     video.snippet.thumbnails.medium?.url || 
                     video.snippet.thumbnails.default?.url;
    
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

// Display search results
function displaySearchResults() {
    const playlistItems = document.getElementById('playlistItems');
    playlistItems.innerHTML = '';

    if (filteredResults.length === 0) {
        playlistItems.innerHTML = `
            <div class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
                    <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                </svg>
                <p>No results found. Try a different search term.</p>
            </div>
        `;
        return;
    }

    filteredResults.forEach((item, index) => {
        const resultItem = createResultItem(item, index);
        playlistItems.appendChild(resultItem);
    });

    // Animate results
    gsap.from('.playlist-item', {
        duration: 0.5,
        y: 20,
        opacity: 0,
        stagger: 0.1,
        ease: 'power2.out'
    });
}

// Create result item element
function createResultItem(item, index) {
    const div = document.createElement('div');
    div.className = 'playlist-item';
    
    const kind = item.id?.kind || item.kind;
    let content = '';
    
    if (kind === 'youtube#video') {
        content = `
            <div class="playlist-item-info">
                <h4>${item.snippet.title}</h4>
                <p>${item.snippet.channelTitle}</p>
            </div>
            <span class="playlist-item-type">Video</span>
        `;
    } else if (kind === 'youtube#playlist') {
        content = `
            <div class="playlist-item-info">
                <h4>${item.snippet.title}</h4>
                <p>${item.snippet.channelTitle}</p>
            </div>
            <span class="playlist-item-type">Playlist</span>
        `;
    } else if (kind === 'youtube#channel') {
        content = `
            <div class="playlist-item-info">
                <h4>${item.snippet.title}</h4>
                <p>${item.snippet.description?.substring(0, 100)}...</p>
            </div>
            <span class="playlist-item-type">Channel</span>
        `;
    }
    
    div.innerHTML = content;
    
    // Add click handler
    div.addEventListener('click', () => {
        handleResultClick(item, index);
    });
    
    return div;
}

// Handle result item click
async function handleResultClick(item, index) {
    const kind = item.id?.kind || item.kind;
    
    if (kind === 'youtube#video') {
        playVideo(item);
    } else if (kind === 'youtube#playlist') {
        await loadPlaylist(item);
    } else if (kind === 'youtube#channel') {
        const channelUrl = `https://www.youtube.com/channel/${item.id.channelId}`;
        window.open(channelUrl, '_blank');
    }
    
    // Update active state
    document.querySelectorAll('.playlist-item').forEach((el, i) => {
        if (i === index) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });
}

// Play a video
function playVideo(video) {
    const videoId = video.id?.videoId || video.contentDetails?.videoId;
    if (videoId) {
        player.loadVideoById(videoId);
        loadVideoInfo(video);
        enablePlayerControls();
    }
}

// Load a playlist
async function loadPlaylist(playlist) {
    try {
        const playlistId = playlist.id?.playlistId;
        if (!playlistId) return;
        
        const response = await fetch(`${API_BASE_URL}/playlist/${playlistId}/items`);
        
        if (!response.ok) {
            throw new Error('Failed to load playlist');
        }
        
        const data = await response.json();
        playlistVideos = data.items || [];
        searchResults = playlistVideos;
        filteredResults = playlistVideos;
        
        displayPlaylistTracks(playlistVideos);
        
        if (playlistVideos.length > 0) {
            playVideoFromPlaylist(0);
        }
        
        document.getElementById('playlistTitle').textContent = playlist.snippet.title;
        document.getElementById('resultsInfo').style.display = 'block';
        document.getElementById('resultsText').textContent = `${playlistVideos.length} videos loaded`;
        
    } catch (error) {
        console.error('Error loading playlist:', error);
        showError('Failed to load playlist');
    }
}

// Enable player controls
function enablePlayerControls() {
    document.getElementById('playPauseBtn').disabled = false;
    document.getElementById('prevBtn').disabled = false;
    document.getElementById('nextBtn').disabled = false;
}

// Update results info
function updateResultsInfo() {
    const resultsInfo = document.getElementById('resultsInfo');
    const resultsText = document.getElementById('resultsText');
    
    if (searchResults.length > 0) {
        resultsInfo.style.display = 'block';
        resultsText.textContent = `Found ${filteredResults.length} results (${searchResults.length} total)`;
    } else {
        resultsInfo.style.display = 'none';
    }
}

// Clear results
function clearResults() {
    searchResults = [];
    filteredResults = [];
    loadDefaultPlaylist();
    document.getElementById('resultsInfo').style.display = 'none';
}

// Show error message
function showError(message) {
    const playlistItems = document.getElementById('playlistItems');
    playlistItems.innerHTML = `
        <div class="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <p>${message}</p>
        </div>
    `;
}

// Player Controls
document.getElementById('playPauseBtn').addEventListener('click', () => {
    if (player && player.getPlayerState) {
        const state = player.getPlayerState();
        if (state === YT.PlayerState.PLAYING) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
    }
});

document.getElementById('prevBtn').addEventListener('click', () => {
    playPrevious();
});

document.getElementById('nextBtn').addEventListener('click', () => {
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

    setTimeBtn.addEventListener('click', () => {
        modal.classList.add('active');
        gsap.from('.modal-content', {
            scale: 0.8,
            opacity: 0,
            duration: 0.3,
            ease: 'back.out(1.7)'
        });
    });

    cancelBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    confirmBtn.addEventListener('click', () => {
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

    gsap.from('.search-section', {
        duration: 1,
        y: 30,
        opacity: 0,
        ease: 'power3.out',
        delay: 0.4
    });

    gsap.from('.timer-section', {
        duration: 1,
        scale: 0.8,
        opacity: 0,
        ease: 'back.out(1.7)',
        delay: 0.6
    });

    gsap.from('.player-card', {
        duration: 1,
        y: 50,
        opacity: 0,
        ease: 'power3.out',
        delay: 0.8
    });

    gsap.from('.playlist', {
        duration: 1,
        y: 50,
        opacity: 0,
        ease: 'power3.out',
        delay: 1
    });
}