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
    initScrollReveal();
    initParallax();
    initParticles();
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

// Scroll reveal using IntersectionObserver on [data-reveal]
function initScrollReveal() {
  var revealEls = document.querySelectorAll('[data-reveal]');
  if (!revealEls.length) return;
  if (!('IntersectionObserver' in window)) {
    for (var i = 0; i < revealEls.length; i++) revealEls[i].classList.add('is-visible');
    return;
  }
  var observer = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.15 });
  for (var j = 0; j < revealEls.length; j++) observer.observe(revealEls[j]);
}

// Basic parallax: elements with [data-parallax] get translateY on scroll
function initParallax() {
  var els = [].slice.call(document.querySelectorAll('[data-parallax]'));
  if (!els.length) return;
  var lastY = window.scrollY;
  var ticking = false;
  var update = function () {
    var h = window.innerHeight;
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var speedAttr = el.getAttribute('data-parallax-speed');
      var speed = speedAttr ? parseFloat(speedAttr) : 0.2;
      if (isNaN(speed)) speed = 0.2;
      var rect = el.getBoundingClientRect();
      var visible = rect.top < h && rect.bottom > 0;
      if (!visible) continue;
      var offset = (rect.top - h / 2) * speed;
      el.style.transform = 'translate3d(0,' + offset.toFixed(1) + 'px,0)';
    }
    ticking = false;
  };
  var onScroll = function () {
    lastY = window.scrollY;
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  update();
}

// Lightweight particles background
function initParticles() {
  var canvas = document.getElementById('bg-particles');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var dpr = Math.max(1, window.devicePixelRatio || 1);
  var particles = [];
  var config = { count: 60, linkDist: 140, maxSpeed: 0.35 };
  var width = 0, height = 0;

  function resize() {
    width = canvas.clientWidth || window.innerWidth;
    height = canvas.clientHeight || window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  function createParticles() {
    particles.length = 0;
    for (var i = 0; i < config.count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * config.maxSpeed,
        vy: (Math.random() - 0.5) * config.maxSpeed,
        r: Math.random() * 2 + 0.5
      });
    }
  }
  createParticles();

  function step() {
    ctx.clearRect(0, 0, width, height);
    // move
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
    }
    // links
    for (var a = 0; a < particles.length; a++) {
      for (var b = a + 1; b < particles.length; b++) {
        var pa = particles[a], pb = particles[b];
        var dx = pa.x - pb.x, dy = pa.y - pb.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < config.linkDist) {
          var alpha = 1 - dist / config.linkDist;
          ctx.strokeStyle = 'rgba(255,255,255,' + alpha.toFixed(3) + ')';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(pa.x, pa.y);
          ctx.lineTo(pb.x, pb.y);
          ctx.stroke();
        }
      }
    }
    // draw
    for (var j = 0; j < particles.length; j++) {
      var pj = particles[j];
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.beginPath();
      ctx.arc(pj.x, pj.y, pj.r, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(step);
  }
  step();
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


