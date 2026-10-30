// 1. Splash Screen Timer (Runs immediately)
setTimeout(function() {
  const splash = document.getElementById("splash");
  const landing = document.getElementById("page-landing");
  
  if (splash) splash.style.display = "none";
  if (landing) landing.style.display = "block";
}, 3000); // 3000ms = 3 seconds

// 2. Navigation
function navTo(pageId) {
  const pages = ["page-landing", "page-login", "page-otp", "page-dashboard", "page-trading", "page-pay"];
  
  pages.forEach(function(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });

  const target = document.getElementById(pageId);
  if (target) target.style.display = "block";

  const navbar = document.getElementById("main-navbar");
  if (["page-dashboard", "page-trading", "page-pay"].includes(pageId)) {
    if (navbar) navbar.style.display = "flex";
  } else {
    if (navbar) navbar.style.display = "none";
  }
  
  window.scrollTo(0, 0);
}

// 3. Login & OTP
function goToOtp() {
  const phone = document.getElementById("login-phone").value.trim();
  if (phone.length < 8) {
    document.getElementById("login-error").textContent = "Please enter a valid phone number.";
    return;
  }
  
  document.getElementById("otp-text").textContent = "Code has been sent to your linked account.";
  navTo("page-otp");
}

function verifyOtp() {
  const code = document.getElementById("otp-input").value.trim();
  if (code === "1234") {
    navTo("page-dashboard");
  } else {
    document.getElementById("otp-error").textContent = "Incorrect code. Try 1234.";
  }
}

function logout() {
  window.location.reload();
}

// 4. Trading Hub
function toggleInitiation() {
  const pkgDiv = document.getElementById("initiation-packages");
  if (pkgDiv) {
    pkgDiv.style.display = pkgDiv.style.display === "none" ? "block" : "none";
  }
}

function initiateTrade(planName, feeAmount) {
  navTo("page-pay");
  const kesAmount = feeAmount * 130;
  document.getElementById("pay-amount-input").value = kesAmount;
  document.getElementById("pay-phone-input").value = "254" + (localStorage.getItem("trex_phone") || "700000000");
  calculateExchangeRate();
}

function setAmount(val) {
  document.getElementById("pay-amount-input").value = val;
  calculateExchangeRate();
}

function calculateExchangeRate() {
  const amount = document.getElementById("pay-amount-input").value || 0;
  const usd = (amount * 0.007695).toFixed(2);
  document.getElementById("calc-usd").textContent = usd + " USD";
}

// 5. Payment Provider Logo (Wrapped in a safety check so it doesn't crash)
window.addEventListener('DOMContentLoaded', () => {
  const providerSelect = document.getElementById("deposit-provider");
  if (providerSelect) {
    providerSelect.addEventListener("change", function() {
      const logo = document.getElementById("provider-logo");
      if (this.value === "AIRTEL") {
        logo.textContent = "AIRTEL";
        logo.style.color = "#e50914";
      } else {
        logo.textContent = "M-PESA";
        logo.style.color = "#2ecc71";
      }
    });
  }
});

// 6. Paystack Payment Processing
async function processPayment() {
  const amount = document.getElementById("pay-amount-input").value;
  const phoneInput = document.getElementById("pay-phone-input").value;
  const provider = document.getElementById("deposit-provider") ? document.getElementById("deposit-provider").value.toLowerCase() : "mpesa";
  
  const btn = document.querySelector(".deposit-btn");

  if (!amount || !phoneInput) {
    alert("Please fill all fields");
    return;
  }

  let formattedPhone = phoneInput;
  if (phoneInput.startsWith("0")) {
    formattedPhone = "254" + phoneInput.substring(1); 
  } else if (!phoneInput.startsWith("254")) {
    formattedPhone = "254" + phoneInput; 
  }

  btn.textContent = "Sending Prompt...";
  btn.disabled = true;

  try {
    const response = await fetch('/api/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: "customer@trexspark.com", 
        amount: amount,
        phone: formattedPhone,
        provider: provider
      })
    });

    const data = await response.json();

    if (data.success || (data.message && data.message.includes("Charge attempted"))) {
      alert("Success! Check your phone for the " + provider.toUpperCase() + " prompt.");
      navTo('page-trading');
    } else {
      alert("Error: " + (data.error || data.message || "Failed to send prompt."));
    }
  } catch (err) {
    alert("Network error. Please try again.");
  } finally {
    btn.textContent = "Deposit";
    btn.disabled = false;
  }
    }
