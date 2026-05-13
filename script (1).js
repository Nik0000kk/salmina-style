/* =============================================
   ЮЛИЯ САЛМИНА — СТИЛИСТ-АРХЕТИПИСТ
   script.js
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ── STICKY HEADER ── */
  const header = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

/* ── SCROLL PROGRESS BAR (Индикатор прокрутки) ── */
  const progressBar = document.getElementById('scroll-progress');
  
  window.addEventListener('scroll', () => {
    if (progressBar) {
      // Насколько пикселей мы прокрутили вниз
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      
      // Общая доступная высота для прокрутки (вся высота документа минус высота окна)
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      
      // Вычисляем процент и применяем к ширине
      const scrollPercentage = (scrollTop / scrollHeight) * 100;
      progressBar.style.width = scrollPercentage + '%';
    }
  }, { passive: true });

/* ── BURGER / MOBILE NAV ── */
  const burger = document.getElementById('burger');
  const nav    = document.getElementById('nav');
  if(burger && nav) {
    burger.addEventListener('click', () => {
      const isOpen = burger.classList.toggle('open');
      nav.classList.toggle('open', isOpen);
      header.classList.toggle('menu-open', isOpen); // Снимаем баг с размытием
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    nav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        burger.classList.remove('open');
        nav.classList.remove('open');
        header.classList.remove('menu-open'); // Возвращаем шапку в норму
        document.body.style.overflow = '';
      });
    });
  }

  /* ── SCROLL REVEAL (Анимация появления текста) ── */
  const revealEls = document.querySelectorAll('.reveal');
  revealEls.forEach(el => el.classList.add('js-reveal'));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });
  revealEls.forEach(el => observer.observe(el));

  /* ── ACCORDION (FAQ) ── */
  const triggers = document.querySelectorAll('.accordion-trigger');
  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      const panel = trigger.nextElementSibling;
      // Закрываем все остальные
      triggers.forEach(t => {
        if (t !== trigger) {
          t.setAttribute('aria-expanded', 'false');
          t.nextElementSibling.classList.remove('open');
        }
      });
      // Переключаем текущий
      if (isExpanded) {
        trigger.setAttribute('aria-expanded', 'false');
        panel.classList.remove('open');
      } else {
        trigger.setAttribute('aria-expanded', 'true');
        panel.classList.add('open');
      }
    });
  });

 /* ── CONTACT FORM (Отправка на почту через Formspree) ── */
  const form = document.getElementById('contact-form');
  const success = document.getElementById('form-success');
  
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const btn = form.querySelector('button[type="submit"]');
      btn.textContent = 'Отправляю...';
      btn.disabled = true;

      // Собираем данные из формы
      const formData = new FormData(form);

      try {
        const response = await fetch('https://formspree.io/f/xkoyawyz', {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          form.reset();
          success.classList.add('show');
          setTimeout(() => success.classList.remove('show'), 5000);
        } else {
          alert('Произошла ошибка при отправке. Пожалуйста, напишите мне в Telegram.');
        }
      } catch (error) {
        alert('Ошибка соединения. Пожалуйста, напишите мне в Telegram.');
      } finally {
        btn.textContent = 'Отправить';
        btn.disabled = false;
      }
    });
  }

  /* ── SMOOTH SCROLL (Плавный скролл) ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const headerH = header.offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 20;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
  
  /* ── LEGAL MODAL (Правовые документы) ── */
  const modal = document.getElementById('legal-modal');
  const btnOpen = document.getElementById('btn-legal');
  const btnClose = document.getElementById('legal-close');
  const overlay = document.getElementById('legal-overlay');

  function openLegal() {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
  function closeLegal() {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }

  if (btnOpen) btnOpen.addEventListener('click', (e) => { e.preventDefault(); openLegal(); });
  if (btnClose) btnClose.addEventListener('click', closeLegal);
  if (overlay) overlay.addEventListener('click', closeLegal);

  const legalTabs = document.querySelectorAll('.legal-tab');
  const docPanels = document.querySelectorAll('.doc-panel');

  legalTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      legalTabs.forEach(t => t.classList.remove('active'));
      docPanels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');
      document.querySelector('.legal-modal-body').scrollTop = 0;
    });
  });

  /* ── HOLOGRAM & SATELLITES ANIMATION ── */
  const heroScene = document.getElementById('hero-scene');
  const heroSection = document.getElementById('hero');
  
  if (heroScene && heroSection) {
    const SECTIONS = [
      { name: 'Астрология',  icon: '✦', href: '#method' },
      { name: 'Архетипы',    icon: '◈', href: '#method' },
      { name: 'Психология',  icon: '⬡', href: '#method' },
      { name: 'Таро',        icon: '◇', href: '#method' }
    ];

    // Создаем спутники и добавляем их прямо к видео-контейнеру
    const orbits = SECTIONS.map((sec, i) => {
      const el = document.createElement('div');
      el.className = 'sat-label';
      el.innerHTML = `<div class="icon">${sec.icon}</div><div class="name">${sec.name}</div>`;
      
      el.addEventListener('click', (e) => { 
        e.preventDefault();
        const target = document.querySelector(sec.href);
        if (target) {
          const headerH = document.getElementById('site-header').offsetHeight;
          const top = target.getBoundingClientRect().top + window.scrollY - headerH - 20;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
      heroScene.appendChild(el);

      return {
        el,
        baseAngle: (i / SECTIONS.length) * Math.PI * 2,
        speed: 0.002 + (Math.random() * 0.0005)
      };
    });

    // Настройка Canvas для линий энергии
    const eCanvas = document.getElementById('energy');
    const eCtx = eCanvas.getContext('2d');
    let cw, ch;
    function resizeEnergy() { 
      cw = eCanvas.width = heroSection.offsetWidth; 
      ch = eCanvas.height = heroSection.offsetHeight; 
    }
    resizeEnergy();
    window.addEventListener('resize', resizeEnergy);

    // Отслеживание мыши
    const mouse = { nx: 0, ny: 0 };
    document.addEventListener('mousemove', e => {
      mouse.nx = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.ny = -(e.clientY / window.innerHeight - 0.5) * 2;
    });

    // Анимация
    const heroVideo = document.getElementById('video-hero');
    const videoGlow = document.getElementById('video-glow');
    let t = 0;

    function animateHologram() {
      requestAnimationFrame(animateHologram);
      
      // Не анимируем, если ушли с первого экрана (экономит батарею)
      if (window.scrollY > window.innerHeight) return;

      t += 0.01;

      // Движение голограммы
      const floatY = Math.sin(t * 1.5) * 10;
      const rotateY = mouse.nx * 8;
      const rotateX = mouse.ny * -5;

      heroVideo.style.transform = `
        translate(${mouse.nx * 10}px, ${-mouse.ny * 10 + floatY}px)
        rotateY(${rotateY}deg) rotateX(${rotateX}deg)
        scale(${1 + Math.sin(t * 2) * 0.015})
      `;

      videoGlow.style.transform = `
        translate(${mouse.nx * 5}px, ${-mouse.ny * 5}px)
        scale(${1 + Math.sin(t * 1.2) * 0.04})
      `;
      heroVideo.style.opacity = 0.94 + Math.random() * 0.06;

      // Орбиты спутников
      const rect = heroScene.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const radiusX = rect.width * 0.55; 
      const radiusY = rect.height * 0.45;

      orbits.forEach((o) => {
        const angle = o.baseAngle + t * o.speed * 100;
        const x = cx + Math.cos(angle) * radiusX + (mouse.nx * 15);
        const y = cy + Math.sin(angle) * radiusY - (mouse.ny * 15);

        o.el.style.left = `${x}px`;
        o.el.style.top = `${y}px`;
        o.el.style.transform = 'translate(-50%, -50%)';
      });

      // Отрисовка энергии
      eCtx.clearRect(0, 0, cw, ch);
      for (let i = 0; i < 5; i++) {
        const a = t * 0.2 + i * (Math.PI * 2 / 5);
        const len = cw * 0.35 + Math.sin(t + i) * cw * 0.1;
        const x2 = (cw / 2) + Math.cos(a) * len;
        const y2 = (ch / 2) + Math.sin(a * 0.8) * len * 0.5;
        
        eCtx.beginPath();
        eCtx.moveTo(cw / 2, ch / 2);
        eCtx.bezierCurveTo(
          (cw / 2) + Math.cos(a + 0.5) * len * 0.4, (ch / 2) + Math.sin(a) * len * 0.3,
          x2 + Math.cos(a + 1) * 30, y2 + Math.sin(a) * 30,
          x2, y2
        );
        eCtx.strokeStyle = `rgba(201,169,110,${0.02 + Math.sin(t + i) * 0.02})`;
        eCtx.lineWidth = 1;
        eCtx.stroke();
      }
    }
    animateHologram();
  }
});
