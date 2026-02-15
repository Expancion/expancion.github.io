// resources/js/os/state.js
const STORE_KEY = "nexus.os.state.v2";

const DEFAULT_STATE = {
    system: {
        language: "cz", // cz | en
        profile: "admin", // admin | fake
        wifi: true,
        dnd: false,
        brightness: 100,
        volume: 70,
        bootProfile: "normal", // normal | safe
    },
    ui: {
        theme: "cyan", // cyan | amber | mono
        blur: true,
        animations: true,
    },
    installedApps: {
        terminal: true,
        cv: true,
        pipelines: true,
        snake: true,
        game2048: true,
        tetris: true,
        explorer: true,
        settings: true,
        notes: true,
        calculator: true,
        process: true,
        appstore: true,
        notifications: true,
    },
    notes: "",
    notifications: [],
    session: {
        windows: [],
    },
};

const listeners = new Set();
let state = loadState();

function clone(v) {
    if (typeof structuredClone === "function") return structuredClone(v);
    return JSON.parse(JSON.stringify(v));
}

function deepMerge(base, patch) {
    if (!patch || typeof patch !== "object") return base;
    const out = Array.isArray(base) ? base.slice() : { ...base };
    for (const [k, v] of Object.entries(patch)) {
        if (v && typeof v === "object" && !Array.isArray(v) && out[k] && typeof out[k] === "object" && !Array.isArray(out[k])) {
            out[k] = deepMerge(out[k], v);
        } else {
            out[k] = clone(v);
        }
    }
    return out;
}

function loadState() {
    try {
        const raw = localStorage.getItem(STORE_KEY);
        if (!raw) return clone(DEFAULT_STATE);
        const parsed = JSON.parse(raw);
        return deepMerge(clone(DEFAULT_STATE), parsed);
    } catch {
        return clone(DEFAULT_STATE);
    }
}

function saveState() {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

function emit() {
    for (const fn of listeners) {
        try {
            fn(state);
        } catch {
            // no-op
        }
    }
}

export function getOSState() {
    return state;
}

export function updateOSState(mutator) {
    const draft = clone(state);
    mutator(draft);
    state = deepMerge(clone(DEFAULT_STATE), draft);
    saveState();
    emit();
    return state;
}

export function subscribeOSState(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
}

export function isAppInstalled(appId) {
    return !!state.installedApps[appId];
}

export function setAppInstalled(appId, enabled) {
    updateOSState((draft) => {
        draft.installedApps[appId] = !!enabled;
    });
}

export function addNotification({ title, message = "", type = "info" }) {
    const note = {
        id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
        title,
        message,
        type,
        ts: Date.now(),
    };

    updateOSState((draft) => {
        draft.notifications.unshift(note);
        if (draft.notifications.length > 120) draft.notifications.length = 120;
    });

    return note;
}

export function clearNotifications() {
    updateOSState((draft) => {
        draft.notifications = [];
    });
}

export function setSessionWindows(windows) {
    updateOSState((draft) => {
        draft.session.windows = Array.isArray(windows) ? windows : [];
    });
}

export function getSessionWindows() {
    return Array.isArray(state.session?.windows) ? state.session.windows : [];
}

export function applyVisualState(doc = document) {
    const { ui, system } = state;
    const html = doc.documentElement;
    const body = doc.body;

    html.dataset.theme = ui.theme;
    html.lang = system.language === "en" ? "en" : "cs";
    body.classList.toggle("nx-no-blur", !ui.blur);
    body.classList.toggle("nx-no-anim", !ui.animations);
    html.style.setProperty("--nx-brightness", `${Math.max(50, Math.min(120, system.brightness))}%`);
}
