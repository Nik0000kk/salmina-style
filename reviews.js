/* ── REVIEWS MARQUEE (ИНТЕРАКТИВНАЯ КАРУСЕЛЬ) ── */
  (function() {
    const REVIEWS = [
      {
        text: 'Это не просто стилистический архетипический разбор! Ваш талант чтения души клиента вскрывает глубинный потенциал, позволяет увидеть свою сущность. <em>«Приведу Ваш образ в соответствие с Вашим Я»</em> — именно так я бы описала ваш метод.',
        author: 'Клиентка · Полный архетипический портрет'
      },
      {
        text: 'Долго думала, как описать свои ощущения после работы с тобой, и поняла — это про <em>возвращение к себе</em>. Сейчас этот страх исчез. Я стала спокойной и уверенной.',
        author: 'Клиентка · Архетип + стиль'
      },
      {
        text: 'Хочу выразить Юлии огромнейшую благодарность! Юлия мега тактичная, безумно лёгкая в общении, интеллигентная девушка и <em>большой профессионал</em> своего дела.',
        author: 'Клиентка · Разбор гардероба'
      },
      {
        text: 'Я поняла, что чувствую себя комфортно и уверенно в одежде, которая является <em>выражением меня</em> — моей натуры, моей природы, моего характера.',
        author: 'Клиентка · Архетип + стиль'
      },
      {
        text: 'Очень понравился подход: мы не просто говорили об одежде, а разобрали мои архетипы, и через них я постепенно начинаю понимать, <em>какие образы действительно мои</em>, а какие нет.',
        author: 'Клиентка · Полный архетипический портрет'
      },
      {
        text: 'Пришло понимание, что подойдёт и с чем надеть, когда видишь вещь. Стала лучше чувствовать и ощущать себя как личность. <em>Юля, вы крутышка!</em>',
        author: 'Клиентка · Консультация'
      },
      {
        text: 'Такая работа на самом деле — это просто <em>титанический труд</em>. Душа радуется, когда вы доверяете и себе и мне.',
        author: 'Клиентка · Полный портрет 50+ слайдов'
      },
      {
        text: 'Я жалею, что вас раньше не встретила! <em>Это мне очень приятно быть в вашем поле.</em>',
        author: 'Клиентка · Сопровождение'
      },
      {
        text: 'Лично для меня важно качество, а не скорость. Если вы устали от одинаковых людей — <em>стоит попробовать этот подход</em>. Искренне советую Юлю — мастера своего дела.',
        author: 'Клиентка · Архетип + стиль'
      },
      {
        text: 'В итоге мой гардероб стал <em>более продуманным и гармоничным</em>, а каждый элемент — на своём месте. Я сейчас продолжаю ориентироваться на составленные Юлией персональные рекомендации.',
        author: 'Клиентка · Разбор гардероба'
      },
      {
        text: 'Всё откликается. Там очень глубокие смыслы заложены. Я чувствую как <em>начинаю возвращаться к себе</em>. Верю что жизнь тогда изменится.',
        author: 'Клиентка · Архетипический портрет'
      },
      {
        text: 'Раньше я постоянно оглядывалась на других. Сейчас этот страх исчез. Я перестала бояться экспериментов, начала комбинировать то, что раньше казалось <em>«слишком смелым»</em>.',
        author: 'Клиентка · Алхимия Образа'
      }
    ];

    function initInteractiveMarquee(rowEl, reviews, speed) {
      // Создаем 3 набора карточек для эффекта бесконечности
      for (let i = 0; i < 3; i++) {
        reviews.forEach(r => {
          const card = document.createElement('div');
          if (i > 0) card.setAttribute('aria-hidden', 'true');
          card.className = 'review-card';
          card.innerHTML = `
            <p class="review-text">${r.text}</p>
            <p class="review-author">${r.author}</p>
          `;
          rowEl.appendChild(card);
        });
      }

      let pos = 0;
      let isHovered = false;
      let isDragging = false;
      let startX = 0;
      let prevX = 0;

      const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
      let setWidth = 0;
      let lastTime = 0;
      function measure() {
        setWidth = rowEl.children[reviews.length].offsetLeft - rowEl.children[0].offsetLeft;
      }
      measure();
      window.addEventListener('resize', measure);
      if (document.fonts) document.fonts.ready.then(measure);
      function tick(timestamp = 0) {
        const elapsed = lastTime ? Math.min(timestamp - lastTime, 50) / (1000 / 60) : 1;
        lastTime = timestamp;
        
        // Центрируем позицию при старте
        if (pos === 0 && setWidth > 0) {
            pos = -setWidth;
        }

        // Авто-скролл, если не трогают
        if (!isHovered && !isDragging && !motion.matches && !document.hidden && setWidth > 0) {
            pos += speed * elapsed;
        }

        // Бесшовное зацикливание
        if (setWidth > 0) {
            while (pos <= -setWidth * 2) pos += setWidth;
            while (pos >= 0) pos -= setWidth;
        }

        rowEl.style.transform = `translateX(${pos}px)`;
        requestAnimationFrame(tick);
      }

// --- МЫШЬ (ПК) ---
      rowEl.addEventListener('mouseenter', () => isHovered = true);
      rowEl.addEventListener('mouseleave', () => { isHovered = false; isDragging = false; });
      
      rowEl.addEventListener('mousedown', (e) => {
          isHovered = true;
          isDragging = true;
          startX = e.pageX;
          prevX = pos;
      });
      
      window.addEventListener('mouseup', () => { isDragging = false; });
      window.addEventListener('mousemove', (e) => {
          if (!isDragging) return;
          const dx = e.pageX - startX;
          pos = prevX + dx;
      });

      // Колесико / тачпад — горизонтальный скролл не блокирует вертикальную прокрутку страницы
      rowEl.addEventListener('wheel', (e) => {
          if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) return; // вертикальный скролл — не мешаем
          e.preventDefault();
          pos -= e.deltaX * 0.8;
      }, { passive: false });

      // --- КАСАНИЯ (ТЕЛЕФОН) ---
      rowEl.addEventListener('touchstart', (e) => {
          isHovered = true;
          isDragging = true;
          startX = e.touches[0].pageX;
          prevX = pos;
      }, {passive: true});
      
      window.addEventListener('touchend', () => {
          isHovered = false;
          isDragging = false;
      });
      
      window.addEventListener('touchmove', (e) => {
          if (!isDragging) return;
          const dx = e.touches[0].pageX - startX;
          pos = prevX + dx;
      }, {passive: true});

      rowEl.addEventListener('touchcancel', () => { isHovered = false; isDragging = false; });
      tick();
    }

    const row1 = document.getElementById('row1');
    const row2 = document.getElementById('row2');
    
    // Одна строчка едет влево, другая вправо
    if (row1) initInteractiveMarquee(row1, REVIEWS.slice(0, 6), -0.8);
    if (row2) initInteractiveMarquee(row2, REVIEWS.slice(6), 0.8);
  })();
