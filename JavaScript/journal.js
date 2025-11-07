// API Configuration - Using bible-api.com (No key required!)
const CONFIG = {
    USE_BIBLE_API_COM: true, // Free API, no authentication needed
    BIBLE_API_URL: 'https://bible-api.com'
};

// DOM Elements
const psalmSelect = document.getElementById('psalmSelect');
const loadPsalmBtn = document.getElementById('loadPsalmBtn');
const psalmDisplay = document.getElementById('psalmDisplay');
const saveBtn = document.getElementById('saveBtn');
const journalInput = document.getElementById('journalInput');
const saveAsPrayerCheckbox = document.getElementById('saveAsPrayer');
const notesList = document.getElementById('notesList');
const prayersList = document.getElementById('prayersList');
const favoritePsalmBtn = document.getElementById('favoritePsalmBtn');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// State
let currentPsalm = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializePage();
    loadPsalmsList();
    renderNotes();
});

// Initialize GSAP animations
function initializePage() {
    gsap.from('.journal-title', {
        duration: 1,
        y: -50,
        opacity: 0,
        ease: 'power3.out'
    });

    gsap.from('.journal-subtitle', {
        duration: 1,
        y: -30,
        opacity: 0,
        ease: 'power3.out',
        delay: 0.2
    });

    gsap.from('.psalm-section', {
        duration: 1,
        y: 50,
        opacity: 0,
        ease: 'power3.out',
        delay: 0.4
    });

    gsap.from('.input-section', {
        duration: 1,
        y: 50,
        opacity: 0,
        ease: 'power3.out',
        delay: 0.6
    });

    gsap.from('.column', {
        duration: 1,
        y: 50,
        opacity: 0,
        ease: 'power3.out',
        stagger: 0.2,
        delay: 0.8
    });
}

// Load Psalms List (All 150 Psalms)
function loadPsalmsList() {
    for (let i = 1; i <= 150; i++) {
        const option = document.createElement('option');
        option.value = `Psalms ${i}`;
        option.textContent = `Psalm ${i}`;
        option.dataset.psalmNumber = i;
        psalmSelect.appendChild(option);
    }
    
    showToast('All 150 Psalms loaded!');
}

