/* =========================================================
   SAFEEDGE APARTMENTS — GITHUB PAGES GALLERY
   No Node.js / Express required.

   GitHub Actions generates images.json automatically from
   the images/ folder whenever the site is deployed.
========================================================= */

const CONFIG = {
  autoPlayMs: 4800,
  refreshMs: 300000
};

const slidesEl = document.getElementById("slides");
const carouselEl = document.getElementById("carousel");
const captionEl = document.getElementById("caption");
const titleEl = document.getElementById("captionTitle");
const textEl = document.getElementById("captionText");
const counterEl = document.getElementById("counter");
const progressEl = document.getElementById("progressBar");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

let images = [];
let current = 0;
let timer = null;
let progressAnimation = null;
let touchStartX = 0;
let touchStartY = 0;
let captionTimeout = null;

const descriptions = [
  "Comfortable spaces designed for living, working and creating.",
  "A calm, welcoming space made for memorable stays.",
  "Everything you need to feel right at home.",
  "Stay connected, comfortable and completely at ease.",
  "Your space to work, relax and enjoy the moment."
];

/* =========================================================
   LOAD IMAGES.JSON
========================================================= */

async function loadImages(keepCurrent = true) {
  try {
    const response = await fetch(`images.json?t=${Date.now()}`, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`images.json returned ${response.status}`);
    }

    const data = await response.json();
    const newImages = Array.isArray(data.images) ? data.images : [];

    if (!newImages.length) {
      images = [];
      showEmptyState();
      return;
    }

    const oldCurrentImage = images[current];
    images = newImages;

    if (keepCurrent && oldCurrentImage) {
      const sameIndex = images.indexOf(oldCurrentImage);
      current = sameIndex >= 0
        ? sameIndex
        : Math.min(current, images.length - 1);
    } else {
      current = Math.min(current, images.length - 1);
    }

    buildSlides();
    startAutoPlay();

  } catch (error) {
    console.error("Could not load SafeEdge gallery:", error);
    showEmptyState();
  }
}

/* =========================================================
   BUILD SLIDES
========================================================= */

function buildSlides() {
  slidesEl.innerHTML = images.map((src, index) => `
    <article class="slide" data-index="${index}">
      <img
        src="${src}"
        alt="SafeEdge Apartments gallery image ${index + 1}"
        loading="${index < 2 ? "eager" : "lazy"}"
        draggable="false"
      >
    </article>
  `).join("");

  updateSlides(false);
}

/* =========================================================
   UPDATE SLIDES
========================================================= */

function updateSlides(animate = true) {
  const slides = [...document.querySelectorAll(".slide")];

  slides.forEach((slide, index) => {
    slide.classList.remove(
      "active",
      "prev",
      "next",
      "far-prev",
      "far-next"
    );

    const difference = circularDistance(index, current, images.length);

    if (difference === 0) {
      slide.classList.add("active");
    } else if (difference === -1) {
      slide.classList.add("prev");
    } else if (difference === 1) {
      slide.classList.add("next");
    } else if (difference < 0) {
      slide.classList.add("far-prev");
    } else {
      slide.classList.add("far-next");
    }
  });

  updateCaption(animate);
  resetProgress();

  if (animate) {
    triggerBackgroundAnimation();
  }
}

/* =========================================================
   STRONG BACKGROUND ANIMATION TRIGGER
========================================================= */

function triggerBackgroundAnimation() {
  document.body.classList.remove("background-shift");

  // Force animation restart.
  void document.body.offsetWidth;

  document.body.classList.add("background-shift");

  window.setTimeout(() => {
    document.body.classList.remove("background-shift");
  }, 950);
}

/* =========================================================
   CIRCULAR POSITION
========================================================= */

function circularDistance(index, active, length) {
  let difference = index - active;

  if (difference > length / 2) {
    difference -= length;
  }

  if (difference < -length / 2) {
    difference += length;
  }

  return difference;
}

/* =========================================================
   CAPTION
========================================================= */

function updateCaption(animate = true) {
  if (!images.length) return;

  const fileName = images[current]
    .split("/")
    .pop()
    .replace(/\.[^/.]+$/, "")
    .replace(/[-_]+/g, " ")
    .trim();

  const title = fileName
    ? fileName.replace(/\b\w/g, letter => letter.toUpperCase())
    : `SafeEdge Gallery ${current + 1}`;

  const updateText = () => {
    titleEl.textContent = title;
    textEl.textContent = descriptions[current % descriptions.length];
    counterEl.textContent =
      `${String(current + 1).padStart(2, "0")} / ${String(images.length).padStart(2, "0")}`;
    captionEl.classList.remove("changing");
  };

  if (captionTimeout) {
    clearTimeout(captionTimeout);
  }

  if (animate) {
    captionEl.classList.add("changing");
    captionTimeout = setTimeout(updateText, 180);
  } else {
    updateText();
  }
}

