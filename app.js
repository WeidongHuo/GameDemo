const GAME_IMAGES = {
  stillwater: [
    "图片/StillWater7.png",
    "图片/StillWater2.png",
    "图片/StillWater3.png",
    "图片/StillWater4.png",
    "图片/StillWater5.png",
    "图片/StillWater6.png",
    "图片/StillWater1.png",
    "图片/StillWater8.png",
  ],
};

function initGallery(section) {
  const key = section.dataset.game;
  const urls = GAME_IMAGES[key];
  if (!urls || !urls.length) return;

  const galleryRoot = section.querySelector(".gallery");
  const mainImg = section.querySelector(".gallery-image");
  const counter = section.querySelector(".gallery-counter");
  const thumbList = section.querySelector(".thumbs");
  const btnPrev = section.querySelector(".hit-prev");
  const btnNext = section.querySelector(".hit-next");

  if (!galleryRoot || !mainImg || !counter || !thumbList || !btnPrev || !btnNext) return;

  let index = 0;
  let autoplayId;

  function setIndex(next) {
    const n = urls.length;
    index = ((next % n) + n) % n;
    mainImg.src = urls[index];
    counter.textContent = `${index + 1} / ${n}`;
    thumbList.querySelectorAll("button").forEach((button, i) => {
      button.classList.toggle("is-active", i === index);
    });
  }

  function restartAutoplay() {
    if (autoplayId) {
      clearInterval(autoplayId);
    }

    if (urls.length > 1) {
      autoplayId = setInterval(() => setIndex(index + 1), 5000);
    }
  }

  thumbList.replaceChildren();

  urls.forEach((url, i) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("aria-label", `第 ${i + 1} 张`);

    const img = document.createElement("img");
    img.src = url;
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";

    btn.appendChild(img);
    btn.addEventListener("click", () => {
      setIndex(i);
      restartAutoplay();
    });
    li.appendChild(btn);
    thumbList.appendChild(li);
  });

  btnPrev.addEventListener("click", () => {
    setIndex(index - 1);
    restartAutoplay();
  });
  btnNext.addEventListener("click", () => {
    setIndex(index + 1);
    restartAutoplay();
  });

  galleryRoot.tabIndex = 0;
  galleryRoot.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setIndex(index - 1);
      restartAutoplay();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setIndex(index + 1);
      restartAutoplay();
    }
  });

  setIndex(0);
  restartAutoplay();
}

document.querySelectorAll(".game-section").forEach(initGallery);

function initPageMusic() {
  const audio = document.querySelector("[data-page-music]");
  const toggle = document.querySelector("[data-music-toggle]");
  if (!audio || !toggle) return;

  const loopStart = Number(audio.dataset.loopStart || 0);
  const unlockEvents = ["pointerdown", "touchend", "keydown"];
  let waitingForGesture = false;

  function removeGestureUnlock() {
    if (!waitingForGesture) return;
    waitingForGesture = false;
    unlockEvents.forEach((eventName) => {
      document.removeEventListener(eventName, unlockFromGesture, true);
    });
    toggle.classList.remove("needs-gesture");
  }

  function addGestureUnlock() {
    if (waitingForGesture) return;
    waitingForGesture = true;
    unlockEvents.forEach((eventName) => {
      document.addEventListener(eventName, unlockFromGesture, true);
    });
    toggle.classList.add("needs-gesture");
  }

  function seekToLoopStart() {
    if (!Number.isFinite(loopStart)) return;
    const target = audio.duration && audio.duration < loopStart ? 0 : loopStart;
    try {
      audio.currentTime = target;
    } catch {
      audio.addEventListener("loadedmetadata", seekToLoopStart, { once: true });
    }
  }

  function updateToggle() {
    toggle.hidden = false;
    toggle.textContent = audio.paused ? "播放音乐" : "暂停音乐";
    toggle.classList.toggle("is-playing", !audio.paused);
  }

  async function playFromLoopStart(reset = false) {
    if (reset || audio.currentTime < loopStart) {
      seekToLoopStart();
    }

    try {
      await audio.play();
    } catch {
      addGestureUnlock();
      updateToggle();
      return false;
    }

    removeGestureUnlock();
    updateToggle();
    return true;
  }

  function unlockFromGesture(e) {
    if (e.type === "keydown" && e.key !== "Enter" && e.key !== " ") return;
    if (e.target instanceof Element && e.target.closest("[data-music-toggle]")) return;
    playFromLoopStart();
  }

  audio.volume = 0.65;
  audio.addEventListener("loadedmetadata", seekToLoopStart, { once: true });
  audio.addEventListener("ended", () => playFromLoopStart(true));
  audio.addEventListener("play", updateToggle);
  audio.addEventListener("pause", updateToggle);

  toggle.addEventListener("click", () => {
    if (audio.paused) {
      playFromLoopStart();
    } else {
      audio.pause();
    }
  });

  updateToggle();
  playFromLoopStart(true);
}

initPageMusic();

function initAmbientBackground() {
  const targets = document.querySelectorAll("[data-bg-target]");
  if (!targets.length) return;

  const states = ["ambient-stillwater", "ambient-forgive"];

  function setAmbient(name) {
    document.body.classList.remove(...states);
    if (name === "stillwater") {
      document.body.classList.add("ambient-stillwater");
    } else if (name === "forgive") {
      document.body.classList.add("ambient-forgive");
    }
  }

  targets.forEach((target) => {
    const name = target.dataset.bgTarget;
    target.addEventListener("pointerenter", () => setAmbient(name));
    target.addEventListener("focus", () => setAmbient(name));
    target.addEventListener("pointerleave", () => setAmbient());
    target.addEventListener("blur", () => setAmbient());
  });
}

initAmbientBackground();

function initLanguageToggle() {
  const toggle = document.querySelector("[data-lang-toggle]");
  if (!toggle) return;

  const translatable = document.querySelectorAll("[data-i18n]");
  let current = "zh";

  function setLanguage(next) {
    current = next;
    document.documentElement.lang = current === "zh" ? "zh-CN" : "en";
    translatable.forEach((element) => {
      const value = element.dataset[current];
      if (value) {
        element.textContent = value;
      }
    });
    toggle.textContent = current === "zh" ? "EN" : "中文";
    toggle.setAttribute("aria-pressed", String(current === "en"));
  }

  toggle.addEventListener("click", () => {
    setLanguage(current === "zh" ? "en" : "zh");
  });

  setLanguage("zh");
}

initLanguageToggle();
