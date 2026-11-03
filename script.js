(function () {
  var root = document.documentElement;
  root.classList.add('js');

  // Site header (mirrors masondixonveter.com behaviour)
  (function initSiteHeader() {
    var header = document.querySelector('[data-site-header]');
    if (!header) return;
    var desktop = window.matchMedia('(min-width: 1200px)');
    var collapse = document.getElementById('navbar-collapse');
    var items = Array.prototype.slice.call(header.querySelectorAll('.navbar-nav > li.mm'));
    var toggleBtn = header.querySelector('.navbar-toggle');
    var closeBtn = header.querySelector('.navbar-close');
    var veil = document.querySelector('[data-navbar-veil]');
    var closeTimer = null;

    function setOpen(item, open) {
      item.classList.toggle('open', open);
      var t = item.querySelector(':scope > .dropdown-toggle');
      if (t) t.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    function closeAll(except) { items.forEach(function (it) { if (it !== except) setOpen(it, false); }); }

    items.forEach(function (item) {
      item.addEventListener('mouseenter', function () {
        if (!desktop.matches) return;
        clearTimeout(closeTimer); closeAll(item); setOpen(item, true);
      });
      item.addEventListener('mouseleave', function () {
        if (!desktop.matches) return;
        closeTimer = setTimeout(function () { setOpen(item, false); }, 300);
      });
      var t = item.querySelector(':scope > .dropdown-toggle');
      t.addEventListener('click', function (e) {
        e.preventDefault();
        var open = !item.classList.contains('open');
        closeAll(item); setOpen(item, open);
      });
    });
    document.addEventListener('click', function (e) {
      if (desktop.matches && !e.target.closest('.navbar-nav > li.mm')) closeAll();
    });

    function openDrawer() {
      collapse.classList.add('in');
      document.body.classList.add('nav-open');
      toggleBtn.setAttribute('aria-expanded', 'true');
      if (closeBtn) closeBtn.focus();
    }
    function closeDrawer() {
      collapse.classList.remove('in');
      document.body.classList.remove('nav-open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      closeAll();
    }
    toggleBtn.addEventListener('click', function () {
      document.body.classList.contains('nav-open') ? closeDrawer() : openDrawer();
    });
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (veil) veil.addEventListener('click', closeDrawer);
    collapse.addEventListener('click', function (e) {
      if (!desktop.matches && e.target.closest('a[href]')) closeDrawer();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (document.body.classList.contains('nav-open')) { closeDrawer(); toggleBtn.focus(); }
        else closeAll();
      }
    });
    desktop.addEventListener('change', function () { closeDrawer(); });

    var ticking = false;
    function updateScrolled() { header.classList.toggle('is-scrolled', window.scrollY > 4); ticking = false; }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(updateScrolled); }
    }, { passive: true });
    updateScrolled();
  })();

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
