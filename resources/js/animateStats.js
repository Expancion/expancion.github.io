document.addEventListener("DOMContentLoaded", () => {
    const counters = document.querySelectorAll(".stat-number");
    let animated = false;

    const animateStats = () => {
      if (animated) return;
      animated = true;

      counters.forEach(counter => {
        const target = +counter.getAttribute("data-target");
        const showPlus = counter.hasAttribute("data-plus");

        const updateCount = () => {
          const current = +counter.innerText;
          const increment = Math.ceil(target / 100);

          if (current < target) {
            counter.innerText = Math.min(current + increment, target);
            setTimeout(updateCount, 20);
          } else {
            counter.innerText = showPlus ? `${target}+` : `${target}`;
          }
        };

        updateCount();
      });
    };

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateStats();
        }
      });
    }, { threshold: 0.5 });

    const statsSection = document.getElementById("stats");
    if (statsSection) {
      observer.observe(statsSection);
    }
  });