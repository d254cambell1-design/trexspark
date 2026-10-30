// 1. Splash Screen & Navigation
window.onload = function() {
  setTimeout(function() {
    var splash = document.getElementById("splash");
    if (splash) splash.style.display = "none";
    
    var landing = document.getElementById("page-landing");
    if (landing) landing.style.display = "block";
  }, 3500);
};

function navTo(pageId) {
  var pages = ["page-landing", "page-login", "page-otp", "page-dashboard", "page-trading", "page-pay"];
  
  pages.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = "none";
  });

  var target = document.getElementById(pageId);
  if (target) target.style.display = "block";

  var navbar = document.getElementById("main-navbar");
  if (["page-dashboard", "page-trading", "page-pay"].includes(pageId)) {
    if (navbar) navbar.style.display = "flex";
  } else {
    if (navbar) navbar.style.display = "none";
  }
  
  window.scrollTo(0, 0);
}

// 2. Login & OTP
function goToOtp() {
  var phone = document.getElementById("login-phone").value.trim();
  if (phone.length < 8) {
    document.getElementById("login-error").textContent = "Please enter a valid phone number.";
    return;
  }
  document.getElementById("otp-text").textContent = "Code has been sent to your linked account.";
  navTo("page-otp");
}

function verifyOtp() {
  var code = document.getElementById("otp-input").value.trim();
  if (code === "1234") {
    navTo("page-dashboard");
  } else {
    document.getElementById("otp-error").textContent = "Incorrect code. Try 1234.";
  }
}

function logout() {
  window.location.reload();
}

// 3. Trading Hub Logic (UPDATED TO MAKE BUTTON WORK)
function toggleInitiation() {
  var pkgDiv = document.getElementById("initiation-packages");
  if (pkgDiv.style.display === "none" || pkgDiv.style.display === "") {
    pkgDiv.style.display = "block";
  } else {
    pkgDiv.style.display = "none";
  }
}

function initiateTrade(planName, feeAmount) {
  navTo("page-pay");
  
  // Convert USD fee to KES for the M-Pesa input
  var kesAmount = feeAmount * 130;
  document.getElementById("pay-amount-input").value = kesAmount;
  
  document.getElementById("pay-phone-input").value = "254" + (localStorage.getItem("trex_phone") || "700000000");
  
  calculateExchangeRate();
}

function setAmount(val) {
  document.getElementById("pay-amount-input").value = val;
  calculateExchangeRate();
}

function calculateExchangeRate() {
  var amount = document.getElementById("pay-amount-input").value || 0;
  var usd = (amount * 0.007695).toFixed(2);
  document.getElementById("calc-usd").textContent = usd + " USD";
}

// 4. Provider Logo Logic
window.addEventListener('DOMContentLoaded', function() {
  var providerSelect = document.getElementById("deposit-provider");
  if (providerSelect) {
    providerSelect.addEventListener("change", function() {
      var logo = document.getElementById("provider-logo");
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

// 5. Paystack Payment Processing
async function processPayment() {
  var amount = document.getElementById("pay-amount-input").value;
  var phoneInput = document.getElementById("pay-phone-input").value;
  var providerSelect = document.getElementById("deposit-provider");
  var provider = providerSelect ? providerSelect.value.toLowerCase() : "mpesa";
  
  var btn = document.querySelector(".deposit-btn");

  if (!amount || !phoneInput) {
    alert("Please fill all fields");
    return;
  }

  var formattedPhone = phoneInput;
  if (phoneInput.startsWith("0")) {
    formattedPhone = "254" + phoneInput.substring(1); 
  } else if (!phoneInput.startsWith("254")) {
    formattedPhone = "254" + phoneInput; 
  }

  btn.textContent = "Sending Prompt...";
  btn.disabled = true;

  try {
    var response = await fetch('/api/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: "customer@trexspark.com", 
        amount: amount,
        phone: formattedPhone,
        provider: provider
      })
    });

    var data = await response.json();

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
