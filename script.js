/* =========================================
   1. SPLASH SCREEN
   ========================================= */
setTimeout(() => {
  document.getElementById("splash").classList.add("hidden");
}, 3500);

/* =========================================
   2. NAVIGATION & UI UPDATES
   ========================================= */
function navTo(pageId) {
  // Hide all pages
  document.querySelectorAll(".page").forEach(p => p.style.display = "none");
  // Show selected page
  document.getElementById("page-" + pageId).style.display = "block";
  
  // If not logged in, prevent going to dashboard/history/admin
  const isLoggedIn = localStorage.getItem("trex_phone");
  if (!isLoggedIn && ["dashboard", "pay", "history", "admin"].includes(pageId)) {
    openAuthModal();
    document.getElementById("page-landing").style.display = "block";
    document.getElementById("page-dashboard").style.display = "none";
    document.getElementById("login-error").textContent = "Please log in first.";
    return;
  }

  window.scrollTo(0, 0);
}

// Check if user is already logged in on page load
window.addEventListener("DOMContentLoaded", () => {
  const savedPhone = localStorage.getItem("trex_phone");
  if (savedPhone) {
    showDashboard(savedPhone);
  }
  updateHistoryTables();
});

/* =========================================
   3. LOGIN & OTP LOGIC (Matches your design)
   ========================================= */
function openAuthModal() {
  document.getElementById("auth-modal").style.display = "block";
  document.getElementById("login-screen").style.display = "block";
  document.getElementById("otp-screen").style.display = "none";
}

function closeAuthModal() {
  document.getElementById("auth-modal").style.display = "none";
}

const countrySelect = document.getElementById("login-country");
const phoneInput = document.getElementById("login-phone");

countrySelect.addEventListener("change", () => {
  const selectedOption = countrySelect.options[countrySelect.selectedIndex];
  const placeholder = selectedOption.getAttribute("data-placeholder");
  phoneInput.value = ""; 
  phoneInput.placeholder = placeholder;
  if (placeholder) phoneInput.maxLength = placeholder.length;
});

let pendingPhone = "";
let pendingCountry = "";

document.getElementById("login-btn").addEventListener("click", () => {
  const phoneRaw = phoneInput.value.trim();
  const err = document.getElementById("login-error");
  err.textContent = "";

  if (phoneRaw.length < 8 || isNaN(phoneRaw)) {
    err.textContent = "Please enter a valid phone number.";
    return;
  }

  pendingPhone = phoneRaw;
  pendingCountry = countrySelect.value;

  document.getElementById("otp-text").textContent = `Code sent to +${pendingCountry} ${phoneRaw}. (Use 1234)`;
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("otp-screen").style.display = "block";
});

document.getElementById("verify-btn").addEventListener("click", () => {
  const code = document.getElementById("otp-input").value.trim();
  const err = document.getElementById("otp-error");
  err.textContent = "";

  if (code === "1234") {
    localStorage.setItem("trex_phone", pendingPhone);
    localStorage.setItem("trex_country", pendingCountry);
    closeAuthModal();
    showDashboard(pendingPhone);
  } else {
    err.textContent = "Incorrect code. Please try 1234.";
  }
});

function showDashboard(phone) {
  navTo("dashboard");
  document.getElementById("user-phone-display").textContent = phone;
  
  // Update Navbar to show logged-in state
  document.getElementById("nav-login").style.display = "none";
  document.getElementById("nav-history").style.display = "inline-block";
  document.getElementById("nav-admin").style.display = "inline-block";
  document.getElementById("nav-logout").style.display = "inline-block";
}

function logout() {
  localStorage.removeItem("trex_phone");
  localStorage.removeItem("trex_country");
  document.getElementById("nav-login").style.display = "inline-block";
  document.getElementById("nav-history").style.display = "none";
  document.getElementById("nav-admin").style.display = "none";
  document.getElementById("nav-logout").style.display = "none";
  navTo("landing");
}

/* =========================================
   4. PAYMENT PROCESSING & HISTORY
   ========================================= */
function processPayment() {
  const amount = document.getElementById("pay-amount").value;
  const phone = document.getElementById("pay-phone").value;
  const method = document.querySelector('input[name="method"]:checked').value;
  const err = document.getElementById("pay-error");

  if (!amount || amount < 1) { err.textContent = "Please enter a valid amount."; return; }
  if (!phone || phone.length < 9) { err.textContent = "Please enter a valid phone number."; return; }
  err.textContent = "";

  // Simulate Payment
  const randomOutcome = Math.random();
  let status = "Success";
  if (randomOutcome > 0.85) status = "Pending";
  else if (randomOutcome > 0.95) status = "Failed";

  const transaction = {
    date: new Date().toLocaleString(),
    amount: amount,
    phone: phone,
    method: method,
    status: status
  };

  let history = JSON.parse(localStorage.getItem("trex_transactions")) || [];
  history.unshift(transaction);
  localStorage.setItem("trex_transactions", JSON.stringify(history));

  alert(`Payment ${status}!`);
  updateHistoryTables();
  navTo('history');
}

function updateHistoryTables() {
  const history = JSON.parse(localStorage.getItem("trex_transactions")) || [];
  
  const userTable = document.getElementById("history-table-body");
  const adminTable = document.getElementById("admin-table-body");

  userTable.innerHTML = "";
  adminTable.innerHTML = "";

  if (history.length === 0) {
    userTable.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 20px;">No transactions yet.</td></tr>`;
    adminTable.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 20px;">No transactions yet.</td></tr>`;
    return;
  }

  history.forEach(t => {
    let color = t.status === "Success" ? "#2ecc71" : (t.status === "Pending" ? "#f1c40f" : "#e50914");
    
    userTable.innerHTML += `
      <tr style="border-bottom: 1px solid #222;">
        <td style="padding: 10px;">${t.date}</td>
        <td style="padding: 10px;">$${t.amount}</td>
        <td style="padding: 10px;">${t.method}</td>
        <td style="padding: 10px; color: ${color}; font-weight: bold;">${t.status}</td>
      </tr>`;

    adminTable.innerHTML += `
      <tr style="border-bottom: 1px solid #222;">
        <td style="padding: 10px;">${t.date}</td>
        <td style="padding: 10px;">${t.phone}</td>
        <td style="padding: 10px;">$${t.amount}</td>
        <td style="padding: 10px; color: ${color}; font-weight: bold;">${t.status}</td>
      </tr>`;
  });
}

/* =========================================
   5. ADMIN LOGIN
   ========================================= */
function adminLogin() {
  const pass = document.getElementById("admin-pass").value;
  const err = document.getElementById("admin-err");

  if (pass === "admin123") {
    document.getElementById("admin-login").style.display = "none";
    document.getElementById("admin-panel").style.display = "block";
    err.textContent = "";
  } else {
    err.textContent = "Incorrect password. Try 'admin123'";
  }
}

function logoutAdmin() {
  document.getElementById("admin-login").style.display = "block";
  document.getElementById("admin-panel").style.display = "none";
  document.getElementById("admin-pass").value = "";
}
