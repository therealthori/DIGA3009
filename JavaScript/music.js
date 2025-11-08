// YouTube API Key
const YOUTUBE_API_KEY = 'AIzaSyCPmdtc5AP2fxAexJzs8Loon9RN2YJ-OeI';

// Default Playlist ID
const DEFAULT_PLAYLIST_ID = 'PLmGouTBbived7Cy0F795kR2c_GEfa-Z-T';

// Fallback: Curated list of embeddable worship videos
const EMBEDDABLE_VIDEOS = [
    { id: 'v_4Z8CZqBf4', title: 'Graves Into Gardens - Elevation Worship', channel: 'Elevation Worship' },
    { id: 'KH4NrUxcsYs', title: 'Goodness of God - Bethel Music', channel: 'Bethel Music' },
    { id: 'PHdzYbN_J6U', title: 'Reckless Love - Cory Asbury', channel: 'Cory Asbury' },
    { id: '0qXmxVySMzw', title: 'Way Maker - Sinach', channel: 'Sinach' },
    { id: 'LfzpfqrPUDo', title: 'What A Beautiful Name - Hillsong Worship', channel: 'Hillsong Worship' },
    { id: 'p0vz6ty_c1k', title: 'Great Are You Lord - All Sons & Daughters', channel: 'All Sons & Daughters' },
    { id: 'GpYOfm5vwJ0', title: 'This Is Amazing Grace - Phil Wickham', channel: 'Phil Wickham' },
    { id: '5JLfUAqCTvo', title: 'Oceans - Hillsong United', channel: 'Hillsong United' },
    { id: 'C7vfvoIPKto', title: 'Build My Life - Passion', channel: 'Passion' },
    { id: 'XtwIT8JjddM', title: 'King of Kings - Hillsong Worship', channel: 'Hillsong Worship' }
];

// State variables
let useFallbackVideos = false;
let consecutiveErrors = 0;
const MAX_CONSECUTIVE_ERRORS = 3;

let timerInterval = null;
let remainingTime = 0;
let isTimerRunning = false;

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
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

// YouTube API calls this function when ready
window.onYouTubeIframeAPIReady = function() {
    player = new YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        playerVars: {
            'autoplay': 0,
            'controls': 1,
            'rel': 0,
            'enablejsapi': 1,
            'origin': window.location.origin,
            'modestbranding': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
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
        consecutiveErrors = 0; // Reset error counter on successful play
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

function onPlayerError(event) {
    console.error('YouTube player error:', event.data);
    const errorMessages = {
        2: 'Invalid video ID',
        5: 'HTML5 player error',
        100: 'Video not found or private',
        101: 'Video not allowed to be played in embedded players',
        150: 'Video not allowed to be played in embedded players'
    };
    const message = errorMessages[event.data] || 'Unknown error';
    
    consecutiveErrors++;
    
    // Auto-skip to next video if current one fails
    if (event.data === 101 || event.data === 150 || event.data === 100) {
        console.log(`Video unavailable (error ${event.data}), trying next... (${consecutiveErrors}/${MAX_CONSECUTIVE_ERRORS} errors)`);
        
        // If too many consecutive errors and not using fallback yet, switch to fallback
        if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS && !useFallbackVideos) {
            console.log('Too many errors, switching to fallback embeddable videos');
            loadFallbackVideos();
            consecutiveErrors = 0;
        } else {
            setTimeout(() => {
                playNext();
            }, 1000);
        }
    } else {
        showError(`Unable to play video: ${message}`);
    }
}

// Load default playlist
async function loadDefaultPlaylist() {
    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,status&playlistId=${DEFAULT_PLAYLIST_ID}&maxResults=50&key=${YOUTUBE_API_KEY}`
        );
        
        if (!response.ok) {
            throw new Error('Failed to load playlist');
        }
        
        const data = await response.json();
        
        // Filter out private/deleted videos
        playlistVideos = (data.items || []).filter(item => {
            const isPublic = item.status?.privacyStatus === 'public';
            const hasVideoId = item.snippet.resourceId?.videoId;
            return isPublic && hasVideoId;
        });
        
        if (playlistVideos.length === 0) {
            console.log('No videos in playlist, using fallback videos');
            loadFallbackVideos();
            return;
        }
        
        searchResults = playlistVideos;
        filteredResults = playlistVideos;
        
        displayPlaylistTracks(playlistVideos);
        
        if (playlistVideos.length > 0) {
            loadVideoInfo(playlistVideos[0]);
            player.cueVideoById(playlistVideos[0].snippet.resourceId.videoId);
        }
        
        document.getElementById('playlistTitle').textContent = 'Gospel Music Playlist';
        document.getElementById('resultsInfo').style.display = 'block';
        document.getElementById('resultsText').textContent = `${playlistVideos.length} videos loaded`;
        
        enablePlayerControls();
        
    } catch (error) {
        console.error('Error loading playlist:', error);
        console.log('Using fallback videos instead');
        loadFallbackVideos();
    }
}

// Load fallback embeddable videos
function loadFallbackVideos() {
    useFallbackVideos = true;
    
    playlistVideos = EMBEDDABLE_VIDEOS.map(video => ({
        snippet: {
            title: video.title,
            channelTitle: video.channel,
            resourceId: {
                videoId: video.id
            },
            thumbnails: {
                default: { url: `https://img.youtube.com/vi/${video.id}/default.jpg` },
                medium: { url: `https://img.youtube.com/vi/${video.id}/mqdefault.jpg` },
                high: { url: `https://img.youtube.com/vi/${video.id}/hqdefault.jpg` }
            }
        }
    }));
    
    searchResults = playlistVideos;
    filteredResults = playlistVideos;
    
    displayPlaylistTracks(playlistVideos);
    
    if (playlistVideos.length > 0) {
        loadVideoInfo(playlistVideos[0]);
        player.cueVideoById(playlistVideos[0].snippet.resourceId.videoId);
    }
    
    document.getElementById('playlistTitle').textContent = 'Worship Music (Curated)';
    document.getElementById('resultsInfo').style.display = 'block';
    document.getElementById('resultsText').textContent = `${playlistVideos.length} embeddable videos`;
    
    enablePlayerControls();
}

