// Function to add a new quote
function addQuote(text, category) {
  if (text && category) {
    quotes.push({ text, category });
    displayRandomQuote(); // refresh DOM with the new quote
  }
}

// Optional: create a form in the DOM for adding quotes
function createAddQuoteForm() {
  const form = document.createElement("form");
  form.innerHTML = `
    <input type="text" id="new-quote-text" placeholder="Enter quote" required>
    <input type="text" id="new-quote-category" placeholder="Enter category" required>
    <button type="submit">Add Quote</button>
  `;

  document.body.appendChild(form);

  form.addEventListener("submit", function(event) {
    event.preventDefault();
    const text = document.getElementById("new-quote-text").value;
    const category = document.getElementById("new-quote-category").value;

    addQuote(text, category);

    // Clear input fields
    form.reset();
  });
}

// Call it so the form appears when page loads
createAddQuoteForm();
