const now = new Date();
normalizeHours(now);

import { events } from '/date.js';

function normalizeHours(date) {
  date.setHours(0, 0, 0, 0);
}

function parseUsDate(dateStr) {
  const [month, day, year] = dateStr.split('/').map(Number);
  const d = new Date(year, month - 1, day);
  normalizeHours(d);
  return d;
}

function isDateValid(eventDate) {
  if (Array.isArray(eventDate)) {
    const [dateStart, dateEnd] = eventDate.map(parseUsDate);
    return dateStart <= now && now <= dateEnd;
  }

  const date = parseUsDate(eventDate);
  return now.getTime() === date.getTime();
}

const badge = document.querySelector('#horaires small');

if (badge) {
  let found = false;

  events.some((element) => {
    if (isDateValid(element.date)) {
      badge.innerText = element.description;
      found = true;
      return true;
    }
    return false;
  });

  if (!found) {
    badge.innerText = "Parc fermé aujourd'hui";
  }
}
