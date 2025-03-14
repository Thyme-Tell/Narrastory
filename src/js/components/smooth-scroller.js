import { gsap } from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const blocks = document.querySelectorAll('.meet-narra__block')

// if window width is bigger than 767px run the animation
if (window.innerWidth > 767) {
	if (blocks.length > 0) {
		// @ts-ignore
		// eslint-disable-next-line new-cap
		const tl = new gsap.timeline({
			scrollTrigger: {
				trigger: '.meet-narra__blocks',
				start: '-20% top',
				scrub: true,
			},
		})

		tl.to(blocks[0], {
			y: 200,
		})

		tl.fromTo(blocks[1], { y: 700 }, { y: 400, ease: 'none' }, '<')
	}
}
