const buttons = document.querySelectorAll('.button')

if (buttons.length > 0) {
	buttons.forEach(button => {
		button.onmousemove = event => {
			const rect = event.target.getBoundingClientRect()

			const x = ((event.clientX - rect.left) / rect.width) * 100
			const y = ((event.clientY - rect.top) / rect.height) * 100

			button.style.setProperty('--x', `${x}%`)
			button.style.setProperty('--y', `${y}%`)
		}
	})
}
