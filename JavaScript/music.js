// YouTube API Key - Replace with your actual key or leave empty for fallback
const YOUTUBE_API_KEY = 'AIzaSyDI_6PB8r-FcawFVtQKYk0lt-Nch6Hbutg';
const DEFAULT_PLAYLIST_ID = 'PLmGouTBbived7Cy0F795kR2c_GEfa-Z-T';

// Curated fallback playlist (works without API)
const FALLBACK_PLAYLIST = [
    { id: 'z5zDW7bsYrk', title: 'Way Maker - Leeland', channel: 'Leeland Official' },
    { id: '0fM1gKzLRpc', title: 'Goodness of God', channel: 'Bethel Music' },
    { id: 'WbN0nX61rIs', title: 'Great Are You Lord', channel: 'All Sons & Daughters' },
    { id: 'O3o3DiMVdOI', title: 'What A Beautiful Name', channel: 'Hillsong Worship' },
    { id: 'CqybaIesbuA', title: 'Oceans (Where Feet May Fail)', channel: 'Hillsong United' },
    { id: 'Bl6hpgGWt64', title: 'Reckless Love', channel: 'Cory Asbury' },
    { id: 'aOd93CHFUMQ', title: 'King of Kings', channel: 'Hillsong Worship' },
    { id: '9RvB5Ym1YeU', title: 'Build My Life', channel: 'Passion' },
    { id: 'D8e9j95dj6E', title: 'Graves Into Gardens', channel: 'Elevation Worship' },
    { id: '8xTmEQ9Be94', title: 'The Blessing', channel: 'Kari Jobe' }
];

let timerInterval = null;
let remainingTime = 0;
let isTimerRunning = false;
let player = null;
let currentTrackIndex = 0;
let playlistVideos = [];
let isPlaying = false;

document.addEventListener('DOMContentLoaded', () => {
    initializeYouTubePlayer();
    initializeTimer();
    initializeSearch();
    initializeAnimations();
});

function initializeYouTubePlayer() {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

window.onYouTubeIframeAPIReady = function() {
    player = new YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        playerVars: {
            'autoplay': 0,
            'controls': 1,
            'rel': 0,
            'modestbranding': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        }
    });
};

function onPlayerError(event) {
    console.error('YouTube error:', event.data);
    showToast('Video unavailable. Trying next...');
    setTimeout(() => playNext(), 1000);
}

