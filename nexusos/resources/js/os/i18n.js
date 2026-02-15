// resources/js/os/i18n.js
const STORE_KEY = "nexus.os.state.v2";
const AUTH_KEY = "nexus.auth.session.v1";
const LOCALE_KEY = "nexus.locale.v1";

const VALID = new Set(["cz", "en"]);
const listeners = new Set();

function normalize(v) {
    return VALID.has(v) ? v : "cz";
}

function readJSON(key, fallback = null) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;
        const parsed = JSON.parse(raw);
        return parsed ?? fallback;
    } catch {
        return fallback;
    }
}

function detectLocale() {
    const os = readJSON(STORE_KEY, {});
    const auth = readJSON(AUTH_KEY, {});
    const fromState = os?.system?.language;
    if (VALID.has(fromState)) return fromState;
    if (VALID.has(auth?.locale)) return auth.locale;
    return normalize(localStorage.getItem(LOCALE_KEY) || "cz");
}

let locale = detectLocale();

function emit() {
    for (const fn of listeners) {
        try {
            fn(locale);
        } catch {
            // no-op
        }
    }
}

function persistLocale(next) {
    localStorage.setItem(LOCALE_KEY, next);

    const os = readJSON(STORE_KEY, {});
    if (!os.system || typeof os.system !== "object") os.system = {};
    os.system.language = next;
    localStorage.setItem(STORE_KEY, JSON.stringify(os));

    const auth = readJSON(AUTH_KEY, {});
    if (auth && typeof auth === "object") {
        auth.locale = next;
        localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
    }
}

export function getLocale() {
    return locale;
}

export function setLocale(next, { persist = true, broadcast = true } = {}) {
    const normalized = normalize(next);
    locale = normalized;
    if (persist) persistLocale(normalized);
    if (broadcast) {
        window.dispatchEvent(new CustomEvent("nexus:locale-change", { detail: { locale: normalized } }));
    }
    emit();
    return normalized;
}

export function subscribeLocale(fn) {
    listeners.add(fn);
    fn(locale);
    return () => listeners.delete(fn);
}

export function pick(i18nMap) {
    if (!i18nMap || typeof i18nMap !== "object") return {};
    return i18nMap[locale] || i18nMap.en || i18nMap.cz || {};
}

export function tr(i18nMap, key, fallback = "") {
    const map = pick(i18nMap);
    if (Object.prototype.hasOwnProperty.call(map, key)) return map[key];
    if (fallback) return fallback;
    return key;
}

window.addEventListener("nexus:locale-change", (e) => {
    const next = normalize(e?.detail?.locale || detectLocale());
    if (next === locale) return;
    locale = next;
    emit();
});

window.addEventListener("storage", (e) => {
    if (!e || (e.key !== LOCALE_KEY && e.key !== STORE_KEY && e.key !== AUTH_KEY)) return;
    const next = detectLocale();
    if (next === locale) return;
    locale = next;
    emit();
});
