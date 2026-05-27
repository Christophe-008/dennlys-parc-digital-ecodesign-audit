window.addEventListener('scroll', () => {
  const bgFix = document.querySelector('.bg-fix');
  const scrollY = window.scrollY;

  if (!bgFix) return;

  const maxScroll = window.innerHeight * 0.6;
  const blurValue = Math.min((scrollY / maxScroll) * 5, 5);
  const sepiaValue = Math.min(scrollY / maxScroll, 1);
  const brightnessValue = Math.min((scrollY / maxScroll) * 0.5, 0.5);

  bgFix.style.setProperty('--blur-value', `${blurValue}px`);
  bgFix.style.setProperty('--sepia-value', String(sepiaValue));
  bgFix.style.setProperty('--brightness-value', String(1 - brightnessValue));
});
