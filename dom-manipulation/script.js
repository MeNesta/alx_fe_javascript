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

  // Using innerHTML for richer formatting
  document.getElementById("quoteDisplay").innerHTML = `
    <p><em>"${randomQuote.text}"</em></p>
    <p><strong>Category:</strong> ${randomQuote.category}</p>
  `;
}

// Function to add a new quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value;
  const category = document.getElementById("newQuoteCategory").value;

  if (text && category) {
    quotes.push({ text, category }); // update array

    // Clear form inputs
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";

    // Update DOM with new quote
    document.getElementById("quoteDisplay").innerHTML = `
      <p><em>"${text}"</em></p>
      <p><strong>Category:</strong> ${category}</p>
    `;
  } else {
    alert("Please enter both a quote and a category.");
  }
}

// Attach event listener to the button
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
