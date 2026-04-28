// IQVerse Tools - script.js

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

// ── Make tool-cards clickable ─────────────────────────────────────────────

document.querySelectorAll(".tool-card[data-href]").forEach((card) => {
	card.style.cursor = "pointer";
	card.addEventListener("click", (e) => {
		// Don't navigate if clicking on a text selection
		if (window.getSelection().toString()) return;
		const href = card.getAttribute("data-href");
		if (href) {
			const target = href.includes("https") ? "_blank" : "_self";
			window.open(href, target);
		}
	});
	// Add keyboard support (Enter key)
	card.setAttribute("role", "button");
	card.setAttribute("tabindex", "0");
	card.addEventListener("keypress", (e) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			const href = card.getAttribute("data-href");
			if (href) {
				const target = href.includes("https") ? "_blank" : "_self";
				window.open(href, target);
			}
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
