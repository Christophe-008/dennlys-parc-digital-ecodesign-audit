const target = document.querySelector('#newsletter-form');

if (target) {
  const isSafeUrl = (value) => {
    try {
      const parsed = new URL(value, window.location.origin);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  };

  const loadNewsletter = () => {
    if (target.dataset.loaded === 'true') return;
    target.dataset.loaded = 'true';

    const iframe = document.createElement('iframe');
    iframe.setAttribute('data-w-type', 'embedded');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('marginheight', '0');
    iframe.setAttribute('marginwidth', '0');
    iframe.setAttribute('width', '100%');
    iframe.style.height = '0';
    const src = target.dataset.src || '';
    if (!isSafeUrl(src)) return;
    iframe.src = src;
    target.appendChild(iframe);

    const script = document.createElement('script');
    script.src = 'https://app.mailjet.com/pas-nc-embedded-v1.js';
    script.defer = true;
    document.body.appendChild(script);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        loadNewsletter();
      }
    },
    { rootMargin: '250px 0px' }
  );

  observer.observe(target);
}
