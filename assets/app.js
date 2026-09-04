document.addEventListener('DOMContentLoaded', () => {

    const counterElement = document.getElementById('counter');
    let count = 0;
    const interval = setInterval(() => {
        count += Math.floor(Math.random() * 15) + 5;
        if (count >= 100) {
            count = 100;
            clearInterval(interval);
            counterElement.innerText = count;
            setTimeout(() => {
                document.body.classList.add('loaded');
            }, 300);
        } else {
            counterElement.innerText = count;
        }
    }, 50);

    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 };
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal-up').forEach(el => revealObserver.observe(el));

    const wrapper = document.querySelector('.horizontal-scroll-wrapper');
    const track = document.getElementById('horizontal-track');

    if (wrapper && track) {
        window.addEventListener('scroll', () => {
            const rect = wrapper.getBoundingClientRect();
            if (rect.top <= 0 && rect.bottom >= window.innerHeight) {
                const scrollProgress = Math.abs(rect.top) / (rect.height - window.innerHeight);
                const maxScroll = track.scrollWidth - window.innerWidth + (window.innerWidth * 0.1);
                track.style.transform = `translateX(-${scrollProgress * maxScroll}px)`;
            }
        });
    }

    const workItems = document.querySelectorAll('.work-item');
    workItems.forEach(item => {
        const imgPath = item.getAttribute('data-img');
        if (imgPath) {
            item.style.backgroundImage = `linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0) 70%), url('${imgPath}')`;
        }
    });

   
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            mobileMenu.classList.toggle('open');
            document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
        });

        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                mobileMenu.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }

    // --- Premium Cookie Banner Logic ---
    const cookieBanner = document.getElementById('premium-cookie-banner');
    const btnAccept = document.getElementById('btn-accept-cookie');
    const btnRefuse = document.getElementById('btn-refuse-cookie');

    if (cookieBanner && btnAccept && btnRefuse) {
        // Verifica se o usuário já respondeu
        const cookieConsent = localStorage.getItem('jovana_cookie_consent');

        if (!cookieConsent) {
            // Animação de entrada suave após 1.5 segundos
            setTimeout(() => {
                cookieBanner.classList.add('show');
            }, 1500);
        }

        // Função para ocultar com estilo e salvar a escolha
        const closeBanner = (choice) => {
            localStorage.setItem('jovana_cookie_consent', choice);
            cookieBanner.classList.remove('show');
        };

        btnAccept.addEventListener('click', () => closeBanner('accepted'));
        btnRefuse.addEventListener('click', () => closeBanner('refused'));
    }
});