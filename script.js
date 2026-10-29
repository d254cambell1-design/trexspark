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
  if (!isLoggedIn && ["dashboard", "trading", "pay"].includes(pageId)) {
    openAuthModal();
    document.getElementById("page-landing").style.display = "block";
    return;
  }
  window.scrollTo(0, 0);
}

window.addEventListener("DOMContentLoaded", () => {
  const savedPhone = localStorage.getItem("trex_phone");
  if (savedPhone) showDashboard(savedPhone);
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
  document.getElementById("pay-amount").value = feeAmount;
  document.getElementById("pay-phone").value = localStorage.getItem("trex_phone");
  document.getElementById("pay-summary").textContent = `Paying Initiation Fee for: ${planName} Package`;
}

function processPayment() {
  const amount = document.getElementById("pay-amount").value;
  if (!amount) { alert("Please enter an amount"); return; }
  
  alert("Payment Successful!");
  navTo('trading');
}
