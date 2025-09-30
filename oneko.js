// Modified oneko.js with random decisions
(function oneko() {
  const isReducedMotion =
    window.matchMedia(`(prefers-reduced-motion: reduce)`) === true ||
    window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true;
  if (isReducedMotion) return;

  const nekoEl = document.createElement("div");

  let nekoPosX = 32;
  let nekoPosY = 32;

  let mousePosX = 0;
  let mousePosY = 0;

  let frameCount = 0;
  let idleAnimationFrame = 0;

  const nekoSpeed = 10;
  let lastFrameTimestamp;
  let mode = "chase"; // chase | wander | sleep
  let modeTimer = 0;
  let wanderDir = [0, 0]; // random wander direction

  const spriteSets = {
    idle: [[-3, -3]],
    alert: [[-7, -3]],
    scratchSelf: [[-5, 0], [-6, 0], [-7, 0]],
    tired: [[-3, -2]],
    sleeping: [[-2, 0], [-2, -1]],
    N: [[-1, -2], [-1, -3]],
    NE: [[0, -2], [0, -3]],
    E: [[-3, 0], [-3, -1]],
    SE: [[-5, -1], [-5, -2]],
    S: [[-6, -3], [-7, -2]],
    SW: [[-5, -3], [-6, -1]],
    W: [[-4, -2], [-4, -3]],
    NW: [[-1, 0], [-1, -1]],
  };

  function init() {
    nekoEl.id = "oneko";
    nekoEl.ariaHidden = true;
    nekoEl.style.width = "32px";
    nekoEl.style.height = "32px";
    nekoEl.style.position = "fixed";
    nekoEl.style.pointerEvents = "none";
    nekoEl.style.imageRendering = "pixelated";
    nekoEl.style.left = `${nekoPosX - 16}px`;
    nekoEl.style.top = `${nekoPosY - 16}px`;
    nekoEl.style.zIndex = 2147483647;

    // pick a random neko sprite if dataset.cat provided
    let nekoFile = "./oneko.gif";
    const curScript = document.currentScript;
    if (curScript && curScript.dataset.cat) {
      nekoFile = curScript.dataset.cat;
    }
    nekoEl.style.backgroundImage = `url(${nekoFile})`;

    document.body.appendChild(nekoEl);

    document.addEventListener("mousemove", (event) => {
      mousePosX = event.clientX;
      mousePosY = event.clientY;
    });

    window.requestAnimationFrame(onAnimationFrame);
  }

  function setSprite(name, frame) {
    const sprite = spriteSets[name][frame % spriteSets[name].length];
    if (sprite) {
      nekoEl.style.backgroundPosition = `${sprite[0] * 32}px ${sprite[1] * 32}px`;
    }
  }

  function pickMode() {
    const options = ["chase", "wander", "sleep"];
    mode = options[Math.floor(Math.random() * options.length)];
    modeTimer = 300 + Math.floor(Math.random() * 300); // stay in mode ~5-10s
    if (mode === "wander") {
      // pick random direction
      const dirs = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]];
      wanderDir = dirs[Math.floor(Math.random() * dirs.length)];
    }
    idleAnimationFrame = 0;
    console.log("Neko mode:", mode);
  }

  function doChase() {
    const diffX = nekoPosX - mousePosX;
    const diffY = nekoPosY - mousePosY;
    const distance = Math.sqrt(diffX ** 2 + diffY ** 2);

    if (distance < nekoSpeed || distance < 48) {
      setSprite("idle", 0);
      return;
    }

    let direction = "";
    direction += diffY / distance > 0.5 ? "N" : "";
    direction += diffY / distance < -0.5 ? "S" : "";
    direction += diffX / distance > 0.5 ? "W" : "";
    direction += diffX / distance < -0.5 ? "E" : "";
    setSprite(direction, frameCount);

    nekoPosX -= (diffX / distance) * nekoSpeed;
    nekoPosY -= (diffY / distance) * nekoSpeed;
  }

  function doWander() {
    setSprite("S", frameCount); // show walking south-ish
    nekoPosX += wanderDir[0] * (nekoSpeed / 2);
    nekoPosY += wanderDir[1] * (nekoSpeed / 2);

    // bounce off screen edges
    if (nekoPosX < 16 || nekoPosX > window.innerWidth - 16) wanderDir[0] *= -1;
    if (nekoPosY < 16 || nekoPosY > window.innerHeight - 16) wanderDir[1] *= -1;
  }

  function doSleep() {
    if (idleAnimationFrame < 8) {
      setSprite("tired", 0);
    } else {
      setSprite("sleeping", Math.floor(idleAnimationFrame / 4));
    }
    idleAnimationFrame++;
  }

  function frame() {
    frameCount++;
    modeTimer--;
    if (modeTimer <= 0) pickMode();

    if (mode === "chase") {
      doChase();
    } else if (mode === "wander") {
      doWander();
    } else if (mode === "sleep") {
      doSleep();
    }

    nekoPosX = Math.min(Math.max(16, nekoPosX), window.innerWidth - 16);
    nekoPosY = Math.min(Math.max(16, nekoPosY), window.innerHeight - 16);
    nekoEl.style.left = `${nekoPosX - 16}px`;
    nekoEl.style.top = `${nekoPosY - 16}px`;
  }

  function onAnimationFrame(timestamp) {
    if (!nekoEl.isConnected) return;
    if (!lastFrameTimestamp) lastFrameTimestamp = timestamp;
    if (timestamp - lastFrameTimestamp > 100) {
      lastFrameTimestamp = timestamp;
      frame();
    }
    window.requestAnimationFrame(onAnimationFrame);
  }

  init();
})();
