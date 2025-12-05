// Bible Web App - Main JavaScript
// Simple, lightweight Bible reader

class BibleApp {
    constructor() {
        // App state
        this.bibleData = null;
        this.currentBookIndex = 0;      // Genesis by default
        this.currentChapterIndex = 0;   // Chapter 1
        this.currentBook = null;
        
        // DOM Elements
        this.bookSelect = document.getElementById('book-select');
        this.chapterSelect = document.getElementById('chapter-select');
        this.textDisplay = document.getElementById('text-display');
        this.currentBookElement = document.getElementById('current-book');
        this.currentChapterElement = document.getElementById('current-chapter');
        this.verseCountElement = document.getElementById('verse-count');
        
        // Navigation buttons
        this.prevButtons = document.querySelectorAll('#prev-chapter, #prev-bottom');
        this.nextButtons = document.querySelectorAll('#next-chapter, #next-bottom');
        
        // Initialize
        this.init();
    }
    
    async init() {
        try {
            // Load Bible data
            await this.loadBibleData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize UI
            this.populateBookDropdown();
            this.loadCurrentChapter();
            
            console.log('Bible App initialized successfully!');
        } catch (error) {
            console.error('Failed to initialize Bible App:', error);
            this.textDisplay.innerHTML = `
                <p style="color: #e74c3c; text-align: center; padding: 40px;">
                    <i class="fas fa-exclamation-triangle"></i><br>
                    Error loading Bible data.<br>
                    Please check if bible.json is in the correct location.
                </p>
            `;
        }
    }
    
    async loadBibleData() {
        // Load the Bible JSON file
        const response = await fetch('https://skadigitalhub.github.io/NKJVBible/bible-kjv.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        this.bibleData = await response.json();
        
        // Set initial current book
        this.currentBook = this.bibleData[this.currentBookIndex];
    }
    
    populateBookDropdown() {
        // Clear loading message
        this.bookSelect.innerHTML = '';
        
        // Add each book to dropdown
        this.bibleData.forEach((book, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = book.name;
            this.bookSelect.appendChild(option);
        });
        
        // Set initial selection
        this.bookSelect.value = this.currentBookIndex;
    }
    
    populateChapterDropdown() {
        // Clear previous chapters
        this.chapterSelect.innerHTML = '';
        
        if (!this.currentBook) return;
        
        // Add chapters for current book
        const chapterCount = this.currentBook.chapters.length;
        
        for (let i = 0; i < chapterCount; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Chapter ${i + 1}`;
            this.chapterSelect.appendChild(option);
        }
        
        // Set current chapter
        this.chapterSelect.value = this.currentChapterIndex;
    }
    
    updateCurrentLocationDisplay() {
        if (!this.currentBook) return;
        
        // Update header display
        this.currentBookElement.textContent = this.currentBook.name;
        this.currentChapterElement.textContent = `Chapter ${this.currentChapterIndex + 1}`;
        
        // Update footer verse count
        const currentChapter = this.currentBook.chapters[this.currentChapterIndex];
        if (currentChapter) {
            this.verseCountElement.textContent = currentChapter.length;
        }
    }
    
    loadCurrentChapter() {
        if (!this.currentBook) return;
        
        // Get current chapter data
        const chapter = this.currentBook.chapters[this.currentChapterIndex];
        
        if (!chapter || chapter.length === 0) {
            this.textDisplay.innerHTML = '<p>No text available for this chapter.</p>';
            return;
        }
        
        // Clear previous text
        this.textDisplay.innerHTML = '';
        
        // Display each verse
        chapter.forEach((verseText, verseIndex) => {
            const verseElement = document.createElement('div');
            verseElement.className = 'verse';
            
            // Add verse number (small, subtle)
            const verseNum = document.createElement('span');
            verseNum.className = 'verse-num';
            verseNum.textContent = verseIndex + 1;
            
            // Add verse text
            const textSpan = document.createElement('span');
            textSpan.textContent = verseText;
            
            // Assemble verse
            verseElement.appendChild(verseNum);
            verseElement.appendChild(textSpan);
            
            this.textDisplay.appendChild(verseElement);
        });
        
        // Update chapter dropdown
        this.populateChapterDropdown();
        
        // Update location display
        this.updateCurrentLocationDisplay();
        
        // Update navigation buttons state
        this.updateNavigationButtons();
    }
    
    updateNavigationButtons() {
        if (!this.currentBook) return;
        
        const totalChapters = this.currentBook.chapters.length;
        
        // Previous buttons - disabled if on first chapter
        const prevDisabled = this.currentChapterIndex === 0;
        this.prevButtons.forEach(btn => {
            btn.disabled = prevDisabled;
        });
        
        // Next buttons - disabled if on last chapter
        const nextDisabled = this.currentChapterIndex === totalChapters - 1;
        this.nextButtons.forEach(btn => {
            btn.disabled = nextDisabled;
        });
    }
    
    goToPrevChapter() {
        if (this.currentChapterIndex > 0) {
            this.currentChapterIndex--;
            this.loadCurrentChapter();
        }
    }
    
    goToNextChapter() {
        if (this.currentBook && 
            this.currentChapterIndex < this.currentBook.chapters.length - 1) {
            this.currentChapterIndex++;
            this.loadCurrentChapter();
        }
    }
    
    goToBook(bookIndex) {
        if (bookIndex >= 0 && bookIndex < this.bibleData.length) {
            this.currentBookIndex = bookIndex;
            this.currentBook = this.bibleData[bookIndex];
            this.currentChapterIndex = 0; // Reset to first chapter
            this.loadCurrentChapter();
        }
    }
    
    goToChapter(chapterIndex) {
        if (this.currentBook && 
            chapterIndex >= 0 && 
            chapterIndex < this.currentBook.chapters.length) {
            this.currentChapterIndex = chapterIndex;
            this.loadCurrentChapter();
        }
    }
    
    setupEventListeners() {
        // Book dropdown change
        this.bookSelect.addEventListener('change', (e) => {
            const bookIndex = parseInt(e.target.value);
            if (!isNaN(bookIndex)) {
                this.goToBook(bookIndex);
            }
        });
        
        // Chapter dropdown change
        this.chapterSelect.addEventListener('change', (e) => {
            const chapterIndex = parseInt(e.target.value);
            if (!isNaN(chapterIndex)) {
                this.goToChapter(chapterIndex);
            }
        });
        
        // Previous chapter buttons
        this.prevButtons.forEach(button => {
            button.addEventListener('click', () => this.goToPrevChapter());
        });
        
        // Next chapter buttons
        this.nextButtons.forEach(button => {
            button.addEventListener('click', () => this.goToNextChapter());
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Left arrow or comma for previous chapter
            if (e.key === 'ArrowLeft' || e.key === ',') {
                if (!e.target.matches('select, input, textarea')) {
                    this.goToPrevChapter();
                }
            }
            // Right arrow or period for next chapter
            else if (e.key === 'ArrowRight' || e.key === '.') {
                if (!e.target.matches('select, input, textarea')) {
                    this.goToNextChapter();
                }
            }
        });
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new BibleApp();
    
    // Make app globally accessible for debugging (optional)
    window.bibleApp = app;
});