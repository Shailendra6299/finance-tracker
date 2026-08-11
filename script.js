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
const savingsRateElement = document.getElementById("savingsRate");
const heroCanvas = document.getElementById("heroCanvas");
const heroSection = document.querySelector(".hero-section");
const heroOverlay = document.querySelector(".hero-overlay");
const heroAddButton = document.getElementById("heroAddButton");
const heroAnalyticsButton = document.getElementById("heroAnalyticsButton");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let heroScene, heroCamera, heroRenderer, heroClock;
let heroGroup, cardMesh, particleSystem, floatingObjects = [];
let mouseTarget = { x: 0, y: 0 };
let mouseCurrent = { x: 0, y: 0 };
let scrollRatio = 0;

const lastTotals = {
    balance: 0,
    income: 0,
    expense: 0,
    savings: 0
};


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


/* =========================================   HERO SCENE
   ========================================= */

function createCardTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 576;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "rgba(15, 20, 30, 0.96)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.font = "bold 72px Inter, sans-serif";
    ctx.fillText("FINORA", 72, 110);

    ctx.fillStyle = "rgba(255,255,255,0.82)";
    ctx.font = "500 42px Inter, sans-serif";
    ctx.fillText("TOTAL BALANCE", 72, 190);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 96px Inter, sans-serif";
    ctx.fillText("₹24,850", 72, 310);

    ctx.fillStyle = "#4ade80";
    ctx.font = "700 54px Inter, sans-serif";
    ctx.fillText("+12.4%", 72, 410);

    ctx.fillStyle = "rgba(255,255,255,0.42)";
    ctx.font = "400 28px Inter, sans-serif";
    ctx.fillText("SHARE · MARKET · SIGNALS", 72, 500);

    const texture = new THREE.CanvasTexture(canvas);
    texture.encoding = THREE.sRGBEncoding;
    texture.minFilter = THREE.LinearFilter;
    texture.anisotropy = 4;
    return texture;
}

function createFloatingShape(shape, material, position, scale = 1) {
    const mesh = new THREE.Mesh(shape, material);
    mesh.position.copy(position);
    mesh.scale.setScalar(scale);
    mesh.userData = {
        baseY: position.y,
        speed: 0.6 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2
    };
    heroScene.add(mesh);
    floatingObjects.push(mesh);
    return mesh;
}

function createHeroScene() {
    heroScene = new THREE.Scene();

    heroRenderer = new THREE.WebGLRenderer({
        canvas: heroCanvas,
        alpha: true,
        antialias: true
    });
    heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    heroRenderer.setSize(window.innerWidth, window.innerHeight);
    heroRenderer.outputEncoding = THREE.sRGBEncoding;

    heroCamera = new THREE.PerspectiveCamera(44, window.innerWidth / window.innerHeight, 0.1, 80);
    heroCamera.position.set(0, 1.7, 6);

    heroClock = new THREE.Clock();

    const ambient = new THREE.AmbientLight(0xffffff, 0.55);
    heroScene.add(ambient);

    const directional = new THREE.DirectionalLight(0xffffff, 1.05);
    directional.position.set(4, 5, 5);
    heroScene.add(directional);

    const rimLight1 = new THREE.PointLight(0x8bb7ff, 0.25, 12);
    rimLight1.position.set(-3.5, 2.5, 3);
    heroScene.add(rimLight1);

    const rimLight2 = new THREE.PointLight(0xffe6aa, 0.18, 12);
    rimLight2.position.set(3.4, 1.8, 2.4);
    heroScene.add(rimLight2);

    heroGroup = new THREE.Group();
    heroScene.add(heroGroup);

    const cardGeometry = new THREE.BoxGeometry(3.4, 2.1, 0.18);
    const cardMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x14213d,
        metalness: 0.05,
        roughness: 0.1,
        transmission: 0.92,
        transparent: true,
        opacity: 0.92,
        ior: 1.5,
        thickness: 0.24,
        clearcoat: 0.45,
        clearcoatRoughness: 0.12,
        reflectivity: 0.25,
        envMapIntensity: 1.1
    });
    cardMesh = new THREE.Mesh(cardGeometry, cardMaterial);
    cardMesh.position.set(0, 0.05, 0);
    cardMesh.castShadow = true;
    cardMesh.receiveShadow = true;
    heroGroup.add(cardMesh);

    const cardInner = new THREE.Mesh(
        new THREE.BoxGeometry(3.36, 2.06, 0.02),
        new THREE.MeshStandardMaterial({
            color: 0xffffff,
            opacity: 0.08,
            transparent: true
        })
    );
    cardInner.position.z = 0.095;
    heroGroup.add(cardInner);

    const infoPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(2.9, 1.4),
        new THREE.MeshBasicMaterial({ map: createCardTexture(), transparent: true })
    );
    infoPlane.position.set(0, 0, 0.091);
    heroGroup.add(infoPlane);

    const coinMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xd4b95a,
        metalness: 1,
        roughness: 0.18,
        clearcoat: 1,
        clearcoatRoughness: 0.05
    });

    const sphereMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x92b7ff,
        transmission: 0.75,
        opacity: 0.35,
        transparent: true,
        roughness: 0.05,
        metalness: 0.05,
        ior: 1.45
    });

    const matteMaterial = new THREE.MeshStandardMaterial({
        color: 0x121926,
        roughness: 0.82,
        metalness: 0.08
    });

    for (let i = 0; i < 3; i += 1) {
        const coin = createFloatingShape(
            new THREE.CylinderGeometry(0.24, 0.24, 0.095, 32),
            coinMaterial,
            new THREE.Vector3((i - 1) * 1.8, 0.9 + i * 0.08, -1.1 + i * 0.4),
            0.9
        );
        coin.rotation.x = Math.PI / 2;
    }

    for (let i = 0; i < 2; i += 1) {
        createFloatingShape(
            new THREE.SphereGeometry(0.42, 28, 28),
            sphereMaterial,
            new THREE.Vector3(-1.4 + i * 2.4, 0.7 + i * 0.14, 1.4 - i * 0.8),
            1
        );
    }

    createFloatingShape(
        new THREE.TorusGeometry(0.5, 0.12, 16, 64),
        matteMaterial,
        new THREE.Vector3(2.1, 0.45, 0),
        0.8
    );

    createFloatingShape(
        new THREE.BoxGeometry(0.55, 0.55, 0.55),
        matteMaterial,
        new THREE.Vector3(-2.0, 0.4, 0.8),
        0.9
    );

    const symbolCanvas = document.createElement("canvas");
    symbolCanvas.width = 320;
    symbolCanvas.height = 320;
    const symbolCtx = symbolCanvas.getContext("2d");
    symbolCtx.fillStyle = "rgba(255,255,255,0)";
    symbolCtx.fillRect(0, 0, 320, 320);
    symbolCtx.fillStyle = "rgba(255,255,255,0.88)";
    symbolCtx.font = "bold 210px Inter, sans-serif";
    symbolCtx.fillText("₹", 70, 240);
    const symbolTexture = new THREE.CanvasTexture(symbolCanvas);
    symbolTexture.encoding = THREE.sRGBEncoding;
    const symbolPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(0.7, 0.7),
        new THREE.MeshBasicMaterial({ map: symbolTexture, transparent: true, opacity: 0.95 })
    );
    symbolPlane.position.set(1.5, 1.1, -0.8);
    heroScene.add(symbolPlane);
    floatingObjects.push(symbolPlane);

    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = prefersReducedMotion ? 48 : 120;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i += 1) {
        positions[i * 3] = (Math.random() - 0.5) * 10;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 4 + 0.9;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.035,
        transparent: true,
        opacity: 0.35,
        depthWrite: false
    });
    particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    heroScene.add(particleSystem);

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("scroll", onScroll, { passive: true });

    heroAddButton.addEventListener("click", () => {
        document.getElementById("description").focus();
        document.querySelector(".content-grid").scrollIntoView({ behavior: "smooth" });
    });

    heroAnalyticsButton.addEventListener("click", () => {
        transactionList.scrollIntoView({ behavior: "smooth" });
    });
}

