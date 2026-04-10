// Simple scroll effect for Navbar
window.addEventListener("scroll", () => {
	const nav = document.querySelector("nav");
	if (window.scrollY > 50) {
		nav.style.padding = "0.8rem 5%";
		nav.style.boxShadow = "0 10px 30px rgba(0,0,0,0.3)";
	} else {
		nav.style.padding = "1.25rem 5%";
		nav.style.boxShadow = "none";
	}
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
	anchor.addEventListener("click", function (e) {
		e.preventDefault();
		document.querySelector(this.getAttribute("href")).scrollIntoView({
			behavior: "smooth",
		});
	});
});
