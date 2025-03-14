import { gsap } from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const slider = document.querySelector('.slider')

if (slider) {
	const next = slider.querySelector('.slider__next')
	// @ts-ignore
	// eslint-disable-next-line new-cap
	const sliderTl = new gsap.timeline({
		scrollTrigger: {
			trigger: '.slider',
			start: 'top top',
			end: () => `+=300%`,
			scrub: true,
			pin: true,
		},
	})

	sliderTl.to('.slider__container', {
		xPercent: -100,
		x: () => window.innerWidth,
		ease: 'none',
	})

	sliderTl.to(next, {
		opacity: 0,
		ease: 'none',
		duration: 0,
	})
}
