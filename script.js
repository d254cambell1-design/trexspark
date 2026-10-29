/* =========================================
   1. SPLASH SCREEN
   ========================================= */
setTimeout(() => {
  document.getElementById("splash").classList.add("hidden");
}, 3500);

// Check if user is already logged in
window.addEventListener("DOMContentLoaded", () => {
  const savedPhone = localStorage.getItem("trex_phone");
  if (savedPhone) {
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("otp-screen").style.display = "none";
    document.getElementById("main-website").style.display = "block";
    document.getElementById("phone").value = savedPhone;
  }
});

/* =========================================
   2. DYNAMIC PHONE FORMATTING
   ========================================= */
const countrySelect = document.getElementById("login-country");
const phoneInput = document.getElementById("login-phone");

countrySelect.addEventListener("change", () => {
  const selectedOption = countrySelect.options[countrySelect.selectedIndex];
  const placeholder = selectedOption.getAttribute("data-placeholder");
  
  phoneInput.value = ""; 
  phoneInput.placeholder = placeholder;
  
  if (placeholder) {
    phoneInput.maxLength = placeholder.length;
  }
});

/* =========================================
   3. LOGIN & OTP LOGIC
   ========================================= */
let pendingPhone = "";
let pendingCountry = "";

// Step 1: Send Code Button
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

  document.getElementById("otp-text").textContent = `We sent a 4-digit code to +${pendingCountry} ${phoneRaw}. (Use 1234)`;

  // FORCE HIDE LOGIN AND SHOW OTP
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("otp-screen").style.display = "flex";
});

// Step 2: Verify Code Button
document.getElementById("verify-btn").addEventListener("click", () => {
  const code = document.getElementById("otp-input").value.trim();
  const err = document.getElementById("otp-error");
  err.textContent = "";

  if (code === "1234") {
    localStorage.setItem("trex_phone", pendingPhone);
    localStorage.setItem("trex_country", pendingCountry);

    // FORCE HIDE OTP AND SHOW MAIN WEBSITE
    document.getElementById("otp-screen").style.display = "none";
    document.getElementById("main-website").style.display = "block";
    document.getElementById("phone").value = pendingPhone;
  } else {
    err.textContent = "Incorrect code. Please try 1234.";
  }
});

// Go back to login
function showLogin() {
  document.getElementById("otp-screen").style.display = "none";
  document.getElementById("login-screen").style.display = "flex";
  document.getElementById("otp-input").value = "";
  document.getElementById("otp-error").textContent = "";
}

/* =========================================
   4. PAYMENT LOGIC
   ========================================= */
const METHODS = {
  KE: [
    { id: "MPESA",  label: "M-Pesa" },
    { id: "AIRTEL", label: "Airtel Money" }
  ],
  ZM: [ { id: "AIRTEL", label: "Airtel Money" } ],
  DEFAULT: [ { id: "MOBILE", label: "Mobile Money" } ]
};

const PESAPAL_PAYMENT_URL = ""; 
let currentPlan = null;
let currentPrice = null;

function show(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function closeCheckout() {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById("plans").scrollIntoView({ behavior: "smooth" });
}

function renderMethods() {
  const country = localStorage.getItem("trex_country") || "KE";
  const methods = METHODS[country] || METHODS["DEFAULT"];
  const box = document.getElementById("methods");
  box.innerHTML = "";
  
  methods.forEach((m, i) => {
    const div = document.createElement("label");
    div.className = "method" + (i === 0 ? " selected" : "");
    div.innerHTML = `<input type="radio" name="method" value="${m.id}" ${i === 0 ? "checked" : ""} /><span>${m.label}</span>`;
    div.addEventListener("click", () => {
      document.querySelectorAll(".method").forEach(x => x.classList.remove("selected"));
      div.classList.add("selected");
    });
    box.appendChild(div);
  });
}

document.querySelectorAll(".choose").forEach(btn => {
  btn.addEventListener("click", () => {
    currentPlan = btn.dataset.plan;
    currentPrice = btn.dataset.usd;
    
    document.getElementById("sum-plan").textContent = currentPlan;
    document.getElementById("sum-price").textContent = "$" + currentPrice;
    renderMethods();
    show("checkout");
  });
});

document.getElementById("pay").addEventListener("click", async () => {
  const err = document.getElementById("error");
  const payBtn = document.getElementById("pay");
  err.textContent = "";

  const country = localStorage.getItem("trex_country") || "KE";
  const phone = document.getElementById("phone").value;
  const method = document.querySelector('input[name="method"]:checked')?.value;

  if (!PESAPAL_PAYMENT_URL) {
    payBtn.disabled = true;
    payBtn.textContent = "Processing…";
    setTimeout(() => {
      document.getElementById("receipt").innerHTML = `<strong>${currentPlan} Plan</strong><br>Amount: $${currentPrice}<br>Phone: +${country} ${phone}<br>Method: ${method}<br><br><em>DEMO MODE — no real money was charged.</em>`;
      show("success");
      payBtn.disabled = false;
      payBtn.textContent = "Pay Now";
    }, 2000);
    return;
  }

  const params = new URLSearchParams({
    amount: currentPrice,
    currency: "USD",
    description: `TREXSPARK ${currentPlan}`,
    phone: phone,
    country: country,
    method: method,
    callback: window.location.origin + "/success"
  });
  window.location.href = `${PESAPAL_PAYMENT_URL}?${params.toString()}`;
});
