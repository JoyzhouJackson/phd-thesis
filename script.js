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
