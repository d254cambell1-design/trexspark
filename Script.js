/* =========================================
   1. SPLASH & NAVIGATION
   ========================================= */
setTimeout(() => {
  document.getElementById("splash").classList.add("hidden");
}, 3500);

function navTo(pageId) {
  document.querySelectorAll(".page").forEach(p => p.style.display = "none");
  document.getElementById("page-" + pageId).style.display = "block";
  
  const isLoggedIn = localStorage.getItem("trex_phone");
  if (!isLoggedIn && ["dashboard", "trading", "pay", "history"].includes(pageId)) {
    openAuthModal();
    document.getElementById("page-landing").style.display = "block";
    return;
  }
  window.scrollTo(0, 0);
}

window.addEventListener("DOMContentLoaded", () => {
  const savedPhone = localStorage.getItem("trex_phone");
  if (savedPhone) showDashboard(savedPhone);
  updateHistoryTables();
});

/* =========================================
   2. LOGIN & OTP LOGIC
   ========================================= */
function openAuthModal() {
  document.getElementById("auth-modal").style.display = "block";
  document.getElementById("login-screen").style.display = "block";
  document.getElementById("otp-screen").style.display = "none";
}
function closeAuthModal() { document.getElementById("auth-modal").style.display = "none"; }

let pendingPhone = "";
document.getElementById("login-btn").addEventListener("click", () => {
  const phoneRaw = document.getElementById("login-phone").value.trim();
  if (phoneRaw.length < 8) return;
  pendingPhone = phoneRaw;
  document.getElementById("otp-text").textContent = `Code sent to ${phoneRaw}. (Use 1234)`;
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("otp-screen").style.display = "block";
});

document.getElementById("verify-btn").addEventListener("click", () => {
  if (document.getElementById("otp-input").value.trim() === "1234") {
    localStorage.setItem("trex_phone", pendingPhone);
    closeAuthModal();
    showDashboard(pendingPhone);
  }
});

function showDashboard(phone) {
  navTo("dashboard");
  document.getElementById("user-phone-display").textContent = phone;
  document.getElementById("nav-login").style.display = "none";
  document.getElementById("nav-dash").style.display = "inline-block";
  document.getElementById("nav-trading").style.display = "inline-block";
  document.getElementById("nav-history").style.display = "inline-block";
  document.getElementById("nav-logout").style.display = "inline-block";
}
function logout() { localStorage.clear(); location.reload(); }

/* =========================================
   3. DEPOSIT & TRADING LOGIC
   ========================================= */
function toggleInitiation() {
  const pkgDiv = document.getElementById("initiation-packages");
  pkgDiv.style.display = pkgDiv.style.display === "none" ? "block" : "none";
  if (pkgDiv.style.display === "block") pkgDiv.scrollIntoView({ behavior: 'smooth' });
}

function initiateTrade(planName, feeAmount) {
  navTo("pay");
  // Pre-fill the deposit form
  document.getElementById("pay-amount-input").value = feeAmount * 130; // Approximate KES
  document.getElementById("pay-phone-input").value = "254" + localStorage.getItem("trex_phone");
  calculateExchangeRate();
}

function setAmount(val) {
  document.getElementById("pay-amount-input").value = val;
  calculateExchangeRate();
}

function calculateExchangeRate() {
  const amount = document.getElementById("pay-amount-input").value || 0;
  // 1 KES = 0.007695 USD (as per your screenshot)
  const usd = (amount * 0.007695).toFixed(2);
  document.getElementById("calc-usd").textContent = `${usd} USD`;
}

// Auto-calculate when user types
document.getElementById("pay-amount-input").addEventListener("input", calculateExchangeRate);

function processPayment() {
  const amount = document.getElementById("pay-amount-input").value;
  const phone = document.getElementById("pay-phone-input").value;

  if (!amount || !phone) { alert("Please fill all fields"); return; }

  let history = JSON.parse(localStorage.getItem("trex_transactions")) || [];
  history.unshift({
    date: new Date().toLocaleString(),
    amount: `KES ${amount}`, // Save as KES
    phone: phone,
    method: "M-Pesa",
    status: "Success"
  });
  localStorage.setItem("trex_transactions", JSON.stringify(history));

  alert("Deposit Successful!");
  updateHistoryTables();
  navTo('history');
}

function updateHistoryTables() {
  const history = JSON.parse(localStorage.getItem("trex_transactions")) || [];
  const userTable = document.getElementById("history-table-body");
  userTable.innerHTML = "";
  history.forEach(t => {
    userTable.innerHTML += `<tr><td>${t.date}</td><td>${t.amount}</td><td>${t.method}</td><td style="color:#2ecc71; font-weight:bold;">${t.status}</td></tr>`;
  });
    }
