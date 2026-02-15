// resources/js/apps/tetris.js
import { tr } from "../os/i18n.js";

const I18N = {
    cz: {
        help: "Šipky = pohyb, Nahoru = otočit, Mezerník = drop, P = pauza, R = restart",
        score: "Skóre",
        lines: "Řádky",
        level: "Level",
        next: "Další",
        pause: "Pauza",
        resume: "Pokračovat",
        new: "Nová",
        ready: "Připraveno.",
        game_over: "Konec hry. Stiskni Nová nebo R.",
        cleared: "Vyčištěno {n} řádků.",
        cleared_one: "Vyčištěn 1 řádek.",
        drop: "Drop.",
        paused_status: "Pozastaveno.",
        running_status: "Běží.",
        go: "Jedeme!",
        paused_overlay: "PAUZA",
    },
    en: {
        help: "Arrows = move, Up = rotate, Space = drop, P = pause, R = restart",
        score: "Score",
        lines: "Lines",
        level: "Level",
        next: "Next",
        pause: "Pause",
        resume: "Resume",
        new: "New",
        ready: "Ready.",
        game_over: "Game Over. Press New or R.",
        cleared: "Cleared {n} lines.",
        cleared_one: "Cleared 1 line.",
        drop: "Drop.",
        paused_status: "Paused.",
        running_status: "Running.",
        go: "Go!",
        paused_overlay: "PAUSED",
    },
};

function t(key, fallback = "") {
    return tr(I18N, key, fallback || key);
}

