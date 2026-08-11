/* =========================================
   GET HTML ELEMENTS
   ========================================= */

const form = document.getElementById("transactionForm");

const transactionList = document.getElementById("transactionList");

const balanceElement = document.getElementById("balance");
const incomeElement = document.getElementById("income");
const expenseElement = document.getElementById("expense");

const transactionCount = document.getElementById("transactionCount");

const filterType = document.getElementById("filterType");
const searchTransaction = document.getElementById("searchTransaction");

const emptyState = document.getElementById("emptyState");

const currentDate = document.getElementById("currentDate");


/* =========================================
   TRANSACTIONS
   ========================================= */

// Get saved transactions from localStorage

let transactions = JSON.parse(
    localStorage.getItem("transactions")
) || [];


/* =========================================
   SHOW CURRENT DATE
   ========================================= */

const today = new Date();

currentDate.textContent = today.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
});


/* =========================================
   ADD TRANSACTION
   ========================================= */

form.addEventListener("submit", function(event) {

    // Prevent page refresh
    event.preventDefault();


    // Get form values

    const description =
        document.getElementById("description").value.trim();

    const amount =
        Number(document.getElementById("amount").value);

    const type =
        document.getElementById("type").value;

    const category =
        document.getElementById("category").value;

    const date =
        document.getElementById("date").value;


    // Create transaction

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


    // Save transaction

    saveTransactions();


    // Update UI

    displayTransactions();

    updateBalance();


    // Clear form

    form.reset();

});


/* =========================================
   SAVE TRANSACTIONS
   ========================================= */

function saveTransactions() {

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

}


/* =========================================
   DISPLAY TRANSACTIONS
   ========================================= */

function displayTransactions() {

    // Remove old transaction elements

    transactionList.innerHTML = "";


    // Get filter value

    const selectedFilter = filterType.value;

    const searchText =
        searchTransaction.value.toLowerCase();


    // Filter transactions

    const filteredTransactions = transactions.filter(
        function(transaction) {

            const matchesType =
                selectedFilter === "all" ||
                transaction.type === selectedFilter;


            const matchesSearch =
                transaction.description
                    .toLowerCase()
                    .includes(searchText);


            return matchesType && matchesSearch;

        }
    );


    /* =====================================
       EMPTY STATE
       ===================================== */

    if (filteredTransactions.length === 0) {

        transactionList.innerHTML = `

            <li class="empty-state">

                <div class="empty-icon">
                    ₹
                </div>

                <h3>
                    No transactions found
                </h3>

                <p>
                    Add a transaction or change your filter.
                </p>

            </li>

        `;

        return;
    }


    /* =====================================
       CREATE TRANSACTIONS
       ===================================== */

    filteredTransactions.forEach(
        function(transaction) {

            const li =
                document.createElement("li");


            // Format category

            const categoryName =
                transaction.category
                    .charAt(0)
                    .toUpperCase()
                +
                transaction.category.slice(1);


            // Format date

            const formattedDate =
                new Date(
                    transaction.date
                ).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                });


            // Income or expense symbol

            const symbol =
                transaction.type === "income"
                    ? "+"
                    : "-";


            // Create transaction HTML

            li.innerHTML = `

                <div>

                    <strong>
                        ${transaction.description}
                    </strong>

                    <br>

                    <small>
                        ${categoryName} · ${formattedDate}
                    </small>

                </div>


                <div>

                    <strong class="
                        ${transaction.type === "income"
                            ? "income-amount"
                            : "expense-amount"}
                    ">

                        ${symbol}₹${transaction.amount}

                    </strong>


                    <button
                        class="delete-button"
                        data-id="${transaction.id}"
                    >
                        Delete
                    </button>

                </div>

            `;


            // Add transaction to list

            transactionList.appendChild(li);

        }
    );


    /* =====================================
       DELETE BUTTONS
       ===================================== */

    const deleteButtons =
        document.querySelectorAll(".delete-button");


    deleteButtons.forEach(
        function(button) {

            button.addEventListener(
                "click",
                function() {

                    const id =
                        Number(button.dataset.id);

                    deleteTransaction(id);

                }
            );

        }
    );

}


/* =========================================
   UPDATE BALANCE
   ========================================= */

function updateBalance() {

    let income = 0;

    let expense = 0;


    // Calculate totals

    transactions.forEach(
        function(transaction) {

            if (transaction.type === "income") {

                income += transaction.amount;

            } else {

                expense += transaction.amount;

            }

        }
    );


    // Calculate balance

    const balance = income - expense;


    // Update dashboard

    balanceElement.textContent =
        "₹" + balance.toLocaleString("en-IN");


    incomeElement.textContent =
        "₹" + income.toLocaleString("en-IN");


    expenseElement.textContent =
        "₹" + expense.toLocaleString("en-IN");


    // Update transaction count

    transactionCount.textContent =
        transactions.length;

}


/* =========================================
   DELETE TRANSACTION
   ========================================= */

function deleteTransaction(id) {

    transactions =
        transactions.filter(
            function(transaction) {

                return transaction.id !== id;

            }
        );


    // Save updated list

    saveTransactions();


    // Update UI

    displayTransactions();

    updateBalance();

}


/* =========================================
   FILTER TRANSACTIONS
   ========================================= */

filterType.addEventListener(
    "change",
    function() {

        displayTransactions();

    }
);


/* =========================================
   SEARCH TRANSACTIONS
   ========================================= */

searchTransaction.addEventListener(
    "input",
    function() {

        displayTransactions();

    }
);


/* =========================================
   INITIAL LOAD
   ========================================= */

// Show saved transactions when page opens

displayTransactions();

updateBalance();