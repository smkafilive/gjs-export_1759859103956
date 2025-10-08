// Entry script
console.log("script.js loaded");

// DOM bootstrap
document.addEventListener('DOMContentLoaded', function () {
  try {
    injectCurrentYear();
    enableSmoothScroll();
    initThemeToggle();
    initLazyLoadImages();
    initCollapsibles();
    initDataDrivenLists();
  } catch (error) {
    console.error('Initialization error:', error);
  }
});

// Inject current year into elements with [data-year]
function injectCurrentYear() {
  var yearElements = document.querySelectorAll('[data-year]');
  if (!yearElements.length) return;
  var yearText = String(new Date().getFullYear());
  for (var i = 0; i < yearElements.length; i++) {
    yearElements[i].textContent = yearText;
  }
}

// Smooth scrolling for same-page anchors
function enableSmoothScroll() {
  var anchors = document.querySelectorAll('a[href^="#"]');
  for (var i = 0; i < anchors.length; i++) {
    anchors[i].addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (!href || href === '#') return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.pushState(null, '', href);
      }
    });
  }
}

// Theme toggle with persistence. Requirements in HTML:
// - A toggle element with [data-theme-toggle]
// - Optional: initial theme via <html data-theme="light|dark">
function initThemeToggle() {
  var html = document.documentElement;
  var toggle = document.querySelector('[data-theme-toggle]');
  if (!toggle) return;

  var STORAGE_KEY = 'site-theme';
  var preferred = localStorage.getItem(STORAGE_KEY);
  if (preferred) {
    html.setAttribute('data-theme', preferred);
  }

  toggle.addEventListener('click', function () {
    var current = html.getAttribute('data-theme') || 'light';
    var next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch (_) {}
  });
}

// Lazy-load images: <img data-src="..." alt="...">
function initLazyLoadImages() {
  var images = [].slice.call(document.querySelectorAll('img[data-src]'));
  if (!images.length) return;

  var loadImage = function (img) {
    if (img.getAttribute('src')) return;
    var src = img.getAttribute('data-src');
    if (!src) return;
    img.setAttribute('src', src);
    img.removeAttribute('data-src');
  };

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        if (entry.isIntersecting) {
          loadImage(entry.target);
          observer.unobserve(entry.target);
        }
      }
    });
    for (var j = 0; j < images.length; j++) observer.observe(images[j]);
  } else {
    // Fallback: load all
    for (var k = 0; k < images.length; k++) loadImage(images[k]);
  }
}

// Collapsible sections: trigger has [data-toggle-target="#id"]
function initCollapsibles() {
  var triggers = document.querySelectorAll('[data-toggle-target]');
  for (var i = 0; i < triggers.length; i++) {
    triggers[i].addEventListener('click', function (e) {
      var targetSel = this.getAttribute('data-toggle-target');
      if (!targetSel) return;
      var target = document.querySelector(targetSel);
      if (!target) return;
      e.preventDefault();
      var isHidden = target.getAttribute('aria-hidden') === 'true' || target.style.display === 'none';
      if (isHidden) {
        target.style.display = '';
        target.setAttribute('aria-hidden', 'false');
      } else {
        target.style.display = 'none';
        target.setAttribute('aria-hidden', 'true');
      }
    });
  }
}

// Data-driven list renderer
// Usage example in HTML:
// <ul data-list-src="/data/items.json" data-list-template="#item-template"></ul>
// <template id="item-template"><li><a href="{{url}}">{{title}}</a></li></template>
function initDataDrivenLists() {
  var lists = document.querySelectorAll('[data-list-src][data-list-template]');
  if (!lists.length) return;

  var fetchJson = function (url) {
    return fetch(url, { cache: 'no-store' }).then(function (r) {
      if (!r.ok) throw new Error('Failed to fetch: ' + url);
      return r.json();
    });
  };

  for (var i = 0; i < lists.length; i++) {
    (function (listEl) {
      var src = listEl.getAttribute('data-list-src');
      var tplSel = listEl.getAttribute('data-list-template');
      var tpl = document.querySelector(tplSel);
      if (!src || !tpl) return;

      fetchJson(src).then(function (items) {
        if (!Array.isArray(items)) return;
        var fragment = document.createDocumentFragment();
        for (var j = 0; j < items.length; j++) {
          var html = tpl.innerHTML
            .replace(/\{\{(\w+)\}\}/g, function (_, key) {
              var value = items[j][key];
              return value == null ? '' : String(value);
            });
          var container = document.createElement('div');
          container.innerHTML = html;
          while (container.firstChild) fragment.appendChild(container.firstChild);
        }
        listEl.innerHTML = '';
        listEl.appendChild(fragment);
      }).catch(function (err) {
        console.error('List render error:', err);
      });
    })(lists[i]);
  }
}


