document.addEventListener('scroll', () => {
	const { scrollY } = window
	const threshold = 500 // Trigger point in pixels
	const navLinks = document.querySelectorAll('.nav-link')

	if (scrollY > threshold) {
		navLinks.forEach(link => link.classList.add('collapsed'))
	} else {
		navLinks.forEach(link => link.classList.remove('collapsed'))
	}
})

document.addEventListener('DOMContentLoaded', () => {
	const currentPage = window.location.pathname
	const navLinks = document.querySelectorAll('.nav-link')

	navLinks.forEach(link => {
		link.classList.remove('active')
		if (link.getAttribute('href') === currentPage) {
			link.classList.add('active')
		}
	})
})
