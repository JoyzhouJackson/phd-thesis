const progress = document.querySelector('#progress');

const siteHeader = document.querySelector('.site-header');
if (siteHeader) {
  // Keep anchor targets and the introduction clear of the fixed, responsive header.
  const updateHeaderHeight = () => {
    document.documentElement.style.setProperty('--site-header-height', `${Math.ceil(siteHeader.getBoundingClientRect().height)}px`);
  };
  updateHeaderHeight();
  new ResizeObserver(updateHeaderHeight).observe(siteHeader);
}

const updateProgress = () => {
  const available = document.documentElement.scrollHeight - window.innerHeight;
  const value = available > 0 ? (window.scrollY / available) * 100 : 0;
  progress.style.width = `${Math.max(0, Math.min(100, value))}%`;
};

window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('shown');
    observer.unobserve(entry.target);
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
window.setTimeout(() => document.querySelectorAll('.reveal').forEach((element) => element.classList.add('shown')), 1000);

const researchVideo = document.querySelector('video');
if (researchVideo) {
  const videoObserver = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      researchVideo.play().catch(() => {});
    } else {
      researchVideo.pause();
    }
  }, { threshold: 0.2 });
  videoObserver.observe(researchVideo);
}

const scheduleTabs = [...document.querySelectorAll('[data-schedule-target]')];
const schedulePanels = [...document.querySelectorAll('[data-schedule-panel]')];

const activateSchedule = (target, moveFocus = false) => {
  scheduleTabs.forEach((tab) => {
    const selected = tab.dataset.scheduleTarget === target;
    tab.classList.toggle('active', selected);
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    if (selected && moveFocus) tab.focus();
  });

  schedulePanels.forEach((panel) => {
    const selected = panel.dataset.schedulePanel === target;
    panel.classList.toggle('active', selected);
    panel.hidden = !selected;
  });
};

if (scheduleTabs.length) {
  const initialTarget = scheduleTabs.find((tab) => tab.classList.contains('active'))?.dataset.scheduleTarget ?? scheduleTabs[0].dataset.scheduleTarget;
  activateSchedule(initialTarget);
}

scheduleTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateSchedule(tab.dataset.scheduleTarget));
  tab.addEventListener('keydown', (event) => {
    const keyOffsets = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (event.key === 'Home') {
      event.preventDefault();
      activateSchedule(scheduleTabs[0].dataset.scheduleTarget, true);
      return;
    }
    if (event.key === 'End') {
      event.preventDefault();
      activateSchedule(scheduleTabs.at(-1).dataset.scheduleTarget, true);
      return;
    }
    if (!(event.key in keyOffsets)) return;
    event.preventDefault();
    const nextIndex = (index + keyOffsets[event.key] + scheduleTabs.length) % scheduleTabs.length;
    activateSchedule(scheduleTabs[nextIndex].dataset.scheduleTarget, true);
  });
});
const legacyChapterIds = { object: 'background', state: 'background' };
const resolveHashTarget = (hash) => {
  let id;
  try { id = decodeURIComponent(hash.replace(/^#/, '')); } catch { return null; }
  return document.getElementById(legacyChapterIds[id] ?? id);
};
const revealHashTarget = (hash, focus = false) => {
  const target = resolveHashTarget(hash);
  if (!target) return;
  const ownChapter = target.querySelector(':scope > details[data-chapter]');
  if (ownChapter) ownChapter.open = true;
  let ancestor = target.closest('details');
  while (ancestor) {
    ancestor.open = true;
    ancestor = ancestor.parentElement?.closest('details');
  }
  const panel = target.closest('[data-schedule-panel]');
  if (panel) activateSchedule(panel.dataset.schedulePanel);
  requestAnimationFrame(() => {
    if (focus) {
      const summary = ownChapter?.querySelector(':scope > summary');
      summary?.focus({ preventScroll: true });
    }
    target.scrollIntoView({ block: 'start' });
    updateProgress();
  });
};
document.addEventListener('click', (event) => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;
  const hash = link.getAttribute('href');
  if (!resolveHashTarget(hash)) return;
  event.preventDefault();
  if (location.hash !== hash) history.pushState(null, '', hash);
  revealHashTarget(hash, true);
});
window.addEventListener('hashchange', () => revealHashTarget(location.hash));
document.querySelector('#collapse-chapters')?.addEventListener('click', () => {
  document.querySelectorAll('details[data-chapter], details[data-chapter] details').forEach((chapter) => {
    chapter.open = false;
  });
  // A chapter hash would reopen its section on refresh; clear only that hash.
  if (resolveHashTarget(location.hash)?.closest('.chapter-section')) {
    history.replaceState(null, '', location.pathname + location.search);
  }
  requestAnimationFrame(updateProgress);
});
document.querySelectorAll('details[data-chapter]').forEach((chapter) => {
  chapter.addEventListener('toggle', () => requestAnimationFrame(updateProgress));
});
if (location.hash) revealHashTarget(location.hash);
