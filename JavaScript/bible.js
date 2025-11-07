// API Configuration
// Using Bible API for verse retrieval
const BIBLE_API_KEY = '9O1az6HSvI8E34rs5UY3H'; // Get from https://scripture.api.bible/
const BIBLE_API_URL = 'https://api.scripture.api.bible/v1';
const BIBLE_ID = 'de4e12af7f28f599-02'; 

const verseDatabase = {
    'John 3:16': {
        reference: 'John 3:16',
        text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
        theme: 'love',
        book: 'JHN',
        chapter: 3,
        verse: 16
    },
    'Philippians 4:13': {
        reference: 'Philippians 4:13',
        text: 'I can do all this through him who gives me strength.',
        theme: 'strength',
        book: 'PHP',
        chapter: 4,
        verse: 13
    },
    'Psalm 23:1': {
        reference: 'Psalm 23:1',
        text: 'The LORD is my shepherd, I lack nothing.',
        theme: 'peace',
        book: 'PSA',
        chapter: 23,
        verse: 1
    },
    'Romans 8:28': {
        reference: 'Romans 8:28',
        text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
        theme: 'purpose',
        book: 'ROM',
        chapter: 8,
        verse: 28
    },
    'Proverbs 3:5-6': {
        reference: 'Proverbs 3:5-6',
        text: 'Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.',
        theme: 'faith',
        book: 'PRO',
        chapter: 3,
        verse: '5-6'
    },
    'Isaiah 41:10': {
        reference: 'Isaiah 41:10',
        text: 'So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.',
        theme: 'strength',
        book: 'ISA',
        chapter: 41,
        verse: 10
    },
    'Jeremiah 29:11': {
        reference: 'Jeremiah 29:11',
        text: 'For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, plans to give you hope and a future.',
        theme: 'hope',
        book: 'JER',
        chapter: 29,
        verse: 11
    },
    'Matthew 6:33': {
        reference: 'Matthew 6:33',
        text: 'But seek first his kingdom and his righteousness, and all these things will be given to you as well.',
        theme: 'purpose',
        book: 'MAT',
        chapter: 6,
        verse: 33
    },
    'Psalm 46:1': {
        reference: 'Psalm 46:1',
        text: 'God is our refuge and strength, an ever-present help in trouble.',
        theme: 'strength',
        book: 'PSA',
        chapter: 46,
        verse: 1
    },
    'Joshua 1:9': {
        reference: 'Joshua 1:9',
        text: 'Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the LORD your God will be with you wherever you go.',
        theme: 'strength',
        book: 'JOS',
        chapter: 1,
        verse: 9
    },
    '2 Timothy 1:7': {
        reference: '2 Timothy 1:7',
        text: 'For the Spirit God gave us does not make us timid, but gives us power, love and self-discipline.',
        theme: 'strength',
        book: '2TI',
        chapter: 1,
        verse: 7
    },
    'Romans 12:2': {
        reference: 'Romans 12:2',
        text: 'Do not conform to the pattern of this world, but be transformed by the renewing of your mind. Then you will be able to test and approve what God\'s will is—his good, pleasing and perfect will.',
        theme: 'faith',
        book: 'ROM',
        chapter: 12,
        verse: 2
    },
    '1 Corinthians 13:4-5': {
        reference: '1 Corinthians 13:4-5',
        text: 'Love is patient, love is kind. It does not envy, it does not boast, it is not proud. It does not dishonor others, it is not self-seeking, it is not easily angered, it keeps no record of wrongs.',
        theme: 'love',
        book: '1CO',
        chapter: 13,
        verse: '4-5'
    },
    'Galatians 5:22-23': {
        reference: 'Galatians 5:22-23',
        text: 'But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control. Against such things there is no law.',
        theme: 'faith',
        book: 'GAL',
        chapter: 5,
        verse: '22-23'
    },
    'Ephesians 2:8-9': {
        reference: 'Ephesians 2:8-9',
        text: 'For it is by grace you have been saved, through faith—and this not from yourselves, it is the gift of God—not by works, so that no one can boast.',
        theme: 'faith',
        book: 'EPH',
        chapter: 2,
        verse: '8-9'
    },
    'Psalm 119:105': {
        reference: 'Psalm 119:105',
        text: 'Your word is a lamp for my feet, a light on my path.',
        theme: 'faith',
        book: 'PSA',
        chapter: 119,
        verse: 105
    },
    'Matthew 11:28': {
        reference: 'Matthew 11:28',
        text: 'Come to me, all you who are weary and burdened, and I will give you rest.',
        theme: 'peace',
        book: 'MAT',
        chapter: 11,
        verse: 28
    },
    'James 1:2-3': {
        reference: 'James 1:2-3',
        text: 'Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds, because you know that the testing of your faith produces perseverance.',
        theme: 'faith',
        book: 'JAS',
        chapter: 1,
        verse: '2-3'
    },
    'Colossians 3:23': {
        reference: 'Colossians 3:23',
        text: 'Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.',
        theme: 'purpose',
        book: 'COL',
        chapter: 3,
        verse: 23
    },
    'Hebrews 11:1': {
        reference: 'Hebrews 11:1',
        text: 'Now faith is confidence in what we hope for and assurance about what we do not see.',
        theme: 'faith',
        book: 'HEB',
        chapter: 11,
        verse: 1
    }
};