// Fetch from bible-api.com
async function fetchPsalm(psalmReference) {
    try {
        const url = `${CONFIG.BIBLE_API_URL}/${encodeURIComponent(psalmReference)}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
        
    } catch (error) {
        console.error('Bible API Error:', error);
        throw error;
    }
}

// Load Chapter Content
async function loadChapter(psalmReference) {
    try {
        psalmDisplay.classList.add('loading');
        
        const data = await fetchPsalm(psalmReference);
        
        if (!data || !data.text) {
            throw new Error('No psalm data returned');
        }
        
        const reference = data.reference || psalmReference;
        const verses = data.verses || [];
        
        let formattedText = '';
        if (verses.length > 0) {
            formattedText = verses.map(verse => {
                return `<p><strong>${verse.verse}</strong> ${verse.text}</p>`;
            }).join('');
        } else {
            formattedText = `<p>${data.text}</p>`;
        }
        
        displayPsalm(reference, formattedText, psalmReference);
        showToast('Psalm loaded successfully!');
        
    } catch (error) {
        psalmDisplay.classList.remove('loading');
        console.error('Error loading psalm:', error);
        psalmDisplay.innerHTML = `
            <div class="empty-state">
                <p>Unable to fetch Psalm text. Please try again.</p>
                <p style="font-size: 0.85rem; margin-top: 0.5rem;">Error: ${error.message}</p>
            </div>
        `;
    }
}

// Display Psalm helper
function displayPsalm(reference, content, psalmId) {
    console.log('Displaying psalm:', reference); 
    console.log('Content length:', content.length); 

    psalmDisplay.innerHTML = `
        <div class="verse-content">
            <div class="verse-label">Scripture</div>
            <div class="verse-reference">${reference}</div>
            <div class="verse-text">${content}</div>
        </div>
    `;
    
    currentPsalm = {
        id: psalmId,
        reference: reference,
        content: content
    };
    
    psalmDisplay.classList.remove('loading');
}

// Load Psalm Button Click - FIXED VERSION
if (loadPsalmBtn) {
    loadPsalmBtn.addEventListener('click', async function(e) {
        // CRITICAL: Stop all default behaviors
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        const psalmReference = psalmSelect.value;
        
        if (!psalmReference) {
            gsap.to('.psalm-select', {
                x: [-10, 10, -10, 10, 0],
                duration: 0.4
            });
            showToast('Please select a Psalm first');
            return false; // Extra safety
        }
        
        await loadChapter(psalmReference);
        return false; // Extra safety
    });
}

// LocalStorage Helpers
function loadSavedNotes() {
    try {
        const notes = localStorage.getItem('journalNotes');
        return notes ? JSON.parse(notes) : [];
    } catch (error) {
        console.error('Error loading notes:', error);
        return [];
    }
}

function saveNotes(notes) {
    try {
        localStorage.setItem('journalNotes', JSON.stringify(notes));
    } catch (error) {
        console.error('Error saving notes:', error);
        showToast('Error saving notes');
    }
}

// Render Notes
function renderNotes() {
    const notes = loadSavedNotes();
    notesList.innerHTML = '';
    prayersList.innerHTML = '';

    if (notes.length === 0) {
        notesList.innerHTML = `
            <div class="empty-state">
                <p>No notes yet. Write something and click "Save Entry".</p>
            </div>
        `;
        prayersList.innerHTML = `
            <div class="empty-state">
                <p>No prayers or favorites yet.</p>
            </div>
        `;
        return;
    }

    let hasNotes = false;
    let hasPrayers = false;

    notes.forEach((note, index) => {
        const noteEl = createNoteElement(note, index);
        notesList.appendChild(noteEl);
        hasNotes = true;

        if (note.isPrayer || note.isFavorite) {
            const prayerEl = createPrayerElement(note);
            prayersList.appendChild(prayerEl);
            hasPrayers = true;
        }
    });

    if (!hasNotes) {
        notesList.innerHTML = `<div class="empty-state"><p>No notes yet.</p></div>`;
    }

    if (!hasPrayers) {
        prayersList.innerHTML = `<div class="empty-state"><p>No prayers or favorites yet.</p></div>`;
    }

    gsap.from('.item, .prayer-item', {
        duration: 0.5,
        y: 20,
        opacity: 0,
        stagger: 0.1,
        ease: 'power2.out'
    });
}

// Create Note Element
function createNoteElement(note, index) {
    const div = document.createElement('div');
    div.className = 'item';
    
    div.innerHTML = `
        <div class="item-content">${escapeHtml(note.text)}</div>
        ${note.psalmRef ? `<div class="psalm-reference">— ${escapeHtml(note.psalmRef)}</div>` : ''}
        <div class="item-date">${note.date}</div>
    `;
    
    div.addEventListener('click', () => {
        journalInput.value = note.text;
        gsap.from('.journal-textarea', {
            scale: 1.02,
            duration: 0.3,
            ease: 'power2.out'
        });
    });
    
    return div;
}

// Create Prayer Element
function createPrayerElement(note) {
    const div = document.createElement('div');
    div.className = 'prayer-item';
    
    div.innerHTML = `
        <div class="prayer-content">${escapeHtml(note.text)}</div>
        ${note.psalmRef ? `<div class="psalm-reference">— ${escapeHtml(note.psalmRef)}</div>` : ''}
        <div class="item-date">${note.date}</div>
    `;
    
    return div;
}

// Save Entry Button Click - FIXED VERSION
if (saveBtn) {
    saveBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        const text = journalInput.value.trim();
        
        if (!text) {
            gsap.to('.journal-textarea', {
                x: [-8, 8, -8, 8, 0],
                duration: 0.4
            });
            showToast('Please write something first');
            return false;
        }

        const selectedOption = psalmSelect.selectedOptions[0];
        const psalmRef = selectedOption ? selectedOption.textContent : null;
        const isPrayer = saveAsPrayerCheckbox.checked;

        const entry = {
            text: text,
            psalmId: selectedOption ? selectedOption.value : null,
            psalmRef: psalmRef,
            date: new Date().toLocaleString(),
            isPrayer: isPrayer,
            isFavorite: false
        };

        const notes = loadSavedNotes();
        notes.unshift(entry);
        saveNotes(notes);
        renderNotes();

        journalInput.value = '';
        saveAsPrayerCheckbox.checked = false;
        
        gsap.to('.save-btn', {
            scale: 0.95,
            duration: 0.1,
            yoyo: true,
            repeat: 1
        });
        
        showToast(isPrayer ? 'Prayer saved!' : 'Entry saved!');
        return false;
    });
}

// Favorite Psalm Button Click - FIXED VERSION
if (favoritePsalmBtn) {
    favoritePsalmBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        const selectedOption = psalmSelect.selectedOptions[0];
        
        if (!selectedOption) {
            gsap.to('.psalm-select', {
                x: [-8, 8, -8, 8, 0],
                duration: 0.4
            });
            showToast('Please select a Psalm first');
            return false;
        }
        
        if (!currentPsalm) {
            showToast('Please load the Psalm first');
            return false;
        }

        const psalmRef = selectedOption.textContent;
        const notes = loadSavedNotes();
        
        const alreadyFavorited = notes.some(note => 
            note.psalmId === selectedOption.value && note.isFavorite
        );
        
        if (alreadyFavorited) {
            showToast('This Psalm is already in your favorites');
            return false;
        }

        const entry = {
            text: `Favorite Psalm — ${psalmRef}`,
            psalmId: selectedOption.value,
            psalmRef: psalmRef,
            date: new Date().toLocaleString(),
            isPrayer: false,
            isFavorite: true
        };
        
        notes.unshift(entry);
        saveNotes(notes);
        renderNotes();
        
        gsap.to('.favorite-btn', {
            scale: 0.9,
            duration: 0.15,
            yoyo: true,
            repeat: 1
        });
        
        showToast('Added to favorites!');
        return false;
    });
}

// Escape HTML Helper
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Show Toast Notification
function showToast(message) {
    if (!toast || !toastMessage) return;
    
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Enter key to save
if (journalInput) {
    journalInput.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            saveBtn.click();
        }
    });
}