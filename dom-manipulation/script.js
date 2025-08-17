// Dynamic Quote Generator JavaScript

// Initial quotes data
let quotes = [
    {
        id: 1,
        text: "The only way to do great work is to love what you do.",
        category: "Motivation",
        author: "Steve Jobs",
        timestamp: Date.now()
    },
    {
        id: 2,
        text: "Innovation distinguishes between a leader and a follower.",
        category: "Innovation",
        author: "Steve Jobs",
        timestamp: Date.now()
    },
    {
        id: 3,
        text: "Life is what happens to you while you're busy making other plans.",
        category: "Life",
        author: "John Lennon",
        timestamp: Date.now()
    },
    {
        id: 4,
        text: "The future belongs to those who believe in the beauty of their dreams.",
        category: "Dreams",
        author: "Eleanor Roosevelt",
        timestamp: Date.now()
    },
    {
        id: 5,
        text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        category: "Success",
        author: "Winston Churchill",
        timestamp: Date.now()
    }
];

let currentFilter = 'all';
let lastSyncTime = null;

// Initialize the application
function init() {
    loadQuotes();
    loadLastFilter();
    populateCategories();
    showRandomQuote();
    updateStats();
    
    // Auto-sync every 30 seconds (simulated)
    setInterval(autoSync, 30000);
}

// Load quotes from local storage
function loadQuotes() {
    const savedQuotes = localStorage.getItem('quotes');
    if (savedQuotes) {
        quotes = JSON.parse(savedQuotes);
    }
}

// Save quotes to local storage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
    updateStats();
}

// Load last selected filter from local storage
function loadLastFilter() {
    const savedFilter = localStorage.getItem('lastFilter');
    if (savedFilter) {
        currentFilter = savedFilter;
        document.getElementById('categoryFilter').value = savedFilter;
    }
}

// Save current filter to local storage
function saveLastFilter() {
    localStorage.setItem('lastFilter', currentFilter);
}

// Display a random quote (as required by the spec)
function displayRandomQuote() {
    showRandomQuote();
}

// Show a random quote based on current filter
function showRandomQuote() {
    const filteredQuotes = getFilteredQuotes();
    if (filteredQuotes.length === 0) {
        document.getElementById('quoteDisplay').innerHTML = 
            '<p>No quotes available for the selected category.</p>';
        return;
    }

    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const quote = filteredQuotes[randomIndex];
    
    // Store last viewed quote in session storage
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
    
    displayQuote(quote);
}

// Display a quote in the quote display area
function displayQuote(quote) {
    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.innerHTML = `
        <p><strong>"${quote.text}"</strong></p>
        <p><em>- ${quote.author || 'Unknown'}</em></p>
        <p><small>Category: ${quote.category}</small></p>
    `;
}

// Get filtered quotes based on current category filter
function getFilteredQuotes() {
    if (currentFilter === 'all') {
        return quotes;
    }
    return quotes.filter(quote => quote.category === currentFilter);
}

// Populate the category dropdown
function populateCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    const categories = [...new Set(quotes.map(quote => quote.category))];
    
    // Clear existing options except "All Categories"
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    
    // Add category options
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    // Restore the selected filter
    categoryFilter.value = currentFilter;
}

// Filter quotes based on selected category (singular version as required)
function filterQuote() {
    filterQuotes();
}

// Filter quotes based on selected category
function filterQuotes() {
    const categoryFilter = document.getElementById('categoryFilter');
    currentFilter = categoryFilter.value;
    saveLastFilter();
    
    // If there's a currently displayed quote, show a new one from the filtered set
    showRandomQuote();
}

// Toggle the add quote form visibility
function toggleAddQuoteForm() {
    const form = document.getElementById('addQuoteForm');
    form.classList.toggle('active');
    
    if (form.classList.contains('active')) {
        document.getElementById('newQuoteText').focus();
    } else {
        // Clear form
        document.getElementById('newQuoteText').value = '';
        document.getElementById('newQuoteCategory').value = '';
    }
}

// Add a new quote
function addQuote() {
    const text = document.getElementById('newQuoteText').value.trim();
    const category = document.getElementById('newQuoteCategory').value.trim();
    
    if (!text || !category) {
        showNotification('Please enter both quote text and category.', 'error');
        return;
    }

    const newQuote = {
        id: Date.now(),
        text: text,
        category: category,
        author: 'User',
        timestamp: Date.now()
    };

    quotes.push(newQuote);
    saveQuotes();
    populateCategories();
    toggleAddQuoteForm();
    
    showNotification('Quote added successfully!');
    
    // Show the new quote if it matches current filter
    if (currentFilter === 'all' || currentFilter === category) {
        displayQuote(newQuote);
    }
}

// Show notification message
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification active ${type}`;
    
    setTimeout(() => {
        notification.classList.remove('active');
    }, 3000);
}

// Update statistics
function updateStats() {
    document.getElementById('totalQuotes').textContent = quotes.length;
    const categories = [...new Set(quotes.map(quote => quote.category))];
    document.getElementById('totalCategories').textContent = categories.length;
}

// Export quotes to JSON file
function exportToJsonFile() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `quotes_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    showNotification('Quotes exported successfully!');
}

