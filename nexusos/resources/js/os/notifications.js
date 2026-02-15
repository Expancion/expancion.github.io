// resources/js/os/notifications.js
import { addNotification, getOSState, subscribeOSState } from "./state.js";
import { tr } from "./i18n.js";

const I18N = {
    cz: { fallback_title: "Notifikace" },
    en: { fallback_title: "Notification" },
};

function t(key, fallback = "") {
    return tr(I18N, key, fallback || key);
}

let toastHost = null;
const listeners = new Set();
let wired = false;

function ensureWire() {
    if (wired) return;
    wired = true;
    subscribeOSState((state) => {
        for (const fn of listeners) fn(state.notifications);
    });
}

function ensureToastHost() {
    if (toastHost && toastHost.isConnected) return toastHost;
    toastHost = document.createElement("div");
    toastHost.className = "nx-toast-host";
    document.body.appendChild(toastHost);
    return toastHost;
}

function renderToast(note) {
    const host = ensureToastHost();
    const el = document.createElement("div");
    el.className = `nx-toast nx-toast-${note.type || "info"}`;
    el.innerHTML = `
      <div class="nx-toast-title">${escapeHtml(note.title || t("fallback_title", "Notification"))}</div>
      ${note.message ? `<div class="nx-toast-msg">${escapeHtml(note.message)}</div>` : ""}
    `;
    host.appendChild(el);

    requestAnimationFrame(() => el.classList.add("is-in"));

    const ttl = 3600;
    const t = setTimeout(() => {
        el.classList.remove("is-in");
        setTimeout(() => el.remove(), 220);
    }, ttl);

    el.addEventListener("click", () => {
        clearTimeout(t);
        el.classList.remove("is-in");
        setTimeout(() => el.remove(), 180);
    });
}

function escapeHtml(s) {
    return String(s)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

export function initNotifications({ toastHostEl } = {}) {
    ensureWire();
    if (toastHostEl) toastHost = toastHostEl;
}

export function subscribeNotifications(fn) {
    ensureWire();
    listeners.add(fn);
    fn(getOSState().notifications);
    return () => listeners.delete(fn);
}

export function notify({ title, message = "", type = "info", force = false }) {
    const note = addNotification({ title, message, type });
    const os = getOSState();
    if (!os.system.dnd || force) renderToast(note);
    return note;
}
