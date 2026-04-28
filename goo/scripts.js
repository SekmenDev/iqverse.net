// Mobile Menu Toggle
document.addEventListener("DOMContentLoaded", function () {
	const mobileMenuToggle = document.getElementById("mobileMenuToggle");
	const mobileMenu = document.getElementById("mobileMenu");
	const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");

	// Toggle mobile menu
	mobileMenuToggle.addEventListener("click", function () {
		mobileMenuToggle.classList.toggle("active");
		mobileMenu.classList.toggle("active");
	});

	// Close menu when a link is clicked
	mobileNavLinks.forEach((link) => {
		link.addEventListener("click", function () {
			mobileMenuToggle.classList.remove("active");
			mobileMenu.classList.remove("active");
		});
	});

	// Close menu when clicking outside
	document.addEventListener("click", function (event) {
		const isClickInsideHeader = event.target.closest(".header");
		if (!isClickInsideHeader && mobileMenu.classList.contains("active")) {
			mobileMenuToggle.classList.remove("active");
			mobileMenu.classList.remove("active");
		}
	});
});
