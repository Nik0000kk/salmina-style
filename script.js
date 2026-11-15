/* Юлия Салмина — навигация, форма, FAQ и правовые документы. */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('site-header');
  const progress = document.getElementById('scroll-progress');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function updateScroll() {
    header.classList.toggle('scrolled', window.scrollY > 40);
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (progress) progress.style.width = `${height > 0 ? Math.min(100, window.scrollY / height * 100) : 0}%`;
  }
  window.addEventListener('scroll', updateScroll, { passive: true });
  window.addEventListener('resize', updateScroll);
  window.addEventListener('load', updateScroll);
  updateScroll();

  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  const mobile = window.matchMedia('(max-width: 720px)');
  let menuOpen = false;
  let menuOverflow = '';

  function setMenu(open, restoreFocus = false) {
    if (open === menuOpen) return;
    if (open) menuOverflow = document.body.style.overflow;
    menuOpen = open;
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    nav.classList.toggle('open', open);
    header.classList.toggle('menu-open', open);
    nav.inert = mobile.matches && !open;
    document.body.style.overflow = open ? 'hidden' : menuOverflow;
    if (restoreFocus) burger.focus();
  }
  if (burger && nav) {
    nav.inert = mobile.matches;
    burger.addEventListener('click', () => setMenu(!menuOpen));
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
    mobile.addEventListener('change', () => {
      setMenu(false);
      nav.inert = mobile.matches;
    });
    document.addEventListener('keydown', event => {
      if (!menuOpen) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        setMenu(false, true);
      }
      if (event.key === 'Tab') {
        const last = nav.querySelector('a:last-child');
        if (event.shiftKey && document.activeElement === burger) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          burger.focus();
        }
      }
    });
  }

  // Обычный HTML остаётся видимым, если анимации недоступны.
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -20px 0px' });
    document.querySelectorAll('.reveal').forEach(element => {
      element.classList.add('js-reveal');
      observer.observe(element);
    });
  }
  reducedMotion.addEventListener('change', event => {
    if (event.matches) document.querySelectorAll('.js-reveal').forEach(element => element.classList.add('visible'));
  });

  const triggers = [...document.querySelectorAll('.accordion-trigger')];
  triggers.forEach((trigger, index) => {
    const panel = trigger.nextElementSibling;
    trigger.id = `faq-question-${index + 1}`;
    panel.id = `faq-answer-${index + 1}`;
    trigger.setAttribute('aria-controls', panel.id);
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', trigger.id);
    panel.hidden = true;
    trigger.addEventListener('click', () => {
      const open = trigger.getAttribute('aria-expanded') !== 'true';
      triggers.forEach(other => {
        const expanded = other === trigger && open;
        other.setAttribute('aria-expanded', String(expanded));
        other.nextElementSibling.hidden = !expanded;
        other.nextElementSibling.classList.toggle('open', expanded);
      });
    });
  });

  const form = document.getElementById('contact-form');
  const success = document.getElementById('form-success');
  const errorMessage = document.getElementById('form-error');
  if (form) {
    const fields = [...form.querySelectorAll('[required]')];
    fields.forEach(field => field.addEventListener('input', () => {
      field.setCustomValidity('');
      success.classList.remove('show');
      errorMessage.hidden = true;
    }));
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (form.getAttribute('aria-busy') === 'true') return;
      fields.forEach(field => field.setCustomValidity(field.value.trim() ? '' : 'Заполните это поле.'));
      if (!form.reportValidity()) return;
      const button = form.querySelector('button[type="submit"]');
      const buttonText = button.textContent;
      success.classList.remove('show');
      errorMessage.hidden = true;
      button.textContent = 'Отправляю…';
      button.disabled = true;
      form.setAttribute('aria-busy', 'true');
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 20000);
      try {
        const data = new FormData(form);
        fields.forEach(field => data.set(field.name, field.value.trim()));
        const response = await fetch(form.action, {
          method: 'POST', body: data,
          headers: { Accept: 'application/json' }, signal: controller.signal
        });
        if (!response.ok) throw new Error('Form submission failed');
        form.reset();
        success.classList.add('show');
      } catch (error) {
        errorMessage.textContent = error.name === 'AbortError'
          ? 'Не удалось дождаться ответа сервиса. Попробуйте позже или напишите в Telegram.'
          : 'Не удалось отправить сообщение. Попробуйте позже или напишите в Telegram.';
        errorMessage.hidden = false;
      } finally {
        window.clearTimeout(timeout);
        button.textContent = buttonText;
        button.disabled = false;
        form.removeAttribute('aria-busy');
      }
    });
  }

  // Правовые ссылки открывают соответствующую вкладку без прокрутки к скрытой панели.
  const modal = document.getElementById('legal-modal');
  const legalTabs = [...document.querySelectorAll('.legal-tab')];
  const panels = [...document.querySelectorAll('.doc-panel')];
  let modalOverflow = '';
  function selectLegal(id) {
    legalTabs.forEach(tab => {
      const selected = tab.dataset.tab === id;
      tab.classList.toggle('active', selected);
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    panels.forEach(panel => panel.classList.toggle('active', panel.id === id));
    modal.querySelector('.legal-modal-body').scrollTop = 0;
  }
  function openLegal(id) {
    selectLegal(id);
    if (modal.open) return;
    setMenu(false);
    modalOverflow = document.body.style.overflow;
    modal.showModal();
    document.body.style.overflow = 'hidden';
  }
  document.querySelectorAll('[data-legal]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      openLegal(link.dataset.legal);
    });
  });
  document.getElementById('legal-close').addEventListener('click', () => modal.close());
  document.getElementById('legal-overlay').addEventListener('click', () => modal.close());
  modal.addEventListener('close', () => { document.body.style.overflow = modalOverflow; });
  legalTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectLegal(tab.dataset.tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % legalTabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + legalTabs.length) % legalTabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = legalTabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      selectLegal(legalTabs[next].dataset.tab);
      legalTabs[next].focus();
    });
  });
  if (panels.some(panel => '#' + panel.id === window.location.hash)) {
    openLegal(window.location.hash.slice(1));
  }

  document.querySelectorAll('a[href^="#"]:not([data-legal])').forEach(anchor => {
    anchor.addEventListener('click', event => {
      const target = document.getElementById(anchor.hash.slice(1));
      if (!target || !anchor.hash) return;
      event.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - header.offsetHeight - 20;
      window.scrollTo({ top, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
      history.replaceState(null, '', anchor.hash);
    });
  });

  /* ── HOLOGRAM & SATELLITES ANIMATION ── */
  const heroScene = document.getElementById('hero-scene');
  const heroSection = document.getElementById('hero');
  
  if (heroScene && heroSection && document.getElementById('energy')) {
    const SECTIONS = [
      { name: 'Астрология',  icon: '✦', href: '#method' },
      { name: 'Архетипы',    icon: '◈', href: '#method' },
      { name: 'Матрица Судьбы', icon: '⬡', href: '#method' },
      { name: 'Таро',        icon: '◇', href: '#method' }
    ];

    // Создаем спутники и добавляем их прямо к видео-контейнеру
    const orbits = SECTIONS.map((sec, i) => {
      const el = document.createElement('a');
      el.href = sec.href;
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
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const heroVideo = document.getElementById('video-hero');
    const videoGlow = document.getElementById('video-glow');
    let t = 0;

    function animateHologram() {
      requestAnimationFrame(animateHologram);
      
      // Не анимируем, если ушли с первого экрана (экономит батарею)
      if (document.hidden || window.scrollY > heroSection.offsetHeight || motion.matches) return;

      t += 0.005;

      const floatY = Math.sin(t * 1.5) * 2;

      // Только плоское смещение — без rotateY/rotateX, которые на мобильных
      // вызывают артефакты при отсутствии perspective на родителе
      heroVideo.style.transform = `
        translate(${mouse.nx * 3}px, ${-mouse.ny * 3 + floatY}px)
        scale(${1 + Math.sin(t * 2) * 0.004})
      `;

      videoGlow.style.transform = `
        translate(${mouse.nx * 2}px, ${-mouse.ny * 2}px)
        scale(${1 + Math.sin(t * 1.2) * 0.015})
      `;
      heroVideo.style.opacity = '1';

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
    const syncVideoMotion = () => {
      if (motion.matches) heroVideo.pause();
      else heroVideo.play().catch(() => {});
    };
    motion.addEventListener('change', syncVideoMotion);
    syncVideoMotion();
    animateHologram();
    if (document.fonts) document.fonts.ready.then(resizeEnergy);
  }
});