// Commentary templates
const commentaryThemes = {
    love: [
        "God's love is unconditional and everlasting. Today, reflect on how His love has transformed your life and share that love with others around you.",
        "In this verse, we see the depth of God's love for humanity. His love never fails, never gives up, and is always patient with us through every season of life."
    ],
    faith: [
        "Faith is trusting God even when we cannot see the path ahead. This verse reminds us that our faith should be rooted firmly in God's unchanging promises.",
        "Walking by faith means surrendering control and trusting that God's plan is perfect, even when we face uncertainty and challenges in our daily lives."
    ],
    hope: [
        "Hope is the anchor of our soul in turbulent times. In times of trouble, God's promises give us assurance that better days are ahead and He is working all things for our good.",
        "This verse teaches us that our hope is not wishful thinking, but a confident expectation based on God's faithfulness throughout generations."
    ],
    strength: [
        "When we are weak, God is strong. This verse reminds us that we can face any challenge with His power working in us and through us.",
        "God's strength is made perfect in our weakness. Today, lean on Him for the courage, endurance, and power you need to overcome obstacles."
    ],
    peace: [
        "God's peace surpasses all understanding and logic. In the midst of chaos and uncertainty, He offers a calm that the world cannot give or take away.",
        "This verse invites us to find rest in God's presence. His peace guards our hearts and minds from anxiety, fear, and worry about tomorrow."
    ],
    purpose: [
        "God has a unique plan and purpose for your life. Trust that He is working all things together for your good, even when you can't see the full picture.",
        "Every moment of your life has divine meaning in God's grand design. Walk confidently knowing He directs your steps and orders your path."
    ]
};

let currentVerse = null;
let savedDevotions = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeDevotionPage();
    setupEventListeners();
    loadTodaysVerse();
    loadSavedDevotions();
});

function initializeDevotionPage() {
    // Animate page elements
    gsap.from('.devotion-title', {
        duration: 1,
        y: -50,
        opacity: 0,
        ease: 'power3.out'
    });

    gsap.from('.devotion-subtitle', {
        duration: 1,
        y: -30,
        opacity: 0,
        ease: 'power3.out',
        delay: 0.2
    });

    gsap.from('.generate-btn', {
        duration: 1,
        scale: 0.8,
        opacity: 0,
        ease: 'back.out(1.7)',
        delay: 0.4
    });

    gsap.from('.verse-card', {
        duration: 1,
        y: 50,
        opacity: 0,
        ease: 'power3.out',
        delay: 0.6
    });

    gsap.from('.commentary-section', {
        duration: 1,
        y: 50,
        opacity: 0,
        ease: 'power3.out',
        delay: 0.8
    });

    gsap.from('.action-buttons', {
        duration: 1,
        y: 30,
        opacity: 0,
        ease: 'power3.out',
        delay: 1
    });
}

function setupEventListeners() {
    document.getElementById('generateBtn').addEventListener('click', generateNewDevotion);
    document.getElementById('saveBtn').addEventListener('click', saveCurrentDevotion);
    document.getElementById('shareBtn').addEventListener('click', shareDevotion);
}

function loadSavedDevotions() {
    try {
        const saved = localStorage.getItem('savedDevotions');
        if (saved) {
            savedDevotions = JSON.parse(saved);
        }
    } catch (error) {
        console.error('Error loading saved devotions:', error);
        savedDevotions = [];
    }
}

// Load today's verse on page load
function loadTodaysVerse() {
    const today = new Date().toDateString();
    const cachedVerse = localStorage.getItem('todaysVerse');
    const cachedDate = localStorage.getItem('verseDate');

    if (cachedVerse && cachedDate === today) {
        try {
            const verse = JSON.parse(cachedVerse);
            displayVerse(verse);
        } catch (error) {
            console.error('Error loading cached verse:', error);
            // Generate a new one
            generateNewDevotion();
        }
    }
}

// Generate new devotion
async function generateNewDevotion() {
    const btn = document.getElementById('generateBtn');
    const btnText = document.getElementById('btnText');
    const loader = document.getElementById('loader');
    
    btn.classList.add('loading');
    btn.disabled = true;

    try {
        // Get random verse from database
        const verseKeys = Object.keys(verseDatabase);
        const randomKey = verseKeys[Math.floor(Math.random() * verseKeys.length)];
        const verseData = verseDatabase[randomKey];
        
        // Try to fetch from API if key is provided
        if (BIBLE_API_KEY && BIBLE_API_KEY !== 'YOUR_API_KEY_HERE') {
            try {
                const apiVerse = await fetchFromBibleAPI(verseData);
                if (apiVerse && apiVerse.text) {
                    verseData.text = apiVerse.text;
                }
            } catch (apiError) {
                console.log('API fetch failed, using cached verse:', apiError);
                // Continue with cached verse
            }
        }
        
        // Display verse and commentary
        displayVerse(verseData);
        
        // Cache for today
        const today = new Date().toDateString();
        localStorage.setItem('todaysVerse', JSON.stringify(verseData));
        localStorage.setItem('verseDate', today);
        
        // Animate new content
        animateContentChange();
        
    } catch (error) {
        console.error('Error generating devotion:', error);
        showToast('Error loading verse. Please try again.');
    } finally {
        btn.classList.remove('loading');
        btn.disabled = false;
    }
}

