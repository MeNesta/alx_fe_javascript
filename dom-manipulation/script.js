// Array of quotes (text + category)
const quotes = [
  { text: "The best way to predict the future is to create it.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "In the middle of difficulty lies opportunity.", category: "Wisdom" }
];

// Function to show a random quote
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];
  document.getElementById("quoteDisplay").innerText =
    `"${randomQuote.text}" — [${randomQuote.category}]`;
}

// Function to add a new quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value;
  const category = document.getElementById("newQuoteCategory").value;

  if (text && category) {
    quotes.push({ text, category }); // update array
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
    showRandomQuote(); // refresh DOM
  } else {
    alert("Please enter both a quote and a category.");
  }
}

// Attach event listener to the button
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
