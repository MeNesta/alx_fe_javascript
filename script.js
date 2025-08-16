// Quotes array - starts with some sample quotes
let quotes = [
    {
        text: "The only way to do great work is to love what you do.",
        category: "Motivational"
    },
    {
        text: "Life is what happens to you while you're busy making other plans.",
        category: "Life"
    },
    {
        text: "The future belongs to those who believe in the beauty of their dreams.",
        category: "Dreams"
    }
];

let currentFilter = 'all';

// Initialize the app
function init() {
    loadQuotes();
    populateCategories();
    updateStats();
    loadLastFilter();
    
    // Add event listeners
    document.getElementById('newQuote').addEventListener('click', showRandomQuote);
    document.getElementById('addQuoteBtn').addEventListener('click', createAddQuoteForm);
}

// Load quotes from localStorage
function loadQuotes() {
    const savedQuotes = localStorage.getItem('quotes');
    if (savedQuotes) {
        quotes = JSON.parse(savedQuotes);
    }
}

// Save quotes to localStorage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Load last selected filter
function loadLastFilter() {
    const savedFilter = localStorage.getItem('selectedCategory');
    if (savedFilter) {
        currentFilter = savedFilter;
        document.getElementById('categoryFilter').value = savedFilter;
    }
}

// Save current filter
function saveCurrentFilter() {
    localStorage.setItem('selectedCategory', currentFilter);
}

// Populate categories dropdown
function populateCategories() {
    const categories = ['all', ...new Set(quotes.map(quote => quote.category))];
    const select = document.getElementById('categoryFilter');
    const currentValue = select.value;
    
    // Clear existing options
    select.innerHTML = '';
    
    // Add all categories
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category === 'all' ? 'All Categories' : category;
        select.appendChild(option);
    });
    
    // Restore selected value
    if (categories.includes(currentValue)) {
        select.value = currentValue;
    }
}

// Show random quote based on current filter
function showRandomQuote() {
    if (quotes.length === 0) {
        document.getElementById('quoteDisplay').innerHTML = '<div>No quotes available. Add some quotes first!</div>';
        return;
    }

    let filteredQuotes = quotes;
    if (currentFilter !== 'all') {
        filteredQuotes = quotes.filter(quote => quote.category === currentFilter);
    }

    if (filteredQuotes.length === 0) {
        document.getElementById('quoteDisplay').innerHTML = '<div>No quotes found in this category.</div>';
        return;
    }

    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const quote = filteredQuotes[randomIndex];

    document.getElementById('quoteDisplay').innerHTML = `
        <div class="quote-text">"${quote.text}"</div>
        <div class="quote-category">${quote.category}</div>
    `;
}

// Filter quotes by category
function filterQuotes() {
    currentFilter = document.getElementById('categoryFilter').value;
    saveCurrentFilter();
    showRandomQuote();
}

// Create/show add quote form
function createAddQuoteForm() {
    const form = document.getElementById('addQuoteForm');
    form.classList.add('show');
}

// Cancel adding quote
function cancelAddQuote() {
    const form = document.getElementById('addQuoteForm');
    form.classList.remove('show');
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
}

// Add new quote
function addQuote() {
    const text = document.getElementById('newQuoteText').value.trim();
    const category = document.getElementById('newQuoteCategory').value.trim();

    if (!text || !category) {
        alert('Please fill in both fields.');
        return;
    }

    // Add new quote to array
    quotes.push({
        text: text,
        category: category
    });

    // Save to localStorage
    saveQuotes();
    
    // Update UI
    populateCategories();
    updateStats();
    cancelAddQuote();
    
    alert('Quote added successfully!');
    showRandomQuote();
}

// Update statistics display
function updateStats() {
    document.getElementById('totalQuotes').textContent = quotes.length;
    document.getElementById('totalCategories').textContent = new Set(quotes.map(q => q.category)).size;
}

// Export quotes to JSON file
function exportToJson() {
    if (quotes.length === 0) {
        alert('No quotes to export.');
        return;
    }

    const dataStr = JSON.stringify(quotes, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'quotes.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('Quotes exported successfully!');
}

// Import quotes from JSON file
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);
            quotes.push(...importedQuotes);
            saveQuotes();
            populateCategories();
            updateStats();
            alert('Quotes imported successfully!');
        } catch (error) {
            alert('Error importing file. Please check the file format.');
        }
    };
    fileReader.readAsText(event.target.files[0]);
}

// Initialize app when page loads
document.addEventListener('DOMContentLoaded', init);