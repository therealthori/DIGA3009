const API_BASE_URL = 'http://localhost:3000/api';

const DEFAULT_PLAYLIST_ID = 'PLf-D8i92I2StkrJGNc-C3LI3NNoNbiNHY';

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
    initializeAnimations();
    
    // Register GSAP plugins
    gsap.registerPlugin(MotionPathPlugin);
});

// Load YouTube IFrame API
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
            'modestbranding': 1,
            'enablejsapi': 1
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
}

function onPlayerReady(event) {
    console.log('YouTube player ready');
    loadDefaultPlaylist();
    
    setInterval(updateProgress, 1000);
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        isPlaying = true;
        document.getElementById('playIcon').style.display = 'none';
        document.getElementById('pauseIcon').style.display = 'block';
        document.getElementById('videoOverlay').style.opacity = '0';
    } else if (event.data === YT.PlayerState.PAUSED) {
        isPlaying = false;
        document.getElementById('playIcon').style.display = 'block';
        document.getElementById('pauseIcon').style.display = 'none';
    } else if (event.data === YT.PlayerState.ENDED) {
        playNext();
    }
}

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
        
        playlistVideos = data.items;
        
        displayPlaylistGrid(playlistVideos);
        
        document.getElementById('videoCount').textContent = `${playlistVideos.length} videos`;
        
        if (playlistVideos.length > 0) {
            player.cueVideoById(playlistVideos[0].videoId);
            updateVideoInfo(playlistVideos[0]);
        }
        
    } catch (error) {
        console.error('Error loading YouTube playlist:', error);
        showFallbackMessage();
    }
}

function displayPlaylistGrid(videos) {
    const playlistGrid = document.getElementById('playlistGrid');
    playlistGrid.innerHTML = '';

    videos.forEach((video, index) => {
        const item = document.createElement('div');
        item.className = 'playlist-item';
        if (index === 0) item.classList.add('active');
        
        item.innerHTML = `
            <img src="${video.thumbnails.medium}" alt="${video.title}" class="playlist-item-thumbnail">
            <div class="playlist-item-info">
                <div class="playlist-item-title">${video.title}</div>
                <div class="playlist-item-channel">${video.channelTitle}</div>
            </div>
        `;
        
        item.addEventListener('click', () => {
            playVideo(index);
            updateActiveItem(index);
        });
        
        playlistGrid.appendChild(item);
    });

    animatePlaylistItems();
}

function animatePlaylistItems() {
    const items = document.querySelectorAll('.playlist-item');
    
    items.forEach((item, index) => {
        gsap.to(item, {
            y: "random(-10, 10)",
            duration: "random(2, 3)",
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: index * 0.1
        });
        
        gsap.from(item, {
            duration: 0.6,
            opacity: 0,
            scale: 0.8,
            delay: index * 0.05,
            ease: 'back.out(1.7)'
        });
    });
}

function playVideo(index) {
    if (playlistVideos[index]) {
        player.loadVideoById(playlistVideos[index].videoId);
        currentTrackIndex = index;
        updateVideoInfo(playlistVideos[index]);
        
        const playBtn = document.getElementById('playPauseBtn');
        gsap.to(playBtn, {
            motionPath: {
                path: [
                    {x: 0, y: 0},
                    {x: 10, y: -10},
                    {x: 0, y: 0}
                ],
                curviness: 1.5
            },
            duration: 0.5,
            ease: "power1.inOut"
        });
    }
}

function updateVideoInfo(video) {
    document.getElementById('videoTitle').textContent = video.title;
    document.getElementById('videoChannel').textContent = video.channelTitle;
}

function updateActiveItem(index) {
    document.querySelectorAll('.playlist-item').forEach((item, i) => {
        if (i === index) {
            item.classList.add('active');
            gsap.to(item, {
                scale: 1.05,
                duration: 0.3,
                yoyo: true,
                repeat: 1,
                ease: 'power2.inOut'
            });
        } else {
            item.classList.remove('active');
        }
    });
}

function showFallbackMessage() {
    const playlistGrid = document.getElementById('playlistGrid');
    playlistGrid.innerHTML = `
        <div class="loading-state" style="grid-column: 1/-1;">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <p>Unable to load playlist</p>
            <p style="font-size: 0.9rem; margin-top: 1rem;">Make sure the server is running</p>
        </div>
    `;
}

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
        playVideo(currentTrackIndex);
        updateActiveItem(currentTrackIndex);
    }
}

function playNext() {
    if (currentTrackIndex < playlistVideos.length - 1) {
        currentTrackIndex++;
        playVideo(currentTrackIndex);
        updateActiveItem(currentTrackIndex);
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

        }
    }
}

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
        
        const timerDisplay = document.querySelector('.timer-display');
        gsap.to(timerDisplay, {
            motionPath: {
                path: [
                    {x: 0, y: 0},
                    {x: 0, y: -20},
                    {x: 0, y: 0}
                ]
            },
            duration: 0.6,
            ease: "bounce.out"
        });
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
    const timerDisplay = document.querySelector('.timer-display');
    
    // Create circular motion path for completion animation
    gsap.to(timerDisplay, {
        motionPath: {
            path: [
                {x: 0, y: 0},
                {x: 30, y: -20},
                {x: 0, y: -40},
                {x: -30, y: -20},
                {x: 0, y: 0}
            ],
            curviness: 1.5
        },
        duration: 1,
        ease: "power2.inOut",
        repeat: 2
    });
    
    if (player) {
        player.pauseVideo();
    }
    
    setTimeout(() => {
        alert('Prayer time complete!');
    }, 2000);
}

// Utility Functions
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
}

// GSAP Animations with Motion Paths
function initializeAnimations() {
    // Title animation with motion path
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

    // Timer animation with floating effect
    gsap.from('.timer-section', {
        duration: 1,
        scale: 0.8,
        opacity: 0,
        ease: 'back.out(1.7)',
        delay: 0.4
    });
    
    // Continuous floating animation for timer
    gsap.to('.timer-display', {
        y: -10,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
    });

    // Video player animation
    gsap.from('.video-player-section', {
        duration: 1,
        y: 50,
        opacity: 0,
        ease: 'power3.out',
        delay: 0.6
    });

    // Playlist section animation
    gsap.from('.playlist-section', {
        duration: 1,
        y: 50,
        opacity: 0,
        ease: 'power3.out',
        delay: 0.8
    });
    
    // Control buttons circular motion on hover
    const controlBtns = document.querySelectorAll('.control-btn-simple');
    controlBtns.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            gsap.to(btn, {
                rotation: 360,
                duration: 0.6,
                ease: 'power2.out'
            });
        });
    });
}