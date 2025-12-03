/* home.js
 * Small interactive behaviors for the site home page:
 * - mobile nav toggle (injects a toggle button if needed)
 * - header shrink / add .scrolled on scroll
 * - back-to-top button (created dynamically)
 * - smooth in-page anchor scrolling
 * - lazy-load images (uses loading="lazy" or IntersectionObserver)
 * - highlight active nav link
 */

(function () {
	'use strict';

	// Utilities
	function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
	function qsa(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

	/* NAV TOGGLE (responsive) */
	function initNavToggle() {
		const header = qs('.navbar');
		if (!header) return;
		const nav = header.querySelector('nav');
		if (!nav) return;

		// create toggle only if not exists
		if (!qs('.nav-toggle', header)) {
			const btn = document.createElement('button');
			btn.type = 'button';
			btn.className = 'nav-toggle';
			btn.setAttribute('aria-expanded', 'false');
			btn.setAttribute('aria-label', 'Toggle navigation');
			btn.innerHTML = '&#9776;'; // hamburger
			// minimal inline styles so it works without CSS changes
			btn.style.fontSize = '20px';
			btn.style.background = 'transparent';
			btn.style.border = 'none';
			btn.style.cursor = 'pointer';
			btn.style.color = 'inherit';
			btn.style.marginLeft = '12px';
			header.insertBefore(btn, header.firstChild);

			// toggle behavior: show/hide nav on small screens
			btn.addEventListener('click', () => {
				const isOpen = btn.getAttribute('aria-expanded') === 'true';
				btn.setAttribute('aria-expanded', String(!isOpen));
				if (!isOpen) {
					nav.style.display = 'block';
				} else {
					nav.style.display = '';
				}
			});

			// ensure nav is visible when resizing to wide screens
			window.addEventListener('resize', () => {
				if (window.innerWidth > 860) {
					nav.style.display = '';
					btn.setAttribute('aria-expanded', 'false');
				} else {
					// hide nav by default on small screens
					if (btn.getAttribute('aria-expanded') !== 'true') nav.style.display = 'none';
				}
			});

			// initial state
			if (window.innerWidth <= 860) {
				nav.style.display = 'none';
			}
		}
	}

	/* HEADER SCROLL EFFECT */
	function initHeaderScroll() {
		const header = qs('.navbar');
		if (!header) return;

		function onScroll() {
			const scrolled = window.scrollY > 40;
			header.classList.toggle('scrolled', scrolled);
		}

		window.addEventListener('scroll', onScroll, { passive: true });
		onScroll();
	}

	/* BACK TO TOP */
	function initBackToTop() {
		const btn = document.createElement('button');
		btn.type = 'button';
		btn.className = 'back-to-top';
		btn.title = 'Back to top';
		btn.innerHTML = '&#8679;';
		// minimal inline styles so it's visible
		Object.assign(btn.style, {
			position: 'fixed',
			right: '18px',
			bottom: '18px',
			width: '44px',
			height: '44px',
			borderRadius: '8px',
			border: 'none',
			background: '#0a0a18',
			color: '#fff',
			display: 'none',
			alignItems: 'center',
			justifyContent: 'center',
			cursor: 'pointer',
			zIndex: 9999,
			fontSize: '18px',
		});

		document.body.appendChild(btn);

		btn.addEventListener('click', () => {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		});

		function onScroll() {
			btn.style.display = window.scrollY > 300 ? 'flex' : 'none';
		}

		window.addEventListener('scroll', onScroll, { passive: true });
		onScroll();
	}

	/* SMOOTH IN-PAGE ANCHOR SCROLLING */
	function initSmoothAnchors() {
		document.addEventListener('click', function (e) {
			const a = e.target.closest('a');
			if (!a) return;
			const href = a.getAttribute('href') || '';
			if (href.startsWith('#') && href.length > 1) {
				const target = document.getElementById(href.slice(1));
				if (target) {
					e.preventDefault();
					target.scrollIntoView({ behavior: 'smooth', block: 'start' });
				}
			}
		});
	}

	/* LAZY IMAGES */
	function initLazyImages() {
		const imgs = qsa('img');
		if ('loading' in HTMLImageElement.prototype) {
			imgs.forEach(img => img.setAttribute('loading', 'lazy'));
			return;
		}

		// fallback to IntersectionObserver
		if ('IntersectionObserver' in window) {
			const io = new IntersectionObserver((entries, obs) => {
				entries.forEach(entry => {
					if (entry.isIntersecting) {
						const img = entry.target;
						if (img.dataset && img.dataset.src) img.src = img.dataset.src;
						img.removeAttribute('data-src');
						io.unobserve(img);
					}
				});
			}, { rootMargin: '200px' });

			imgs.forEach(img => {
				if (img.dataset && img.dataset.src) io.observe(img);
			});
		}
	}

	/* ACTIVE NAV LINK */
	function highlightActiveNav() {
		const links = qsa('header .navbar nav a');
		if (!links.length) return;
	const path = window.location.pathname.replace(/\/index\.html$/, '/') || '/';
		links.forEach(a => {
			// compare pathname or anchor
			try {
				const href = a.getAttribute('href');
				if (!href) return;
				// if absolute or starts with / compare pathname
				if (href.startsWith('/')) {
					const url = new URL(href, window.location.origin);
					a.classList.toggle('active', url.pathname === window.location.pathname);
				} else if (href.startsWith('#')) {
					// don't mark
				} else {
					// relative links
					a.classList.toggle('active', href === '' || href === '.' ? window.location.pathname.endsWith('/') : window.location.pathname.endsWith(href));
				}
			} catch (err) {
				// ignore
			}
		});
	}

	// Init all
	function init() {
		initNavToggle();
		initHeaderScroll();
		initBackToTop();
		initSmoothAnchors();
		initLazyImages();
		highlightActiveNav();
		initCarousel();
		// lightweight behaviors for new sections
		initSeeMore('.new-arrivals');
		initSeeMore('.most-searched');
		initNewsletterForm();
	}

	// Run on DOM ready
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
	else init();

})();

/* Carousel initialization */
function initCarousel() {
	const carousel = document.querySelector('.banner-carousel .carousel');
	if (!carousel) return;
	const track = carousel.querySelector('.carousel-track');
	const slides = Array.from(track.children);
	if (!slides.length) return;

	// clone first slide for seamless looping
	const firstClone = slides[0].cloneNode(true);
	track.appendChild(firstClone);

	let index = 0; // current slide index
	const total = slides.length; // original count
	let slideWidth = carousel.querySelector('.carousel-viewport').offsetWidth;
	let timer = null;
	// make focusable for keyboard navigation
	carousel.tabIndex = 0;

	function update() {
		track.style.transition = 'transform .6s ease';
		track.style.transform = `translateX(-${(index+0) * 100}%)`;
	}

	function next() {
		index++;
		update();
		if (index > total - 1) {
			// when clone visible, after transition reset to 0 without animation
			setTimeout(() => {
				track.style.transition = 'none';
				track.style.transform = 'translateX(0)';
				index = 0;
			}, 620);
		}
	}

	function prev() {
		if (index === 0) {
			// jump to clone (end) first then show previous
			track.style.transition = 'none';
			track.style.transform = `translateX(-${total * 100}%)`;
			index = total - 1;
			// force reflow
			void track.offsetWidth;
			track.style.transition = 'transform .6s ease';
			track.style.transform = `translateX(-${index * 100}%)`;
		} else {
			index--;
			update();
		}
	}

	function start() {
		stop();
		timer = setInterval(next, 3500);
	}
	function stop() { if (timer) { clearInterval(timer); timer = null; } }

	// controls
	const nextBtn = carousel.querySelector('.carousel-next');
	const prevBtn = carousel.querySelector('.carousel-prev');
	if (nextBtn) nextBtn.addEventListener('click', () => { stop(); next(); start(); });
	if (prevBtn) prevBtn.addEventListener('click', () => { stop(); prev(); start(); });

	// pause on hover
	carousel.addEventListener('mouseenter', stop);
	carousel.addEventListener('mouseleave', start);

	// keyboard navigation
	carousel.addEventListener('keydown', (e) => {
		if (e.key === 'ArrowRight') { stop(); next(); start(); }
		else if (e.key === 'ArrowLeft') { stop(); prev(); start(); }
	});

	// swipe / drag support (pointer events)
	(function addDrag() {
		const viewport = carousel.querySelector('.carousel-viewport');
		if (!viewport) return;
		let pointerId = null;
		let startX = 0;
		let deltaX = 0;
		let dragging = false;

		function onDown(e) {
			pointerId = e.pointerId;
			viewport.setPointerCapture(pointerId);
			startX = e.clientX;
			deltaX = 0;
			dragging = true;
			track.style.transition = 'none';
		}

		function onMove(e) {
			if (!dragging || e.pointerId !== pointerId) return;
			deltaX = e.clientX - startX;
			const translate = -index * slideWidth + deltaX;
			track.style.transform = `translateX(${translate}px)`;
		}

		function onUp(e) {
			if (!dragging || e.pointerId !== pointerId) return;
			viewport.releasePointerCapture(pointerId);
			dragging = false;
			// threshold
			const threshold = Math.max(50, slideWidth * 0.12);
			if (deltaX < -threshold) {
				stop(); next(); start();
			} else if (deltaX > threshold) {
				stop(); prev(); start();
			} else {
				// snap back
				track.style.transition = 'transform .3s ease';
				track.style.transform = `translateX(-${index * 100}%)`;
			}
			pointerId = null;
			deltaX = 0;
		}

		viewport.addEventListener('pointerdown', onDown);
		viewport.addEventListener('pointermove', onMove);
		viewport.addEventListener('pointerup', onUp);
		viewport.addEventListener('pointercancel', onUp);
	})();

	// responsive: recalc widths on resize
	window.addEventListener('resize', () => {
		slideWidth = carousel.querySelector('.carousel-viewport').offsetWidth;
	});

	// kick off
	start();
}

	/* --- New small behaviors for added home sections --- */
	function initNewArrivals() {
		// arrivals used to support drag-to-scroll when layout was horizontal.
		// Now arrivals are a responsive grid, so this behavior is no-op.
		return;
	}

	function initSeeMore(selector) {
		const sections = Array.from(document.querySelectorAll(selector));
		if (!sections.length) return;
		sections.forEach(section => {
			const track = section.querySelector('.arrivals-track');
			const btn = section.querySelector('.arrivals-more');
			if (!btn || !track) return;

			btn.addEventListener('click', () => {
				const expanded = track.classList.toggle('expanded');
				// toggle hidden class on extras
				Array.from(track.querySelectorAll('.arrival.extra')).forEach(el => {
					if (expanded) el.classList.remove('hidden');
					else el.classList.add('hidden');
				});
				btn.textContent = expanded ? 'Thu gọn' : 'Xem thêm';
			});
		});
	}

	/* events accordion removed (events section no longer present) */

	function initNewsletterForm() {
		const form = document.querySelector('.newsletter-form');
		if (!form) return;
		form.addEventListener('submit', (e) => {
			e.preventDefault();
			const email = (form.querySelector('input[type="email"]') || {}).value || '';
			const btn = form.querySelector('button');
			const valid = /^\S+@\S+\.\S+$/.test(email.trim());
			if (!valid) {
				alert('Vui lòng nhập email hợp lệ');
				return;
			}
			if (btn) { btn.disabled = true; btn.textContent = 'Đang gửi...'; }
			// fake submit (no backend in this repo)
			setTimeout(() => {
				if (btn) { btn.disabled = false; btn.textContent = 'Đăng ký'; }
				form.reset();
				alert('Cảm ơn! Bạn đã đăng ký nhận tin.');
			}, 900);
		});
	}

