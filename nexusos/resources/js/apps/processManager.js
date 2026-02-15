// resources/js/apps/processManager.js
import { tr } from "../os/i18n.js";

const I18N = {
    cz: {
        title: "Správce procesů",
        subtitle: "úlohy oken",
        refresh: "Obnovit",
        wm_unavailable: "Window manager není dostupný.",
        no_windows: "Žádná běžící okna.",
        minimized: "Minimalizováno",
        focus: "Zaměřit",
        kill: "Ukončit",
    },
    en: {
        title: "Process Manager",
        subtitle: "window tasks",
        refresh: "Refresh",
        wm_unavailable: "Window manager unavailable.",
        no_windows: "No running windows.",
        minimized: "Minimized",
        focus: "Focus",
        kill: "Kill",
    },
};

function t(key, fallback = "") {
    return tr(I18N, key, fallback || key);
}

export function openProcessManager(ctx = {}) {
    const wm = ctx.wm;
    const root = document.createElement("div");
    root.className = "nx-process";

    root.innerHTML = `
      <div class="nx-game-top">
        <div><b>${t("title", "Process Manager")}</b> <span class="muted">${t("subtitle", "window tasks")}</span></div>
        <button class="nx-mini-btn" id="pm-refresh">${t("refresh", "Refresh")}</button>
      </div>
      <div class="nx-list" id="pm-list"></div>
    `;

    const list = root.querySelector("#pm-list");

    function fakeUsage(id) {
        const seed = Array.from(id).reduce((a, ch) => a + ch.charCodeAt(0), 0);
        const t = Date.now() / 1000;
        const cpu = Math.max(1, Math.round(((Math.sin(t + seed) + 1) * 7) + 1));
        const ram = Math.max(24, Math.round(((Math.cos(t / 2 + seed) + 1) * 180) + 60));
        return { cpu, ram };
    }

    function render() {
        if (!wm) {
            list.innerHTML = `<div class="muted">${t("wm_unavailable", "Window manager unavailable.")}</div>`;
            return;
        }

        const rows = wm.listWindows ? wm.listWindows() : [];
        list.innerHTML = "";

        if (!rows.length) {
            list.innerHTML = `<div class="muted">${t("no_windows", "No running windows.")}</div>`;
            return;
        }

        for (const row of rows) {
            const usage = fakeUsage(row.id);
            const item = document.createElement("div");
            item.className = "nx-item";
            item.innerHTML = `
              <div class="nx-row">
                <div>
                  <div><b>${escapeHtml(row.title || row.id)}</b> <span class="muted">(${escapeHtml(row.id)})</span></div>
                  <div class="muted">CPU ${usage.cpu}% • RAM ${usage.ram}MB ${row.minimized ? `• ${t("minimized", "Minimized")}` : ""}</div>
                </div>
                <div style="display:flex; gap:8px;">
                  <button class="nx-mini-btn" data-act="focus">${t("focus", "Focus")}</button>
                  <button class="nx-mini-btn" data-act="close">${t("kill", "Kill")}</button>
                </div>
              </div>
            `;
            item.querySelector('[data-act="focus"]').addEventListener("click", () => {
                if (row.minimized && wm.restore) wm.restore(row.id);
                if (wm.focus) wm.focus(row.id);
            });
            item.querySelector('[data-act="close"]').addEventListener("click", () => {
                if (wm.close) wm.close(row.id);
                render();
            });
            list.appendChild(item);
        }
    }

    function escapeHtml(s) {
        return String(s)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    root.querySelector("#pm-refresh").addEventListener("click", render);

    const timer = setInterval(render, 1200);
    const obs = new MutationObserver(() => {
        if (!root.isConnected) {
            clearInterval(timer);
            obs.disconnect();
        }
    });
    obs.observe(document.body, { childList: true, subtree: true });

    render();
    return root;
}
