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
  if (!isLoggedIn && ["dashboard", "trading", "pay", "history", "admin"].includes(pageId)) {
    openAuthModal();
    document.getElementById("page-landing").style.display = "block";
    document.getElementById("login-error").textContent = "Please log in first.";
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

function closeAuthModal() {
  document.getElementById("auth-modal").style.display = "none";
}

let pendingPhone = "";
let pendingCountry = "";

document.getElementById("login-btn").addEventListener("click", () => {
  const phoneRaw = document.getElementById("login-phone").value.trim();
  const err = document.getElementById("login-error");
  
  if (phoneRaw.length < 8) {
    err.textContent = "Please enter a valid phone number.";
    return;
  }
  pendingPhone = phoneRaw;
  pendingCountry = document.getElementById("login-country").value;
  document.getElementById("otp-text").textContent = `Code sent to +${pendingCountry} ${phoneRaw}. (Use 1234)`;
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("otp-screen").style.display = "block";
});

document.getElementById("verify-btn").addEventListener("click", () => {
  if (document.getElementById("otp-input").value.trim() === "1234") {
    localStorage.setItem("trex_phone", pendingPhone);
    closeAuthModal();
    showDashboard(pendingPhone);
  } else {
    document.getElementById("otp-error").textContent = "Incorrect code. Try 1234.";
  }
});

function showDashboard(phone) {
  navTo("dashboard");
  document.getElementById("user-phone-display").textContent = phone;
  document.getElementById("nav-login").style.display = "none";
  document.getElementById("nav-dash").style.display = "inline-block";
  document.getElementById("nav-trading").style.display = "inline-block";
  document.getElementById("nav-history").style.display = "inline-block";
  document.getElementById("nav-admin").style.display = "inline-block";
  document.getElementById("nav-logout").style.display = "inline-block";
}

function logout() {
  localStorage.clear();
  location.reload();
}

/* =========================================
   3. TRADING HUB LOGIC
   ========================================= */
function toggleInitiation() {
  const pkgDiv = document.getElementById("initiation-packages");
  if (pkgDiv.style.display === "none") {
    pkgDiv.style.display = "block";
    pkgDiv.scrollIntoView({ behavior: 'smooth' });
  } else {
    pkgDiv.style.display = "none";
  }
}

function initiateTrade(planName, feeAmount) {
  navTo("pay");
  document.getElementById("pay-amount").value = feeAmount;
  document.getElementById("pay-phone").value = localStorage.getItem("trex_phone");
  document.getElementById("pay-summary").textContent = `Paying Initiation Fee for: ${planName} Package`;
}

/* =========================================
   4. PAYMENT PROCESSING
   ========================================= */
function processPayment() {
  const amount = document.getElementById("pay-amount").value;
  const phone = document.getElementById("pay-phone").value;
  const method = document.querySelector('input[name="method"]:checked').value;

  if (!amount || !phone) return;

  let history = JSON.parse(localStorage.getItem("trex_transactions")) || [];
  history.unshift({
    date: new Date().toLocaleString(),
    amount: amount,
    phone: phone,
    method: method,
    status: "Success"
  });
  localStorage.setItem("trex_transactions", JSON.stringify(history));

  alert("Payment Successful!");
  updateHistoryTables();
  navTo('history');
}

function updateHistoryTables() {
  const history = JSON.parse(localStorage.getItem("trex_transactions")) || [];
  const userTable = document.getElementById("history-table-body");
  userTable.innerHTML = "";
  history.forEach(t => {
    userTable.innerHTML += `<tr><td>${t.date}</td><td>$${t.amount}</td><td>${t.method}</td><td style="color:#2ecc71; font-weight:bold;">${t.status}</td></tr>`;
  });
  }
