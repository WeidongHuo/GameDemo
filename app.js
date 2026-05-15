const GAME_IMAGES = {
  stillwater: [
    "图片/StillWater1.png",
    "图片/StillWater2.png",
    "图片/StillWater3.png",
    "图片/StillWater4.png",
    "图片/StillWater5.png",
    "图片/StillWater6.png",
    "图片/StillWater7.png",
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

  function setIndex(next) {
    const n = urls.length;
    index = ((next % n) + n) % n;
    mainImg.src = urls[index];
    counter.textContent = `${index + 1} / ${n}`;
    thumbList.querySelectorAll("button").forEach((button, i) => {
      button.classList.toggle("is-active", i === index);
    });
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
    btn.addEventListener("click", () => setIndex(i));
    li.appendChild(btn);
    thumbList.appendChild(li);
  });

  btnPrev.addEventListener("click", () => setIndex(index - 1));
  btnNext.addEventListener("click", () => setIndex(index + 1));

  galleryRoot.tabIndex = 0;
  galleryRoot.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setIndex(index - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setIndex(index + 1);
    }
  });

  setIndex(0);
}

document.querySelectorAll(".game-section").forEach(initGallery);

function initPageMusic() {
  const audio = document.querySelector("[data-page-music]");
  const toggle = document.querySelector("[data-music-toggle]");
  if (!audio || !toggle) return;

  const loopStart = Number(audio.dataset.loopStart || 0);

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
      updateToggle();
      return;
    }

    updateToggle();
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
