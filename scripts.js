// IQVerse Tools — script.js

// ── Intersection Observer for scroll reveals ──────────────────────────────

const revealEls = document.querySelectorAll(".tool-card, .idea-card");

const observer = new IntersectionObserver(
	(entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				// Stagger children of idea grid
				const el = entry.target;
				const delay = el.classList.contains("idea-card")
					? Array.from(el.parentElement.children).indexOf(el) * 60
					: Array.from(el.parentElement.querySelectorAll(".tool-card")).indexOf(el) * 120;

				setTimeout(() => {
					el.classList.add("visible");
				}, delay);

				observer.unobserve(el);
			}
		});
	},
	{ threshold: 0.08 },
);

revealEls.forEach((el) => observer.observe(el));

// ── Nav scroll state ──────────────────────────────────────────────────────

const nav = document.querySelector(".nav");

window.addEventListener(
	"scroll",
	() => {
		if (window.scrollY > 40) {
			nav.style.borderBottomColor = "rgba(255,255,255,0.1)";
		} else {
			nav.style.borderBottomColor = "rgba(255,255,255,0.07)";
		}
	},
	{ passive: true },
);

// ── Smooth scroll for anchor links ────────────────────────────────────────

document.querySelectorAll('a[href^="#"]').forEach((link) => {
	link.addEventListener("click", (e) => {
		const target = document.querySelector(link.getAttribute("href"));
		if (target) {
			e.preventDefault();
			target.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	});
});

// ── Subtle cursor glow follow on tool cards ───────────────────────────────

function initCursorGlow() {
	const glow = document.createElement("div");
	glow.className = "cursor-glow";
	document.body.appendChild(glow);
	let fadeTimeout;
	document.addEventListener("mousemove", (event) => {
		glow.style.left = `${event.clientX}px`;
		glow.style.top = `${event.clientY}px`;
		glow.style.opacity = "1";
		glow.style.zIndex = "0";
		clearTimeout(fadeTimeout);
		fadeTimeout = setTimeout(() => {
			glow.style.opacity = "0";
		}, 900);
	});
	document.addEventListener("mouseleave", () => {
		glow.style.opacity = "0";
	});
}
initCursorGlow();