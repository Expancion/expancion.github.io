// resources/js/apps/snake.js
import { tr } from "../os/i18n.js";

const I18N = {
    cz: {
        title: "Snake",
        help: "WASD / Šipky • Mezerník = pauza • R = restart",
        score: "Skóre",
        best: "Nejlepší",
        ready: "Připraveno.",
        go: "Jedeme!",
        go_help: "Jedeme! Mezerník = pauza, R = restart.",
        game_over: "Konec hry. Stiskni R pro restart.",
        paused: "PAUZA",
        paused_short: "Pozastaveno.",
    },
    en: {
        title: "Snake",
        help: "WASD / Arrows • Space = pause • R = restart",
        score: "Score",
        best: "Best",
        ready: "Ready.",
        go: "Go!",
        go_help: "Go! Space = pause, R = restart.",
        game_over: "Game Over. Press R to restart.",
        paused: "PAUSED",
        paused_short: "Paused.",
    },
};

function t(key, fallback = "") {
    return tr(I18N, key, fallback || key);
}

export function openSnake() {
    const root = document.createElement("div");
    root.className = "nx-game nx-snake";

    root.innerHTML = `
    <div class="nx-game-top">
      <div><b>${t("title", "Snake")}</b> <span class="muted">${t("help", "WASD / Arrows • Space = pause • R = restart")}</span></div>
      <div class="nx-game-stats">
        <span class="nx-badge">${t("score", "Score")}: <b id="sn-score">0</b></span>
        <span class="nx-badge">${t("best", "Best")}: <b id="sn-best">0</b></span>
      </div>
    </div>
    <canvas class="nx-game-canvas" width="600" height="600"></canvas>
    <div class="nx-game-bottom muted" id="sn-status">${t("ready", "Ready.")}</div>
  `;

    const canvas = root.querySelector("canvas");
    const ctx = canvas.getContext("2d");

    const scoreEl = root.querySelector("#sn-score");
    const bestEl = root.querySelector("#sn-best");
    const statusEl = root.querySelector("#sn-status");

    const SIZE = 24;
    const CELLS = canvas.width / SIZE;
    const TICK_MS = 120;

    let snake, dir, nextDir, food, score, paused, alive, loop;
    const bestKey = "nexus_snake_best";

    function randCell() {
        return { x: Math.floor(Math.random() * CELLS), y: Math.floor(Math.random() * CELLS) };
    }

    function spawnFood() {
        let f;
        do {
            f = randCell();
        } while (snake.some(s => s.x === f.x && s.y === f.y));
        return f;
    }

    function reset() {
        const mid = Math.floor(CELLS / 2);
        snake = [{ x: mid, y: mid }, { x: mid - 1, y: mid }, { x: mid - 2, y: mid }];
        dir = { x: 1, y: 0 };
        nextDir = dir;
        food = spawnFood();
        score = 0;
        paused = false;
        alive = true;
        scoreEl.textContent = "0";
        bestEl.textContent = String(getBest());
        statusEl.textContent = t("go_help", "Go! Space = pause, R = restart.");
        draw();
    }

    function getBest() {
        const v = Number(localStorage.getItem(bestKey) || "0");
        return Number.isFinite(v) ? v : 0;
    }

    function setBest(v) {
        localStorage.setItem(bestKey, String(v));
        bestEl.textContent = String(v);
    }

    function tick() {
        if (!alive || paused) return;

        dir = nextDir;
        const head = snake[0];
        const newHead = { x: head.x + dir.x, y: head.y + dir.y };
        const willEat = newHead.x === food.x && newHead.y === food.y;

        // walls
        if (newHead.x < 0 || newHead.y < 0 || newHead.x >= CELLS || newHead.y >= CELLS) {
            die();
            return;
        }
        // self (moving into current tail is allowed only when not eating)
        const bodyToCheck = willEat ? snake : snake.slice(0, -1);
        if (bodyToCheck.some(s => s.x === newHead.x && s.y === newHead.y)) {
            die();
            return;
        }

        snake.unshift(newHead);

        // eat
        if (willEat) {
            score++;
            scoreEl.textContent = String(score);
            if (score > getBest()) setBest(score);
            food = spawnFood();
        } else {
            snake.pop();
        }

        draw();
    }

    function die() {
        alive = false;
        statusEl.textContent = t("game_over", "Game Over. Press R to restart.");
        draw();
    }

    function draw() {
        // bg
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // subtle grid
        ctx.strokeStyle = "rgba(255,255,255,0.14)";
        ctx.globalAlpha = 0.20;
        for (let i = 0; i <= CELLS; i++) {
            ctx.beginPath();
            ctx.moveTo(i * SIZE, 0);
            ctx.lineTo(i * SIZE, canvas.height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * SIZE);
            ctx.lineTo(canvas.width, i * SIZE);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;

        // food
        ctx.fillStyle = "#fb7185";
        ctx.fillRect(food.x * SIZE + 6, food.y * SIZE + 6, SIZE - 12, SIZE - 12);

        // snake
        snake.forEach((s, idx) => {
            const pad = idx === 0 ? 4 : 6;
            ctx.fillStyle = idx === 0 ? "#22d3ee" : "#34d399";
            ctx.fillRect(s.x * SIZE + pad, s.y * SIZE + pad, SIZE - pad * 2, SIZE - pad * 2);
        });

        if (paused) {
            ctx.globalAlpha = 0.9;
            ctx.fillStyle = "#ffffff";
            ctx.font = "700 20px Ubuntu Sans, system-ui, sans-serif";
            ctx.fillText(t("paused", "PAUSED"), 12, 24);
            ctx.globalAlpha = 1;
        }
    }

    function setDir(nx, ny) {
        // prevent reversing
        if (dir.x === -nx && dir.y === -ny) return;
        nextDir = { x: nx, y: ny };
    }

    function onKey(e) {
        if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") { setDir(0, -1); e.preventDefault(); }
        if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") { setDir(0, 1); e.preventDefault(); }
        if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") { setDir(-1, 0); e.preventDefault(); }
        if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") { setDir(1, 0); e.preventDefault(); }

        if (e.key === " ") {
            paused = !paused;
            statusEl.textContent = paused ? t("paused_short", "Paused.") : (alive ? t("go", "Go!") : statusEl.textContent);
            e.preventDefault();
            draw();
        }
        if (e.key === "r" || e.key === "R") reset();
    }

    // focus handling: only capture keys when window is active-ish
    root.tabIndex = 0;
    root.addEventListener("click", () => root.focus());
    root.addEventListener("keydown", onKey);

    // init
    reset();
    loop = setInterval(tick, TICK_MS);
    requestAnimationFrame(() => root.focus());

    // cleanup when element removed (window closed)
    const obs = new MutationObserver(() => {
        if (!root.isConnected) {
            clearInterval(loop);
            obs.disconnect();
        }
    });
    obs.observe(document.body, { childList: true, subtree: true });

    return root;
}
