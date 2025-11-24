document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.querySelector(".projects-carousel");
  if (!carousel) return;

  const track = carousel.querySelector(".pc-track");
  const slides = Array.from(track.querySelectorAll(".pc-card"));
  const prevBtn = carousel.querySelector(".pc-prev");
  const nextBtn = carousel.querySelector(".pc-next");

  const slidesToShow = 3; // number of visible slides
  const realCount = slides.length;
  if (realCount === 0) return;

  // Helper to read numeric gap (grid gap)
  const getGap = () => {
    const g = getComputedStyle(track).gap || getComputedStyle(track).columnGap;
    return parseFloat(g) || 0;
  };

  // Clone slides for infinite loop
  const clonesBefore = slides.slice(-slidesToShow).map(s => s.cloneNode(true));
  const clonesAfter = slides.slice(0, slidesToShow).map(s => s.cloneNode(true));

  clonesBefore.forEach(c => track.insertBefore(c, track.firstChild));
  clonesAfter.forEach(c => track.appendChild(c));

  // All slides (including clones)
  let allSlides = Array.from(track.children);

  // Current index pointer into allSlides (we start at the first real slide)
  let idx = slidesToShow;

  // Compute slide size (width + gap)
  const computeSizes = () => {
    // Use the first real slide (which is at position slidesToShow after clones)
    allSlides = Array.from(track.children);
    const firstReal = allSlides[idx];
    // if images aren't loaded yet, width might be zero; fallback to bounding box of any card
    const w = firstReal.getBoundingClientRect().width || allSlides[0].getBoundingClientRect().width;
    const gap = getGap();
    return { slideSize: w + gap, gap, w };
  };

  let { slideSize } = computeSizes();

  // Set initial position (translate to show the real first slide)
  let position = idx * slideSize;
  track.style.transform = `translateX(-${position}px)`;

  // Move function: +1 = next, -1 = prev
  const move = (direction) => {
    // direction: +1 -> move to next (shift left), -1 -> move to prev (shift right)
    // we update idx accordingly and animate
    if (direction === +1) {
      idx += 1;
    } else if (direction === -1) {
      idx -= 1;
    } else {
      return;
    }

    // recompute sizes in case of responsive change
    const sizes = computeSizes();
    slideSize = sizes.slideSize;
    position = idx * slideSize;

    // animate
    track.style.transition = "transform 0.55s ease";
    track.style.transform = `translateX(-${position}px)`;
  };

  // When animation ends, correct the index if we are on clones
  track.addEventListener("transitionend", () => {
    // If we've moved past the last real slide (into clones at end)
    if (idx >= slidesToShow + realCount) {
      // jump back to the equivalent real slide (no transition)
      idx = slidesToShow;
      const sizes = computeSizes();
      slideSize = sizes.slideSize;
      position = idx * slideSize;
      track.style.transition = "none";
      track.style.transform = `translateX(-${position}px)`;
      // force reflow so next transition works
      void track.offsetWidth;
    }

    // If we've moved before the first real slide (into clones at start)
    if (idx < slidesToShow) {
      idx = slidesToShow + realCount - 1;
      const sizes = computeSizes();
      slideSize = sizes.slideSize;
      position = idx * slideSize;
      track.style.transition = "none";
      track.style.transform = `translateX(-${position}px)`;
      void track.offsetWidth;
    }
  });

  // Buttons
  if (nextBtn) nextBtn.addEventListener("click", () => move(+1));
  if (prevBtn) prevBtn.addEventListener("click", () => move(-1));

  // Keyboard accessibility (optional)
  carousel.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { move(+1); }
    if (e.key === "ArrowLeft") { move(-1); }
  });
  // make controls focusable for keyboard events
  carousel.setAttribute("tabindex", "0");

  // Recalculate sizes / position on resize (keeps layout stable)
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const sizes = computeSizes();
      slideSize = sizes.slideSize;
      position = idx * slideSize;
      track.style.transition = "none";
      track.style.transform = `translateX(-${position}px)`;
      void track.offsetWidth;
    }, 80);
  });

  // Optional: autoplay (comment out if you don't want it)
  let autoplayId = setInterval(() => move(+1), 4000);
  carousel.addEventListener("mouseenter", () => clearInterval(autoplayId));
  carousel.addEventListener("mouseleave", () => autoplayId = setInterval(() => move(+1), 4000));
});
