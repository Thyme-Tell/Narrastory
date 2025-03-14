import { gsap } from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const revealText = document.querySelector('.reveal')

if (revealText) {
	const text1 = revealText.querySelector('.reveal-first')
	const text2 = revealText.querySelectorAll('.reveal-second')

	gsap.from(revealText, {
		opacity: 0,
		ease: 'none',
		duration: 1,
		scrollTrigger: {
			trigger: '.textReveal__container',
			start: 'top 50%',
			end: '+=50%',
			scrub: true,
		},
	})

	// @ts-ignore
	// eslint-disable-next-line new-cap
	const revealTL = new gsap.timeline({
		scrollTrigger: {
			trigger: '.textReveal__container',
			start: 'top top',
			end: '+=150%',
			scrub: true,
			pin: true,
		},
	})

	revealTL.fromTo(
		text1,
		{ filter: 'blur(4px)' },
		{ filter: 'blur(0px)', duration: 0.5, ease: 'none' }
	)
	revealTL.from(text2, {
		filter: 'blur(4px)',
		stagger: 1,
		duration: 2,
		ease: 'none',
	})

	gsap.to(revealText, {
		opacity: 0,
		ease: 'none',
		duration: 1,
		scrollTrigger: {
			trigger: '.textReveal__container',
			start: 'bottom 80%',
			end: '+=15%',
			scrub: true,
		},
	})
}
