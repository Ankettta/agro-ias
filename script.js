document.addEventListener('DOMContentLoaded', function () {
  // Сбрасываем скролл
  window.scrollTo(0, 0);
  history.replaceState(null, '', window.location.pathname);

  // Плавное появление баннера
  const bannerFadeElements = document.querySelectorAll('.banner__wrapper .fade-in');
  bannerFadeElements.forEach((el, i) => {
    setTimeout(() => el.classList.add('show'), i * 400);
  });

  // Плавное появление при скролле
  const scrollFadeElements = document.querySelectorAll('main .fade-in');
  const appearOnScroll = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('show');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.2, rootMargin: "0px 0px -50px 0px" });

  scrollFadeElements.forEach(el => appearOnScroll.observe(el));

  // ------------------- Бургер
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.header__nav');
  const header = document.querySelector('.header');

  if (burger && nav) {
    burger.addEventListener('click', e => {
      e.stopPropagation();
      const opened = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', opened);
      nav.setAttribute('aria-hidden', !opened);
    });

    document.addEventListener('click', e => {
      if (!nav.classList.contains('open')) return;
      if (header.contains(e.target)) return;
      nav.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      nav.setAttribute('aria-hidden', 'true');
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && nav.classList.contains('open')) {
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        nav.setAttribute('aria-hidden', 'true');
      }
    });

    // Плавный скролл по якорям
    document.querySelectorAll('.nav__item a, .btn[href^="#"]').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetEl = document.getElementById(targetId);
        if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });

        if (nav.classList.contains('open')) {
          nav.classList.remove('open');
          burger.setAttribute('aria-expanded', 'false');
          nav.setAttribute('aria-hidden', 'true');
        }
      });
    });
  }

 // ------------------- Форма
const cooperationForm = document.getElementById('cooperationForm');
if (cooperationForm) {
  cooperationForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    const submitBtn = this.querySelector('.cooperation__form-btn');
    const originalBtnText = submitBtn.textContent; 
    
    submitBtn.disabled = true;
    submitBtn.textContent = currentTranslations.form_sending || 'Отправка...';

    try {
      const response = await fetch('send-mail.php', { 
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        alert(currentTranslations.form_success || 'Заявка отправлена! Спасибо за сотрудничество.');
        this.reset(); // Очищаем форму после успешной отправки
      } else {
        alert(currentTranslations.form_error || result.message || 'Ошибка! Попробуйте отправить заявку позже.');
      }
    } catch (error) {
      alert(currentTranslations.form_connection_error || 'Ошибка соединения! Проверьте интернет и попробуйте снова.');
      console.error('Ошибка отправки формы:', error);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  });
}

  // 1. Хранилище текущих переводов и активного языка
  let currentTranslations = {};
  let activeLang = localStorage.getItem('preferredLang') || "ru"; // Сохраняем язык между перезагрузками

  // 2. Функция для загрузки переводов из JSON-файла
  async function loadTranslations(lang) {
    try {
      const response = await fetch(`lang/${lang}.json`);
      if (!response.ok) throw new Error(`Failed to load ${lang} translations`);
      currentTranslations = await response.json();
      activeLang = lang;
      localStorage.setItem('preferredLang', lang); // Сохраняем выбор языка
      applyTranslations();
    } catch (error) {
      console.error("Error loading translations:", error);
    }
  }

  // 3. Функция для применения переводов к HTML-элементам
  function applyTranslations() {
    // Обойти все элементы с атрибутом data-i18n
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.getAttribute("data-i18n");
      
      // Если перевод для ключа существует
      if (currentTranslations[key]) {
        // Проверяем, является ли элемент иконкой (часто это i с классами фреймворков)
        const isIcon = element.tagName === "I" && 
                      (element.classList.contains('fa') || 
                       element.classList.contains('icon') ||
                       element.classList.contains('svg-icon'));

        // Проверяем, является ли элемент изображением с src
        const isImageWithSrc = element.tagName === "IMG" && element.hasAttribute("src");

        // Не трогаем иконки и изображения с src (только alt)
        if (isIcon) {
          // Для иконок обновляем только текстовое содержимое, если оно есть
          if (element.textContent.trim() !== '') {
            element.textContent = currentTranslations[key];
          }
        } else if (isImageWithSrc) {
          // Для изображений обновляем только alt
          element.setAttribute("alt", currentTranslations[key]);
        } else if (element.hasAttribute("placeholder")) {
          // Для плейсхолдеров инпутов
          element.setAttribute("placeholder", currentTranslations[key]);
        } else if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'SPAN', 'A', 'BUTTON', 'LI'].includes(element.tagName)) {
          // Для текстовых элементов с возможностью HTML
          element.innerHTML = currentTranslations[key];
        } else {
          // Для других элементов
          element.textContent = currentTranslations[key];
        }
      }
    });

    // Обновляем язык документа
    document.documentElement.lang = activeLang;

    // Обновляем текст кнопки отправки формы, если она существует
    const submitBtn = document.querySelector('.cooperation__form-btn');
    if (submitBtn && currentTranslations.form_submit) {
      submitBtn.textContent = currentTranslations.form_submit;
    }
  }

  // 4. Обработчик кликов по кнопкам языков
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.getAttribute("data-lang");
      if (lang && lang !== activeLang) {
        loadTranslations(lang);
        // Добавляем визуальную индикацию активного языка
        document.querySelectorAll(".lang-btn").forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
    });
  });

  // 5. Загружаем переводы по умолчанию (единожды, без дублирования)
  loadTranslations(activeLang);
});

    
