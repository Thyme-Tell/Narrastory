import '../scss/main.scss'
import 'lazysizes'
import 'lazysizes/plugins/unveilhooks/ls.unveilhooks'
import 'lazysizes/plugins/bgset/ls.bgset'

// utils
import './utils/initLenis.js'
import './utils/initBtns.js'

// components
import './components/header.js'
import './components/textReveal.js'
import './components/slider.js'
import './components/bannerReveal.js'
import './components/smooth-scroller.js'
import './components/scale-up.js'
import './components/circle-reveal.js'
import './components/subscription.js'

document.addEventListener('lazybeforeunveil', e => {
	if (e.target instanceof HTMLElement) {
		const bg = e.target.getAttribute('data-bg')
		if (bg) {
			e.target.style.backgroundImage = `url(${bg})`
		}
	}
})

/**
 * Accept HMR as per: https://vitejs.dev/guide/api-hmr.html
 */
/// <reference types="vite/client" />
if (import.meta.hot) {
	import.meta.hot.accept(() => {
		console.log('HMR')
	})
}