// Import quotes from JSON file
function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);
            
            // Validate imported data
            if (!Array.isArray(importedQuotes)) {
                throw new Error('Invalid file format');
            }
            
            // Add IDs and timestamps if missing
            importedQuotes.forEach(quote => {
                if (!quote.id) quote.id = Date.now() + Math.random();
                if (!quote.timestamp) quote.timestamp = Date.now();
                if (!quote.author) quote.author = 'Unknown';
            });
            
            // Merge with existing quotes (avoid duplicates)
            const existingTexts = new Set(quotes.map(q => q.text));
            const newQuotes = importedQuotes.filter(q => !existingTexts.has(q.text));
            
            quotes.push(...newQuotes);
            saveQuotes();
            populateCategories();
            updateStats();
            
            showNotification(`${newQuotes.length} quotes imported successfully!`);
        } catch (error) {
            showNotification('Error importing file. Please check the file format.', 'error');
        }
        
        // Reset file input
        event.target.value = '';
    };
    fileReader.readAsText(file);
}

// Simulate server sync
function syncWithServer() {
    showNotification('Syncing with server...');
    
    // Add loading state to sync button
    const syncButton = event.target;
    syncButton.classList.add('loading');
    syncButton.disabled = true;
    
    // Simulate API call delay
    setTimeout(() => {
        // Simulate receiving new quotes from server
        const serverQuotes = [
            {
                id: Date.now() + 1000,
                text: "The best time to plant a tree was 20 years ago. The second best time is now.",
                category: "Wisdom",
                author: "Chinese Proverb",
                timestamp: Date.now()
            },
            {
                id: Date.now() + 2000,
                text: "Code is like humor. When you have to explain it, it's bad.",
                category: "Programming",
                author: "Cory House",
                timestamp: Date.now()
            }
        ];
        
        // Simple conflict resolution: merge new quotes
        const existingIds = new Set(quotes.map(q => q.id));
        const newQuotes = serverQuotes.filter(q => !existingIds.has(q.id));
        
        if (newQuotes.length > 0) {
            quotes.push(...newQuotes);
            saveQuotes();
            populateCategories();
            updateStats();
            showNotification(`Sync complete! ${newQuotes.length} new quotes received.`);
        } else {
            showNotification('Sync complete! No new quotes available.');
        }
        
        lastSyncTime = new Date();
        updateSyncStatus();
        
        // Remove loading state
        syncButton.classList.remove('loading');
        syncButton.disabled = false;
    }, 1500);
}

// Auto sync (simplified version)
function autoSync() {
    // Only auto-sync if user has quotes and it's been more than 5 minutes
    if (quotes.length > 5 && (!lastSyncTime || Date.now() - lastSyncTime > 300000)) {
        console.log('Auto-syncing...');
        // In a real app, this would be a background sync
        lastSyncTime = new Date();
        updateSyncStatus();
    }
}

// Update sync status display
function updateSyncStatus() {
    const syncStatus = document.getElementById('syncStatus');
    if (lastSyncTime) {
        syncStatus.textContent = `Last sync: ${lastSyncTime.toLocaleTimeString()}`;
    }
}

// Create add quote form (as required by the spec)
function createAddQuoteForm() {
    const form = document.createElement('div');
    form.className = 'add-quote-form dynamic';
    form.innerHTML = `
        <h3>Add New Quote</h3>
        <div class="form-group">
            <input type="text" id="dynamicQuoteText" placeholder="Enter a new quote" />
        </div>
        <div class="form-group">
            <input type="text" id="dynamicQuoteCategory" placeholder="Enter quote category" />
        </div>
        <div class="form-group">
            <button onclick="addQuoteFromDynamicForm()">Add Quote</button>
            <button onclick="removeDynamicForm()">Cancel</button>
        </div>
    `;
    
    // Remove any existing dynamic forms
    removeDynamicForm();
    
    // Add the new form after the quote display
    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.parentNode.insertBefore(form, quoteDisplay.nextSibling);
    
    // Focus on the text input
    document.getElementById('dynamicQuoteText').focus();
}

// Add quote from dynamically created form
function addQuoteFromDynamicForm() {
    const text = document.getElementById('dynamicQuoteText').value.trim();
    const category = document.getElementById('dynamicQuoteCategory').value.trim();
    
    if (!text || !category) {
        showNotification('Please enter both quote text and category.', 'error');
        return;
    }

    const newQuote = {
        id: Date.now(),
        text: text,
        category: category,
        author: 'User',
        timestamp: Date.now()
    };

    quotes.push(newQuote);
    saveQuotes();
    populateCategories();
    removeDynamicForm();
    
    showNotification('Quote added successfully!');
    
    if (currentFilter === 'all' || currentFilter === category) {
        displayQuote(newQuote);
    }
}

// Remove dynamically created form
function removeDynamicForm() {
    const forms = document.querySelectorAll('.add-quote-form');
    forms.forEach(form => {
        if (form.id !== 'addQuoteForm') {
            form.remove();
        }
    });
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Handle keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.key === 'n' && e.ctrlKey) {
        e.preventDefault();
        showRandomQuote();
    }
    if (e.key === 'a' && e.ctrlKey) {
        e.preventDefault();
        toggleAddQuoteForm();
    }
    if (e.key === 'e' && e.ctrlKey) {
        e.preventDefault();
        exportToJsonFile();
    }
});

// Handle form submission with Enter key
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const activeElement = document.activeElement;
        if (activeElement.id === 'newQuoteText' || activeElement.id === 'newQuoteCategory') {
            e.preventDefault();
            addQuote();
        }
    }
});

// Utility function to generate random ID
function generateRandomId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

// Utility function to validate quote object
function isValidQuote(quote) {
    return quote && 
           typeof quote.text === 'string' && 
           typeof quote.category === 'string' && 
           quote.text.trim().length > 0 && 
           quote.category.trim().length > 0;
}

// Utility function to sanitize HTML content
function sanitizeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}