// Fetch verse from Bible API
async function fetchFromBibleAPI(verseData) {
    try {
        const verseId = `${verseData.book}.${verseData.chapter}.${verseData.verse}`;
        const url = `https://api.scripture.api.bible/v1/bibles/de4e12af7f28f599-02/verses/${verseId}`;
        
        const response = await fetch(url, {
            headers: {
                'api-key': BIBLE_API_KEY
            }
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        
        if (data && data.data && data.data.content) {
            // Clean the text (remove HTML tags)
            const parser = new DOMParser();
            const doc = parser.parseFromString(data.data.content, 'text/html');
            const cleanText = doc.body.textContent.trim();
            
            return {
                ...verseData,
                text: cleanText
            };
        }
        
        return null;
    } catch (error) {
        console.error('Bible API Error:', error);
        return null;
    }
}

// Display verse and generate commentary
function displayVerse(verseData) {
    currentVerse = verseData;
    
    // Update verse reference and text
    document.getElementById('verseReference').textContent = verseData.reference;
    document.getElementById('verseText').textContent = verseData.text;
    
    // Generate and display commentary
    const commentary = generateCommentary(verseData);
    document.getElementById('commentaryContent').innerHTML = commentary;
}

// Generate contextual commentary
function generateCommentary(verseData) {
    const theme = verseData.theme || 'faith';
    const themeCommentaries = commentaryThemes[theme] || commentaryThemes.faith;
    const selectedCommentary = themeCommentaries[Math.floor(Math.random() * themeCommentaries.length)];
    
    const commentary = `
        <p>${selectedCommentary}</p>
        <p>As you meditate on this verse today, consider how God is speaking directly to your current situation. His word is alive and active, ready to transform your heart and renew your mind with truth.</p>
        <p>Take a moment to pray and ask God to reveal the deeper meaning of this scripture in your life. Write down any insights, promises, or applications that come to mind as you reflect on His word.</p>
    `;
    
    return commentary;
}

// Animate content change
function animateContentChange() {
    gsap.from('.verse-content', {
        duration: 0.6,
        x: -30,
        opacity: 0,
        ease: 'power2.out'
    });

    gsap.from('#commentaryContent', {
        duration: 0.6,
        y: 20,
        opacity: 0,
        ease: 'power2.out',
        delay: 0.2
    });
}

// Save current devotion
function saveCurrentDevotion() {
    if (!currentVerse) {
        showToast('No devotion to save');
        return;
    }

    const devotion = {
        id: Date.now(),
        date: new Date().toISOString(),
        dateString: new Date().toLocaleDateString(),
        verse: currentVerse,
        commentary: document.getElementById('commentaryContent').innerHTML
    };

    savedDevotions.unshift(devotion);
    
    // Keep only last 30 devotions
    if (savedDevotions.length > 30) {
        savedDevotions = savedDevotions.slice(0, 30);
    }
    
    try {
        localStorage.setItem('savedDevotions', JSON.stringify(savedDevotions));
        showToast('Saved to your devotions!');
    } catch (error) {
        console.error('Error saving devotion:', error);
        showToast('Error saving devotion');
    }
    
    // Animate save button
    gsap.to('#saveBtn', {
        scale: 0.9,
        duration: 0.1,
        yoyo: true,
        repeat: 1
    });
}

// Share devotion
function shareDevotion() {
    if (!currentVerse) {
        showToast('No devotion to share');
        return;
    }

    const shareText = `${currentVerse.reference}\n\n"${currentVerse.text}"\n\n- SELAH Daily Devotion`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Daily Devotion',
            text: shareText
        }).then(() => {
            showToast('Shared successfully!');
        }).catch(err => {
            if (err.name !== 'AbortError') {
                copyToClipboard(shareText);
            }
        });
    } else {
        copyToClipboard(shareText);
    }
    
    // Animate share button
    gsap.to('#shareBtn', {
        scale: 0.9,
        duration: 0.1,
        yoyo: true,
        repeat: 1
    });
}

function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Copied to clipboard!');
        }).catch(err => {
            console.error('Could not copy text:', err);
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
    }
}

function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        document.execCommand('copy');
        showToast('Copied to clipboard!');
    } catch (err) {
        console.error('Fallback copy failed:', err);
        showToast('Could not copy to clipboard');
    }
    
    document.body.removeChild(textArea);
}

// Show toast notification
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (!toast || !toastMessage) {
        console.error('Toast elements not found');
        return;
    }
    
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}