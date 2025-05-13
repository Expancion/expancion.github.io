document.addEventListener("DOMContentLoaded", () => {
    const track = document.getElementById("carousel-track");
    const prev = document.getElementById("prev");
    const next = document.getElementById("next");
    const slides = track.children;
    const total = slides.length;
    let index = 0;
  
    function updateSlide() {
      const offset = -index * 100;
      track.style.transform = `translateX(${offset}%)`;
    }
  
    prev.addEventListener("click", () => {
      index = (index - 1 + total) % total;
      updateSlide();
    });
  
    next.addEventListener("click", () => {
      index = (index + 1) % total;
      updateSlide();
    });
  });
  