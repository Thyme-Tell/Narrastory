import { gsap } from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const circleReveal = document.querySelector('.circle-reveal')

if (circleReveal) {
	// @ts-ignore
	// eslint-disable-next-line new-cap
	const tl = new gsap.timeline({
		scrollTrigger: {
			trigger: circleReveal,
			start: 'top top',
			end: () => `+=200%`,
			scrub: true,
			pin: true,
		},
	})

	tl.to('.circle-reveal__circle', {
		'clip-path': 'circle(100% at 50% 50%)',
		duration: 4,
	})

	tl.to('.circle-reveal__content', {
		opacity: 1,
		duration: 1,
	})

	tl.to(
		'.circle-reveal__content h3',
		{
			opacity: 1,
			duration: 1,
			y: -20,
		},
		'-=0.5'
	)

	tl.to({}, { duration: 1 })
}
