// ---------------------------
// Dynamic Quote Generator
// ---------------------------

// Step 0: Base Quotes Array
let quotes = [
  { text: "The best way to predict the future is to invent it.", category: "Motivation" },
  { text: "Life is what happens when you’re busy making other plans.", category: "Life" },
  { text: "Do not take life too seriously. You will never get out of it alive.", category: "Humor" }
];

// DOM Elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");

// ---------------------------
// Task 0: Show Random Quote
// ---------------------------
function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.innerText = "No quotes available. Please add one!";
    return;
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.innerHTML = `"${quote.text}" <br><em>- ${quote.category}</em>`;

  // Save last viewed quote to sessionStorage (Task 1)
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// ---------------------------
// Task 0: Add Quote
// ---------------------------
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const newQuote = {
    text: textInput.value.trim(),
    category: categoryInput.value.trim() || "General"
  };

  if (!newQuote.text) {
    alert("Please enter a valid quote!");
    return;
  }

  quotes.push(newQuote);
  saveQuotes(); // Task 1: Save to localStorage
  populateCategories(); // Task 2: Update dropdown

  textInput.value = "";
  categoryInput.value = "";
  alert("Quote added successfully!");
}

// ---------------------------
// Task 1: Local Storage
// ---------------------------
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  }
}

// Restore last viewed quote from sessionStorage
function restoreLastQuote() {
  const last = sessionStorage.getItem("lastQuote");
  if (last) {
    const quote = JSON.parse(last);
    quoteDisplay.innerHTML = `"${quote.text}" <br><em>- ${quote.category}</em>`;
  } else {
    showRandomQuote();
  }
}

// ---------------------------
// Task 1: JSON Export
// ---------------------------
function exportToJson() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Task 1: JSON Import
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories(); // Task 2
      alert("Quotes imported successfully!");
    } catch (err) {
      alert("Invalid JSON file!");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ---------------------------
// Task 2: Category Filtering
// ---------------------------
function populateCategories() {
  const filter = document.getElementById("categoryFilter");
  if (!filter) return;

  const categories = ["all", ...new Set(quotes.map(q => q.category))];
  filter.innerHTML = categories
    .map(cat => `<option value="${cat}">${cat}</option>`)
    .join("");

  // Restore last selected category
  const savedCategory = localStorage.getItem("selectedCategory");
  if (savedCategory && categories.includes(savedCategory)) {
    filter.value = savedCategory;
    filterQuotes();
  }
}

function filterQuotes() {
  const filter = document.getElementById("categoryFilter");
  const selectedCategory = filter.value;

  localStorage.setItem("selectedCategory", selectedCategory);

  if (selectedCategory === "all") {
    showRandomQuote();
  } else {
    const filtered = quotes.filter(q => q.category === selectedCategory);
    if (filtered.length > 0) {
      const randomIndex = Math.floor(Math.random() * filtered.length);
      const quote = filtered[randomIndex];
      quoteDisplay.innerHTML = `"${quote.text}" <br><em>- ${quote.category}</em>`;
    } else {
      quoteDisplay.innerText = "No quotes in this category.";
    }
  }
}

// ---------------------------
// Task 3: Simulated Server Sync
// ---------------------------
// Example: simulate fetch from a mock API
async function syncWithServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=3");
    const serverData = await response.json();

    // Convert server data to quotes (fake mapping)
    const serverQuotes = serverData.map(item => ({
      text: item.title,
      category: "Server"
    }));

    // Simple conflict resolution: server overwrites
    quotes = [...quotes, ...serverQuotes];
    saveQuotes();
    populateCategories();
    alert("Synced with server. Server quotes added!");
  } catch (err) {
    console.error("Server sync failed:", err);
  }
}

// ---------------------------
// Init
// ---------------------------
document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  populateCategories();
  restoreLastQuote();
});

newQuoteBtn.addEventListener("click", () => {
  const filter = document.getElementById("categoryFilter");
  if (filter && filter.value !== "all") {
    filterQuotes();
  } else {
    showRandomQuote();
  }
});
