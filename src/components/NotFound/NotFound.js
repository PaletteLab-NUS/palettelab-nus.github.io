import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Particle from "../Particle";
import "./NotFound.css";

const PIXEL = 4;
const SHIP_COLOR = "#f4f4f4";

const SHIP_SPRITE = [
  [0, 0, 1, 0, 0],
  [0, 1, 1, 1, 0],
  [1, 1, 1, 1, 1],
  [0, 1, 0, 1, 0],
];

const ALIEN_SPRITE = [
  [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 1, 0, 0, 1, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 1, 0, 1, 1, 1, 1, 0, 1, 0],
  [1, 1, 1, 0, 0, 0, 0, 1, 1, 1],
  [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 1, 1, 1, 1, 0, 0, 1],
];

function randomBrightColor() {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 100%, 58%)`;
}

function spriteWidth(sprite) {
  return sprite[0].length * PIXEL;
}

function spriteHeight(sprite) {
  return sprite.length * PIXEL;
}

function drawSprite(ctx, sprite, x, y, color) {
  ctx.fillStyle = color;
  sprite.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell) {
        ctx.fillRect(
          x + colIndex * PIXEL,
          y + rowIndex * PIXEL,
          PIXEL,
          PIXEL
        );
      }
    });
  });
}

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function createAliens(canvasWidth, canvasHeight) {
  const alienW = spriteWidth(ALIEN_SPRITE);
  const alienH = spriteHeight(ALIEN_SPRITE);
  const targetCount = 18 + Math.floor(Math.random() * 7);
  const minX = 8;
  const maxX = canvasWidth - alienW - 8;
  const minY = Math.max(28, canvasHeight * 0.06);
  const maxY = canvasHeight * 0.42;
  const spacing = 8;
  const aliens = [];
  let attempts = 0;
  const maxAttempts = targetCount * 40;

  while (aliens.length < targetCount && attempts < maxAttempts) {
    attempts += 1;
    const x = minX + Math.random() * (maxX - minX);
    const y = minY + Math.random() * (maxY - minY);
    const candidate = {
      x,
      y,
      w: alienW + spacing,
      h: alienH + spacing,
    };

    const overlaps = aliens.some((alien) =>
      rectsOverlap(candidate, {
        x: alien.x,
        y: alien.y,
        w: alienW + spacing,
        h: alienH + spacing,
      })
    );

    if (!overlaps) {
      aliens.push({
        x,
        y,
        alive: true,
        color: randomBrightColor(),
      });
    }
  }

  return aliens;
}

function getCanvasSize(containerWidth) {
  const cssW = Math.min(760, Math.max(320, containerWidth));
  const cssH = Math.round(cssHFromWidth(cssW));
  return { cssW, cssH };
}

function cssHFromWidth(cssW) {
  return cssW * 0.58;
}

function SpaceShooterGame() {
  const canvasRef = useRef(null);
  const panelRef = useRef(null);
  const stateRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const panel = panelRef.current;
    if (!canvas || !panel) return undefined;

    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    let cssW = 0;
    let cssH = 0;
    let frameId = 0;

    const shipW = spriteWidth(SHIP_SPRITE);
    const shipH = spriteHeight(SHIP_SPRITE);

    const state = {
      shipX: 0,
      shipY: 0,
      shipW,
      shipH,
      bullets: [],
      aliens: [],
      alienDir: 1,
      alienSpeed: 0.5,
      keys: { left: false, right: false },
      lastShot: 0,
      score: 0,
      gameOver: false,
      pointerX: null,
    };

    stateRef.current = state;

    const resizeCanvas = () => {
      const { cssW: nextW, cssH: nextH } = getCanvasSize(panel.clientWidth);
      cssW = nextW;
      cssH = nextH;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      state.shipX = (cssW - shipW) / 2;
      state.shipY = cssH - shipH - 18;
    };

    const shoot = () => {
      if (state.gameOver) return;
      const now = performance.now();
      if (now - state.lastShot < 240) return;
      state.lastShot = now;
      state.bullets.push({
        x: state.shipX + shipW / 2 - 1,
        y: state.shipY - 8,
        w: 3,
        h: 10,
      });
    };

    const resetGame = () => {
      resizeCanvas();
      state.shipX = (cssW - shipW) / 2;
      state.bullets = [];
      state.aliens = createAliens(cssW, cssH);
      state.alienDir = 1;
      state.alienSpeed = 0.5;
      state.score = 0;
      state.gameOver = false;
      state.lastShot = 0;
    };

    const onKeyDown = (event) => {
      if (event.code === "ArrowLeft" || event.code === "KeyA") {
        state.keys.left = true;
      }
      if (event.code === "ArrowRight" || event.code === "KeyD") {
        state.keys.right = true;
      }
      if (event.code === "Space") {
        event.preventDefault();
        shoot();
      }
      if (event.code === "Enter" && state.gameOver) {
        resetGame();
      }
    };

    const onKeyUp = (event) => {
      if (event.code === "ArrowLeft" || event.code === "KeyA") {
        state.keys.left = false;
      }
      if (event.code === "ArrowRight" || event.code === "KeyD") {
        state.keys.right = false;
      }
    };

    const setPointerFromEvent = (event) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = "touches" in event ? event.touches[0]?.clientX : event.clientX;
      if (clientX == null) return;
      state.pointerX = clientX - rect.left;
    };

    const onPointerDown = (event) => {
      canvas.setPointerCapture(event.pointerId);
      if (state.gameOver) {
        resetGame();
        event.preventDefault();
        return;
      }
      setPointerFromEvent(event);
      shoot();
      event.preventDefault();
    };

    const onPointerMove = (event) => {
      setPointerFromEvent(event);
      event.preventDefault();
    };

    const onPointerUp = () => {
      state.pointerX = null;
    };

    const update = () => {
      if (!state.gameOver) {
        const speed = 3.4;

        if (state.keys.left) {
          state.shipX -= speed;
        }
        if (state.keys.right) {
          state.shipX += speed;
        }
        if (state.pointerX != null) {
          state.shipX = state.pointerX - shipW / 2;
        }

        state.shipX = Math.max(8, Math.min(cssW - shipW - 8, state.shipX));

        state.bullets.forEach((bullet) => {
          bullet.y -= 4.8;
        });
        state.bullets = state.bullets.filter((bullet) => bullet.y > -12);

        let edgeHit = false;
        state.aliens.forEach((alien) => {
          if (!alien.alive) return;
          alien.x += state.alienDir * state.alienSpeed;
          if (alien.x <= 8 || alien.x + spriteWidth(ALIEN_SPRITE) >= cssW - 8) {
            edgeHit = true;
          }
        });

        if (edgeHit) {
          state.alienDir *= -1;
          state.aliens.forEach((alien) => {
            if (alien.alive) {
              alien.y += 12;
            }
          });
          state.alienSpeed += 0.05;
        }

        state.bullets.forEach((bullet) => {
          state.aliens.forEach((alien) => {
            if (!alien.alive) return;
            const alienBox = {
              x: alien.x,
              y: alien.y,
              w: spriteWidth(ALIEN_SPRITE),
              h: spriteHeight(ALIEN_SPRITE),
            };
            if (rectsOverlap(bullet, alienBox)) {
              alien.alive = false;
              bullet.y = -100;
              state.score += 10;
            }
          });
        });

        const shipBox = {
          x: state.shipX,
          y: state.shipY,
          w: shipW,
          h: shipH,
        };

        state.aliens.forEach((alien) => {
          if (!alien.alive) return;
          const alienBox = {
            x: alien.x,
            y: alien.y,
            w: spriteWidth(ALIEN_SPRITE),
            h: spriteHeight(ALIEN_SPRITE),
          };
          if (rectsOverlap(shipBox, alienBox) || alien.y + spriteHeight(ALIEN_SPRITE) >= state.shipY) {
            state.gameOver = true;
          }
        });

        if (state.aliens.every((alien) => !alien.alive)) {
          state.aliens = createAliens(cssW, cssH);
          state.alienSpeed += 0.08;
        }
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, cssW, cssH);

      state.aliens.forEach((alien) => {
        if (alien.alive) {
          drawSprite(ctx, ALIEN_SPRITE, alien.x, alien.y, alien.color);
        }
      });

      state.bullets.forEach((bullet) => {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(bullet.x, bullet.y, bullet.w, bullet.h);
      });

      drawSprite(ctx, SHIP_SPRITE, state.shipX, state.shipY, SHIP_COLOR);

      ctx.fillStyle = "rgba(255,255,255,0.88)";
      ctx.font = "600 15px Urbanist, sans-serif";
      ctx.fillText(`Score ${state.score}`, 12, 24);

      if (state.gameOver) {
        ctx.fillStyle = "rgba(8, 6, 20, 0.45)";
        ctx.fillRect(0, 0, cssW, cssH);
        ctx.textAlign = "center";
        ctx.fillStyle = "#ffffff";
        ctx.font = "700 28px Urbanist, sans-serif";
        ctx.fillText("Game over", cssW / 2, cssH / 2 - 8);
        ctx.font = "500 16px Urbanist, sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.82)";
        ctx.fillText("Tap to retry", cssW / 2, cssH / 2 + 24);
        ctx.textAlign = "left";
      }
    };

    const loop = () => {
      update();
      render();
      frameId = requestAnimationFrame(loop);
    };

    const onResize = () => {
      const prevCenter = state.shipX + shipW / 2;
      const prevWidth = cssW || panel.clientWidth;
      resizeCanvas();
      if (prevWidth > 0) {
        const ratio = prevCenter / prevWidth;
        state.shipX = ratio * cssW - shipW / 2;
        state.shipX = Math.max(8, Math.min(cssW - shipW - 8, state.shipX));
      }
      state.shipY = cssH - shipH - 18;
    };

    resetGame();
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("resize", onResize);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    loop();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
    };
  }, []);

  return (
    <div className="notfound-game-panel" ref={panelRef}>
      <canvas
        ref={canvasRef}
        className="notfound-shooter-canvas"
        aria-label="Retro space shooter mini game"
      />
      <p className="notfound-game-hint">Move and tap to shoot. Spacebar works too.</p>
    </div>
  );
}

function NotFound() {
  return (
    <section className="notfound-section">
      <Particle />

      <div className="notfound-arcade-wrap">
        <div className="notfound-arcade">
          <h1 className="notfound-code">404</h1>
          <p className="notfound-subtitle">
            <span className="main-name">Oops!</span> Lost in Space
          </p>

          <Link to="/" className="notfound-back-btn">
            Back to Base
          </Link>

          <hr className="notfound-divider" aria-hidden="true" />

          <SpaceShooterGame />
        </div>
      </div>
    </section>
  );
}

export default NotFound;
