/* =====================================================
   校园AI大赛 · B 版 交互脚本
   功能：倒计时 / 移动端导航 / 滚动渐入 / FAQ 互斥展开
   ===================================================== */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. 报名截止倒计时 ---------- */
  // 报名截止时间：2026 年 11 月 6 日 23:59:59
  var DEADLINE = new Date('2026-11-06T23:59:59');
  var elDays = document.getElementById('cdDays');
  var elHours = document.getElementById('cdHours');
  var elMins = document.getElementById('cdMins');
  var elSecs = document.getElementById('cdSecs');
  var lastSecs = null;

  function pad(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function renderCountdown() {
    if (!elDays || !elHours || !elMins || !elSecs) return;

    var diff = DEADLINE.getTime() - Date.now();
    if (diff <= 0) {
      elDays.textContent = '00';
      elHours.textContent = '00';
      elMins.textContent = '00';
      elSecs.textContent = '00';
      var label = document.querySelector('.countdown-label');
      if (label) label.textContent = '📋 报名已截止';
      return;
    }

    var totalSeconds = Math.floor(diff / 1000);
    var days = Math.floor(totalSeconds / 86400);
    var hours = Math.floor((totalSeconds % 86400) / 3600);
    var mins = Math.floor((totalSeconds % 3600) / 60);
    var secs = totalSeconds % 60;

    elDays.textContent = pad(days);
    elHours.textContent = pad(hours);
    elMins.textContent = pad(mins);
    elSecs.textContent = pad(secs);

    // 秒位跳动反馈（减弱动效模式下跳过）
    if (!prefersReducedMotion && lastSecs !== null && lastSecs !== secs) {
      elSecs.classList.add('tick');
      setTimeout(function () { elSecs.classList.remove('tick'); }, 120);
    }
    lastSecs = secs;
  }

  renderCountdown();
  setInterval(renderCountdown, 1000);

  /* ---------- 2. 移动端汉堡导航 ---------- */
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');

  function closeMenu() {
    if (!navToggle || !navLinks) return;
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', '展开菜单');
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      navToggle.setAttribute('aria-label', isOpen ? '收起菜单' : '展开菜单');
    });

    // 点击任意导航项后收起菜单
    navLinks.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });

    // 点击导航栏以外区域收起
    document.addEventListener('click', function (e) {
      if (!e.target.closest('#navbar')) closeMenu();
    });
  }

  /* ---------- 3. 滚动渐入（IntersectionObserver） ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    // 不支持或要求减弱动效：直接全部显示
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- 4. FAQ 手风琴：同一时间只展开一条 ---------- */
  var faqList = document.getElementById('faqList');
  if (faqList) {
    var faqItems = Array.prototype.slice.call(faqList.querySelectorAll('details'));
    faqItems.forEach(function (item) {
      item.addEventListener('toggle', function () {
        if (!item.open) return;
        faqItems.forEach(function (other) {
          if (other !== item && other.open) other.open = false;
        });
      });
    });
  }
})();

// ---------- 作品墙筛选 ----------
document.querySelectorAll('.work-filter').forEach(function (btn) {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.work-filter').forEach(function (b) { b.classList.remove('is-active'); });
    btn.classList.add('is-active');
    var f = btn.dataset.filter;
    document.querySelectorAll('.work-card[data-track]').forEach(function (card) {
      if (card.style.visibility === 'hidden') return; // 布局占位卡不参与
      var show = f === 'all' || card.dataset.track === f;
      card.style.display = show ? '' : 'none';
    });
  });
});
