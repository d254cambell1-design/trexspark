// Wait 3 seconds for the splash screen, then show the landing page
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById("splash").style.display = "none";
    document.getElementById("page-landing").style.display = "block";
  }, 3000);
});

// This function is bulletproof. It hides all 6 pages, then opens the exact one clicked.
function navTo(pageId) {
  const pages = ["page-landing", "page-login", "page-otp", "page-dashboard", "page-trading", "page-pay"];
  
  pages.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });

  const target = document.getElementById(pageId);
  if (target) target.style.display = "block";

  // Show navbar only on main pages
  if (["page-dashboard", "page-trading", "page-pay"].includes(pageId)) {
    document.getElementById("main-navbar").style.display = "flex";
  } else {
    document.getElementById("main-navbar").style.display = "none";
  }
  
  window.scrollTo(0, 0);
}

// Login Logic
function goToOtp() {
  const phone = document.getElementById("login-phone").value.trim();
  if (phone.length < 8) {
    document.getElementById("login-error").textContent = "Please enter a valid phone number.";
    return;
  }
  
  document.getElementById("otp-text").textContent = "Code has been sent to your linked account.";
  navTo("page-otp");
}

// OTP Logic
function verifyOtp() {
  const code = document.getElementById("otp-input").value.trim();
  if (code === "1234") {
    navTo("page-dashboard");
  } else {
    document.getElementById("otp-error").textContent = "Incorrect code. Try 1234.";
  }
}

// Logout Logic
function logout() {
  window.location.reload();
}
