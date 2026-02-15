const STORE_KEY = "nexus.os.state.v2";
const AUTH_KEY = "nexus.auth.session.v1";
const LOCALE_KEY = "nexus.locale.v1";

const FALLBACK_I18N = {
    cz: {
        bootSub: "NEXUS kernel bootstrap",
        profileNormal: "normální profil",
        profileSafe: "nouzový profil",
        detailsShow: "Detaily",
        detailsHide: "Skrýt detaily",
        bootStarting: "Bootuji subsystémy…",
        bootDone: "NEXUS OS připraven.",
        bootKeys: "Enter = přeskočit • D = detaily • F2 = jazyk",
        stageKernel: "Načítám jádro",
        stageMemory: "Inicializuji paměť a I/O",
        stageDisplay: "Startuji compositor",
        stageSession: "Inicializuji uživatelské prostředí",
        stageServices: "Spouštím systémové služby",
        stageModules: "Načítám moduly aplikací",
        stageFinal: "Dokončuji start systému",
        safeLimited: "Nouzový profil: omezené moduly",
        authHeadline: "Vítejte zpět",
        authSubline: "Nexus Display Manager",
        authUserLabel: "Uživatelské jméno",
        authPassLabel: "Heslo",
        authUserPlaceholder: "uživatel",
        authPassPlaceholder: "heslo",
        authButton: "Přihlásit",
        authHelp: "F2 = CZ/EN",
        authDenied: "Neplatné přihlašovací údaje.",
        authWelcome: "Přístup povolen",
        authHint: "Použij admin/admin nebo fake/fake",
    },
    en: {
        bootSub: "NEXUS kernel bootstrap",
        profileNormal: "normal profile",
        profileSafe: "safe profile",
        detailsShow: "Details",
        detailsHide: "Hide details",
        bootStarting: "Booting subsystems…",
        bootDone: "NEXUS OS ready.",
        bootKeys: "Enter = skip • D = details • F2 = language",
        stageKernel: "Loading kernel",
        stageMemory: "Initializing memory and I/O",
        stageDisplay: "Starting compositor",
        stageSession: "Initializing user environment",
        stageServices: "Starting system services",
        stageModules: "Loading application modules",
        stageFinal: "Finalizing system startup",
        safeLimited: "Safe profile: limited modules",
        authHeadline: "Welcome back",
        authSubline: "Nexus Display Manager",
        authUserLabel: "Username",
        authPassLabel: "Password",
        authUserPlaceholder: "username",
        authPassPlaceholder: "password",
        authButton: "Sign in",
        authHelp: "F2 = CZ/EN",
        authDenied: "Invalid credentials.",
        authWelcome: "Access granted",
        authHint: "Use admin/admin or fake/fake",
    },
};

const APP_MODULE_ALIAS = {
    terminal: "apps.terminal",
    cv: "apps.cv",
    pipelines: "apps.pipelines",
    snake: "apps.game.snake",
    game2048: "apps.game.2048",
    tetris: "apps.game.tetris",
    explorer: "apps.explorer",
    settings: "apps.settings",
    notes: "apps.notes",
    calculator: "apps.calculator",
    process: "apps.process",
    appstore: "apps.appstore",
    notifications: "apps.notifications",
};

function loadJSON(key, fallback = null) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;
        const parsed = JSON.parse(raw);
        return parsed ?? fallback;
    } catch {
        return fallback;
    }
}

