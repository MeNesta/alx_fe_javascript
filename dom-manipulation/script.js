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
    document.body.appendChild(li