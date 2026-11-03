(function () {
  var root = document.documentElement;
  root.classList.add('js');

  // Mobile navigation toggle
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
      }
    });
  }

  // Count-up numbers
  var counters = document.querySelectorAll('[data-count]');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function format(n, el) {
    return n.toLocaleString('en-US') + (el.getAttribute('data-suffix') || '');
  }
  function runCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var duration = 1800;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 4);
      el.textContent = format(Math.round(target * eased), el);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
    // Safety net: always land on the final value (e.g. if the tab is backgrounded)
    setTimeout(function () { el.textContent = format(target, el); }, duration + 400);
  }
  if (counters.length && !reduce && 'IntersectionObserver' in window) {
    counters.forEach(function (el) { el.textContent = format(0, el); });
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          co.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }

  // Scroll reveal
  var targets = document.querySelectorAll('[data-reveal], [data-reveal-stagger]');
  document.querySelectorAll('[data-reveal-stagger]').forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (child, i) {
      child.style.setProperty('--d', (i * 90) + 'ms');
    });
  });
  if (!('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
  targets.forEach(function (el) { io.observe(el); });
})();
