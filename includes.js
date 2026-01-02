// Simple static-site includes (header + footer)
async function loadInclude(targetId, url) {
  const el = document.getElementById(targetId);
  if (!el) return;

  try {
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    el.innerHTML = await res.text();
  } catch (e) {
    console.warn("Include failed:", url, e);
  }
}

function ensureTopAnchor() {
  if (document.getElementById("top")) return;
  const top = document.createElement("div");
  top.id = "top";
  top.style.position = "absolute";
  top.style.top = "0";
  top.style.left = "0";
  top.style.height = "0";
  top.style.width = "0";
  document.body.prepend(top);
}

function highlightActiveNav() {
  const header = document.getElementById("site-header");
  if (!header) return;

  const path = (location.pathname || "/").replace(/\/+$/, "");
  const isArticles = path.startsWith("/articles/");
  const basename = path.split("/").pop() || "index.html";

  const links = header.querySelectorAll("nav a[href]");

  links.forEach(a => {
    const href = a.getAttribute("href") || "";
    const isActive =
      href === path ||
      href === ("/" + basename) ||
      (basename === "index.html" && (href === "/" || href === "/index.html")) ||
      (isArticles && href === "/articles/index.html");

    if (isActive) {
      a.classList.add("active");
      a.setAttribute("aria-current", "page");
    } else {
      a.classList.remove("active");
      a.removeAttribute("aria-current");
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  ensureTopAnchor();

  await loadInclude("site-header", "/header.html");
  highlightActiveNav();

  await loadInclude("site-footer", "/footer.html");
});
