/* =====================================================
   校园AI大赛 · B 版 交互脚本
   功能：倒计时 / 移动端导航 / 滚动渐入 / FAQ 互斥展开
   ===================================================== */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. 倒计时：报名截止 → 自动切换到作品提交截止 ---------- */
  var DEADLINE = new Date('2026-11-13T23:59:59');        // 报名截止
  var SUBMIT_DEADLINE = new Date('2026-11-27T23:59:59'); // 作品提交截止
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

    var now = Date.now();
    var target = DEADLINE;                       // 当前倒计时的目标
    var label = document.querySelector('.countdown-label');
    var dlText = document.querySelector('.countdown-deadline');

    if (now >= DEADLINE.getTime()) {
      // 报名截止后：开发期切换为"距作品提交截止"
      target = SUBMIT_DEADLINE;
      if (label) label.textContent = '⏳ 距作品提交截止还有';
      if (dlText) dlText.textContent = '作品提交截止：2026 年 11 月 27 日 23:59（作品帖 + U 盘文件）';
    } else if (dlText) {
      dlText.textContent = '报名截止：2026 年 11 月 13 日 23:59';
    }

    var diff = target.getTime() - now;
    if (diff <= 0) {
      elDays.textContent = '00';
      elHours.textContent = '00';
      elMins.textContent = '00';
      elSecs.textContent = '00';
      if (label) {
        label.textContent = now >= SUBMIT_DEADLINE.getTime()
          ? '🏁 赛事已进入评审阶段'
          : '📋 报名已截止';
      }
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
  /* ---------- 5. 获奖展示页状态灯：按日期自动推进，不再写死某个阶段 ---------- */
  var stageText = document.getElementById('statusText');
  var stageDesc = document.getElementById('statusDesc');
  if (stageText && stageDesc) {
    var nowMs = Date.now();
    var tMs = function (s) { return new Date(s).getTime(); };
    var dateTag = '<strong class="status-date grad-text">12 月 3 日</strong>';
    var stage;
    if (nowMs < tMs('2026-11-09T00:00:00')) {
      stage = ['报名未开始', '大赛 11 月 9 日开放报名，11 月 27 日作品提交截止，获奖名单将于 ' + dateTag + ' 在本页公布，记得收藏'];
    } else if (nowMs < tMs('2026-11-14T00:00:00')) {
      stage = ['报名进行中', '11 月 13 日 23:59 截止报名，获奖名单将于 ' + dateTag + ' 在本页公布，记得收藏'];
    } else if (nowMs < tMs('2026-11-28T00:00:00')) {
      stage = ['作品开发中', '作品征集至 11 月 27 日 23:59（作品帖 + U 盘文件），获奖名单将于 ' + dateTag + ' 在本页公布'];
    } else if (nowMs < tMs('2026-12-03T00:00:00')) {
      stage = ['评审进行中', '作品评审正在进行，获奖名单将于 ' + dateTag + ' 在本页公布，记得收藏'];
    } else {
      stage = ['获奖名单已公布', '获奖名单已公布，往下滚动即可查看获奖队伍与作品展示'];
    }
    stageText.textContent = stage[0];
    stageDesc.innerHTML = stage[1];
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
