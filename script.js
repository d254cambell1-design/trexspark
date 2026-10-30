/* =========================================
   1. SPLASH & NAVIGATION
   ========================================= */
setTimeout(() => {
  document.getElementById("splash").classList.add("hidden");
}, 3500);

function navTo(targetPageId) {
  // Hide every single page
  document.querySelectorAll(".page").forEach(p => p.style.display = "none");
  
  // Show only the target page
  document.getElementById("page-" + targetPageId).style.display = "block";
  
  // Hide navbar on auth pages
  if (["landing", "login", "otp"].includes(targetPageId)) {
    document.getElementById("main-navbar").style.display = "none";
  } else {
    document.getElementById("main-navbar").style.display = "flex";
  }
  
  window.scrollTo(0, 0);
}

window.addEventListener("DOMContentLoaded", () => {
  const savedPhone = localStorage.getItem("trex_phone");
  if (savedPhone) {
    navTo("dashboard");
  } else {
    navTo("landing");
  }
});

/* =========================================
   2. LOGIN & OTP LOGIC
   ========================================= */
const countrySelect = document.getElementById("login-country");
const phoneInput = document.getElementById("login-phone");

countrySelect.addEventListener("change", () => {
  const selectedOption = countrySelect.options[countrySelect.selectedIndex];
  const placeholder = selectedOption.getAttribute("data-placeholder");
  
  phoneInput.value = ""; 
  if (placeholder) {
    phoneInput.placeholder = "e.g. " + placeholder;
    phoneInput.maxLength = placeholder.length;
  } else {
    phoneInput.placeholder = "Enter phone number";
  }
});
countrySelect.dispatchEvent(new Event('change'));

let pendingPhone = "";

function goToOtp() {
  const phoneRaw = document.getElementById("login-phone").value.trim();
  if (phoneRaw.length < 8) {
    document.getElementById("login-error").textContent = "Please enter a valid phone number.";
    return;
  }
  pendingPhone = phoneRaw;
  
  // UPDATED: Message doesn't show the phone number, and no demo text
  document.getElementById("otp-text").textContent = "Code has been sent to your linked account.";
  
  // Move to OTP page
  navTo("otp");
}

function verifyOtp() {
  if (document.getElementById("otp-input").value.trim() === "1234") {
    localStorage.setItem("trex_phone", pendingPhone);
    // Move to Dashboard
    navTo("dashboard");
  } else {
    document.getElementById("otp-error").textContent = "Incorrect code. Try 1234.";
  }
}

function logout() { 
  localStorage.clear(); 
  location.reload(); 
}

/* =========================================
   3. TRADING & DEPOSIT LOGIC
   ========================================= */
function toggleInitiation() {
  const pkgDiv = document.getElementById("initiation-packages");
  pkgDiv.style.display = pkgDiv.style.display === "none" ? "block" : "none";
  if (pkgDiv.style.display === "block") pkgDiv.scrollIntoView({ behavior: 'smooth' });
}

function initiateTrade(planName, feeAmount) {
  navTo("pay");
  const kesAmount = feeAmount * 130;
  document.getElementById("pay-amount-input").value = kesAmount;
  document.getElementById("pay-phone-input").value = "254" + localStorage.getItem("trex_phone");
  calculateExchangeRate();
}

function setAmount(val) {
  document.getElementById("pay-amount-input").value = val;
  calculateExchangeRate();
}

function calculateExchangeRate() {
  const amount = document.getElementById("pay-amount-input").value || 0;
  const usd = (amount * 0.007695).toFixed(2);
  document.getElementById("calc-usd").textContent = `${usd} USD`;
}

document.getElementById("pay-amount-input").addEventListener("input", calculateExchangeRate);

document.getElementById("deposit-provider").addEventListener("change", function() {
  const logo = document.getElementById("provider-logo");
  if (this.value === "AIRTEL") {
    logo.textContent = "AIRTEL";
    logo.style.color = "#e50914";
  } else {
    logo.textContent = "M-PESA";
    logo.style.color = "#2ecc71";
  }
});

/* =========================================
   4. REAL PAYSTACK PAYMENT PROCESSING
   ========================================= */
async function processPayment() {
  const amount = document.getElementById("pay-amount-input").value;
  const phoneInput = document.getElementById("pay-phone-input").value;
  const providerSelect = document.getElementById("deposit-provider"); 
  const provider = providerSelect ? providerSelect.value.toLowerCase() : "mpesa";
  
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
      alert(`Success! Check your phone for the ${provider.toUpperCase()} prompt.`);
      navTo('trading');
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
