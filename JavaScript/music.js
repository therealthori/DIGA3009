fetch('https://api.soundcloud.com/tracks/977191300?client_id=cGLuFb9vlKW89vK8UCbJdM4L8fulUZb8')
  .then(r => console.log('Status:', r.status))
  .then(r => r.json())
  .then(data => console.log(data));


// SoundCloud Widget API Configuration
const DEFAULT_PLAYLIST_URL = 'https://soundcloud.com/angeline-almy/sets/gospel-music-praise-and';

// Timer Variables
let timerInterval = null;
let remainingTime = 0;
let isTimerRunning = false;

// Music Player Variables
let widget = null;
let currentTrackIndex = 0;
let currentPlaylist = [];
let isPlaying = false;
let duration = 0;
let currentTime = 0;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeSoundCloudPlayer();
    initializeTimer();
    initializeSearch();
    initializeAnimations();
});

// Initialize SoundCloud Player
function initializeSoundCloudPlayer() {
    const iframe = document.createElement('iframe');
    iframe.id = 'soundcloud-player';
    iframe.width = '0';
    iframe.height = '0';
    iframe.scrolling = 'no';
    iframe.frameborder = 'no';
    iframe.allow = 'autoplay';
    iframe.src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(DEFAULT_PLAYLIST_URL)}&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false`;
    document.body.appendChild(iframe);

    widget = SC.Widget('soundcloud-player');
    
    widget.bind(SC.Widget.Events.READY, () => {
        console.log('SoundCloud widget ready');
        loadDefaultPlaylist();
    });

    widget.bind(SC.Widget.Events.PLAY, onPlay);
    widget.bind(SC.Widget.Events.PAUSE, onPause);
    widget.bind(SC.Widget.Events.FINISH, onFinish);
    widget.bind(SC.Widget.Events.PLAY_PROGRESS, onPlayProgress);
}

// Load default playlist
function loadDefaultPlaylist() {
    widget.getSounds((sounds) => {
        if (sounds && sounds.length > 0) {
            currentPlaylist = sounds;
            displayPlaylistTracks(sounds);
            loadTrackInfo(sounds[0]);
            
            document.getElementById('playlistTitle').textContent = 'Gospel Music Praise & Worship';
            document.getElementById('resultsInfo').style.display = 'block';
            document.getElementById('resultsText').textContent = `${sounds.length} tracks loaded`;
            
            enablePlayerControls();
        }
    });
}

// Initialize Search Functionality
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const clearBtn = document.getElementById('clearBtn');
    const filterBtns = document.querySelectorAll('.filter-btn');

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
        loadDefaultPlaylist();
    });

    // Filter buttons - filter current playlist
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            filterPlaylist(filter);
        });
    });
}

// Filter current playlist based on search term
function filterPlaylist(searchTerm) {
    if (!currentPlaylist || currentPlaylist.length === 0) return;

    let filtered = currentPlaylist;

    if (searchTerm !== 'all') {
        filtered = currentPlaylist.filter(track => {
            const title = track.title.toLowerCase();
            const artist = track.user.username.toLowerCase();
            const term = searchTerm.toLowerCase();
            return title.includes(term) || artist.includes(term);
        });
    }

    displayPlaylistTracks(filtered);
    document.getElementById('resultsText').textContent = `Showing ${filtered.length} of ${currentPlaylist.length} tracks`;
}

// Perform Search (searches within loaded playlist)
function performSearch(query) {
    const searchBtn = document.getElementById('searchBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');
    
    searchBtn.disabled = true;
    loadingSpinner.style.display = 'block';

    // Simulate loading delay
    setTimeout(() => {
        const filtered = currentPlaylist.filter(track => {
            const title = track.title.toLowerCase();
            const artist = track.user.username.toLowerCase();
            const searchQuery = query.toLowerCase();
            return title.includes(searchQuery) || artist.includes(searchQuery);
        });

        displayPlaylistTracks(filtered);
        
        document.getElementById('resultsInfo').style.display = 'block';
        document.getElementById('resultsText').textContent = 
            filtered.length > 0 
                ? `Found ${filtered.length} tracks matching "${query}"`
                : `No tracks found matching "${query}"`;

        searchBtn.disabled = false;
        loadingSpinner.style.display = 'none';
    }, 500);
}

// Display playlist tracks
function displayPlaylistTracks(tracks) {
    const playlistItems = document.getElementById('playlistItems');
    playlistItems.innerHTML = '';

    if (tracks.length === 0) {
        playlistItems.innerHTML = `
            <div class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
                    <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                </svg>
                <p>No tracks found</p>
            </div>
        `;
        return;
    }

    tracks.forEach((track, index) => {
        const item = document.createElement('div');
        item.className = 'playlist-item';
        if (index === currentTrackIndex) item.classList.add('active');
        
        const duration = formatTime(track.duration / 1000);
        item.innerHTML = `
            <div class="playlist-item-info">
                <h4>${track.title}</h4>
                <p>${track.user.username}</p>
            </div>
            <span class="playlist-item-duration">${duration}</span>
        `;
        
        // Store original index for playback
        const originalIndex = currentPlaylist.indexOf(track);
        item.addEventListener('click', () => {
            playTrackFromPlaylist(originalIndex);
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

// Play track from playlist by index
function playTrackFromPlaylist(index) {
    widget.skip(index);
    widget.play();
    currentTrackIndex = index;
    updateActiveTrack(index);
}

// Load track info without playing
function loadTrackInfo(track) {
    document.getElementById('trackTitle').textContent = track.title;
    document.getElementById('artistName').textContent = track.user.username;
    
    const albumImage = document.getElementById('albumImage');
    const artworkUrl = track.artwork_url ? track.artwork_url.replace('-large', '-t500x500') : null;
    albumImage.src = artworkUrl || track.user.avatar_url || 'https://via.placeholder.com/400?text=No+Artwork';
    
    duration = track.duration / 1000;
    document.getElementById('duration').textContent = formatTime(duration);
}

// Update active track in playlist
function updateActiveTrack(index) {
    const playlistItems = document.querySelectorAll('.playlist-item');
    playlistItems.forEach(item => item.classList.remove('active'));
    
    // Find and highlight the current track
    if (playlistItems[index]) {
        playlistItems[index].classList.add('active');
        playlistItems[index].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    // Update track info
    if (currentPlaylist[index]) {
        loadTrackInfo(currentPlaylist[index]);
    }
}

// Enable player controls
function enablePlayerControls() {
    document.getElementById('playPauseBtn').disabled = false;
    document.getElementById('prevBtn').disabled = false;
    document.getElementById('nextBtn').disabled = false;
}

// Player Controls
document.getElementById('playPauseBtn').addEventListener('click', () => {
    widget.isPaused((paused) => {
        if (paused) {
            widget.play();
        } else {
            widget.pause();
        }
    });
});

document.getElementById('prevBtn').addEventListener('click', () => {
    widget.prev();
    if (currentTrackIndex > 0) {
        currentTrackIndex--;
        updateActiveTrack(currentTrackIndex);
    }
});

document.getElementById('nextBtn').addEventListener('click', () => {
    widget.next();
    if (currentTrackIndex < currentPlaylist.length - 1) {
        currentTrackIndex++;
        updateActiveTrack(currentTrackIndex);
    }
});

// Progress bar click
document.getElementById('progressBar').addEventListener('click', (e) => {
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = progressBar.offsetWidth;
    const percentage = (clickX / width);
    const seekTime = duration * percentage * 1000;
    
    widget.seekTo(seekTime);
});

// Widget Events
function onPlay() {
    isPlaying = true;
    document.getElementById('playIcon').style.display = 'none';
    document.getElementById('pauseIcon').style.display = 'block';
    
    widget.getCurrentSoundIndex((index) => {
        currentTrackIndex = index;
        updateActiveTrack(index);
    });
}

function onPause() {
    isPlaying = false;
    document.getElementById('playIcon').style.display = 'block';
    document.getElementById('pauseIcon').style.display = 'none';
}

function onFinish() {
    if (currentTrackIndex < currentPlaylist.length - 1) {
        currentTrackIndex++;
        updateActiveTrack(currentTrackIndex);
    } else {
        // Reset to beginning
        currentTrackIndex = 0;
        updateActiveTrack(currentTrackIndex);
    }
}

function onPlayProgress(data) {
    currentTime = data.currentPosition / 1000;
    const totalDuration = data.duration / 1000;
    
    const percentage = (data.currentPosition / data.duration) * 100;
    document.getElementById('progressFill').style.width = `${percentage}%`;
    
    document.getElementById('currentTime').textContent = formatTime(currentTime);
    document.getElementById('duration').textContent = formatTime(totalDuration);
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
        
        if (remainingTime > 0) {
            updateTimerDisplay();
            startTimer();
        }
        
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
    
    widget.pause();
    
    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Prayer Time Complete!', {
            body: 'Your prayer session has ended.',
            icon: '/favicon.ico'
        });
    } else {
        alert('Prayer time complete!');
    }
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