/* =========================================================
   NAVIGATION
========================================================= */

function next() {
  if (images.length < 2) return;

  current = (current + 1) % images.length;
  updateSlides();
}

function previous() {
  if (images.length < 2) return;

  current = (current - 1 + images.length) % images.length;
  updateSlides();
}

/* =========================================================
   AUTOPLAY
========================================================= */

function startAutoPlay() {
  stopAutoPlay();

  if (images.length < 2) return;

  timer = setInterval(next, CONFIG.autoPlayMs);
  animateProgress();
}

function stopAutoPlay() {
  clearInterval(timer);
  timer = null;

  if (progressAnimation) {
    cancelAnimationFrame(progressAnimation);
    progressAnimation = null;
  }
}

/* =========================================================
   PROGRESS BAR
========================================================= */

function resetProgress() {
  if (!images.length) return;

  if (progressAnimation) {
    cancelAnimationFrame(progressAnimation);
    progressAnimation = null;
  }

  progressEl.style.width = "0%";

  if (images.length > 1) {
    animateProgress();
  }
}

function animateProgress() {
  if (images.length < 2) return;

  const startedAt = performance.now();

  function frame(now) {
    const elapsed = now - startedAt;
    const percentage = Math.min(
      (elapsed / CONFIG.autoPlayMs) * 100,
      100
    );

    progressEl.style.width = `${percentage}%`;

    if (elapsed < CONFIG.autoPlayMs) {
      progressAnimation = requestAnimationFrame(frame);
    }
  }

  progressAnimation = requestAnimationFrame(frame);
}

/* =========================================================
   BUTTON CONTROLS
========================================================= */

prevBtn.addEventListener("click", () => {
  previous();
  startAutoPlay();
});

nextBtn.addEventListener("click", () => {
  next();
  startAutoPlay();
});

/* =========================================================
   PAUSE ON HOVER
========================================================= */

carouselEl.addEventListener("mouseenter", stopAutoPlay);
carouselEl.addEventListener("mouseleave", startAutoPlay);

/* =========================================================
   MOBILE SWIPE
========================================================= */

carouselEl.addEventListener("touchstart", event => {
  const touch = event.changedTouches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}, { passive: true });

carouselEl.addEventListener("touchend", event => {
  const touch = event.changedTouches[0];
  const deltaX = touch.clientX - touchStartX;
  const deltaY = touch.clientY - touchStartY;

  if (
    Math.abs(deltaX) > 45 &&
    Math.abs(deltaX) > Math.abs(deltaY)
  ) {
    if (deltaX < 0) {
      next();
    } else {
      previous();
    }

    startAutoPlay();
  }
}, { passive: true });

/* =========================================================
   KEYBOARD CONTROLS
========================================================= */

document.addEventListener("keydown", event => {
  if (event.key === "ArrowRight") {
    next();
    startAutoPlay();
  }

  if (event.key === "ArrowLeft") {
    previous();
    startAutoPlay();
  }
});

/* =========================================================
   TAB VISIBILITY
========================================================= */

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopAutoPlay();
  } else {
    startAutoPlay();
  }
});

/* =========================================================
   REFRESH GENERATED IMAGE LIST
========================================================= */

setInterval(() => {
  if (!document.hidden) {
    loadImages(true);
  }
}, CONFIG.refreshMs);

/* =========================================================
   EMPTY STATE
========================================================= */

function showEmptyState() {
  slidesEl.innerHTML = `
    <article class="slide active empty-state">
      <div class="empty-content">
        <span class="empty-icon">⌂</span>
        <h2>No Gallery Images Yet</h2>
        <p>
          Add your SafeEdge Apartments photos to the
          <strong>images</strong> folder and push them to GitHub.
        </p>
      </div>
    </article>
  `;

  titleEl.textContent = "SafeEdge Gallery";
  textEl.textContent = "Add photos to the images folder to begin.";
  counterEl.textContent = "00 / 00";
  progressEl.style.width = "0%";

  stopAutoPlay();
}

/* =========================================================
   INITIAL LOAD
========================================================= */

loadImages(false);
