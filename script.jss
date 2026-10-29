/* =========================================
   1. SPLASH SCREEN & LOGIN LOGIC
   ========================================= */

setTimeout(() => {
  document.getElementById("splash").classList.add("hidden");
}, 3500);

window.addEventListener("DOMContentLoaded", () => {
  const savedPhone = localStorage.getItem("trex_phone");
  const savedCountry = localStorage.getItem("trex_country");

  if (savedPhone) {
    document.getElementById("login-screen").classList.remove("active");
    document.getElementById("main-website").style.display = "block";
    document.getElementById("phone").value = savedPhone;
  }
});

document.getElementById("login-btn").addEventListener("click", () => {
  const country = document.getElementById("login-country").value;
  const phoneRaw = document.getElementById("login-phone").value.trim();
  const err = document.getElementById("login-error");

  if (!/^\d{9,12}$/.test(phoneRaw)) {
    err.textContent = "Enter a valid phone number (9–12 digits).";
    return;
  }

  localStorage.setItem("trex_phone", phoneRaw);
  localStorage.setItem("trex_country", country);

  document.getElementById("login-screen").classList.remove("active");
  document.getElementById("main-website").style.display = "block";
  document.getElementById("phone").value = phoneRaw;
});


/* =========================================
   2. PAYMENT LOGIC
   ========================================= */

const METHODS = {
  KE: [
    { id: "MPESA",  label: "M-Pesa" },
    { id: "AIRTEL", label: "Airtel Money" }
  ],
  ZM: [
    { id: "AIRTEL", label: "Airtel Money" }
  ],
  DEFAULT: [
    { id: "MOBILE", label: "Mobile Money" }
  ]
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

// Listen to all buttons (Basic, Lifetime, Signals, Masterclass)
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
      document.getElementById("receipt").innerHTML = `<strong>${currentPlan} Plan</strong><br>Amount: $${currentPrice}<br>Phone: ${phone}<br>Method: ${method}<br><br><em>DEMO MODE — no real money was charged.</em>`;
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
