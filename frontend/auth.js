import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://oqbzbvkbqzpcuivsahkx.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xYnpidmticXpwY3VpdnNhaGt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MDk2MTMsImV4cCI6MjA3NDE4NTYxM30._bAXsOuz-xPbALqK9X0R5QKNZcwSzKCats3vMTfDGWs";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let isLoggedIn = false;
let currentUser = null;

document.addEventListener("DOMContentLoaded", async () => {
  const sidebar = document.getElementById("sidebar");
  const toggleBtn = document.getElementById("toggleBtn");
  const welcomeEl = document.getElementById("welcomeUser");

  if (!sidebar || !toggleBtn) {
    console.error("Sidebar or toggle button not found");
    return;
  }

  // Restore sidebar state
  const savedState = localStorage.getItem("sidebarState");
  if (savedState === "collapsed") {
    sidebar.classList.add("collapsed");
    welcomeEl.style.display = "none";
  }

  // Collapse toggle
  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    if (sidebar.classList.contains("collapsed")) {
      welcomeEl.style.display = "none";
      localStorage.setItem("sidebarState", "collapsed");
    } else {
      welcomeEl.style.display = "block";
      localStorage.setItem("sidebarState", "expanded");
    }
  });

  // Fetch logged-in user
  const { data, error } = await supabase.auth.getUser();
  if (error) console.error("Error fetching user:", error);
  const user = data?.user;

  applyAuthState(user);
  applyProtectedLinks(user);

  // Subscribe to auth changes
  supabase.auth.onAuthStateChange(async (_event, session) => {
    const newUser = session?.user ?? null;

    applyAuthState(newUser);
    applyProtectedLinks(newUser);

    if (newUser) {
      try {
        await fetch("/api/mark-active", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: newUser.email }),
        });
      } catch (err) {
        console.error("Failed to mark user active:", err);
      }
    }
  });
});

// Update sidebar + welcome text based on auth state
function applyAuthState(user) {
  const sidebarBtn = document.querySelector(".logout a");
  const sidebarIcon = sidebarBtn.querySelector(".material-icons.icon");
  const sidebarText = sidebarBtn.querySelector(".text");
  const welcomeEl = document.getElementById("welcomeUser");

  if (user) {
    isLoggedIn = true;
    currentUser = user;

    const meta = user.user_metadata || {};
    const displayName =
      meta.full_name ||
      meta.name ||
      (user.email ? user.email.split("@")[0] : "User");

    welcomeEl.textContent = `Welcome, ${displayName}`;

    sidebarIcon.textContent = "logout";
    sidebarText.textContent = "Logout";
    sidebarBtn.href = "#";
    sidebarBtn.onclick = async (e) => {
      e.preventDefault();
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        window.location.href = "index.html"; // redirect to homepage
      } catch (err) {
        console.error("[auth] sidebar signOut failed", err);
        alert("Logout failed: " + (err.message || err));
      }
    };
  } else {
    isLoggedIn = false;
    currentUser = null;

    welcomeEl.textContent = "Login to use features";

    sidebarIcon.textContent = "login";
    sidebarText.textContent = "Login";
    sidebarBtn.href = "login.html";
    sidebarBtn.onclick = null;
  }
}

// Guard protected links
function applyProtectedLinks(user) {
  const links = document.querySelectorAll(".protected-link");

  links.forEach((link) => {
    link.onclick = null; // reset any previous handler

    if (!user) {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = "login.html";
      });
    }
  });
}