function onMouseMove(event) {
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = (event.clientY / window.innerHeight) * 2 - 1;
    mouseTarget.x = x * 0.4;
    mouseTarget.y = -y * 0.35;
}

function onScroll() {
    const top = window.scrollY;
    const limit = Math.max(window.innerHeight * 0.8, 1);
    scrollRatio = Math.min(1, top / limit);
}

function onResize() {
    heroRenderer.setSize(window.innerWidth, window.innerHeight);
    heroCamera.aspect = window.innerWidth / window.innerHeight;
    heroCamera.updateProjectionMatrix();
}

function animateHero() {
    const elapsed = heroClock.getElapsedTime();
    if (!prefersReducedMotion) {
        mouseCurrent.x += (mouseTarget.x - mouseCurrent.x) * 0.08;
        mouseCurrent.y += (mouseTarget.y - mouseCurrent.y) * 0.08;
        heroCamera.position.x += (mouseCurrent.x * 0.8 - heroCamera.position.x) * 0.03;
        heroCamera.position.y += (1.8 + mouseCurrent.y + scrollRatio * 0.35 - heroCamera.position.y) * 0.04;
    } else {
        heroCamera.position.x = 0;
        heroCamera.position.y = 1.75 + scrollRatio * 0.35;
    }
    heroGroup.rotation.y += (mouseCurrent.x * 0.3 - heroGroup.rotation.y) * 0.04;
    heroGroup.rotation.x += (mouseCurrent.y * 0.15 - heroGroup.rotation.x) * 0.04;
    heroGroup.position.y = Math.sin(elapsed * 0.95) * 0.15 + scrollRatio * 0.28;
    cardMesh.position.y = Math.sin(elapsed * 1.1) * 0.08 + 0.04;

    const baseRotation = prefersReducedMotion ? 0 : elapsed * 0.18;
    floatingObjects.forEach((object, index) => {
        if (object.isPoints) {
            object.rotation.y = baseRotation * 0.5;
        } else {
            object.rotation.z = baseRotation * 0.6 * (index % 2 === 0 ? 1 : -1);
            object.position.y = object.userData.baseY + Math.sin(elapsed * object.userData.speed + object.userData.phase) * 0.12;
        }
    });

    if (particleSystem) {
        particleSystem.rotation.y = elapsed * 0.06;
    }

    heroCamera.lookAt(0, 0.1, 0);
    heroRenderer.render(heroScene, heroCamera);
    requestAnimationFrame(animateHero);
}

createHeroScene();
animateHero();


/* =========================================   ADD TRANSACTION
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

    const savingsRate = income === 0 ? 0 : Math.round(((income - expense) / income) * 100);
    savingsRateElement.textContent = `${savingsRate}%`;


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