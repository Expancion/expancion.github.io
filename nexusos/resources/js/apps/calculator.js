// resources/js/apps/calculator.js
function safeEval(expr) {
    const cleaned = expr.replace(/\s+/g, "");
    if (!/^[0-9+\-*/%.()]+$/.test(cleaned)) throw new Error("Invalid expression");
    // eslint-disable-next-line no-new-func
    return Function(`"use strict"; return (${cleaned});`)();
}

export function calculateExpression(expr) {
    const out = safeEval(expr);
    if (!Number.isFinite(out)) throw new Error("Math error");
    return out;
}

export function openCalculator() {
    const root = document.createElement("div");
    root.className = "nx-calc";
    root.innerHTML = `
      <div class="nx-calc-display" id="calc-display">0</div>
      <div class="nx-calc-grid" id="calc-grid"></div>
    `;

    const display = root.querySelector("#calc-display");
    const grid = root.querySelector("#calc-grid");

    const keys = [
        "C", "(", ")", "/",
        "7", "8", "9", "*",
        "4", "5", "6", "-",
        "1", "2", "3", "+",
        "0", ".", "%", "=",
    ];

    let expr = "";

    function update() {
        display.textContent = expr || "0";
    }

    function push(k) {
        if (k === "C") {
            expr = "";
            update();
            return;
        }
        if (k === "=") {
            try {
                expr = String(calculateExpression(expr));
            } catch {
                expr = "ERR";
            }
            update();
            return;
        }
        if (expr === "ERR") expr = "";
        expr += k;
        update();
    }

    keys.forEach((k) => {
        const b = document.createElement("button");
        b.className = "nx-calc-btn";
        b.textContent = k;
        b.addEventListener("click", () => push(k));
        grid.appendChild(b);
    });

    root.tabIndex = 0;
    root.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); push("="); return; }
        if (e.key === "Escape") { e.preventDefault(); push("C"); return; }
        if (/[0-9+\-*/%.()]/.test(e.key)) { e.preventDefault(); push(e.key); }
        if (e.key === "Backspace") { e.preventDefault(); expr = expr.slice(0, -1); update(); }
    });

    requestAnimationFrame(() => root.focus());
    return root;
}
