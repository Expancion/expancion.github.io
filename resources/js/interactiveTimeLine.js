document.addEventListener("DOMContentLoaded", () => {
    const items = document.querySelectorAll("#timeline .mb-10");
  
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const dot = entry.target.querySelector(".timeline-dot");
  
        if (!dot) return; // bezpečnostní kontrola
  
        if (entry.isIntersecting) {
          dot.classList.remove("bg-blue-500");
          dot.classList.add("bg-green-400", "scale-110");
        } else {
          dot.classList.remove("bg-green-400", "scale-110");
          dot.classList.add("bg-blue-500");
        }
      });
    }, {
      threshold: 0.4,
    });
  
    items.forEach(item => observer.observe(item));
  });
  