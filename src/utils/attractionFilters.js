export function filterByCategory(attractions, categoryValue) {
  if (categoryValue === 'all') {
    return attractions.filter((attraction) => attraction.categorie !== 'restaurant');
  }

  if (categoryValue === 'eau') {
    return attractions.filter((attraction) => attraction.sous_categorie === categoryValue);
  }

  return attractions.filter((attraction) => attraction.categorie === categoryValue);
}

export function filterByMinSize(attractions, targetValue) {
  const sizeValue = Number(targetValue);
  return attractions.filter(
    (attraction) =>
      attraction.categorie !== 'restaurant' &&
      Number(attraction.taille?.min || 0) <= sizeValue
  );
}
