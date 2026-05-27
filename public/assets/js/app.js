console.log('Welcome on Dennlys Parc');
window.onload = () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('./../../sw.js')
            .then((registration) => {
                console.log(
                    'Service Worker enregistré avec succès:',
                    registration
                );

                registration.pushManager
                    .subscribe({
                        userVisibleOnly: true,
                    })
                    .then((subscription) => {
                        console.log('Push subscription:', subscription);
                    })
                    .catch((error) => {
                        console.error(
                            "Échec de l'abonnement aux notifications push:",
                            error
                        );
                    });
            })
            .catch((error) => {
                console.error(
                    "Échec de l'enregistrement du Service Worker:",
                    error
                );
            });
    }
};

import { attractions } from './attractions.js?v=2026.0.0';
const btnMenu = document.getElementById('btnMenu');
const navHeader = document.getElementById('navHeader');

if (document.querySelectorAll('.rellax').length >= 1) {
    const rellax = new Rellax('.rellax');
}

/**
 * Navigation sub-menu
 */
const allBtnSubMenu = document.querySelectorAll('.hasSubMenu');
allBtnSubMenu.forEach((btnSubMenu) => {
    btnSubMenu.addEventListener('click', function (e) {
        e.stopPropagation();
        if (this.classList.contains('active')) {
            this.classList.remove('active');
        } else {
            allBtnSubMenu.forEach((element) => {
                if (element.classList.contains('active')) {
                    element.classList.remove('active');
                }
            });
            this.classList.add('active');
        }
    });
});

document.querySelector('body').addEventListener('click', () => {
    allBtnSubMenu.forEach((element) => {
        if (element.classList.contains('active')) {
            element.classList.remove('active');
        }
    });
});

btnMenu.addEventListener('click', function (e) {
    navHeader.classList.toggle('active');
});

import Swiper from 'https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.esm.browser.min.js';

const swiper = new Swiper('.swiperCalendar', {
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
        // when window width is >= 320px
        1024: {
            autoHeight: false,
        },
    },
});
/**
 * ONLY PAGE ATTRACTIONS
 */
if (document.querySelector('body').classList.contains('attractions')) {
    const radioFilter = document.getElementsByName('categorie');
    /* Toise */
    filterSize.addEventListener('input', (e) => {
        radioFilter.forEach((btnRadio) => {
            btnRadio.checked = false;
        });
        const targetValue = e.target.value;
        size.innerText = `${e.target.value} cm`;
        const attractionsFilter = attractions.filter(
            (attraction) =>
                attraction.categorie != 'restaurant' &&
                attraction.taille.min <= targetValue //&&attraction.taille.max >= targetValue
        );
        createListAttraction(attractionsFilter);
    });
    /* TEMPLATE */
    const createListAttraction = (array) => {
        count.innerHTML = `(${array.length})`;
        listAttractions.innerHTML = '';
        array.forEach((attraction) => {
            // console.table(attraction);
            const template = document.querySelector('#attraction');

            const clone = document.importNode(template.content, true);
            const grid = clone.querySelector('.grid');
            const displaySize = clone.querySelector('.displaySize');
            const up = clone.querySelector('#up');
            const img = clone.querySelector('.imgAttraction');
            const h1 = clone.querySelector('.attractionName');
            const cat = clone.querySelector('#cat');
            let txtCat = '';
            if (attraction.taille.min === null) {
                displaySize.classList.add('hide');
            }
            switch (attraction.categorie) {
                case 'enfant':
                    txtCat = '<small>pour les</small><br><b>enfants</b>';
                    break;
                case 'famille':
                    txtCat = '<small>pour la</small><br><b>famille</b>';
                    break;
                case 'sensation':
                    txtCat = '<small>attraction</small><br><b>à sensations</b>';
                    break;
            }
            const size = clone.querySelector('#sizeMin');
            // const desc = clone.querySelector(".attractionDesc");
            // const mapLink = clone.querySelector("#mapLink");
            const singleLink = clone.querySelector('#single');
            grid.classList.add(attraction.categorie);
            attraction.sous_categorie &&
                grid.classList.add(attraction.sous_categorie);
            up.classList.add(attraction.categorie);
            attraction.sous_categorie &&
                up.classList.add(attraction.sous_categorie);

            img.setAttribute(
                'src',
                `./../assets/images/attractions/${attraction.categorie}/${attraction.media.url_photo}/small/presentation_1.jpg`
            );
            img.setAttribute('alt', attraction.nom);
            const pre_titre = attraction.pre_titre
                ? `<span>${attraction.pre_titre}</span></span>`
                : '';
            h1.innerHTML = `${pre_titre} ${attraction.nom}`;
            // desc.innerText = attraction.description;
            // mapLink.setAttribute("href", `./plan.php?search=${attraction.nom}`);
            cat.innerHTML = `<b>${txtCat}</b>`;
            size.innerHTML = `<b>${attraction.taille.min}cm</b>`;
            singleLink.setAttribute(
                'href',
                `./attraction.php?name=${attraction.media.url_photo}&cat=${attraction.categorie}`
            );
            listAttractions.appendChild(clone);
        });
    };

    /* BTN RADIO FILTER */
    radioFilter.forEach((btnRadio) => {
        btnRadio.addEventListener('change', () => {
            /* INIT TOISE */
            // filterSize.value = "80";
            // size.innerText = "80 cm";
            /* */
            if (btnRadio.checked) {
                // console.log(btnRadio.value);
                if (btnRadio.value === 'all') {
                    createListAttraction(
                        attractions.filter(
                            (attraction) => attraction.categorie != 'restaurant'
                        )
                    );
                } else if (btnRadio.value === 'eau') {
                    createListAttraction(
                        attractions.filter(
                            (attraction) =>
                                attraction.sous_categorie === btnRadio.value
                        )
                    );
                } else {
                    createListAttraction(
                        attractions.filter(
                            (attraction) =>
                                attraction.categorie === btnRadio.value
                        )
                    );
                }
            }
        });
    });

    createListAttraction(
        attractions.filter((attraction) => attraction.categorie != 'restaurant')
    );
}

if (document.querySelector('body').classList.contains('acces')) {
    const coord = [50.570559, 2.1551699];
    var map = L.map('map', {
        attributionControl: false,
    }).setView(coord, 9);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        // attribution:
        //   '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    L.marker(coord).addTo(map).bindPopup('Dennlys Parc').openPopup();
}