// Initialize Search
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const clearBtn = document.getElementById('clearBtn');
    const filterBtns = document.querySelectorAll('.filter-btn');

    searchBtn.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) performSearch(query);
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) performSearch(query);
        }
    });

    searchInput.addEventListener('input', (e) => {
        clearBtn.style.display = e.target.value.length > 0 ? 'flex' : 'none';
    });

    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearBtn.style.display = 'none';
        searchInput.focus();
        clearResults();
    });

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
    
    searchBtn.disabled = true;
    loadingSpinner.style.display = 'block';

    try {
        let searchType = 'video,playlist,channel';
        if (currentFilter !== 'all') searchType = currentFilter;
        
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=${searchType}&maxResults=20&key=${YOUTUBE_API_KEY}`
        );

        if (!response.ok) throw new Error(`Search failed: ${response.status}`);

        const data = await response.json();
        searchResults = data.items || [];
        
        applyFilter();
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

function applyFilter() {
    if (currentFilter === 'all') {
        filteredResults = searchResults;
    } else {
        filteredResults = searchResults.filter(item => {
            const kind = item.id?.kind || '';
            return kind === `youtube#${currentFilter}`;
        });
    }
}

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

    if (typeof gsap !== 'undefined') {
        gsap.from('.playlist-item', {
            duration: 0.5,
            y: 20,
            opacity: 0,
            stagger: 0.05,
            ease: 'power2.out'
        });
    }
}

function playVideoFromPlaylist(index) {
    if (playlistVideos[index]) {
        const videoId = playlistVideos[index].snippet.resourceId?.videoId;
        if (videoId) {
            console.log(`Playing video ${index + 1}/${playlistVideos.length}: ${videoId}`);
            player.loadVideoById(videoId);
            currentTrackIndex = index;
            loadVideoInfo(playlistVideos[index]);
        } else {
            console.log('No video ID found, skipping...');
            playNext();
        }
    }
}

function loadVideoInfo(video) {
    const title = video.snippet.title;
    const channel = video.snippet.channelTitle;
    
    document.getElementById('trackTitle').textContent = title;
    document.getElementById('artistName').textContent = channel;
}

function updateActiveTrack(index) {
    document.querySelectorAll('.playlist-item').forEach((item, i) => {
        if (i === index) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

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

    if (typeof gsap !== 'undefined') {
        gsap.from('.playlist-item', {
            duration: 0.5,
            y: 20,
            opacity: 0,
            stagger: 0.1,
            ease: 'power2.out'
        });
    }
}

function createResultItem(item, index) {
    const div = document.createElement('div');
    div.className = 'playlist-item';
    
    const kind = item.id?.kind || '';
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
                <p>${item.snippet.description?.substring(0, 100) || 'Channel'}...</p>
            </div>
            <span class="playlist-item-type">Channel</span>
        `;
    }
    
    div.innerHTML = content;
    div.addEventListener('click', () => handleResultClick(item, index));
    
    return div;
}

async function handleResultClick(item, index) {
    const kind = item.id?.kind || '';
    
    if (kind === 'youtube#video') {
        playVideo(item);
    } else if (kind === 'youtube#playlist') {
        await loadPlaylist(item);
    } else if (kind === 'youtube#channel') {
        window.open(`https://www.youtube.com/channel/${item.id.channelId}`, '_blank');
    }
    
    document.querySelectorAll('.playlist-item').forEach((el, i) => {
        if (i === index) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });
}

function playVideo(video) {
    const videoId = video.id?.videoId;
    if (videoId) {
        player.loadVideoById(videoId);
        loadVideoInfo(video);
        enablePlayerControls();
    }
}

async function loadPlaylist(playlist) {
    try {
        const playlistId = playlist.id?.playlistId;
        if (!playlistId) return;
        
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${YOUTUBE_API_KEY}`
        );
        
        if (!response.ok) throw new Error('Failed to load playlist');
        
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

function enablePlayerControls() {
    document.getElementById('playPauseBtn').disabled = false;
    document.getElementById('prevBtn').disabled = false;
    document.getElementById('nextBtn').disabled = false;
}

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

function clearResults() {
    searchResults = [];
    filteredResults = [];
    loadDefaultPlaylist();
    document.getElementById('resultsInfo').style.display = 'none';
}

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

document.getElementById('prevBtn').addEventListener('click', () => playPrevious());
document.getElementById('nextBtn').addEventListener('click', () => playNext());

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
    } else {
        console.log('Reached end of playlist');
    }
}

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
        if (typeof gsap !== 'undefined') {
            gsap.from('.modal-content', {
                scale: 0.8,
                opacity: 0,
                duration: 0.3,
                ease: 'back.out(1.7)'
            });
        }
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
    if (typeof gsap !== 'undefined') {
        gsap.to('.timer-display', {
            scale: 1.1,
            duration: 0.3,
            yoyo: true,
            repeat: 3,
            ease: 'power2.inOut'
        });
    }
    
    if (player) {
        player.pauseVideo();
    }
    alert('Prayer time complete!');
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
}

// GSAP Animations
function initializeAnimations() {
    if (typeof gsap === 'undefined') return;
    
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