import { gsap } from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const scaleUp = document.querySelector('.scale-up')
if (window.innerWidth > 767) {
	if (scaleUp) {
		// @ts-ignore
		// eslint-disable-next-line new-cap
		const tl = new gsap.timeline({
			scrollTrigger: {
				trigger: scaleUp,
				start: 'top top',
				end: () => `+=400%`,
				scrub: true,
				pin: true,
			},
		})

		tl.to({}, { duration: 1 })

		tl.to('.scale-up__container', {
			scale: '1.8',
			ease: 'none',
			duration: 2,
		})

		tl.to(
			'.scale-up__copy',
			{
				opacity: '0',
				ease: 'none',
				duration: 2,
			},
			'<'
		)

		tl.to(
			'.scale-up__bg',
			{
				opacity: '0',
				ease: 'none',
				duration: 2,
			},
			'<'
		)

		tl.to('#phone-img-1', {
			opacity: '0',
			ease: 'none',
			duration: 2,
		})

		tl.fromTo(
			'.scale-up__phone__copy',
			{ bottom: '-100%' },
			{ bottom: '50px', duration: 6, ease: 'none' },
			'<'
		)

		tl.to(
			'#phone-img-2',
			{
				opacity: '0',
				ease: 'none',
				duration: 2,
			},
			'-=2'
		)

		tl.to({}, { duration: 3 })
	}
}