function onPlayerReady(event) {
    console.log('Player ready');
    loadDefaultPlaylist();
    setInterval(updateProgress, 1000);
    enablePlayerControls();
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

async function loadDefaultPlaylist() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    loadingSpinner.style.display = 'block';
    
    try {
        if (YOUTUBE_API_KEY && YOUTUBE_API_KEY.length > 20) {
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${DEFAULT_PLAYLIST_ID}&maxResults=50&key=${YOUTUBE_API_KEY}`
            );
            
            if (response.ok) {
                const data = await response.json();
                playlistVideos = data.items.map(item => ({
                    id: item.snippet.resourceId.videoId,
                    title: item.snippet.title,
                    channel: item.snippet.channelTitle
                }));
            } else {
                throw new Error('API failed');
            }
        } else {
            throw new Error('No API key');
        }
    } catch (error) {
        console.log('Using fallback playlist');
        playlistVideos = FALLBACK_PLAYLIST;
    }
    
    displayPlaylistTracks(playlistVideos);
    
    if (playlistVideos.length > 0) {
        player.cueVideoById(playlistVideos[0].id);
        loadVideoInfo(playlistVideos[0]);
    }
    
    document.getElementById('playlistTitle').textContent = 'Gospel Worship Playlist';
    document.getElementById('resultsInfo').style.display = 'block';
    document.getElementById('resultsText').textContent = `${playlistVideos.length} videos loaded`;
    
    loadingSpinner.style.display = 'none';
}

function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const clearBtn = document.getElementById('clearBtn');

    searchBtn.addEventListener('click', () => {
        performLocalSearch(searchInput.value.trim());
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performLocalSearch(searchInput.value.trim());
    });

    searchInput.addEventListener('input', (e) => {
        const value = e.target.value;
        clearBtn.style.display = value.length > 0 ? 'flex' : 'none';
        
        if (value.length === 0) {
            displayPlaylistTracks(playlistVideos);
            document.getElementById('resultsText').textContent = `${playlistVideos.length} videos`;
        }
    });

    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearBtn.style.display = 'none';
        displayPlaylistTracks(playlistVideos);
        document.getElementById('resultsText').textContent = `${playlistVideos.length} videos`;
    });
}

function performLocalSearch(query) {
    if (!query) {
        displayPlaylistTracks(playlistVideos);
        return;
    }

    const filtered = playlistVideos.filter(video => {
        const title = video.title.toLowerCase();
        const channel = video.channel.toLowerCase();
        const q = query.toLowerCase();
        return title.includes(q) || channel.includes(q);
    });

    displayPlaylistTracks(filtered);
    document.getElementById('resultsText').textContent = 
        filtered.length > 0 
            ? `Found ${filtered.length} of ${playlistVideos.length} videos`
            : `No videos found for "${query}"`;
}

function displayPlaylistTracks(videos) {
    const playlistItems = document.getElementById('playlistItems');
    playlistItems.innerHTML = '';

    if (videos.length === 0) {
        playlistItems.innerHTML = `
            <div class="empty-state">
                <p>No videos found</p>
            </div>
        `;
        return;
    }

    videos.forEach((video, displayIndex) => {
        const item = document.createElement('div');
        item.className = 'playlist-item';
        
        const originalIndex = playlistVideos.indexOf(video);
        if (originalIndex === currentTrackIndex) item.classList.add('active');
        
        item.innerHTML = `
            <div class="playlist-item-info">
                <h4>${escapeHtml(video.title)}</h4>
                <p>${escapeHtml(video.channel)}</p>
            </div>
        `;
        
        item.addEventListener('click', () => {
            playVideoFromPlaylist(originalIndex);
        });
        
        playlistItems.appendChild(item);
    });

    if (typeof gsap !== 'undefined') {
        gsap.from('.playlist-item', {
            duration: 0.3,
            opacity: 0,
            y: 10,
            stagger: 0.02,
            ease: 'power2.out'
        });
    }
}

function playVideoFromPlaylist(index) {
    if (playlistVideos[index]) {
        player.loadVideoById(playlistVideos[index].id);
        currentTrackIndex = index;
        loadVideoInfo(playlistVideos[index]);
        updateActiveTrack(index);
    }
}

function loadVideoInfo(video) {
    document.getElementById('trackTitle').textContent = video.title;
    document.getElementById('artistName').textContent = video.channel;
}

function updateActiveTrack(index) {
    document.querySelectorAll('.playlist-item').forEach((item, i) => {
        const video = playlistVideos[i];
        if (i === index && video) {
            item.classList.add('active');
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            item.classList.remove('active');
        }
    });
}

function enablePlayerControls() {
    document.getElementById('playPauseBtn').disabled = false;
    document.getElementById('prevBtn').disabled = false;
    document.getElementById('nextBtn').disabled = false;
}

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
    if (currentTrackIndex > 0) {
        playVideoFromPlaylist(currentTrackIndex - 1);
    }
});

document.getElementById('nextBtn').addEventListener('click', () => {
    playNext();
});

function playNext() {
    if (currentTrackIndex < playlistVideos.length - 1) {
        playVideoFromPlaylist(currentTrackIndex + 1);
    } else {
        playVideoFromPlaylist(0);
    }
}

document.getElementById('progressBar').addEventListener('click', (e) => {
    if (player && player.getDuration) {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = e.currentTarget.offsetWidth;
        const percentage = clickX / width;
        const seekTime = player.getDuration() * percentage;
        player.seekTo(seekTime, true);
    }
});

function updateProgress() {
    if (player && player.getCurrentTime && player.getDuration) {
        try {
            const current = player.getCurrentTime();
            const duration = player.getDuration();
            
            if (duration > 0) {
                const percentage = (current / duration) * 100;
                document.getElementById('progressFill').style.width = `${percentage}%`;
                document.getElementById('currentTime').textContent = formatTime(current);
                document.getElementById('duration').textContent = formatTime(duration);
            }
        } catch (e) {}
    }
}

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
        if (remainingTime > 0) {
            updateTimerDisplay();
            startTimer();
        }
        modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });
}

function startTimer() {
    if (isTimerRunning) clearInterval(timerInterval);
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
    const mins = Math.floor(remainingTime / 60);
    const secs = remainingTime % 60;
    document.getElementById('minutes').textContent = String(mins).padStart(2, '0');
    document.getElementById('seconds').textContent = String(secs).padStart(2, '0');
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
    if (player) player.pauseVideo();
    showToast('Prayer time complete!');
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message) {
    alert(message);
}

function initializeAnimations() {
    if (typeof gsap === 'undefined') return;
    
    gsap.from('.prayer-title', { duration: 1, y: -50, opacity: 0, ease: 'power3.out' });
    gsap.from('.prayer-subtitle', { duration: 1, y: -30, opacity: 0, ease: 'power3.out', delay: 0.2 });
    gsap.from('.search-section', { duration: 1, y: 30, opacity: 0, ease: 'power3.out', delay: 0.4 });
    gsap.from('.timer-section', { duration: 1, scale: 0.8, opacity: 0, ease: 'back.out(1.7)', delay: 0.6 });
    gsap.from('.player-card', { duration: 1, y: 50, opacity: 0, ease: 'power3.out', delay: 0.8 });
    gsap.from('.playlist', { duration: 1, y: 50, opacity: 0, ease: 'power3.out', delay: 1 });
}