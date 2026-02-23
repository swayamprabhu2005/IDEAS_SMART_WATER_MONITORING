import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = "https://oqbzbvkbqzpcuivsahkx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xYnpidmticXpwY3VpdnNhaGt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MDk2MTMsImV4cCI6MjA3NDE4NTYxM30._bAXsOuz-xPbALqK9X0R5QKNZcwSzKCats3vMTfDGWs";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let isLoggedIn = false;
let currentUser = null;

function pickColorFromString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const group = Math.abs(hash) % 3;

  switch (group) {
    case 0:
      return `hsl(${20 + (hash % 20)}, 85%, 60%)`;
    case 1:
      return `hsl(${220 + (hash % 40)}, 60%, 55%)`;
    case 2:
      return `hsl(${40 + (hash % 10)}, 50%, ${50 + (hash % 10)}%)`;
    default:
      return `hsl(200, 50%, 60%)`;
  }
}

function getDisplayName(user) {
  const meta = user?.user_metadata || {};
  return (
    meta.full_name ||
    meta.name ||
    (user.email ? user.email.split("@")[0] : "User")
  );
}

function createAvatarHtml(user) {
  const displayName = getDisplayName(user);
  const email = user.email || "";
  const letter = (displayName?.[0] || "?").toUpperCase();
  const bg = pickColorFromString(displayName || email || letter);

  return `<div class="avatar-fallback" style="background:${bg}">${letter}</div>`;
}

async function guardProtectedPage() {
  if (!document.body.dataset.protectedPage) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    window.location.href = "login.html";
  }
}

function applyNavState(user) {
  const loginBtnEl = document.querySelector(".login-btn");

  const links = document.querySelectorAll(".protected-link");

  links.forEach((el) => {
    if (!el.dataset.guardAttached) {
      el.addEventListener("click", function (e) {
        if (!isLoggedIn) {
          e.preventDefault();
          e.stopPropagation();

          if (el.onclick) {
            el.onclick = null;
          }

          window.location.href = "login.html";
        }
      });

      el.dataset.guardAttached = "true";
    }
  });

  if (!loginBtnEl) return;

  const newBtn = loginBtnEl.cloneNode(false);
  newBtn.className = loginBtnEl.className;
  loginBtnEl.parentNode.replaceChild(newBtn, loginBtnEl);

  if (user) {
    isLoggedIn = true;
    currentUser = user;

    const name = getDisplayName(user);
    const email = user.email;
    const avatarHtml = createAvatarHtml(user);

    newBtn.href = "#";
    newBtn.innerHTML = `
      <div class="user-menu">
        <div class="user-trigger">
          ${avatarHtml}
          <span class="user-label">${name}</span>
          <span class="chev">▾</span>
        </div>

        <div class="user-dropdown" role="menu" aria-hidden="true">
          <div class="dropdown-head">
            <div class="dropdown-avatar">${avatarHtml}</div>
            <div class="dropdown-info">
              <strong class="dropdown-name">${name}</strong>
              <div class="dropdown-email">${email}</div>
            </div>
          </div>

          <div class="dropdown-actions">
            <button class="btn logout-btn pink-btn">Logout</button>
          </div>
        </div>
      </div>
    `;

    const trigger = newBtn.querySelector(".user-trigger");
    const dropdown = newBtn.querySelector(".user-dropdown");

    trigger.addEventListener("click", (ev) => {
      ev.preventDefault();
      const hidden = dropdown.getAttribute("aria-hidden") === "true";
      dropdown.setAttribute("aria-hidden", hidden ? "false" : "true");
      dropdown.style.display = hidden ? "block" : "none";
    });

    const logoutBtn = newBtn.querySelector(".logout-btn");

    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();

      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        window.location.href = "index.html";
      } catch (err) {
        console.error("[auth] signOut failed", err);
        alert("Logout failed: " + (err.message || err));
      }
    });

    document.addEventListener("click", (evt) => {
      if (!newBtn.contains(evt.target)) {
        dropdown.setAttribute("aria-hidden", "true");
        dropdown.style.display = "none";
      }
    });
  } else {
    isLoggedIn = false;
    currentUser = null;

    newBtn.textContent = "Login";
    newBtn.href = "login.html";
  }
}

async function refreshAuthState() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    applyNavState(user);
  } catch (err) {
    console.error("[auth] getUser failed", err);
  }
}

function subscribeAuthChanges() {
  supabase.auth.onAuthStateChange((_event, session) => {
    const user = session?.user ?? null;
    applyNavState(user);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await guardProtectedPage();
  await refreshAuthState();
  subscribeAuthChanges();
});