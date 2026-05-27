const feedContainer = document.querySelector('#facebook-feed');

if (feedContainer) {
  const loadFeed = async () => {
    if (feedContainer.dataset.loaded === 'true') return;
    feedContainer.dataset.loaded = 'true';

    try {
      const fontAwesomeCss = document.createElement('link');
      fontAwesomeCss.rel = 'stylesheet';
      fontAwesomeCss.href = 'https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css';
      document.head.appendChild(fontAwesomeCss);

      const cffCss = document.createElement('link');
      cffCss.rel = 'stylesheet';
      cffCss.href = './utils/fbfeed/core/css/cff.css?ver3.7';
      document.head.appendChild(cffCss);

      const response = await fetch('./assets/data/facebook-feed.html', { cache: 'force-cache' });
      const markup = await response.text();
      if (!markup.includes('class="cff-wrapper"')) {
        throw new Error('Unexpected feed markup');
      }
      feedContainer.innerHTML = markup;

      // required by cff.js runtime
      window.cffpath = './utils/fbfeed';
      window.cfflinkhashtags = 'true';

      await new Promise((resolve, reject) => {
        const cffJs = document.createElement('script');
        cffJs.src = './utils/fbfeed/core/js/cff.js';
        cffJs.defer = true;
        cffJs.onload = resolve;
        cffJs.onerror = reject;
        document.body.appendChild(cffJs);
      });

      feedContainer.setAttribute('aria-busy', 'false');
    } catch {
      feedContainer.innerHTML = '<p class="text-center">Impossible de charger les actus. <a href="https://facebook.com/198796153596386" target="_blank" rel="noopener noreferrer">Voir sur Facebook</a></p>';
      feedContainer.setAttribute('aria-busy', 'false');
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        loadFeed();
      }
    },
    { rootMargin: '300px 0px' }
  );

  observer.observe(feedContainer);
}
