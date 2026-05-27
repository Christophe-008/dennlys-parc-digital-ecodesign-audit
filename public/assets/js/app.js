import { attractions } from './attractions.js?v=2026.0.0';
import Swiper from 'https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.esm.browser.min.js';

const body = document.body;
const btnMenu = document.getElementById('btnMenu');
const navHeader = document.getElementById('navHeader');
let rellaxInstance = null;
let calendarSwiperInstance = null;

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

  if (!rellaxInstance) {
    const instance = new window.Rellax('.rellax');
    if (typeof instance.refresh === 'function') {
      instance.refresh();
    }
    rellaxInstance = instance;
  }

  window.addEventListener('resize', () => {
    if (rellaxInstance && typeof rellaxInstance.refresh === 'function') {
      rellaxInstance.refresh();
    }
  });
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

  if (calendarSwiperInstance && typeof calendarSwiperInstance.destroy === 'function') {
    calendarSwiperInstance.destroy(true, true);
  }

  const instance = new Swiper('.swiperCalendar', {
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

  if (typeof instance.update === 'function') {
    instance.update();
  }
  calendarSwiperInstance = instance;
}

function getFilteredAttractionsByCategory(categoryValue) {
  if (categoryValue === 'all') {
    return attractions.filter((attraction) => attraction.categorie !== 'restaurant');
  }

  if (categoryValue === 'eau') {
    return attractions.filter((attraction) => attraction.sous_categorie === categoryValue);
  }

  return attractions.filter((attraction) => attraction.categorie === categoryValue);
}

function renderCategorySelection(btnRadio, elements) {
  if (!btnRadio.checked) return;
  const filtered = getFilteredAttractionsByCategory(btnRadio.value);
  createListAttraction(filtered, elements);
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

function getAttractionNodes(clone) {
  return {
    grid: clone.querySelector('.grid'),
    displaySize: clone.querySelector('.displaySize'),
    up: clone.querySelector('#up'),
    img: clone.querySelector('.imgAttraction'),
    title: clone.querySelector('.attractionName'),
    cat: clone.querySelector('#cat'),
    size: clone.querySelector('#sizeMin'),
    singleLink: clone.querySelector('#single'),
  };
}

function hasRequiredAttractionNodes(nodes) {
  return (
    nodes.grid &&
    nodes.up &&
    nodes.img &&
    nodes.title &&
    nodes.cat &&
    nodes.size &&
    nodes.singleLink
  );
}

function applyAttractionClasses(nodes, attraction) {
  if (attraction.taille?.min == null && nodes.displaySize) {
    nodes.displaySize.classList.add('hide');
  }

  if (attraction.categorie) {
    nodes.grid.classList.add(attraction.categorie);
    nodes.up.classList.add(attraction.categorie);
  }

  if (attraction.sous_categorie) {
    nodes.grid.classList.add(attraction.sous_categorie);
    nodes.up.classList.add(attraction.sous_categorie);
  }
}

function fillAttractionMedia(nodes, attraction) {
  nodes.img.src = `./../assets/images/attractions/${attraction.categorie}/${attraction.media.url_photo}/small/presentation_1.jpg`;
  nodes.img.alt = attraction.nom || '';

  buildAttractionTitle(nodes.title, attraction);
  setAttractionCategoryLabel(nodes.cat, attraction.categorie);

  const minSize = attraction.taille?.min;
  nodes.size.textContent = minSize == null ? '' : `${minSize}cm`;
  nodes.singleLink.href = `./attraction.php?name=${attraction.media.url_photo}&cat=${attraction.categorie}`;
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
    const nodes = getAttractionNodes(clone);
    if (!hasRequiredAttractionNodes(nodes)) return;

    applyAttractionClasses(nodes, attraction);
    fillAttractionMedia(nodes, attraction);
    listAttractions.appendChild(clone);
  });
}

function clearRadioSelection(radioFilter) {
  radioFilter.forEach((btnRadio) => {
    btnRadio.checked = false;
  });
}

function filterAttractionsBySize(targetValue) {
  return attractions.filter(
    (attraction) =>
      attraction.categorie !== 'restaurant' &&
      Number(attraction.taille?.min || 0) <= targetValue
  );
}

function initAttractionsPage() {
  if (!body.classList.contains('attractions')) return;

  const elements = getAttractionsElements();
  const { radioFilter, filterSize, sizeLabel } = elements;

  if (!radioFilter || !filterSize) return;

  filterSize.addEventListener('input', (event) => {
    clearRadioSelection(radioFilter);

    const targetValue = Number(event.target.value);
    if (sizeLabel) {
      sizeLabel.textContent = `${targetValue} cm`;
    }

    createListAttraction(filterAttractionsBySize(targetValue), elements);
  });

  radioFilter.forEach((btnRadio) => {
    btnRadio.addEventListener('change', () => {
      renderCategorySelection(btnRadio, elements);
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
