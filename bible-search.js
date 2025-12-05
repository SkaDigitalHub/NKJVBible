// bible-search.js
let bibleData = null;
let searchIndex = null;

// Initialize when page loads
window.addEventListener('DOMContentLoaded', async () => {
    await loadBibleData();
    setupSearch();
});

// Load the Bible data
async function loadBibleData() {
    try {
        const loadingEl = document.getElementById('stats');
        loadingEl.textContent = 'Loading Bible data...';
        
        const response = await fetch('bible-kjv.json');
        
        if (!response.ok) {
            throw new Error(`Failed to load Bible data: ${response.status}`);
        }
        
        bibleData = await response.json();
        
        // Update stats
        const statsEl = document.getElementById('stats');
        statsEl.textContent = `Loaded ${bibleData.length.toLocaleString()} verses. Start typing to search!`;
        
        console.log(`Loaded ${bibleData.length} verses`);
        
        // Build search index for faster searching
        buildSearchIndex();
        
    } catch (error) {
        console.error('Error loading Bible data:', error);
        document.getElementById('stats').textContent = 
            'Error loading Bible data. Please check console.';
    }
}

// Build a simple search index
function buildSearchIndex() {
    console.log('Building search index...');
    searchIndex = new Map();
    
    // Index each verse by its words
    bibleData.forEach((verse, index) => {
        const words = verse.text.toLowerCase().match(/\b\w+\b/g) || [];
        
        words.forEach(word => {
            if (word.length > 2) { // Ignore short words
                if (!searchIndex.has(word)) {
                    searchIndex.set(word, []);
                }
                searchIndex.get(word).push(index);
            }
        });
    });
    
    console.log(`Index built with ${searchIndex.size} unique words`);
}

// Setup search functionality
function setupSearch() {
    const searchBox = document.getElementById('search-box');
    let searchTimeout = null;
    
    searchBox.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        // Clear previous timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        // If empty query
        if (!query) {
            document.getElementById('stats').textContent = 
                `Loaded ${bibleData.length.toLocaleString()} verses. Start typing to search!`;
            document.getElementById('results-container').innerHTML = '';
            return;
        }
        
        // Show searching message
        document.getElementById('stats').textContent = `Searching for "${query}"...`;
        
        // Debounce search (wait 300ms after typing stops)
        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, 300);
    });
}

// Perform the actual search
function performSearch(query) {
    if (!bibleData) {
        document.getElementById('stats').textContent = 'Bible data not loaded yet.';
        return;
    }
    
    const startTime = performance.now();
    const searchTerm = query.toLowerCase().trim();
    const results = [];
    
    // STRATEGY 1: Use index for faster search (if available)
    if (searchIndex && searchTerm.length > 2) {
        const words = searchTerm.split(/\s+/);
        
        // Find verses containing ALL words
        const verseIndices = new Map();
        
        words.forEach(word => {
            if (searchIndex.has(word)) {
                searchIndex.get(word).forEach(index => {
                    verseIndices.set(index, (verseIndices.get(index) || 0) + 1);
                });
            }
        });
        
        // Get verses that contain all search words
        verseIndices.forEach((wordCount, index) => {
            if (wordCount === words.length) {
                results.push(bibleData[index]);
            }
        });
        
    } else {
        // STRATEGY 2: Simple linear search (works for all queries)
        bibleData.forEach(verse => {
            if (verse.text.toLowerCase().includes(searchTerm)) {
                results.push(verse);
            }
        });
    }
    
    const endTime = performance.now();
    const searchTime = (endTime - startTime).toFixed(2);
    
    // Update stats
    const statsEl = document.getElementById('stats');
    statsEl.textContent = `Found ${results.length.toLocaleString()} results for "${query}" in ${searchTime}ms`;
    
    // Display results
    displayResults(results, query);
}

