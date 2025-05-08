document.addEventListener("DOMContentLoaded", () => {
    // Skill bary
    const bars = document.querySelectorAll(".skill-bar");
  
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const targetWidth = el.getAttribute("data-width");
          el.style.width = targetWidth;
          el.classList.add("transition-all", "duration-700");
          observer.unobserve(el);
        }
      });
    }, {
      threshold: 0.2,
    });
  
    bars.forEach(bar => observer.observe(bar));
  
  });
  