// Get elements from HTML
const form = document.getElementById("transactionForm");
const transactionList = document.getElementById("transactionList");

const balanceElement = document.getElementById("balance");
const incomeElement = document.getElementById("income");
const expenseElement = document.getElementById("expense");


// Store transactions
let transactions = [];


// When form is submitted
form.addEventListener("submit", function(event) {

    // Stop page from refreshing
    event.preventDefault();

    // Get values from form
    const description = document.getElementById("description").value;
    const amount = Number(document.getElementById("amount").value);
    const type = document.getElementById("type").value;
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;

    // Create transaction object
    const transaction = {
        id: Date.now(),
        description: description,
        amount: amount,
        type: type,
        category: category,
        date: date
    };

    // Add transaction to array
    transactions.push(transaction);

    // Update screen
    displayTransactions();
    updateBalance();

    // Clear form
    form.reset();
});


// Display transactions
function displayTransactions() {

    // Clear old list
    transactionList.innerHTML = "";

    // Loop through transactions
    transactions.forEach(function(transaction) {

        const li = document.createElement("li");

        li.innerHTML = `
            <div>
                <strong>${transaction.description}</strong>
                <br>
                <small>
                    ${transaction.category} | ${transaction.date}
                </small>
            </div>

            <div>
                ${transaction.type === "income" ? "+" : "-"}₹${transaction.amount}

                <button onclick="deleteTransaction(${transaction.id})">
                    Delete
                </button>
            </div>
        `;

        transactionList.appendChild(li);
    });
}


// Update balance, income and expenses
function updateBalance() {

    let income = 0;
    let expense = 0;

    transactions.forEach(function(transaction) {

        if (transaction.type === "income") {
            income = income + transaction.amount;
        } 
        else {
            expense = expense + transaction.amount;
        }

    });

    const balance = income - expense;

    // Update HTML
    balanceElement.textContent = "₹" + balance;
    incomeElement.textContent = "₹" + income;
    expenseElement.textContent = "₹" + expense;
}


// Delete transaction
function deleteTransaction(id) {

    transactions = transactions.filter(function(transaction) {
        return transaction.id !== id;
    });

    displayTransactions();
    updateBalance();
}