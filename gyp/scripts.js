// Smooth active nav on scroll
const sections = document.querySelectorAll("section[id], div[id]");
const navLinks = document.querySelectorAll(".nav-links a");
window.addEventListener(
	"scroll",
	() => {
		let current = "";
		sections.forEach((s) => {
			if (window.scrollY >= s.offsetTop - 100) current = s.id;
		});
		navLinks.forEach((a) => {
			a.style.color = a.getAttribute("href") === "#" + current ? "#fff" : "";
		});
		// Navbar bg on scroll
		document.getElementById("navbar").style.background = window.scrollY > 40 ? "rgba(9,9,15,.95)" : "rgba(9,9,15,.8)";
	},
	{ passive: true },
);

// Fade-up on scroll for cards
const observer = new IntersectionObserver(
	(entries) => {
		entries.forEach((e) => {
			if (e.isIntersecting) {
				e.target.style.opacity = "1";
				e.target.style.transform = "translateY(0)";
			}
		});
	},
	{ threshold: 0.12 },
);
document.querySelectorAll(".prob-card,.feat-card,.pers-card,.sec-card,.testi-card").forEach((el, i) => {
	el.style.opacity = "0";
	el.style.transform = "translateY(20px)";
	el.style.transition = `opacity .5s ease ${(i % 4) * 0.07}s, transform .5s ease ${(i % 4) * 0.07}s, border-color .2s, box-shadow .2s`;
	observer.observe(el);
});
