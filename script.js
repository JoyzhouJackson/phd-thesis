const progress = document.querySelector('#pageProgress');
const year = document.querySelector('#year');
const themeToggle = document.querySelector('.theme-toggle');
const tabs = [...document.querySelectorAll('[role="tab"]')];
const panels = [...document.querySelectorAll('[role="tabpanel"]')];

year.textContent = new Date().getFullYear();

const updateProgress = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
  progress.style.width = `${Math.min(100, Math.max(0, ratio * 100))}%`;
};

window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('shown');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

// Ensure content remains visible for print, full-page captures, and browsers that
// do not deliver every IntersectionObserver callback during rapid navigation.
window.setTimeout(() => {
  document.querySelectorAll('.reveal').forEach((element) => element.classList.add('shown'));
}, 1200);

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((item) => item.setAttribute('aria-selected', String(item === tab)));
    panels.forEach((panel) => {
      const selected = panel.id === `panel-${tab.dataset.tab}`;
      panel.hidden = !selected;
      panel.classList.toggle('active', selected);
      if (selected) panel.querySelectorAll('.reveal').forEach((item) => item.classList.add('shown'));
    });
  });

  tab.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    const offset = event.key === 'ArrowRight' ? 1 : -1;
    const nextIndex = (tabs.indexOf(tab) + offset + tabs.length) % tabs.length;
    tabs[nextIndex].focus();
    tabs[nextIndex].click();
  });
});

themeToggle.addEventListener('click', () => {
  const active = document.body.classList.toggle('light-hero');
  themeToggle.setAttribute('aria-pressed', String(active));
});

document.querySelectorAll('.agent-loop button').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.agent-loop button').forEach((item) => item.removeAttribute('data-active'));
    button.setAttribute('data-active', 'true');
  });
});
