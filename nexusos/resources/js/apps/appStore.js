// resources/js/apps/appStore.js
import { tr } from "../os/i18n.js";

const I18N = {
    cz: {
        title: "Obchod aplikací (Mock)",
        subtitle: "Instalace / odinstalace aplikací v launcheru",
        install: "Instalovat",
        uninstall: "Odinstalovat",
        open: "Otevřít",
        core_block: "Core aplikaci nelze odinstalovat.",
        installed: "{app} nainstalována.",
        uninstalled: "{app} odinstalována.",
    },
    en: {
        title: "App Store (Mock)",
        subtitle: "Install / uninstall launcher apps",
        install: "Install",
        uninstall: "Uninstall",
        open: "Open",
        core_block: "Core app cannot be uninstalled.",
        installed: "{app} installed.",
        uninstalled: "{app} uninstalled.",
    },
};

function t(key, fallback = "") {
    return tr(I18N, key, fallback || key);
}

export function openAppStore(ctx = {}) {
    const root = document.createElement("div");
    root.className = "nx-appstore";
    root.innerHTML = `
      <div class="nx-game-top">
        <div><b>${escapeHtml(t("title", "App Store (Mock)"))}</b> <span class="muted">${escapeHtml(t("subtitle", "Install / uninstall launcher apps"))}</span></div>
      </div>
      <div class="nx-list" id="as-list"></div>
    `;

    const list = root.querySelector("#as-list");

    function render() {
        const state = ctx.getState ? ctx.getState() : null;
        const catalog = Array.isArray(ctx.catalog) ? ctx.catalog : [];
        list.innerHTML = "";

        for (const app of catalog) {
            const installed = !!state?.installedApps?.[app.id];
            const row = document.createElement("div");
            row.className = "nx-item";
            row.innerHTML = `
              <div class="nx-row">
                <div>
                  <div><b>${escapeHtml(app.title)}</b> <span class="muted">(${escapeHtml(app.id)})</span></div>
                  <div class="muted">${escapeHtml(app.desc || "")}</div>
                </div>
                <div style="display:flex; gap:8px;">
                  <button class="nx-mini-btn" data-act="toggle">${installed ? escapeHtml(t("uninstall", "Uninstall")) : escapeHtml(t("install", "Install"))}</button>
                  <button class="nx-mini-btn" data-act="open" ${installed ? "" : "disabled"}>${escapeHtml(t("open", "Open"))}</button>
                </div>
              </div>
            `;

            row.querySelector('[data-act="toggle"]').addEventListener("click", () => {
                if (app.core) {
                    if (ctx.notify) ctx.notify({ title: t("title", "App Store"), message: t("core_block", "Core app cannot be uninstalled."), type: "warn" });
                    return;
                }

                if (ctx.setInstalled) ctx.setInstalled(app.id, !installed);
                if (installed && ctx.onUninstall) ctx.onUninstall(app.id);
                if (ctx.notify) ctx.notify({
                    title: t("title", "App Store"),
                    message: (installed ? t("uninstalled", "{app} uninstalled.") : t("installed", "{app} installed.")).replace("{app}", app.title),
                    type: "info",
                });
                render();
            });

            row.querySelector('[data-act="open"]').addEventListener("click", () => {
                if (installed && ctx.openApp) ctx.openApp(app.id);
            });

            list.appendChild(row);
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

    if (ctx.subscribeState) {
        const unsub = ctx.subscribeState(render);
        const obs = new MutationObserver(() => {
            if (!root.isConnected) {
                unsub();
                obs.disconnect();
            }
        });
        obs.observe(document.body, { childList: true, subtree: true });
    }

    render();
    return root;
}
