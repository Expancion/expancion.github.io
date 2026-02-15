// resources/js/apps/game2048.js
import { tr } from "../os/i18n.js";

const I18N = {
    cz: {
        help: "Šipky / WASD • R = restart",
        score: "Skóre",
        best: "Nejlepší",
        new: "Nová",
        new_title: "Nová hra",
        game_over: "Konec hry",
        over_sub: "Stiskni R nebo Nová",
        play_again: "Hrát znovu",
        ready: "Připraveno.",
        go: "Jedeme!",
        no_move: "Žádný tah.",
        won: "Vyhráls!",
        won_sub: "Pokračuj nebo stiskni R/Nová",
        moved: "Přesunuto.",
    },
    en: {
        help: "Arrows / WASD • R = restart",
        score: "Score",
        best: "Best",
        new: "New",
        new_title: "New game",
        game_over: "Game Over",
        over_sub: "Press R or New",
        play_again: "Play again",
        ready: "Ready.",
        go: "Go!",
        no_move: "No move.",
        won: "You win!",
        won_sub: "Keep going or press R/New",
        moved: "Moved.",
    },
};

function t(key, fallback = "") {
    return tr(I18N, key, fallback || key);
}

export function open2048() {
    const root = document.createElement("div");
    root.className = "nx-game nx-2048";
    root.tabIndex = 0;

    root.innerHTML = `
    <div class="nx-game-top">
      <div>
        <b>2048</b>
        <span class="muted">${t("help", "Arrows / WASD • R = restart")}</span>
      </div>
      <div class="nx-game-stats">
        <span class="nx-badge">${t("score", "Score")}: <b id="g-score">0</b></span>
        <span class="nx-badge">${t("best", "Best")}: <b id="g-best">0</b></span>
        <button class="nx-mini-btn" id="g-new" title="${t("new_title", "New game")}">${t("new", "New")}</button>
      </div>
    </div>

    <div class="nx-2048-wrap">
      <div class="nx-2048-board" id="g-board"></div>
      <div class="nx-2048-overlay" id="g-overlay">
        <div class="nx-2048-overlay-card">
          <div class="nx-2048-title" id="g-over-title">${t("game_over", "Game Over")}</div>
          <div class="muted" id="g-over-sub">${t("over_sub", "Press R or New")}</div>
          <div class="nx-2048-actions">
            <button class="nx-mini-btn" id="g-again">${t("play_again", "Play again")}</button>
          </div>
        </div>
      </div>
    </div>

    <div class="nx-game-bottom muted" id="g-status">${t("ready", "Ready.")}</div>
  `;

    const boardEl = root.querySelector("#g-board");
    const scoreEl = root.querySelector("#g-score");
    const bestEl = root.querySelector("#g-best");
    const statusEl = root.querySelector("#g-status");

    const overlayEl = root.querySelector("#g-overlay");
    const overTitleEl = root.querySelector("#g-over-title");
    const overSubEl = root.querySelector("#g-over-sub");
    const btnNew = root.querySelector("#g-new");
    const btnAgain = root.querySelector("#g-again");

    const SIZE = 4;
    const bestKey = "nexus_2048_best";

    let grid = makeEmpty();
    let score = 0;
    let won = false;
    let locked = false;

    function hideOverlay() {
        overlayEl.hidden = true;
        overlayEl.classList.remove("is-visible");
        overlayEl.style.display = "none";
    }

    function revealOverlay() {
        overlayEl.hidden = false;
        overlayEl.classList.add("is-visible");
        overlayEl.style.display = "grid";
    }

    function makeEmpty() {
        return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
    }

    function getBest() {
        const v = Number(localStorage.getItem(bestKey) || "0");
        return Number.isFinite(v) ? v : 0;
    }
    function setBest(v) {
        localStorage.setItem(bestKey, String(v));
        bestEl.textContent = String(v);
    }

    function randEmptyCell(g) {
        const empties = [];
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) if (g[r][c] === 0) empties.push([r, c]);
        }
        if (!empties.length) return null;
        return empties[Math.floor(Math.random() * empties.length)];
    }

    function addRandomTile() {
        const cell = randEmptyCell(grid);
        if (!cell) return false;
        const [r, c] = cell;
        grid[r][c] = Math.random() < 0.9 ? 2 : 4;
        return true;
    }

    function reset() {
        grid = makeEmpty();
        score = 0;
        won = false;
        locked = false;
        scoreEl.textContent = "0";
        bestEl.textContent = String(getBest());
        hideOverlay();
        statusEl.textContent = t("go", "Go!");
        addRandomTile();
        addRandomTile();
        render(true);
    }

    function clone(g) {
        return g.map(row => row.slice());
    }

    // compress + merge one line (array length 4) to the left
    function slideLine(line) {
        const arr = line.filter(v => v !== 0);
        let gained = 0;

        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i] !== 0 && arr[i] === arr[i + 1]) {
                arr[i] *= 2;
                gained += arr[i];
                arr[i + 1] = 0;
                if (arr[i] === 2048) won = true;
            }
        }

        const out = arr.filter(v => v !== 0);
        while (out.length < SIZE) out.push(0);

        return { out, gained };
    }

    function rotateRight(g) {
        const out = makeEmpty();
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) out[c][SIZE - 1 - r] = g[r][c];
        }
        return out;
    }

    // apply move by rotating so we can always "move left"
    function move(dir) {
        if (overlayEl.classList.contains("is-visible") && overTitleEl.textContent === t("won", "You win!")) {
            hideOverlay();
        }
        if (locked) return;

        const before = clone(grid);
        let working = clone(grid);
        let rotations = 0;

        // dir: "left" "right" "up" "down"
        if (dir === "up") rotations = 3;
        if (dir === "right") rotations = 2;
        if (dir === "down") rotations = 1;

        for (let i = 0; i < rotations; i++) working = rotateRight(working);

        let gainedTotal = 0;
        const after = makeEmpty();
        for (let r = 0; r < SIZE; r++) {
            const { out, gained } = slideLine(working[r]);
            after[r] = out;
            gainedTotal += gained;
        }

        let result = after;
        // rotate back
        for (let i = 0; i < (4 - rotations) % 4; i++) result = rotateRight(result);

        const changed = !sameGrid(before, result);
        if (!changed) {
            statusEl.textContent = t("no_move", "No move.");
            return;
        }

        grid = result;
        score += gainedTotal;
        scoreEl.textContent = String(score);
        if (score > getBest()) setBest(score);

        addRandomTile();

        render();
        if (won) showOverlay(t("won", "You win!"), t("won_sub", "Keep going or press R/New"), { lockGame: false });
        else if (isGameOver()) showOverlay(t("game_over", "Game Over"), t("over_sub", "Press R or New"), { lockGame: true });
        else statusEl.textContent = gainedTotal ? `+${gainedTotal}` : t("moved", "Moved.");
    }

    function sameGrid(a, b) {
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) if (a[r][c] !== b[r][c]) return false;
        }
        return true;
    }

    function isGameOver() {
        // any empty
        for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (grid[r][c] === 0) return false;

        // any mergeable neighbors
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const v = grid[r][c];
                if (r + 1 < SIZE && grid[r + 1][c] === v) return false;
                if (c + 1 < SIZE && grid[r][c + 1] === v) return false;
            }
        }
        return true;
    }

    function showOverlay(title, sub, { lockGame = false } = {}) {
        overTitleEl.textContent = title;
        overSubEl.textContent = sub;
        revealOverlay();
        locked = lockGame;
    }

    function render(first = false) {
        // build tiles
        boardEl.innerHTML = "";
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const v = grid[r][c];
                const cell = document.createElement("div");
                cell.className = "nx-2048-cell";
                cell.dataset.v = String(v);
                cell.textContent = v ? String(v) : "";
                if (!first && v) cell.classList.add("pop");
                boardEl.appendChild(cell);
            }
        }

    }

    function onKey(e) {
        const k = e.key;
        if (k === "ArrowLeft" || k === "a" || k === "A") { e.preventDefault(); move("left"); }
        if (k === "ArrowRight" || k === "d" || k === "D") { e.preventDefault(); move("right"); }
        if (k === "ArrowUp" || k === "w" || k === "W") { e.preventDefault(); move("up"); }
        if (k === "ArrowDown" || k === "s" || k === "S") { e.preventDefault(); move("down"); }
        if (k === "r" || k === "R") { e.preventDefault(); reset(); }
    }

    btnNew.addEventListener("click", () => reset());
    btnAgain.addEventListener("click", () => reset());
    root.addEventListener("keydown", onKey);
    root.addEventListener("click", () => root.focus());

    // cleanup if window closed
    const obs = new MutationObserver(() => {
        if (!root.isConnected) obs.disconnect();
    });
    obs.observe(document.body, { childList: true, subtree: true });

    hideOverlay();
    reset();
    requestAnimationFrame(() => root.focus());
    return root;
}
