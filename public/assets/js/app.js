import { attractions } from './attractions.js?v=2026.0.0';
import Swiper from 'https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.esm.browser.min.js';

const body = document.body;
const btnMenu = document.getElementById('btnMenu');
const navHeader = document.getElementById('navHeader');

function initServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./../../sw.js')
      .then((registration) =>
        registration.pushManager.subscribe({ userVisibleOnly: true })
      )
      .catch(() => {
        // Silent fail: service worker/push is non-blocking for core UX
      });
  });
}

function initRellax() {
  if (document.querySelectorAll('.rellax').length < 1) return;
  if (typeof window.Rellax !== 'function') return;
  // eslint-disable-next-line no-new
  new window.Rellax('.rellax');
}

function initSubMenus() {
  const subMenus = document.querySelectorAll('.hasSubMenu');
  if (!subMenus.length) return;

  subMenus.forEach((item) => {
    item.addEventListener('click', (event) => {
      event.stopPropagation();

      const isActive = item.classList.contains('active');
      subMenus.forEach((node) => node.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    });
  });

  body.addEventListener('click', () => {
    subMenus.forEach((item) => item.classList.remove('active'));
  });
}

function initMainMenu() {
  if (!btnMenu || !navHeader) return;
  btnMenu.addEventListener('click', () => {
    navHeader.classList.toggle('active');
  });
}

function initCalendarSwiper() {
  if (!document.querySelector('.swiperCalendar')) return;

  // eslint-disable-next-line no-new
  new Swiper('.swiperCalendar', {
    loop: true,
    autoHeight: true,
    spaceBetween: 50,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true,
    },
    breakpoints: {
      1024: { autoHeight: false },
    },
  });
}

function getAttractionsElements() {
  return {
    radioFilter: document.getElementsByName('categorie'),
    filterSize: document.getElementById('filterSize'),
    sizeLabel: document.getElementById('size'),
    countLabel: document.getElementById('count'),
    listAttractions: document.getElementById('listAttractions'),
    template: document.querySelector('#attraction'),
  };
}

function setAttractionCategoryLabel(container, category) {
  const mapping = {
    enfant: ['pour les', 'enfants'],
    famille: ['pour la', 'famille'],
    sensation: ['attraction', 'à sensations'],
  };

  const [top, bottom] = mapping[category] || ['', ''];
  container.replaceChildren();

  const strong = document.createElement('b');
  const small = document.createElement('small');
  small.textContent = top;
  strong.appendChild(small);
  strong.appendChild(document.createElement('br'));
  strong.appendChild(document.createTextNode(bottom));
  container.appendChild(strong);
}

function buildAttractionTitle(node, attraction) {
  node.replaceChildren();

  if (attraction.pre_titre) {
    const pre = document.createElement('span');
    pre.textContent = attraction.pre_titre;
    node.appendChild(pre);
    node.appendChild(document.createTextNode(' '));
  }

  node.appendChild(document.createTextNode(attraction.nom || ''));
}

function createListAttraction(items, elements) {
  const { countLabel, listAttractions, template } = elements;
  if (!listAttractions || !template) return;

  if (countLabel) {
    countLabel.textContent = `(${items.length})`;
  }

  listAttractions.innerHTML = '';

  items.forEach((attraction) => {
    const clone = document.importNode(template.content, true);

    const grid = clone.querySelector('.grid');
    const displaySize = clone.querySelector('.displaySize');
    const up = clone.querySelector('#up');
    const img = clone.querySelector('.imgAttraction');
    const title = clone.querySelector('.attractionName');
    const cat = clone.querySelector('#cat');
    const size = clone.querySelector('#sizeMin');
    const singleLink = clone.querySelector('#single');

    if (!grid || !up || !img || !title || !cat || !size || !singleLink) {
      return;
    }

    if (attraction.taille?.min == null && displaySize) {
      displaySize.classList.add('hide');
    }

    if (attraction.categorie) {
      grid.classList.add(attraction.categorie);
      up.classList.add(attraction.categorie);
    }

    if (attraction.sous_categorie) {
      grid.classList.add(attraction.sous_categorie);
      up.classList.add(attraction.sous_categorie);
    }

    img.src = `./../assets/images/attractions/${attraction.categorie}/${attraction.media.url_photo}/small/presentation_1.jpg`;
    img.alt = attraction.nom || '';

    buildAttractionTitle(title, attraction);
    setAttractionCategoryLabel(cat, attraction.categorie);

    const minSize = attraction.taille?.min;
    size.textContent = minSize == null ? '' : `${minSize}cm`;

    singleLink.href = `./attraction.php?name=${attraction.media.url_photo}&cat=${attraction.categorie}`;
    listAttractions.appendChild(clone);
  });
}

function initAttractionsPage() {
  if (!body.classList.contains('attractions')) return;

  const elements = getAttractionsElements();
  const { radioFilter, filterSize, sizeLabel } = elements;

  if (!radioFilter || !filterSize) return;

  filterSize.addEventListener('input', (event) => {
    radioFilter.forEach((btnRadio) => {
      btnRadio.checked = false;
    });

    const targetValue = Number(event.target.value);
    if (sizeLabel) {
      sizeLabel.textContent = `${targetValue} cm`;
    }

    const filtered = attractions.filter(
      (attraction) =>
        attraction.categorie !== 'restaurant' &&
        Number(attraction.taille?.min || 0) <= targetValue
    );

    createListAttraction(filtered, elements);
  });

  radioFilter.forEach((btnRadio) => {
    btnRadio.addEventListener('change', () => {
      if (!btnRadio.checked) return;

      if (btnRadio.value === 'all') {
        createListAttraction(
          attractions.filter((attraction) => attraction.categorie !== 'restaurant'),
          elements
        );
        return;
      }

      if (btnRadio.value === 'eau') {
        createListAttraction(
          attractions.filter(
            (attraction) => attraction.sous_categorie === btnRadio.value
          ),
          elements
        );
        return;
      }

      createListAttraction(
        attractions.filter((attraction) => attraction.categorie === btnRadio.value),
        elements
      );
    });
  });

  createListAttraction(
    attractions.filter((attraction) => attraction.categorie !== 'restaurant'),
    elements
  );
}

function initAccessMap() {
  if (!body.classList.contains('acces')) return;
  if (typeof window.L === 'undefined') return;

  const mapElement = document.getElementById('map');
  if (!mapElement) return;

  const coord = [50.570559, 2.1551699];
  const map = window.L.map('map', { attributionControl: false }).setView(coord, 9);

  window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  window.L.marker(coord).addTo(map).bindPopup('Dennlys Parc').openPopup();
}

function initApp() {
  initServiceWorker();
  initRellax();
  initSubMenus();
  initMainMenu();
  initCalendarSwiper();
  initAttractionsPage();
  initAccessMap();
}

initApp();
