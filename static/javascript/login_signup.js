const btnLogin = document.getElementById("btnLogin");
const btnSignup = document.getElementById("btnSignup");

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

// Hiển thị form với hiệu ứng có hướng (direction: 'left' hoặc 'right')
function showForm(show, hide, tabShow, tabHide, direction = 'left') {

    tabShow.classList.add("active");
    tabHide.classList.remove("active");

    // helper to clear any sliding animation classes
    function resetAnim(el) {
        el.classList.remove('slide-in-left','slide-in-right','slide-out-left','slide-out-right','show','hide-animate');
    }

    // If the hide form is visible, animate it out
    if (!hide.classList.contains("hidden")) {
        resetAnim(hide);
        // direction 'left' means outgoing moves left, incoming comes from right
        hide.classList.add(direction === 'left' ? 'slide-out-left' : 'slide-out-right');

        setTimeout(() => {
            hide.classList.add("hidden");
            resetAnim(hide);
            hide.setAttribute('aria-hidden', 'true');
        }, 400);
    }

    // Prepare and animate the show form in
    resetAnim(show);
    show.classList.remove("hidden");
    show.setAttribute('aria-hidden', 'false');
    show.classList.add(direction === 'left' ? 'slide-in-left' : 'slide-in-right');

    // remove incoming animation class after it finishes
    setTimeout(() => resetAnim(show), 480);
}

// CLICK LOGIN
btnLogin.addEventListener("click", () => {
    // Switch back to Login: incoming form should slide in from left
    showForm(loginForm, signupForm, btnLogin, btnSignup, 'right');
});

// CLICK SIGNUP
btnSignup.addEventListener("click", () => {
    // Switch to Signup: incoming form should slide in from right
    showForm(signupForm, loginForm, btnSignup, btnLogin, 'left');
});

// Accessibility: set initial aria-hidden states
document.addEventListener('DOMContentLoaded', () => {
    if (loginForm) loginForm.setAttribute('aria-hidden', loginForm.classList.contains('hidden') ? 'true' : 'false');
    if (signupForm) signupForm.setAttribute('aria-hidden', signupForm.classList.contains('hidden') ? 'true' : 'false');
});

// Highlight active nav link based on current pathname
function highlightActiveNavSimple() {
    try {
        const links = Array.from(document.querySelectorAll('header .navbar nav a'));
        if (!links.length) return;
        const current = window.location.pathname;
        links.forEach(a => {
            const href = a.getAttribute('href') || '';
            // normalize paths for comparison
            if (href.startsWith('/')) {
                const url = new URL(href, window.location.origin);
                a.classList.toggle('active', url.pathname === current);
            } else {
                // if relative or anchor, consider match by file name
                a.classList.toggle('active', href && current.endsWith(href.replace(/^\/#/, '')));
            }
        });
    } catch (e) {
        // ignore
    }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', highlightActiveNavSimple);
else highlightActiveNavSimple();
