// resources/js/apps/notificationsCenter.js
import { tr } from "../os/i18n.js";

const I18N = {
    cz: {
        title: "Notifikace",
        clear_all: "Vymazat vše",
        no_notifications: "Žádné notifikace.",
        fallback_title: "Notifikace",
    },
    en: {
        title: "Notifications",
        clear_all: "Clear all",
        no_notifications: "No notifications.",
        fallback_title: "Notification",
    },
};

function t(key, fallback = "") {
    return tr(I18N, key, fallback || key);
}

export function openNotificationsCenter(ctx = {}) {
    const root = document.createElement("div");
    root.className = "nx-notify-center";
    root.innerHTML = `
      <div class="nx-game-top">
        <div><b>${t("title", "Notifications")}</b></div>
        <button class="nx-mini-btn" id="nc-clear">${t("clear_all", "Clear all")}</button>
      </div>
      <div class="nx-list" id="nc-list"></div>
    `;

    const list = root.querySelector("#nc-list");
    const clearBtn = root.querySelector("#nc-clear");

    function fmt(ts) {
        return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }

    function render() {
        const notes = ctx.getState ? (ctx.getState().notifications || []) : [];
        list.innerHTML = "";
        if (!notes.length) {
            list.innerHTML = `<div class="muted">${t("no_notifications", "No notifications.")}</div>`;
            return;
        }

        for (const n of notes) {
            const row = document.createElement("div");
            row.className = `nx-item nx-note-row nx-note-${n.type || "info"}`;
            row.innerHTML = `
              <div class="nx-row">
                <div>
                  <div><b>${escapeHtml(n.title || t("fallback_title", "Notification"))}</b></div>
                  ${n.message ? `<div class="muted">${escapeHtml(n.message)}</div>` : ""}
                </div>
                <div class="muted">${fmt(n.ts)}</div>
              </div>
            `;
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

    clearBtn.addEventListener("click", () => {
        if (ctx.clearNotifications) ctx.clearNotifications();
        render();
    });

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
