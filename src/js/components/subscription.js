const forms = document.querySelectorAll('.hero__signup')

if (forms.length) {
	forms.forEach(form => {
		form.addEventListener('freeform-ajax-success', event => {
			const successBanner = form.querySelector('.freeform-form-success')
			if (successBanner) {
				successBanner.style.display = 'block'

				setTimeout(() => {
					successBanner.style.display = 'none'
				}, 4000)
			}
		})
	})
}
