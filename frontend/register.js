import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = "https://oqbzbvkbqzpcuivsahkx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xYnpidmticXpwY3VpdnNhaGt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MDk2MTMsImV4cCI6MjA3NDE4NTYxM30._bAXsOuz-xPbALqK9X0R5QKNZcwSzKCats3vMTfDGWs";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  if (!form) return;

  const nameEl = document.getElementById("name");
  const emailEl = document.getElementById("email");
  const phoneEl = document.getElementById("phone");
  const passwordEl = document.getElementById("password");
  const confirmEl = document.getElementById("confirmPassword");

  let errorEl = document.getElementById("error-msg");

  if (!errorEl) {
    errorEl = document.createElement("p");
    errorEl.id = "error-msg";
    errorEl.style.color = "red";
    errorEl.style.fontSize = "0.9rem";
    errorEl.style.marginTop = "5px";
    form.appendChild(errorEl);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.textContent = "";

    const name = nameEl?.value.trim() || "";
    const email = emailEl?.value.trim() || "";
    const phone = phoneEl?.value.trim() || "";
    const password = passwordEl?.value || "";
    const confirmPassword = confirmEl?.value || "";

    /* ===== VALIDATION ===== */

    if (!name || !email || !phone || !password || !confirmPassword) {
      errorEl.textContent = "Please fill all fields.";
      return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      errorEl.textContent = "Phone number must be exactly 10 digits.";
      return;
    }

    if (password !== confirmPassword) {
      errorEl.textContent = "Passwords do not match.";
      return;
    }

    /* ===== SIGNUP ===== */

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            phone: phone
          }
        }
      });

      if (error) {
        console.error("[register] error", error);
        errorEl.textContent =
          "Registration failed: " + (error.message || error);
        return;
      }
      window.location.href = "login.html";

    } catch (err) {
      console.error("[register] unexpected error", err);
      errorEl.textContent = "Unexpected error. Check console.";
    }
  });
});