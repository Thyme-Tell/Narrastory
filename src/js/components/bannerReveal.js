import { gsap } from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import SplitText from 'gsap/src/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

const banner = document.querySelector('.banner-text-reveal')

if (banner) {
	const content = banner.querySelector('.banner__content')
	const copy = banner.querySelector('.banner__copy')
	const header = banner.querySelector('.banner__header')
	const text = banner.querySelector('.banner__text')
	const img = banner.querySelector('.banner__bg img')

	const splitHeader = new SplitText(header, {
		type: 'chars',
	})

	// @ts-ignore
	// eslint-disable-next-line new-cap
	const tl = new gsap.timeline({
		scrollTrigger: {
			trigger: '.banner__container',
			start: 'top top',
			end: '+=300%',
			scrub: true,
			pin: true,
		},
	})

	tl.from(content, {
		opacity: '0',
		duration: 0.001,
		ease: 'none',
	})

	tl.from(splitHeader.chars, {
		opacity: '0',
		duration: 2,
		stagger: 0.1,
		ease: 'none',
	})

	tl.fromTo(
		copy,
		{ left: '50%' },
		{ left: '25%', duration: 4, ease: 'ease-out' }
	)

	tl.from(
		text,
		{
			opacity: '0',
			duration: 2,
			ease: 'none',
		},
		'<'
	)

	tl.from(
		img,
		{
			opacity: '0',
			duration: 5,
			ease: 'none',
		},
		'<1'
	)

	tl.to({}, { duration: 2 })
}