export function openTetris() {
    const root = document.createElement("div");
    root.className = "nx-game nx-tetris";
    root.tabIndex = 0;

    root.innerHTML = `
    <div class="nx-game-top">
      <div><b>Tetris</b> <span class="muted">${t("help", "Arrows = move, Up = rotate, Space = drop, P = pause, R = restart")}</span></div>
      <div class="nx-game-stats">
        <span class="nx-badge">${t("score", "Score")}: <b id="tt-score">0</b></span>
        <span class="nx-badge">${t("lines", "Lines")}: <b id="tt-lines">0</b></span>
        <span class="nx-badge">${t("level", "Level")}: <b id="tt-level">1</b></span>
      </div>
    </div>

    <div class="nx-tetris-wrap">
      <canvas class="nx-tetris-canvas" width="300" height="600"></canvas>
      <div class="nx-tetris-side">
        <div class="muted">${t("next", "Next")}</div>
        <canvas class="nx-tetris-next" width="120" height="120"></canvas>
        <button class="nx-mini-btn" id="tt-pause">${t("pause", "Pause")}</button>
        <button class="nx-mini-btn" id="tt-new">${t("new", "New")}</button>
      </div>
    </div>

    <div class="nx-game-bottom muted" id="tt-status">${t("ready", "Ready.")}</div>
  `;

    const scoreEl = root.querySelector("#tt-score");
    const linesEl = root.querySelector("#tt-lines");
    const levelEl = root.querySelector("#tt-level");
    const statusEl = root.querySelector("#tt-status");

    const canvas = root.querySelector(".nx-tetris-canvas");
    const ctx = canvas.getContext("2d");
    const nextCanvas = root.querySelector(".nx-tetris-next");
    const nextCtx = nextCanvas.getContext("2d");

    const btnPause = root.querySelector("#tt-pause");
    const btnNew = root.querySelector("#tt-new");

    const COLS = 10;
    const ROWS = 20;
    const CELL = canvas.width / COLS;
    const bestKey = "nexus_tetris_best";
    const COLORS = ["", "#22d3ee", "#fbbf24", "#06b6d4", "#34d399", "#fb7185", "#a78bfa", "#f97316"];

    const SHAPES = [
        [[1, 1, 1, 1]], // I
        [[2, 2], [2, 2]], // O
        [[0, 3, 0], [3, 3, 3]], // T
        [[0, 4, 4], [4, 4, 0]], // S
        [[5, 5, 0], [0, 5, 5]], // Z
        [[6, 0, 0], [6, 6, 6]], // J
        [[0, 0, 7], [7, 7, 7]], // L
    ];

    let board = makeBoard();
    let current = null;
    let next = null;
    let score = 0;
    let lines = 0;
    let level = 1;
    let paused = false;
    let over = false;
    let rafId = null;
    let dropMs = 800;
    let lastTs = 0;
    let gravityAcc = 0;
    const SOFT_DROP_MULT = 9;
    const HOLD_MOVE_DELAY_MS = 100;
    const HOLD_MOVE_REPEAT_MS = 100;
    let holdDelayAcc = 0;
    let holdRepeatAcc = 0;
    const input = { down: false, left: false, right: false };

    function makeBoard() {
        return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    }

    function getBest() {
        const v = Number(localStorage.getItem(bestKey) || "0");
        return Number.isFinite(v) ? v : 0;
    }

    function setBest(v) {
        localStorage.setItem(bestKey, String(v));
    }

    function copyMatrix(m) {
        return m.map((row) => row.slice());
    }

    function randomShape() {
        const idx = Math.floor(Math.random() * SHAPES.length);
        return copyMatrix(SHAPES[idx]);
    }

    function pieceOf(shape) {
        return {
            m: shape,
            x: Math.floor((COLS - shape[0].length) / 2),
            y: -1,
        };
    }

    function collides(piece, dx = 0, dy = 0, testMatrix = piece.m) {
        for (let r = 0; r < testMatrix.length; r++) {
            for (let c = 0; c < testMatrix[r].length; c++) {
                const v = testMatrix[r][c];
                if (!v) continue;
                const nx = piece.x + c + dx;
                const ny = piece.y + r + dy;

                if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
                if (ny >= 0 && board[ny][nx]) return true;
            }
        }
        return false;
    }

    function mergePiece(piece) {
        for (let r = 0; r < piece.m.length; r++) {
            for (let c = 0; c < piece.m[r].length; c++) {
                const v = piece.m[r][c];
                if (!v) continue;
                const ny = piece.y + r;
                const nx = piece.x + c;
                if (ny >= 0) board[ny][nx] = v;
            }
        }
    }

    function rotateClockwise(matrix) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const out = Array.from({ length: cols }, () => Array(rows).fill(0));
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) out[c][rows - 1 - r] = matrix[r][c];
        }
        return out;
    }

    function clearLines() {
        let cleared = 0;
        for (let r = ROWS - 1; r >= 0; r--) {
            if (board[r].every((v) => v !== 0)) {
                board.splice(r, 1);
                board.unshift(Array(COLS).fill(0));
                cleared++;
                r++;
            }
        }
        return cleared;
    }

    function spawn() {
        if (!next) next = randomShape();
        current = pieceOf(next);
        next = randomShape();
        drawNext();

        if (collides(current)) {
            over = true;
            statusEl.textContent = t("game_over", "Game Over. Press New or R.");
            const best = getBest();
            if (score > best) setBest(score);
        }
    }

    function setSpeedFromLevel() {
        dropMs = Math.max(110, 800 - (level - 1) * 65);
    }

    function stopLoop() {
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    }

    function startLoop() {
        stopLoop();
        lastTs = 0;
        gravityAcc = 0;
        rafId = requestAnimationFrame(frame);
    }

    function updateHud() {
        scoreEl.textContent = String(score);
        linesEl.textContent = String(lines);
        levelEl.textContent = String(level);
    }

    function lockAndContinue() {
        mergePiece(current);
        const cleared = clearLines();
        if (cleared > 0) {
            const table = [0, 100, 300, 500, 800];
            score += table[cleared] * level;
            lines += cleared;
            level = 1 + Math.floor(lines / 10);
            setSpeedFromLevel();
            statusEl.textContent = cleared === 1
                ? t("cleared_one", "Cleared 1 line.")
                : t("cleared", "Cleared {n} lines.").replace("{n}", String(cleared));
        } else {
            statusEl.textContent = t("drop", "Drop.");
        }
        updateHud();
        spawn();
    }

    function stepDown() {
        if (over || !current) return false;
        if (!collides(current, 0, 1)) {
            current.y += 1;
            return true;
        } else {
            lockAndContinue();
            return false;
        }
    }

    function hardDrop() {
        if (!current || paused || over) return;
        let dist = 0;
        while (!collides(current, 0, 1)) {
            current.y += 1;
            dist++;
        }
        score += dist * 2;
        updateHud();
        lockAndContinue();
    }

    function drawCell(context, x, y, v, cell) {
        context.fillStyle = COLORS[v] || "#ffffff";
        context.fillRect(x * cell + 1, y * cell + 1, cell - 2, cell - 2);
    }

    function drawBoard() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = "rgba(255,255,255,0.12)";
        ctx.globalAlpha = 0.2;
        for (let c = 0; c <= COLS; c++) {
            ctx.beginPath();
            ctx.moveTo(c * CELL, 0);
            ctx.lineTo(c * CELL, canvas.height);
            ctx.stroke();
        }
        for (let r = 0; r <= ROWS; r++) {
            ctx.beginPath();
            ctx.moveTo(0, r * CELL);
            ctx.lineTo(canvas.width, r * CELL);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;

        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const v = board[r][c];
                if (v) drawCell(ctx, c, r, v, CELL);
            }
        }

        if (!current) return;
        for (let r = 0; r < current.m.length; r++) {
            for (let c = 0; c < current.m[r].length; c++) {
                const v = current.m[r][c];
                if (!v) continue;
                const x = current.x + c;
                const y = current.y + r;
                if (y >= 0) drawCell(ctx, x, y, v, CELL);
            }
        }
    }

    function drawNext() {
        const cell = 24;
        nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
        if (!next) return;
        const w = next[0].length;
        const h = next.length;
        const startX = Math.floor((nextCanvas.width - w * cell) / 2);
        const startY = Math.floor((nextCanvas.height - h * cell) / 2);

        for (let r = 0; r < h; r++) {
            for (let c = 0; c < w; c++) {
                const v = next[r][c];
                if (!v) continue;
                nextCtx.fillStyle = COLORS[v];
                nextCtx.fillRect(startX + c * cell + 1, startY + r * cell + 1, cell - 2, cell - 2);
            }
        }
    }

    function draw() {
        drawBoard();
        if (paused) {
            ctx.fillStyle = "rgba(0,0,0,0.45)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#ffffff";
            ctx.font = '700 22px "Ubuntu Sans", system-ui, sans-serif';
            ctx.fillText(t("paused_overlay", "PAUSED"), 95, canvas.height / 2);
        }
    }

    function move(dx) {
        if (!current || paused || over) return;
        if (!collides(current, dx, 0)) current.x += dx;
    }

    function softDrop() {
        if (!current || paused || over) return;
        if (!collides(current, 0, 1)) {
            current.y += 1;
            score += 1;
            updateHud();
        } else {
            lockAndContinue();
        }
    }

    function rotate() {
        if (!current || paused || over) return;
        const rotated = rotateClockwise(current.m);
        if (!collides(current, 0, 0, rotated)) {
            current.m = rotated;
            return;
        }

        const kicks = [1, -1, 2, -2];
        for (const kick of kicks) {
            if (!collides(current, kick, 0, rotated)) {
                current.x += kick;
                current.m = rotated;
                return;
            }
        }
    }

    function clearInput() {
        input.down = false;
        input.left = false;
        input.right = false;
        holdDelayAcc = 0;
        holdRepeatAcc = 0;
    }

    function stepHeldHorizontal(dt) {
        if (input.left === input.right) {
            holdDelayAcc = 0;
            holdRepeatAcc = 0;
            return;
        }

        const dx = input.left ? -1 : 1;
        if (holdDelayAcc < HOLD_MOVE_DELAY_MS) {
            holdDelayAcc += dt;
            return;
        }

        holdRepeatAcc += dt;
        while (holdRepeatAcc >= HOLD_MOVE_REPEAT_MS) {
            holdRepeatAcc -= HOLD_MOVE_REPEAT_MS;
            move(dx);
        }
    }

    function frame(ts) {
        if (!lastTs) lastTs = ts;
        const dt = Math.min(48, ts - lastTs);
        lastTs = ts;

        if (!paused && !over) {
            stepHeldHorizontal(dt);

            const stepMs = dropMs / (input.down ? SOFT_DROP_MULT : 1);
            gravityAcc += dt;
            while (gravityAcc >= stepMs) {
                gravityAcc -= stepMs;
                if (!stepDown()) break;
            }
        }

        draw();
        rafId = requestAnimationFrame(frame);
    }

    function togglePause() {
        if (over) return;
        paused = !paused;
        if (paused) clearInput();
        statusEl.textContent = paused ? t("paused_status", "Paused.") : t("running_status", "Running.");
        btnPause.textContent = paused ? t("resume", "Resume") : t("pause", "Pause");
    }

    function reset() {
        board = makeBoard();
        current = null;
        next = null;
        score = 0;
        lines = 0;
        level = 1;
        paused = false;
        over = false;
        clearInput();
        btnPause.textContent = t("pause", "Pause");
        setSpeedFromLevel();
        updateHud();
        spawn();
        startLoop();
        statusEl.textContent = t("go", "Go!");
    }

    function onKey(e) {
        const k = e.key;
        if (e.repeat) {
            if (k === "ArrowDown" || k === "s" || k === "S") {
                e.preventDefault();
                input.down = true;
            }
            return;
        }

        if (k === "ArrowLeft" || k === "a" || k === "A") {
            e.preventDefault();
            input.left = true;
            input.right = false;
            holdDelayAcc = 0;
            holdRepeatAcc = 0;
            move(-1);
        }
        if (k === "ArrowRight" || k === "d" || k === "D") {
            e.preventDefault();
            input.right = true;
            input.left = false;
            holdDelayAcc = 0;
            holdRepeatAcc = 0;
            move(1);
        }
        if (k === "ArrowDown" || k === "s" || k === "S") {
            e.preventDefault();
            input.down = true;
            softDrop();
        }
        if (k === "ArrowUp" || k === "w" || k === "W" || k === "x" || k === "X") { e.preventDefault(); rotate(); }
        if (k === " ") { e.preventDefault(); hardDrop(); }
        if (k === "p" || k === "P") { e.preventDefault(); togglePause(); }
        if (k === "r" || k === "R") { e.preventDefault(); reset(); }
    }

    function onKeyUp(e) {
        const k = e.key;
        if (k === "ArrowLeft" || k === "a" || k === "A") input.left = false;
        if (k === "ArrowRight" || k === "d" || k === "D") input.right = false;
        if (k === "ArrowDown" || k === "s" || k === "S") input.down = false;
        if (input.left === input.right) {
            holdDelayAcc = 0;
            holdRepeatAcc = 0;
        }
    }

    btnPause.addEventListener("click", togglePause);
    btnNew.addEventListener("click", reset);
    root.addEventListener("keydown", onKey);
    root.addEventListener("keyup", onKeyUp);
    root.addEventListener("click", () => root.focus());
    root.addEventListener("blur", clearInput);

    const obs = new MutationObserver(() => {
        if (!root.isConnected) {
            stopLoop();
            obs.disconnect();
        }
    });
    obs.observe(document.body, { childList: true, subtree: true });

    reset();
    requestAnimationFrame(() => root.focus());
    return root;
}