function saveJSON(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // no-op
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

function ts() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function tagText(level) {
    if (level === "ok") return "[ OK ]";
    if (level === "warn") return "[WARN]";
    if (level === "bad") return "[FAIL]";
    return "[INFO]";
}

async function loadBootI18N() {
    try {
        const url = new URL("../i18n/boot-login.json", import.meta.url);
        const res = await fetch(url);
        if (!res.ok) return FALLBACK_I18N;
        const json = await res.json();
        if (!json || typeof json !== "object") return FALLBACK_I18N;
        if (!json.cz || !json.en) return FALLBACK_I18N;
        return json;
    } catch {
        return FALLBACK_I18N;
    }
}

function startClock() {
    setInterval(() => {
        const c = document.getElementById("clock");
        if (!c) return;
        c.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }, 1000);
}

async function initBootLogin() {
    const I18N = await loadBootI18N();

    const bootEl = document.getElementById("boot");
    const bootStageEl = document.getElementById("boot-stage-boot");
    const authStageEl = document.getElementById("boot-stage-login");
    if (!bootEl || !bootStageEl || !authStageEl) {
        startClock();
        return;
    }

    const bootSubEl = document.getElementById("boot-sub");
    const consoleToggleEl = document.getElementById("boot-console-toggle");
    const logWrapEl = document.getElementById("boot-log-wrap");
    const logEl = document.getElementById("boot-log");
    const fillEl = document.getElementById("boot-bar-fill");
    const hintEl = document.getElementById("boot-hint");
    const percentEl = document.getElementById("boot-percent");
    const shortcutsEl = document.getElementById("boot-shortcuts");
    const particlesEl = document.getElementById("boot-particles");

    const authHeadlineEl = document.getElementById("auth-headline");
    const authSublineEl = document.getElementById("auth-subline");
    const authHelpEl = document.getElementById("auth-help");
    const authStatusEl = document.getElementById("auth-status");
    const authUserLabelEl = document.getElementById("auth-user-label");
    const authPassLabelEl = document.getElementById("auth-pass-label");
    const loginPanelEl = document.getElementById("boot-login-panel");
    const loginUserEl = document.getElementById("login-user");
    const loginPassEl = document.getElementById("login-pass");
    const loginSubmitEl = document.getElementById("boot-login-submit");
    const localeToggleEl = document.getElementById("boot-locale-toggle");

    if (
        !bootSubEl || !consoleToggleEl || !logWrapEl || !logEl || !fillEl || !hintEl || !percentEl || !shortcutsEl ||
        !authHeadlineEl || !authSublineEl || !authHelpEl || !authStatusEl || !authUserLabelEl || !authPassLabelEl ||
        !loginPanelEl || !loginUserEl || !loginPassEl || !loginSubmitEl || !localeToggleEl
    ) {
        startClock();
        return;
    }

    function text(locale) {
        return I18N[locale] || I18N.cz || FALLBACK_I18N.cz;
    }

    function addBootLine(level, msg) {
        const row = document.createElement("div");
        row.className = "boot-line";
        row.innerHTML = `
      <span class="boot-time">${ts()}</span>
      <span class="boot-tag ${level}">${tagText(level)}</span>
      <span class="boot-msg">${escapeHtml(msg)}</span>
    `;
        logEl.appendChild(row);
        logEl.scrollTop = logEl.scrollHeight;
    }

    const os = loadJSON(STORE_KEY, {});
    const osSystem = os?.system || {};
    const profile = os?.system?.bootProfile === "safe" ? "safe" : "normal";
    const savedAuth = loadJSON(AUTH_KEY, {});
    let locale =
        ["cz", "en"].includes(osSystem?.language) ? osSystem.language :
            (["cz", "en"].includes(savedAuth?.locale) ? savedAuth.locale : (localStorage.getItem(LOCALE_KEY) || "cz"));
    if (!["cz", "en"].includes(locale)) locale = "cz";

    let timer = null;
    let stages = [];
    let idx = 0;
    let done = false;
    let consoleOpen = false;
    let audioCtx = null;

    function syncSystemPrefs(partial = {}) {
        const draft = loadJSON(STORE_KEY, {}) || {};
        if (!draft.system || typeof draft.system !== "object") draft.system = {};
        if (partial.language) draft.system.language = partial.language;
        if (partial.profile) draft.system.profile = partial.profile;
        saveJSON(STORE_KEY, draft);
    }

    function setStatus(message, level = "neutral") {
        authStatusEl.textContent = message;
        authStatusEl.dataset.level = level;
    }

    function setProgress(pct) {
        const safePct = Math.max(0, Math.min(100, pct));
        fillEl.style.width = `${safePct}%`;
        percentEl.textContent = `${safePct}%`;
    }

    function applyLocale() {
        const t = text(locale);
        localStorage.setItem(LOCALE_KEY, locale);
        syncSystemPrefs({ language: locale });
        document.documentElement.lang = locale === "cz" ? "cs" : "en";

        const profileLabel = profile === "safe" ? t.profileSafe : t.profileNormal;
        bootSubEl.textContent = `${t.bootSub} • ${profileLabel}`;
        hintEl.textContent = done ? t.bootDone : t.bootStarting;
        shortcutsEl.textContent = t.bootKeys;
        consoleToggleEl.textContent = consoleOpen ? t.detailsHide : t.detailsShow;
        authHeadlineEl.textContent = t.authHeadline;
        authSublineEl.textContent = t.authSubline;
        authUserLabelEl.textContent = t.authUserLabel;
        authPassLabelEl.textContent = t.authPassLabel;
        loginUserEl.placeholder = t.authUserPlaceholder;
        loginPassEl.placeholder = t.authPassPlaceholder;
        loginSubmitEl.textContent = t.authButton;
        authHelpEl.textContent = t.authHelp;
        localeToggleEl.textContent = locale.toUpperCase();
        if (authStatusEl.dataset.level !== "bad" && authStatusEl.dataset.level !== "ok") {
            setStatus(t.authHint, "neutral");
        }
    }

    function toggleConsole(force) {
        consoleOpen = typeof force === "boolean" ? force : !consoleOpen;
        logWrapEl.classList.toggle("is-hidden", !consoleOpen);
        applyLocale();
    }

    function buildStages() {
        const t = text(locale);
        const installedApps = os?.installedApps || {};
        const enabledApps = Object.entries(installedApps)
            .filter(([, enabled]) => enabled)
            .map(([id]) => id);
        const appLimit = profile === "safe" ? 4 : 12;
        const appBatch = enabledApps.slice(0, appLimit);

        const list = [
            { level: "info", msg: t.stageKernel, delay: 90 },
            { level: "ok", msg: t.stageMemory, delay: 90 },
            { level: "ok", msg: t.stageDisplay, delay: 90 },
            { level: "info", msg: t.stageSession, delay: 85 },
            { level: "ok", msg: t.stageServices, delay: 85 },
        ];

        if (profile === "safe") list.push({ level: "warn", msg: t.safeLimited, delay: 100 });
        list.push({ level: "info", msg: t.stageModules, delay: 80 });
        appBatch.forEach((appId) => {
            const modName = APP_MODULE_ALIAS[appId] || `apps.${appId}`;
            list.push({ level: "ok", msg: `module ${modName}`, delay: 64 });
        });
        list.push({ level: "ok", msg: t.stageFinal, delay: 90 });
        return list;
    }

    function initParticles() {
        if (!particlesEl) return;
        particlesEl.innerHTML = "";
        const count = window.matchMedia("(max-width: 980px)").matches ? 26 : 42;
        const frag = document.createDocumentFragment();

        for (let i = 0; i < count; i++) {
            const dot = document.createElement("span");
            dot.className = "boot-particle";
            dot.style.left = `${Math.random() * 100}%`;
            dot.style.top = `${Math.random() * 100}%`;
            dot.style.setProperty("--size", `${(1 + Math.random() * 2.6).toFixed(2)}px`);
            dot.style.setProperty("--drift", `${(-28 + Math.random() * 56).toFixed(1)}px`);
            dot.style.setProperty("--dur", `${(16 + Math.random() * 20).toFixed(2)}s`);
            dot.style.animationDelay = `-${(Math.random() * 26).toFixed(2)}s`;
            frag.appendChild(dot);
        }
        particlesEl.appendChild(frag);
    }

    function getAudioCtx() {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return null;
        if (!audioCtx) audioCtx = new Ctx();
        return audioCtx;
    }

    function playTone(ctx, now, freq, duration, volume) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + duration + 0.03);
    }

    function playChime(kind = "ready") {
        const ctx = getAudioCtx();
        if (!ctx) return;
        if (ctx.state === "suspended") ctx.resume().catch(() => { });
        const start = ctx.currentTime + 0.03;
        if (kind === "success") {
            playTone(ctx, start, 392, 0.16, 0.035);
            playTone(ctx, start + 0.14, 523, 0.20, 0.04);
            return;
        }
        if (kind === "error") {
            playTone(ctx, start, 220, 0.14, 0.03);
            playTone(ctx, start + 0.11, 185, 0.16, 0.03);
            return;
        }
        playTone(ctx, start, 330, 0.16, 0.024);
        playTone(ctx, start + 0.13, 440, 0.20, 0.026);
    }

    function finishBoot() {
        done = true;
        clearTimeout(timer);
        setProgress(100);
        hintEl.textContent = text(locale).bootDone;
        setTimeout(showDisplayLogin, 420);
    }

    function step() {
        if (done) return;
        if (idx >= stages.length) {
            finishBoot();
            return;
        }
        const item = stages[idx++];
        addBootLine(item.level, item.msg);
        setProgress(Math.round((idx / stages.length) * 100));
        hintEl.textContent = item.msg;
        timer = setTimeout(step, item.delay ?? 90);
    }

    function fastForward() {
        if (done) return;
        clearTimeout(timer);
        for (; idx < stages.length; idx++) {
            const item = stages[idx];
            addBootLine(item.level, item.msg);
        }
        finishBoot();
    }

    function showDisplayLogin() {
        bootStageEl.classList.add("is-fade-out");
        setTimeout(() => {
            bootEl.classList.add("is-login");
            bootStageEl.hidden = true;
            authStageEl.hidden = false;
            requestAnimationFrame(() => authStageEl.classList.add("is-visible"));
            const storedProfile = ["admin", "fake"].includes(osSystem?.profile) ? osSystem.profile : "";
            loginUserEl.value = savedAuth?.user || storedProfile || "";
            loginPassEl.value = "";
            setStatus(text(locale).authHint, "neutral");
            requestAnimationFrame(() => (loginUserEl.value ? loginPassEl : loginUserEl).focus());
            playChime("ready");
        }, 280);
    }

    function finishAuth(user) {
        localStorage.setItem(AUTH_KEY, JSON.stringify({
            user,
            locale,
            ts: Date.now(),
        }));
        syncSystemPrefs({ language: locale, profile: user });
        clearTimeout(timer);
        bootEl.classList.add("is-exit");
        window.removeEventListener("keydown", onBootKey);
        window.removeEventListener("keydown", onAuthKey);
        setTimeout(() => {
            bootEl.style.display = "none";
            bootEl.setAttribute("aria-hidden", "true");
            window.dispatchEvent(new CustomEvent("nexus:auth", { detail: { user, locale } }));
        }, 420);
    }

    function attemptLogin() {
        const t = text(locale);
        const user = (loginUserEl.value || "").trim().toLowerCase();
        const pass = loginPassEl.value || "";
        if (!user || !pass) {
            setStatus(t.authHint, "bad");
            (user ? loginPassEl : loginUserEl).focus();
            return;
        }

        const valid = { admin: "admin", fake: "fake" };
        if (valid[user] && valid[user] === pass) {
            loginPanelEl.classList.remove("is-error");
            setStatus(`${t.authWelcome}: ${user}`, "ok");
            playChime("success");
            setTimeout(() => finishAuth(user), 280);
            return;
        }

        setStatus(t.authDenied, "bad");
        playChime("error");
        loginPanelEl.classList.remove("is-error");
        void loginPanelEl.offsetWidth;
        loginPanelEl.classList.add("is-error");
        loginPassEl.value = "";
        loginPassEl.focus();
    }

    function onBootKey(e) {
        if (bootStageEl.hidden) return;
        if (e.key === "Enter") {
            e.preventDefault();
            fastForward();
            return;
        }
        if ((e.key === "d" || e.key === "D") && !e.repeat) {
            e.preventDefault();
            toggleConsole();
            return;
        }
        if (e.key === "F2") {
            e.preventDefault();
            locale = locale === "cz" ? "en" : "cz";
            stages = buildStages();
            applyLocale();
        }
    }

    function onAuthKey(e) {
        if (authStageEl.hidden) return;
        if (e.key === "Enter") {
            e.preventDefault();
            attemptLogin();
            return;
        }
        if (e.key === "F2") {
            e.preventDefault();
            locale = locale === "cz" ? "en" : "cz";
            applyLocale();
            return;
        }
        if (e.key === "Escape") {
            loginPassEl.value = "";
            setStatus(text(locale).authHint, "neutral");
        }
    }

    consoleToggleEl.addEventListener("click", () => toggleConsole());
    localeToggleEl.addEventListener("click", () => {
        locale = locale === "cz" ? "en" : "cz";
        stages = buildStages();
        applyLocale();
    });
    loginSubmitEl.addEventListener("click", attemptLogin);
    window.addEventListener("keydown", onBootKey);
    window.addEventListener("keydown", onAuthKey);

    initParticles();
    stages = buildStages();
    idx = 0;
    done = false;
    logEl.innerHTML = "";
    setProgress(0);
    toggleConsole(false);
    applyLocale();
    hintEl.textContent = text(locale).bootStarting;
    step();

    startClock();
}

initBootLogin();