// Display search results
function displayResults(results, query) {
    const container = document.getElementById('results-container');
    
    if (results.length === 0) {
        container.innerHTML = `
            <div class="result">
                <div class="reference">No results found</div>
                <div class="verse">No verses found containing "${query}"</div>
            </div>
        `;
        return;
    }
    
    // Sort by book order
    const bookOrder = {
        "Genesis": 1, "Exodus": 2, "Leviticus": 3, "Numbers": 4, "Deuteronomy": 5,
        "Joshua": 6, "Judges": 7, "Ruth": 8, "1 Samuel": 9, "2 Samuel": 10,
        "1 Kings": 11, "2 Kings": 12, "1 Chronicles": 13, "2 Chronicles": 14,
        "Ezra": 15, "Nehemiah": 16, "Esther": 17, "Job": 18, "Psalms": 19,
        "Proverbs": 20, "Ecclesiastes": 21, "Song of Solomon": 22, "Isaiah": 23,
        "Jeremiah": 24, "Lamentations": 25, "Ezekiel": 26, "Daniel": 27,
        "Hosea": 28, "Joel": 29, "Amos": 30, "Obadiah": 31, "Jonah": 32,
        "Micah": 33, "Nahum": 34, "Habakkuk": 35, "Zephaniah": 36, "Haggai": 37,
        "Zechariah": 38, "Malachi": 39, "Matthew": 40, "Mark": 41, "Luke": 42,
        "John": 43, "Acts": 44, "Romans": 45, "1 Corinthians": 46, "2 Corinthians": 47,
        "Galatians": 48, "Ephesians": 49, "Philippians": 50, "Colossians": 51,
        "1 Thessalonians": 52, "2 Thessalonians": 53, "1 Timothy": 54, "2 Timothy": 55,
        "Titus": 56, "Philemon": 57, "Hebrews": 58, "James": 59, "1 Peter": 60,
        "2 Peter": 61, "1 John": 62, "2 John": 63, "3 John": 64, "Jude": 65,
        "Revelation": 66
    };
    
    results.sort((a, b) => {
        if (bookOrder[a.book] !== bookOrder[b.book]) {
            return bookOrder[a.book] - bookOrder[b.book];
        }
        if (a.chapter !== b.chapter) {
            return a.chapter - b.chapter;
        }
        return a.verse - b.verse;
    });
    
    // Limit to 500 results for performance
    const displayResults = results.slice(0, 500);
    
    // Generate HTML
    let html = '';
    displayResults.forEach(verse => {
        // Highlight search terms in verse text
        let highlightedText = verse.text;
        const regex = new RegExp(`(${query})`, 'gi');
        highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
        
        html += `
            <div class="result">
                <div class="reference">${verse.book} ${verse.chapter}:${verse.verse}</div>
                <div class="verse">${highlightedText}</div>
            </div>
        `;
    });
    
    // Show "more results" message if we limited
    if (results.length > 500) {
        html += `
            <div class="result">
                <div class="reference">Results limited</div>
                <div class="verse">Showing 500 of ${results.length} results. Try a more specific search.</div>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

// Add to bible-search.js

// Advanced search with filters
function advancedSearch(query, options = {}) {
    const {
        book = null,
        testament = null, // 'old' or 'new'
        minChapter = 1,
        maxChapter = 150
    } = options;
    
    const searchTerm = query.toLowerCase();
    const results = [];
    
    bibleData.forEach(verse => {
        // Apply filters
        if (book && verse.book !== book) return;
        if (testament) {
            const isNewTestament = bookOrder[verse.book] >= 40;
            if (testament === 'new' && !isNewTestament) return;
            if (testament === 'old' && isNewTestament) return;
        }
        if (verse.chapter < minChapter || verse.chapter > maxChapter) return;
        
        // Search in text
        if (verse.text.toLowerCase().includes(searchTerm)) {
            results.push(verse);
        }
    });
    
    return results;
}

// Book/chapter selector
function addBookSelector() {
    const books = [...new Set(bibleData.map(v => v.book))];
    
    const selector = document.createElement('select');
    selector.id = 'book-selector';
    selector.innerHTML = `
        <option value="">All Books</option>
        ${books.map(book => `<option value="${book}">${book}</option>`).join('')}
    `;
    
    selector.addEventListener('change', () => {
        const book = selector.value;
        const query = document.getElementById('search-box').value;
        
        if (query) {
            const results = advancedSearch(query, { book });
            displayResults(results, query);
        }
    });
    
    document.getElementById('search-box').insertAdjacentElement('afterend', selector);
}

// Save search history
function saveToHistory(query, results) {
    const history = JSON.parse(localStorage.getItem('bibleSearchHistory') || '[]');
    
    history.unshift({
        query,
        count: results.length,
        timestamp: new Date().toISOString()
    });
    
    // Keep only last 50 searches
    localStorage.setItem('bibleSearchHistory', JSON.stringify(history.slice(0, 50)));
}
