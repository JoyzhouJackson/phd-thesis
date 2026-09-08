const progress = document.querySelector('#progress');

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
