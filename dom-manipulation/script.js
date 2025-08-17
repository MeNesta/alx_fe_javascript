// Default quotes for initial setup
        const defaultQuotes = [
            {
                text: "The only way to do great work is to love what you do.",
                category: "motivation"
            },
            {
                text: "Life is what happens to you while you're busy making other plans.",
                category: "life"
            },
            {
                text: "The future belongs to those who believe in the beauty of their dreams.",
                category: "dreams"
            },
            {
                text: "It is during our darkest moments that we must focus to see the light.",
                category: "inspiration"
            },
            {
                text: "The way to get started is to quit talking and begin doing.",
                category: "motivation"
            },
            {
                text: "Don't let yesterday take up too much of today.",
                category: "life"
            },
            {
                text: "You learn more from failure than from success. Don't let it stop you. Failure builds character.",
                category: "wisdom"
            },
            {
                text: "If you are working on something that you really care about, you don't have to be pushed. The vision pulls you.",
                category: "passion"
            },
            {
                text: "Innovation distinguishes between a leader and a follower.",
                category: "leadership"
            },
            {
                text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
                category: "perseverance"
            }
        ];

        // Load quotes from localStorage or use defaults
        let quotes = loadQuotes();

        // Current filter category (null means show all)
        let currentFilter = loadSessionPreference('currentFilter');

        // Storage keys
        const STORAGE_KEYS = {
            QUOTES: 'quoteGenerator_quotes',
            PREFERENCES: 'quoteGenerator_preferences',
            LAST_QUOTE: 'quoteGenerator_lastQuote'
        };

        // ===== WEB STORAGE FUNCTIONS =====

        // Save quotes to localStorage
        function saveQuotes() {
            try {
                const quotesJson = JSON.stringify(quotes);
                localStorage.setItem(STORAGE_KEYS.QUOTES, quotesJson);
                updateStorageInfo();
                console.log('Quotes saved to localStorage:', quotes.length);
            } catch (error) {
                console.error('Error saving quotes to localStorage:', error);
                showMessage('Error saving data to local storage.', 'error');
            }
        }

        // Load quotes from localStorage
        function loadQuotes() {
            try {
                const savedQuotes = localStorage.getItem(STORAGE_KEYS.QUOTES);
                if (savedQuotes) {
                    const parsedQuotes = JSON.parse(savedQuotes);
                    console.log('Quotes loaded from localStorage:', parsedQuotes.length);
                    return Array.isArray(parsedQuotes) ? parsedQuotes : defaultQuotes;
                }
            } catch (error) {
                console.error('Error loading quotes from localStorage:', error);
                showMessage('Error loading data from local storage. Using defaults.', 'error');
            }
            return [...defaultQuotes];
        }

        // Save user preferences to sessionStorage
        function saveSessionPreference(key, value) {
            try {
                sessionStorage.setItem(key, JSON.stringify(value));
            } catch (error) {
                console.error('Error saving to sessionStorage:', error);
            }
        }

        // Load user preferences from sessionStorage
        function loadSessionPreference(key) {
            try {
                const saved = sessionStorage.getItem(key);
                return saved ? JSON.parse(saved) : null;
            } catch (error) {
                console.error('Error loading from sessionStorage:', error);
                return null;
            }
        }

        // Save last viewed quote to sessionStorage
        function saveLastQuote(quote) {
            saveSessionPreference(STORAGE_KEYS.LAST_QUOTE, {
                quote: quote,
                timestamp: Date.now()
            });
        }

        // ===== JSON IMPORT/EXPORT FUNCTIONS =====

        // Export quotes to JSON file
        function exportToJson() {
            try {
                const dataToExport = {
                    quotes: quotes,
                    exportDate: new Date().toISOString(),
                    version: "1.0",
                    totalQuotes: quotes.length
                };

                const jsonString = JSON.stringify(dataToExport, null, 2);
                const blob = new Blob([jsonString], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                
                const downloadLink = document.createElement('a');
                downloadLink.href = url;
                downloadLink.download = `quotes_export_${new Date().toISOString().split('T')[0]}.json`;
                
                // Trigger download
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                
                // Clean up the URL object
                URL.revokeObjectURL(url);
                
                showMessage(`Successfully exported ${quotes.length} quotes!`, 'success');
                console.log('Quotes exported successfully');
                
            } catch (error) {
                console.error('Error exporting quotes:', error);
                showMessage('Error exporting quotes. Please try again.', 'error');
            }
        }

        // Import quotes from JSON file
        function importFromJsonFile(event) {
            const file = event.target.files[0];
            if (!file) return;

            if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
                showMessage('Please select a valid JSON file.', 'error');
                return;
            }

            const fileReader = new FileReader();
            
            fileReader.onload = function(event) {
                try {
                    const fileContent = event.target.result;
                    let importedData;
                    
                    try {
                        importedData = JSON.parse(fileContent);
                    } catch (parseError) {
                        throw new Error('Invalid JSON format');
                    }
                    
                    // Handle different import formats
                    let importedQuotes = [];
                    
                    if (Array.isArray(importedData)) {
                        // Direct array of quotes
                        importedQuotes = importedData;
                    } else if (importedData.quotes && Array.isArray(importedData.quotes)) {
                        // Structured export format
                        importedQuotes = importedData.quotes;
                    } else {
                        throw new Error('No valid quotes array found in file');
                    }
                    
                    // Validate quote objects
                    const validQuotes = importedQuotes.filter(quote => 
                        quote && 
                        typeof quote === 'object' && 
                        typeof quote.text === 'string' && 
                        typeof quote.category === 'string' &&
                        quote.text.trim() !== '' &&
                        quote.category.trim() !== ''
                    );
                    
                    if (validQuotes.length === 0) {
                        throw new Error('No valid quotes found in file');
                    }
                    
                    // Add imported quotes
                    const beforeCount = quotes.length;
                    quotes.push(...validQuotes);
                    
                    // Remove duplicates based on text content
                    quotes = quotes.filter((quote, index, self) => 
                        index === self.findIndex(q => q.text.trim().toLowerCase() === quote.text.trim().toLowerCase())
                    );
                    
                    const addedCount = quotes.length - beforeCount;
                    const duplicatesRemoved = validQuotes.length - addedCount;
                    
                    // Save to localStorage and update UI
                    saveQuotes();
                    updateCategoryFilter();
                    updateStats();
                    
                    let message = `Successfully imported ${addedCount} quotes!`;
                    if (duplicatesRemoved > 0) {
                        message += ` (${duplicatesRemoved} duplicates removed)`;
                    }
                    
                    showMessage(message, 'success');
                    console.log('Import successful:', { addedCount, duplicatesRemoved });
                    
                } catch (error) {
                    console.error('Error importing quotes:', error);
                    showMessage(`Import failed: ${error.message}`, 'error');
                }
                
                // Reset file input
                event.target.value = '';
            };
            
            fileReader.onerror = function() {
                showMessage('Error reading file. Please try again.', 'error');
                event.target.value = '';
            };
            
            fileReader.readAsText(file);
        }

        // ===== DATA MANAGEMENT FUNCTIONS =====

        // Clear all data
        function clearAllData() {
            if (confirm('Are you sure you want to clear all quotes? This action cannot be undone.')) {
                quotes = [];
                localStorage.removeItem(STORAGE_KEYS.QUOTES);
                sessionStorage.clear();
                currentFilter = null;
                
                updateCategoryFilter();
                updateStats();
                updateStorageInfo();
                
                const quoteDisplay = document.getElementById('quoteDisplay');
                quoteDisplay.innerHTML = '<div class="empty-state">All quotes cleared. Add new quotes to get started!</div>';
                
                showMessage('All data cleared successfully!', 'success');
            }
        }

        // Reset to default quotes
        function resetToDefaults() {
            if (confirm('Reset to default quotes? This will replace all current quotes.')) {
                quotes = [...defaultQuotes];
                saveQuotes();
                currentFilter = null;
                
                updateCategoryFilter();
                updateStats();
                showRandomQuote();
                
                showMessage('Reset to default quotes successfully!', 'success');
            }
        }

        // ===== UI HELPER FUNCTIONS =====

        // Show success/error messages
        function showMessage(message, type = 'success') {
            const existingMessage = document.querySelector('.success-message, .error-message');
            if (existingMessage) {
                existingMessage.remove();
            }
            
            const messageDiv = document.createElement('div');
            messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
            messageDiv.textContent = message;
            
            const container = document.querySelector('.container');
            container.insertBefore(messageDiv, container.firstChild.nextSibling);
            
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, 5000);
        }

        // Update storage information display
        function updateStorageInfo() {
            const storageInfo = document.getElementById('storageInfo');
            const quotesSize = localStorage.getItem(STORAGE_KEYS.QUOTES)?.length || 0;
            const sessionData = Object.keys(sessionStorage).length;
            
            storageInfo.innerHTML = `
                <div><strong>Storage Info:</strong></div>
                <div>LocalStorage: ${(quotesSize / 1024).toFixed(2)} KB used | Session Data: ${sessionData} items</div>
                <div>Last Updated: ${new Date().toLocaleString()}</div>
            `;
        }

        // Function to display a random quote and update the DOM
        function showRandomQuote() {
            const quoteDisplay = document.getElementById('quoteDisplay');
            
            if (quotes.length === 0) {
                quoteDisplay.innerHTML = '<div class="empty-state">No quotes available. Add some quotes to get started!</div>';
                return;
            }

            // Filter quotes based on current category filter
            let availableQuotes = currentFilter 
                ? quotes.filter(quote => quote.category.toLowerCase() === currentFilter.toLowerCase())
                : quotes;

            if (availableQuotes.length === 0) {
                quoteDisplay.innerHTML = `<div class="empty-state">No quotes found in "${currentFilter}" category.</div>`;
                return;
            }

            // Select a random quote from available quotes
            const randomIndex = Math.floor(Math.random() * availableQuotes.length);
            const selectedQuote = availableQuotes[randomIndex];

            // Save last viewed quote to session storage
            saveLastQuote(selectedQuote);

            // Create and update DOM elements
            quoteDisplay.innerHTML = '';
            quoteDisplay.className = 'fade-in';
            
            const quoteTextElement = document.createElement('div');
            quoteTextElement.className = 'quote-text';
            quoteTextElement.textContent = selectedQuote.text;
            
            const quoteCategoryElement = document.createElement('div');
            quoteCategoryElement.className = 'quote-category';
            quoteCategoryElement.textContent = `— ${selectedQuote.category} —`;
            
            quoteDisplay.appendChild(quoteTextElement);
            quoteDisplay.appendChild(quoteCategoryElement);

            // Update statistics
            updateStats();
        }

        // Function to add a new quote to the quotes array and update the DOM
        function addQuote() {
            const newQuoteText = document.getElementById('newQuoteText');
            const newQuoteCategory = document.getElementById('newQuoteCategory');
            
            const quoteText = newQuoteText.value.trim();
            const quoteCategory = newQuoteCategory.value.trim();
            
            // Validate input
            if (!quoteText || !quoteCategory) {
                showMessage('Please enter both a quote and a category.', 'error');
                return;
            }

            // Check for duplicates
            const isDuplicate = quotes.some(quote => 
                quote.text.trim().toLowerCase() === quoteText.toLowerCase()
            );

            if (isDuplicate) {
                showMessage('This quote already exists.', 'error');
                return;
            }

            // Create new quote object
            const newQuote = {
                text: quoteText,
                category: quoteCategory.toLowerCase()
            };

            // Add to quotes array
            quotes.push(newQuote);

            // Save to localStorage
            saveQuotes();

            // Clear input fields
            newQuoteText.value = '';
            newQuoteCategory.value = '';

            // Update the DOM
            updateCategoryFilter();
            updateStats();

            // Show success feedback
            const addButton = event.target;
            const originalText = addButton.textContent;
            addButton.textContent = 'Quote Added!';
            addButton.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
            
            setTimeout(() => {
                addButton.textContent = originalText;
                addButton.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            }, 2000);

            // Optionally show the newly added quote
            currentFilter = newQuote.category;
            saveSessionPreference('currentFilter', currentFilter);
            updateCategoryFilter();
            showRandomQuote();

            showMessage('Quote added successfully!', 'success');
        }

        // Function to create and manage category filter buttons
        function updateCategoryFilter() {
            const categoryFilter = document.getElementById('categoryFilter');
            
            // Get unique categories
            const categories = [...new Set(quotes.map(quote => quote.category))];
            
            // Clear existing buttons
            categoryFilter.innerHTML = '';
            
            // Add "All Categories" button
            const allButton = document.createElement('button');
            allButton.className = 'category-btn' + (currentFilter === null ? ' active' : '');
            allButton.textContent = 'All Categories';
            allButton.onclick = () => {
                currentFilter = null;
                saveSessionPreference('currentFilter', currentFilter);
                updateCategoryFilter();
                showRandomQuote();
            };
            categoryFilter.appendChild(allButton);
            
            // Add category buttons
            categories.forEach(category => {
                const button = document.createElement('button');
                button.className = 'category-btn' + (currentFilter === category ? ' active' : '');
                button.textContent = category.charAt(0).toUpperCase() + category.slice(1);
                button.onclick = () => {
                    currentFilter = category;
                    saveSessionPreference('currentFilter', currentFilter);
                    updateCategoryFilter();
                    showRandomQuote();
                };
                categoryFilter.appendChild(button);
            });
        }

        // Function to update statistics display
        function updateStats() {
            const statsElement = document.getElementById('stats');
            const totalQuotes = quotes.length;
            const categories = new Set(quotes.map(quote => quote.category)).size;
            
            statsElement.innerHTML = `
                <div>Total Quotes: ${totalQuotes} | Categories: ${categories}</div>
            `;
        }

        // Function to create add quote form (as mentioned in requirements)
        function createAddQuoteForm() {
            // This function demonstrates how the form could be created dynamically
            // The form is already present in HTML, but here's how it could be created via DOM manipulation
            
            const container = document.querySelector('.container');
            
            // Check if form already exists
            if (document.querySelector('.dynamic-add-quote-section')) {
                return;
            }
            
            const addQuoteSection = document.createElement('div');
            addQuoteSection.className = 'add-quote-section dynamic-add-quote-section';
            
            const title = document.createElement('h3');
            title.textContent = 'Add Your Own Quote (Dynamically Created)';
            
            const formGroup = document.createElement('div');
            formGroup.className = 'form-group';
            
            const textInput = document.createElement('input');
            textInput.type = 'text';
            textInput.id = 'dynamicQuoteText';
            textInput.placeholder = 'Enter a new quote';
            
            const categoryInput = document.createElement('input');
            categoryInput.type = 'text';
            categoryInput.id = 'dynamicQuoteCategory';
            categoryInput.placeholder = 'Enter quote category';
            
            const addButton = document.createElement('button');
            addButton.textContent = 'Add Quote';
            addButton.onclick = () => {
                const text = textInput.value.trim();
                const category = categoryInput.value.trim();
                
                if (text && category) {
                    quotes.push({ text, category: category.toLowerCase() });
                    saveQuotes();
                    textInput.value = '';
                    categoryInput.value = '';
                    updateCategoryFilter();
                    updateStats();
                    
                    addButton.textContent = 'Quote Added!';
                    setTimeout(() => {
                        addButton.textContent = 'Add Quote';
                    }, 2000);
                }
            };
            
            formGroup.appendChild(textInput);
            formGroup.appendChild(categoryInput);
            formGroup.appendChild(addButton);
            
            addQuoteSection.appendChild(title);
            addQuoteSection.appendChild(formGroup);
            
            container.appendChild(addQuoteSection);
        }

        // Event listener on the "Show New Quote" button
        document.addEventListener('DOMContentLoaded', function() {
            const newQuoteButton = document.getElementById('newQuote');
            
            // Add event listener to the "Show New Quote" button
            newQuoteButton.addEventListener('click', showRandomQuote);
            
            // Initialize the application
            updateCategoryFilter();
            updateStats();
            updateStorageInfo();
            
            // Load last viewed quote if available
            const lastQuoteData = loadSessionPreference(STORAGE_KEYS.LAST_QUOTE);
            if (lastQuoteData && lastQuoteData.quote) {
                const timeDiff = Date.now() - lastQuoteData.timestamp;
                // Show last quote if viewed within the last hour
                if (timeDiff < 3600000) {
                    const quoteDisplay = document.getElementById('quoteDisplay');
                    const quote = lastQuoteData.quote;
                    
                    const quoteTextElement = document.createElement('div');
                    quoteTextElement.className = 'quote-text';
                    quoteTextElement.textContent = quote.text;
                    
                    const quoteCategoryElement = document.createElement('div');
                    quoteCategoryElement.className = 'quote-category';
                    quoteCategoryElement.textContent = `— ${quote.category} —`;
                    
                    quoteDisplay.innerHTML = '';
                    quoteDisplay.appendChild(quoteTextElement);
                    quoteDisplay.appendChild(quoteCategoryElement);
                }
            }
            
            // Add event listeners for Enter key on input fields
            document.getElementById('newQuoteText').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    document.getElementById('newQuoteCategory').focus();
                }
            });
            
            document.getElementById('newQuoteCategory').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    addQuote();
                }
            });
            
            // Add warning class to dangerous buttons
            const clearButton = document.querySelector('button[onclick="clearAllData()"]');
            if (clearButton) {
                clearButton.classList.add('warning-btn');
            }
            
            console.log('Dynamic Quote Generator with Web Storage initialized');
            console.log('Quotes array contains:', quotes.length, 'quotes');
            console.log('Available functions: showRandomQuote, addQuote, exportToJson, importFromJsonFile, clearAllData, resetToDefaults');
        });

        // Additional DOM manipulation demonstration
        function demonstrateAdvancedDOMManipulation() {
            // This function showcases various DOM manipulation techniques
            
            // 1. Creating elements programmatically
            const demo = document.createElement('div');
            demo.style.cssText = 'padding: 10px; background: #f0f0f0; margin: 10px 0; border-radius: 5px;';
            
            // 2. Setting attributes and properties
            demo.setAttribute('data-demo', 'advanced-dom');
            demo.className = 'demo-section';
            
            // 3. Adding event listeners
            demo.addEventListener('click', function() {
                this.style.background = this.style.background === 'rgb(240, 240, 240)' ? '#e0e0e0' : '#f0f0f0';
            });
            
            // 4. Manipulating text and HTML content
            demo.innerHTML = '<strong>Advanced DOM Demo:</strong> Click me to change background!';
            
            // 5. Inserting into the DOM
            const container = document.querySelector('.container');
            container.appendChild(demo);
            
            // 6. Querying and modifying existing elements
            const quoteDisplay = document.querySelector('#quoteDisplay');
            if (quoteDisplay) {
                // Store original styles
                const originalBackground = quoteDisplay.style.background;
                
                // Temporarily modify styles
                setTimeout(() => {
                    quoteDisplay.style.background = 'linear-gradient(45deg, #ff6b6b, #feca57)';
                    setTimeout(() => {
                        quoteDisplay.style.background = originalBackground;
                    }, 2000);
                }, 1000);
            }
        }

        // Expose functions globally for testing and demonstration
        window.quoteApp = {
            quotes,
            showRandomQuote,
            addQuote,
            createAddQuoteForm,
            demonstrateAdvancedDOMManipulation,
            exportToJson,
            importFromJsonFile,
            clearAllData,
            resetToDefaults,
            saveQuotes,
            loadQuotes
        };
    </script> {
                quoteDisplay.innerHTML = `<div class="empty-state">No quotes found in "${currentFilter}" category.</div>`;
                return;
            }

            // Select a random quote from available quotes
            const randomIndex = Math.floor(Math.random() * availableQuotes.length);
            const selectedQuote = availableQuotes[randomIndex];

            // Create and update DOM elements
            quoteDisplay.innerHTML = '';
            quoteDisplay.className = 'fade-in';
            
            const quoteTextElement = document.createElement('div');
            quoteTextElement.className = 'quote-text';
            quoteTextElement.textContent = selectedQuote.text;
            
            const quoteCategoryElement = document.createElement('div');
            quoteCategoryElement.className = 'quote-category';
            quoteCategoryElement.textContent = `— ${selectedQuote.category} —`;
            
            quoteDisplay.appendChild(quoteTextElement);
            quoteDisplay.appendChild(quoteCategoryElement);

            // Update statistics
            updateStats();
        }

        // Function to add a new quote to the quotes array and update the DOM
        function addQuote() {
            const newQuoteText = document.getElementById('newQuoteText');
            const newQuoteCategory = document.getElementById('newQuoteCategory');
            
            const quoteText = newQuoteText.value.trim();
            const quoteCategory = newQuoteCategory.value.trim();
            
            // Validate input
            if (!quoteText || !quoteCategory) {
                alert('Please enter both a quote and a category.');
                return;
            }

            // Create new quote object
            const newQuote = {
                text: quoteText,
                category: quoteCategory.toLowerCase()
            };

            // Add to quotes array
            quotes.push(newQuote);

            // Clear input fields
            newQuoteText.value = '';
            newQuoteCategory.value = '';

            // Update the DOM
            updateCategoryFilter();
            updateStats();

            // Show success feedback
            const addButton = event.target;
            const originalText = addButton.textContent;
            addButton.textContent = 'Quote Added!';
            addButton.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
            
            setTimeout(() => {
                addButton.textContent = originalText;
                addButton.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            }, 2000);

            // Optionally show the newly added quote
            currentFilter = newQuote.category;
            updateCategoryFilter();
            showRandomQuote();
        }

        // Function to create and manage category filter buttons
        function updateCategoryFilter() {
            const categoryFilter = document.getElementById('categoryFilter');
            
            // Get unique categories
            const categories = [...new Set(quotes.map(quote => quote.category))];
            
            // Clear existing buttons
            categoryFilter.innerHTML = '';
            
            // Add "All Categories" button
            const allButton = document.createElement('button');
            allButton.className = 'category-btn' + (currentFilter === null ? ' active' : '');
            allButton.textContent = 'All Categories';
            allButton.onclick = () => {
                currentFilter = null;
                updateCategoryFilter();
                showRandomQuote();
            };
            categoryFilter.appendChild(allButton);
            
            // Add category buttons
            categories.forEach(category => {
                const button = document.createElement('button');
                button.className = 'category-btn' + (currentFilter === category ? ' active' : '');
                button.textContent = category.charAt(0).toUpperCase() + category.slice(1);
                button.onclick = () => {
                    currentFilter = category;
                    updateCategoryFilter();
                    showRandomQuote();
                };
                categoryFilter.appendChild(button);
            });
        }

        // Function to update statistics display
        function updateStats() {
            const statsElement = document.getElementById('stats');
            const totalQuotes = quotes.length;
            const categories = new Set(quotes.map(quote => quote.category)).size;
            
            statsElement.innerHTML = `
                <div>Total Quotes: ${totalQuotes} | Categories: ${categories}</div>
            `;
        }

        // Function to create add quote form (as mentioned in requirements)
        function createAddQuoteForm() {
            // This function demonstrates how the form could be created dynamically
            // The form is already present in HTML, but here's how it could be created via DOM manipulation
            
            const container = document.querySelector('.container');
            
            // Check if form already exists
            if (document.querySelector('.dynamic-add-quote-section')) {
                return;
            }
            
            const addQuoteSection = document.createElement('div');
            addQuoteSection.className = 'add-quote-section dynamic-add-quote-section';
            
            const title = document.createElement('h3');
            title.textContent = 'Add Your Own Quote (Dynamically Created)';
            
            const formGroup = document.createElement('div');
            formGroup.className = 'form-group';
            
            const textInput = document.createElement('input');
            textInput.type = 'text';
            textInput.id = 'dynamicQuoteText';
            textInput.placeholder = 'Enter a new quote';
            
            const categoryInput = document.createElement('input');
            categoryInput.type = 'text';
            categoryInput.id = 'dynamicQuoteCategory';
            categoryInput.placeholder = 'Enter quote category';
            
            const addButton = document.createElement('button');
            addButton.textContent = 'Add Quote';
            addButton.onclick = () => {
                const text = textInput.value.trim();
                const category = categoryInput.value.trim();
                
                if (text && category) {
                    quotes.push({ text, category: category.toLowerCase() });
                    textInput.value = '';
                    categoryInput.value = '';
                    updateCategoryFilter();
                    updateStats();
                    
                    addButton.textContent = 'Quote Added!';
                    setTimeout(() => {
                        addButton.textContent = 'Add Quote';
                    }, 2000);
                }
            };
            
            formGroup.appendChild(textInput);
            formGroup.appendChild(categoryInput);
            formGroup.appendChild(addButton);
            
            addQuoteSection.appendChild(title);
            addQuoteSection.appendChild(formGroup);
            
            container.appendChild(addQuoteSection);
        }

        // Event listener on the "Show New Quote" button
        document.addEventListener('DOMContentLoaded', function() {
            const newQuoteButton = document.getElementById('newQuote');
            
            // Add event listener to the "Show New Quote" button
            newQuoteButton.addEventListener('click', showRandomQuote);
            
            // Initialize the application
            updateCategoryFilter();
            updateStats();
            
            // Add event listeners for Enter key on input fields
            document.getElementById('newQuoteText').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    document.getElementById('newQuoteCategory').focus();
                }
            });
            
            document.getElementById('newQuoteCategory').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    addQuote();
                }
            });
            
            console.log('Dynamic Quote Generator initialized');
            console.log('Quotes array contains:', quotes.length, 'quotes');
            console.log('Available functions: showRandomQuote, addQuote, createAddQuoteForm');
        });

        // Additional DOM manipulation demonstration
        function demonstrateAdvancedDOMManipulation() {
            // This function showcases various DOM manipulation techniques
            
            // 1. Creating elements programmatically
            const demo = document.createElement('div');
            demo.style.cssText = 'padding: 10px; background: #f0f0f0; margin: 10px 0; border-radius: 5px;';
            
            // 2. Setting attributes and properties
            demo.setAttribute('data-demo', 'advanced-dom');
            demo.className = 'demo-section';
            
            // 3. Adding event listeners
            demo.addEventListener('click', function() {
                this.style.background = this.style.background === 'rgb(240, 240, 240)' ? '#e0e0e0' : '#f0f0f0';
            });
            
            // 4. Manipulating text and HTML content
            demo.innerHTML = '<strong>Advanced DOM Demo:</strong> Click me to change background!';
            
            // 5. Inserting into the DOM
            const container = document.querySelector('.container');
            container.appendChild(demo);
            
            // 6. Querying and modifying existing elements
            const quoteDisplay = document.querySelector('#quoteDisplay');
            if (quoteDisplay) {
                // Store original styles
                const originalBackground = quoteDisplay.style.background;
                
                // Temporarily modify styles
                setTimeout(() => {
                    quoteDisplay.style.background = 'linear-gradient(45deg, #ff6b6b, #feca57)';
                    setTimeout(() => {
                        quoteDisplay.style.background = originalBackground;
                    }, 2000);
                }, 1000);
            }
        }

        // Expose functions globally for testing and demonstration
        window.quoteApp = {
            quotes,
            showRandomQuote,
            addQuote,
            createAddQuoteForm,
            demonstrateAdvancedDOMManipulation
        };