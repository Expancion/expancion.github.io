// resources/js/apps/settings.js
const AUTH_KEY = "nexus.auth.session.v1";
const LOCALE_KEY = "nexus.locale.v1";

const I18N = {
    cz: {
        navTitle: "Nexus Control Center",
        navSub: "Systémový profil",
        navSignedAs: "Přihlášen jako",
        navSystem: "Systém",
        navAppearance: "Vzhled",
        navBehavior: "Chování",
        navMaintenance: "Údržba",

        panelSystemTitle: "Systém",
        panelSystemSubtitle: "Hardware, profil, jazyk a konektivita.",
        panelAppearanceTitle: "Vzhled",
        panelAppearanceSubtitle: "Barevné schéma a vizuální efekty.",
        panelBehaviorTitle: "Chování",
        panelBehaviorSubtitle: "Boot profil a runtime chování.",
        panelMaintenanceTitle: "Údržba",
        panelMaintenanceSubtitle: "Session cleanup a operace s lokálními daty.",

        badgeTheme: "Téma",
        badgeBrightness: "Jas",
        badgeVolume: "Hlasitost",
        badgeProfile: "Profil",

        cardDisplayAudio: "Displej a zvuk",
        labelBrightness: "Jas",
        labelVolume: "Hlasitost",

        cardConnectivity: "Konektivita",
        labelWifi: "Wi-Fi zapnuta",
        labelDnd: "Nerušit",

        cardProfile: "Profil a přístup",
        labelActiveProfile: "Aktivní profil",
        labelSwitchProfile: "Přepnout profil",
        profileAdmin: "admin",
        profileFake: "fake",
        roleAdmin: "Administrator",
        roleFake: "Sandbox user",
        roleLabel: "Role",

        cardLanguage: "Jazyk systému",
        labelLanguage: "Jazyk",
        langCz: "Čeština",
        langEn: "English",
        languageHelp: "Přepne rozhraní systému i login screen.",

        cardHardware: "Informace o zařízení",
        hwCpu: "CPU",
        hwGpu: "GPU",
        hwRam: "RAM",
        hwStorage: "Storage",
        hwPlatform: "Platforma",
        hwDetecting: "Zjišťuji…",
        hwUnknown: "Nedostupné",
        hwThreads: "vláken",

        cardTheme: "Téma",
        labelColorProfile: "Barevný profil",
        themeCyan: "Cyan",
        themeAmber: "Amber",
        themeMono: "Mono",

        cardVisual: "Vizuální efekty",
        labelBlur: "Efekty rozostření",
        labelAnimations: "Animace",

        cardBoot: "Boot a startup",
        labelBoot: "Boot profil",
        bootNormal: "Normal",
        bootSafe: "Safe mode",
        bootHelp: "Safe mode načte omezenou sadu modulů a služeb při startu.",

        cardStorage: "Úložiště a session",
        btnClearSession: "Vymazat uloženou session",
        btnClearNotes: "Vymazat poznámky",

        notifySessionCleared: "Uložená session oken byla vymazána.",
        notifyNotesCleared: "Poznámky byly vymazány.",
        notifyProfileChanged: "Profil přepnut na",
        notifyLanguageChanged: "Jazyk systému změněn na",
        notifyTitle: "Nastavení",
    },
    en: {
        navTitle: "Nexus Control Center",
        navSub: "System profile",
        navSignedAs: "Signed in as",
        navSystem: "System",
        navAppearance: "Appearance",
        navBehavior: "Behavior",
        navMaintenance: "Maintenance",

        panelSystemTitle: "System",
        panelSystemSubtitle: "Hardware, profile, language and connectivity.",
        panelAppearanceTitle: "Appearance",
        panelAppearanceSubtitle: "Theme and visual effects.",
        panelBehaviorTitle: "Behavior",
        panelBehaviorSubtitle: "Boot profile and runtime behavior.",
        panelMaintenanceTitle: "Maintenance",
        panelMaintenanceSubtitle: "Session cleanup and local data operations.",

        badgeTheme: "Theme",
        badgeBrightness: "Brightness",
        badgeVolume: "Volume",
        badgeProfile: "Profile",

        cardDisplayAudio: "Display & Audio",
        labelBrightness: "Brightness",
        labelVolume: "Volume",

        cardConnectivity: "Connectivity",
        labelWifi: "Wi-Fi enabled",
        labelDnd: "Do not disturb",

        cardProfile: "Profile & Access",
        labelActiveProfile: "Active profile",
        labelSwitchProfile: "Switch profile",
        profileAdmin: "admin",
        profileFake: "fake",
        roleAdmin: "Administrator",
        roleFake: "Sandbox user",
        roleLabel: "Role",

        cardLanguage: "System language",
        labelLanguage: "Language",
        langCz: "Čeština",
        langEn: "English",
        languageHelp: "Applies to system UI and login screen.",

        cardHardware: "Device information",
        hwCpu: "CPU",
        hwGpu: "GPU",
        hwRam: "RAM",
        hwStorage: "Storage",
        hwPlatform: "Platform",
        hwDetecting: "Detecting…",
        hwUnknown: "Unavailable",
        hwThreads: "threads",

        cardTheme: "Theme",
        labelColorProfile: "Color profile",
        themeCyan: "Cyan",
        themeAmber: "Amber",
        themeMono: "Mono",

        cardVisual: "Visual effects",
        labelBlur: "Blur effects",
        labelAnimations: "Animations",

        cardBoot: "Boot & Startup",
        labelBoot: "Boot profile",
        bootNormal: "Normal",
        bootSafe: "Safe mode",
        bootHelp: "Safe mode loads a reduced set of modules and app services at boot.",

        cardStorage: "Storage & Session",
        btnClearSession: "Clear Saved Session",
        btnClearNotes: "Clear Notes",

        notifySessionCleared: "Saved window session cleared.",
        notifyNotesCleared: "Notes storage cleared.",
        notifyProfileChanged: "Profile switched to",
        notifyLanguageChanged: "System language changed to",
        notifyTitle: "Settings",
    },
};

const VALID_LOCALES = new Set(["cz", "en"]);
const VALID_PROFILES = new Set(["admin", "fake"]);
const NEXUS_HW_PROFILE = Object.freeze({
    cpu: "8C / 16T",
    gpu: "NVIDIA GeForce RTX 5080",
    ram: "64 GB DDR5 6000 MT/s",
});

function normalizeLocale(value) {
    return VALID_LOCALES.has(value) ? value : "cz";
}

function normalizeProfile(value) {
    return VALID_PROFILES.has(value) ? value : "admin";
}

function readAuth() {
    try {
        const raw = localStorage.getItem(AUTH_KEY);
        if (!raw) return { user: "admin", locale: "cz", ts: Date.now() };
        const parsed = JSON.parse(raw) || {};
        return {
            user: normalizeProfile((parsed.user || "").toLowerCase()),
            locale: normalizeLocale(parsed.locale),
            ts: Number.isFinite(parsed.ts) ? parsed.ts : Date.now(),
        };
    } catch {
        return { user: "admin", locale: "cz", ts: Date.now() };
    }
}

function writeAuth(auth) {
    const next = {
        user: normalizeProfile((auth?.user || "").toLowerCase()),
        locale: normalizeLocale(auth?.locale),
        ts: Date.now(),
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(next));
    return next;
}

function pickGpuRenderer() {
    try {
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        if (!gl) return null;
        const dbg = gl.getExtension("WEBGL_debug_renderer_info");
        if (dbg) {
            const r = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL);
            if (typeof r === "string" && r.trim()) return r.trim();
        }
        const fallback = gl.getParameter(gl.RENDERER);
        if (typeof fallback === "string" && fallback.trim()) return fallback.trim();
        return null;
    } catch {
        return null;
    }
}

function formatGiB(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) return null;
    const gib = bytes / (1024 ** 3);
    if (gib >= 100) return `${Math.round(gib)} GB`;
    return `${gib.toFixed(1)} GB`;
}

async function readHardwareInfo() {
    const data = {
        cpu: NEXUS_HW_PROFILE.cpu,
        ram: NEXUS_HW_PROFILE.ram,
        gpu: NEXUS_HW_PROFILE.gpu || pickGpuRenderer(),
        platform:
            (navigator.userAgentData && navigator.userAgentData.platform) ||
            navigator.platform ||
            null,
        storageUsed: null,
        storageTotal: null,
    };

    if (navigator.storage && typeof navigator.storage.estimate === "function") {
        try {
            const estimate = await navigator.storage.estimate();
            data.storageUsed = Number.isFinite(estimate?.usage) ? estimate.usage : null;
            data.storageTotal = Number.isFinite(estimate?.quota) ? estimate.quota : null;
        } catch {
            // no-op
        }
    }
    return data;
}

export function openSettings(ctx = {}) {
    const root = document.createElement("div");
    root.className = "nx-settings";

    root.innerHTML = `
      <div class="nx-settings-shell">
        <aside class="nx-settings-nav" aria-label="Settings sections">
          <div class="nx-settings-nav-head">
            <div id="st-nav-title" class="nx-settings-nav-title">Nexus Control Center</div>
            <div id="st-nav-sub" class="muted">System profile</div>
          </div>
          <button id="st-nav-system" type="button" class="nx-settings-nav-item is-active" data-panel="system">System</button>
          <button id="st-nav-appearance" type="button" class="nx-settings-nav-item" data-panel="appearance">Appearance</button>
          <button id="st-nav-behavior" type="button" class="nx-settings-nav-item" data-panel="behavior">Behavior</button>
          <button id="st-nav-maintenance" type="button" class="nx-settings-nav-item" data-panel="maintenance">Maintenance</button>
        </aside>

        <section class="nx-settings-main">
          <header class="nx-settings-head">
            <div>
              <h2 id="st-title" class="nx-settings-title">System</h2>
              <div id="st-subtitle" class="muted">Hardware, profile, language and connectivity.</div>
            </div>
            <div class="nx-settings-state">
              <span class="nx-badge"><span id="st-badge-theme-label">Theme</span>: <b id="st-theme-badge">cyan</b></span>
              <span class="nx-badge"><span id="st-badge-bright-label">Brightness</span>: <b id="st-bright-badge">100%</b></span>
              <span class="nx-badge"><span id="st-badge-volume-label">Volume</span>: <b id="st-volume-badge">70%</b></span>
              <span class="nx-badge"><span id="st-badge-profile-label">Profile</span>: <b id="st-profile-badge">admin</b></span>
            </div>
          </header>

          <div class="nx-settings-panels">
            <div class="nx-settings-panel is-active" data-panel="system">
              <div class="nx-settings-card">
                <div id="st-card-display-title" class="nx-settings-card-title">Display & Audio</div>
                <label class="nx-set-row"><span id="st-label-brightness">Brightness</span>
                  <input id="st-brightness" class="nx-input" type="range" min="50" max="120" step="1" />
                </label>
                <label class="nx-set-row"><span id="st-label-volume">Volume</span>
                  <input id="st-volume" class="nx-input" type="range" min="0" max="100" step="1" />
                </label>
              </div>

              <div class="nx-settings-card">
                <div id="st-card-connect-title" class="nx-settings-card-title">Connectivity</div>
                <label class="nx-set-toggle"><input type="checkbox" id="st-wifi" /> <span id="st-label-wifi">Wi-Fi enabled</span></label>
                <label class="nx-set-toggle"><input type="checkbox" id="st-dnd" /> <span id="st-label-dnd">Do not disturb</span></label>
              </div>

              <div class="nx-settings-card">
                <div id="st-card-profile-title" class="nx-settings-card-title">Profile & Access</div>
                <div class="nx-set-row"><span id="st-label-active-profile">Active profile</span>
                  <span class="nx-settings-inline-badges">
                    <span id="st-profile-current" class="nx-badge">admin</span>
                    <span id="st-profile-role" class="nx-badge">Administrator</span>
                  </span>
                </div>
                <label class="nx-set-row"><span id="st-label-switch-profile">Switch profile</span>
                  <select id="st-profile" class="nx-input">
                    <option value="admin">admin</option>
                    <option value="fake">fake</option>
                  </select>
                </label>
              </div>

              <div class="nx-settings-card">
                <div id="st-card-language-title" class="nx-settings-card-title">System language</div>
                <label class="nx-set-row"><span id="st-label-language">Language</span>
                  <select id="st-language" class="nx-input">
                    <option value="cz">Čeština</option>
                    <option value="en">English</option>
                  </select>
                </label>
                <div id="st-lang-help" class="muted">Applies to system UI and login screen.</div>
              </div>

              <div class="nx-settings-card nx-settings-card-wide">
                <div id="st-card-hw-title" class="nx-settings-card-title">Device information</div>
                <div class="nx-settings-kv"><span id="st-hw-label-cpu">CPU</span><b id="st-hw-cpu">Detecting…</b></div>
                <div class="nx-settings-kv"><span id="st-hw-label-gpu">GPU</span><b id="st-hw-gpu">Detecting…</b></div>
                <div class="nx-settings-kv"><span id="st-hw-label-ram">RAM</span><b id="st-hw-ram">Detecting…</b></div>
                <div class="nx-settings-kv"><span id="st-hw-label-storage">Storage</span><b id="st-hw-storage">Detecting…</b></div>
                <div class="nx-settings-kv"><span id="st-hw-label-platform">Platform</span><b id="st-hw-platform">Detecting…</b></div>
              </div>
            </div>

            <div class="nx-settings-panel" data-panel="appearance">
              <div class="nx-settings-card">
                <div id="st-card-theme-title" class="nx-settings-card-title">Theme</div>
                <label class="nx-set-row"><span id="st-label-theme">Color profile</span>
                  <select id="st-theme" class="nx-input">
                    <option value="cyan">Cyan</option>
                    <option value="amber">Amber</option>
                    <option value="mono">Mono</option>
                  </select>
                </label>
              </div>

              <div class="nx-settings-card">
                <div id="st-card-effects-title" class="nx-settings-card-title">Visual effects</div>
                <label class="nx-set-toggle"><input type="checkbox" id="st-blur" /> <span id="st-label-blur">Blur effects</span></label>
                <label class="nx-set-toggle"><input type="checkbox" id="st-anim" /> <span id="st-label-anim">Animations</span></label>
              </div>
            </div>

            <div class="nx-settings-panel" data-panel="behavior">
              <div class="nx-settings-card">
                <div id="st-card-boot-title" class="nx-settings-card-title">Boot & Startup</div>
                <label class="nx-set-row"><span id="st-label-boot">Boot profile</span>
                  <select id="st-boot" class="nx-input">
                    <option value="normal">Normal</option>
                    <option value="safe">Safe mode</option>
                  </select>
                </label>
                <div id="st-boot-help" class="muted">Safe mode loads a reduced set of modules and app services at boot.</div>
              </div>
            </div>

            <div class="nx-settings-panel" data-panel="maintenance">
              <div class="nx-settings-card">
                <div id="st-card-storage-title" class="nx-settings-card-title">Storage & Session</div>
                <div class="nx-settings-actions">
                  <button class="nx-mini-btn" id="st-reset-session">Clear Saved Session</button>
                  <button class="nx-mini-btn" id="st-reset-notes">Clear Notes</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    `;

    const PANEL_META = {
        system: { title: "panelSystemTitle", subtitle: "panelSystemSubtitle" },
        appearance: { title: "panelAppearanceTitle", subtitle: "panelAppearanceSubtitle" },
        behavior: { title: "panelBehaviorTitle", subtitle: "panelBehaviorSubtitle" },
        maintenance: { title: "panelMaintenanceTitle", subtitle: "panelMaintenanceSubtitle" },
    };

    let currentPanel = "system";
    let hardwareLoading = true;
    let hardware = {
        cpu: null,
        ram: null,
        gpu: null,
        storageUsed: null,
        storageTotal: null,
        platform: null,
    };

    const panelRefs = {
        navItems: Array.from(root.querySelectorAll(".nx-settings-nav-item")),
        panels: Array.from(root.querySelectorAll(".nx-settings-panel")),
        title: root.querySelector("#st-title"),
        subtitle: root.querySelector("#st-subtitle"),
        themeBadge: root.querySelector("#st-theme-badge"),
        brightBadge: root.querySelector("#st-bright-badge"),
        volumeBadge: root.querySelector("#st-volume-badge"),
        profileBadge: root.querySelector("#st-profile-badge"),
        navTitle: root.querySelector("#st-nav-title"),
        navSub: root.querySelector("#st-nav-sub"),
    };

    const refs = {
        navSystem: root.querySelector("#st-nav-system"),
        navAppearance: root.querySelector("#st-nav-appearance"),
        navBehavior: root.querySelector("#st-nav-behavior"),
        navMaintenance: root.querySelector("#st-nav-maintenance"),

        badgeThemeLabel: root.querySelector("#st-badge-theme-label"),
        badgeBrightLabel: root.querySelector("#st-badge-bright-label"),
        badgeVolumeLabel: root.querySelector("#st-badge-volume-label"),
        badgeProfileLabel: root.querySelector("#st-badge-profile-label"),

        cardDisplayTitle: root.querySelector("#st-card-display-title"),
        labelBrightness: root.querySelector("#st-label-brightness"),
        labelVolume: root.querySelector("#st-label-volume"),
        cardConnectTitle: root.querySelector("#st-card-connect-title"),
        labelWifi: root.querySelector("#st-label-wifi"),
        labelDnd: root.querySelector("#st-label-dnd"),

        cardProfileTitle: root.querySelector("#st-card-profile-title"),
        labelActiveProfile: root.querySelector("#st-label-active-profile"),
        labelSwitchProfile: root.querySelector("#st-label-switch-profile"),
        profileCurrent: root.querySelector("#st-profile-current"),
        profileRole: root.querySelector("#st-profile-role"),
        profile: root.querySelector("#st-profile"),

        cardLanguageTitle: root.querySelector("#st-card-language-title"),
        labelLanguage: root.querySelector("#st-label-language"),
        language: root.querySelector("#st-language"),
        langHelp: root.querySelector("#st-lang-help"),

        cardHardwareTitle: root.querySelector("#st-card-hw-title"),
        hwLabelCpu: root.querySelector("#st-hw-label-cpu"),
        hwLabelGpu: root.querySelector("#st-hw-label-gpu"),
        hwLabelRam: root.querySelector("#st-hw-label-ram"),
        hwLabelStorage: root.querySelector("#st-hw-label-storage"),
        hwLabelPlatform: root.querySelector("#st-hw-label-platform"),
        hwCpu: root.querySelector("#st-hw-cpu"),
        hwGpu: root.querySelector("#st-hw-gpu"),
        hwRam: root.querySelector("#st-hw-ram"),
        hwStorage: root.querySelector("#st-hw-storage"),
        hwPlatform: root.querySelector("#st-hw-platform"),

        cardThemeTitle: root.querySelector("#st-card-theme-title"),
        labelTheme: root.querySelector("#st-label-theme"),
        theme: root.querySelector("#st-theme"),

        cardEffectsTitle: root.querySelector("#st-card-effects-title"),
        labelBlur: root.querySelector("#st-label-blur"),
        labelAnim: root.querySelector("#st-label-anim"),
        blur: root.querySelector("#st-blur"),
        anim: root.querySelector("#st-anim"),

        cardBootTitle: root.querySelector("#st-card-boot-title"),
        labelBoot: root.querySelector("#st-label-boot"),
        bootHelp: root.querySelector("#st-boot-help"),
        boot: root.querySelector("#st-boot"),

        cardStorageTitle: root.querySelector("#st-card-storage-title"),
        resetSession: root.querySelector("#st-reset-session"),
        resetNotes: root.querySelector("#st-reset-notes"),

        brightness: root.querySelector("#st-brightness"),
        volume: root.querySelector("#st-volume"),
        wifi: root.querySelector("#st-wifi"),
        dnd: root.querySelector("#st-dnd"),
    };

    function getState() {
        return ctx.getState ? ctx.getState() : null;
    }

    function update(mutator) {
        if (!ctx.updateState) return;
        ctx.updateState(mutator);
        if (ctx.applyVisual) ctx.applyVisual();
        if (ctx.refreshLauncher) ctx.refreshLauncher();
    }

    function getLocale() {
        const s = getState();
        const fromState = s?.system?.language;
        if (VALID_LOCALES.has(fromState)) return fromState;
        const fromStorage = localStorage.getItem(LOCALE_KEY);
        return normalizeLocale(fromStorage);
    }

    function t(key) {
        const lang = getLocale();
        return (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key;
    }

    function getCurrentProfile() {
        const s = getState();
        const fromState = s?.system?.profile;
        if (VALID_PROFILES.has(fromState)) return fromState;
        return normalizeProfile(readAuth().user);
    }

    function setPanel(panelId) {
        currentPanel = panelId;
        panelRefs.navItems.forEach((btn) => {
            const active = btn.dataset.panel === panelId;
            btn.classList.toggle("is-active", active);
        });
        panelRefs.panels.forEach((panel) => {
            const active = panel.dataset.panel === panelId;
            panel.classList.toggle("is-active", active);
        });
        const meta = PANEL_META[panelId] || PANEL_META.system;
        panelRefs.title.textContent = t(meta.title);
        panelRefs.subtitle.textContent = t(meta.subtitle);
    }

    function renderLocale() {
        refs.navSystem.textContent = t("navSystem");
        refs.navAppearance.textContent = t("navAppearance");
        refs.navBehavior.textContent = t("navBehavior");
        refs.navMaintenance.textContent = t("navMaintenance");
        panelRefs.navTitle.textContent = t("navTitle");

        refs.badgeThemeLabel.textContent = t("badgeTheme");
        refs.badgeBrightLabel.textContent = t("badgeBrightness");
        refs.badgeVolumeLabel.textContent = t("badgeVolume");
        refs.badgeProfileLabel.textContent = t("badgeProfile");

        refs.cardDisplayTitle.textContent = t("cardDisplayAudio");
        refs.labelBrightness.textContent = t("labelBrightness");
        refs.labelVolume.textContent = t("labelVolume");
        refs.cardConnectTitle.textContent = t("cardConnectivity");
        refs.labelWifi.textContent = t("labelWifi");
        refs.labelDnd.textContent = t("labelDnd");

        refs.cardProfileTitle.textContent = t("cardProfile");
        refs.labelActiveProfile.textContent = t("labelActiveProfile");
        refs.labelSwitchProfile.textContent = t("labelSwitchProfile");

        refs.cardLanguageTitle.textContent = t("cardLanguage");
        refs.labelLanguage.textContent = t("labelLanguage");
        refs.language.querySelector('option[value="cz"]').textContent = t("langCz");
        refs.language.querySelector('option[value="en"]').textContent = t("langEn");
        refs.langHelp.textContent = t("languageHelp");

        refs.cardHardwareTitle.textContent = t("cardHardware");
        refs.hwLabelCpu.textContent = t("hwCpu");
        refs.hwLabelGpu.textContent = t("hwGpu");
        refs.hwLabelRam.textContent = t("hwRam");
        refs.hwLabelStorage.textContent = t("hwStorage");
        refs.hwLabelPlatform.textContent = t("hwPlatform");

        refs.cardThemeTitle.textContent = t("cardTheme");
        refs.labelTheme.textContent = t("labelColorProfile");
        refs.theme.querySelector('option[value="cyan"]').textContent = t("themeCyan");
        refs.theme.querySelector('option[value="amber"]').textContent = t("themeAmber");
        refs.theme.querySelector('option[value="mono"]').textContent = t("themeMono");

        refs.cardEffectsTitle.textContent = t("cardVisual");
        refs.labelBlur.textContent = t("labelBlur");
        refs.labelAnim.textContent = t("labelAnimations");

        refs.cardBootTitle.textContent = t("cardBoot");
        refs.labelBoot.textContent = t("labelBoot");
        refs.boot.querySelector('option[value="normal"]').textContent = t("bootNormal");
        refs.boot.querySelector('option[value="safe"]').textContent = t("bootSafe");
        refs.bootHelp.textContent = t("bootHelp");

        refs.cardStorageTitle.textContent = t("cardStorage");
        refs.resetSession.textContent = t("btnClearSession");
        refs.resetNotes.textContent = t("btnClearNotes");
    }

    function renderHardware() {
        if (hardwareLoading) {
            const msg = t("hwDetecting");
            refs.hwCpu.textContent = msg;
            refs.hwGpu.textContent = msg;
            refs.hwRam.textContent = msg;
            refs.hwStorage.textContent = msg;
            refs.hwPlatform.textContent = msg;
            return;
        }

        const unknown = t("hwUnknown");
        refs.hwCpu.textContent = hardware.cpu || unknown;
        refs.hwGpu.textContent = hardware.gpu || unknown;
        refs.hwRam.textContent = hardware.ram || unknown;

        const used = formatGiB(hardware.storageUsed);
        const total = formatGiB(hardware.storageTotal);
        refs.hwStorage.textContent = used && total ? `${used} / ${total}` : total || unknown;
        refs.hwPlatform.textContent = hardware.platform || unknown;
    }

    function render() {
        const s = getState();
        if (!s) return;

        const profile = getCurrentProfile();
        const locale = getLocale();

        refs.theme.value = s.ui.theme;
        refs.brightness.value = String(s.system.brightness);
        refs.volume.value = String(s.system.volume);
        refs.boot.value = s.system.bootProfile;
        refs.blur.checked = !!s.ui.blur;
        refs.anim.checked = !!s.ui.animations;
        refs.wifi.checked = !!s.system.wifi;
        refs.dnd.checked = !!s.system.dnd;
        refs.profile.value = profile;
        refs.language.value = locale;

        panelRefs.themeBadge.textContent = s.ui.theme;
        panelRefs.brightBadge.textContent = `${s.system.brightness}%`;
        panelRefs.volumeBadge.textContent = `${s.system.volume}%`;
        panelRefs.profileBadge.textContent = profile;

        refs.profileCurrent.textContent = profile === "fake" ? t("profileFake") : t("profileAdmin");
        refs.profileRole.textContent = `${t("roleLabel")}: ${profile === "fake" ? t("roleFake") : t("roleAdmin")}`;

        panelRefs.navSub.textContent = `${t("navSignedAs")} ${profile}`;

        renderLocale();
        setPanel(currentPanel);
        renderHardware();
    }

    refs.theme.addEventListener("change", () => update((draft) => { draft.ui.theme = refs.theme.value; }));
    refs.brightness.addEventListener("input", () => update((draft) => { draft.system.brightness = Number(refs.brightness.value); }));
    refs.volume.addEventListener("input", () => update((draft) => { draft.system.volume = Number(refs.volume.value); }));
    refs.boot.addEventListener("change", () => update((draft) => { draft.system.bootProfile = refs.boot.value; }));

    refs.blur.addEventListener("change", () => update((draft) => { draft.ui.blur = refs.blur.checked; }));
    refs.anim.addEventListener("change", () => update((draft) => { draft.ui.animations = refs.anim.checked; }));
    refs.wifi.addEventListener("change", () => update((draft) => { draft.system.wifi = refs.wifi.checked; }));
    refs.dnd.addEventListener("change", () => update((draft) => { draft.system.dnd = refs.dnd.checked; }));

    refs.profile.addEventListener("change", () => {
        const profile = normalizeProfile(refs.profile.value);
        const locale = getLocale();
        update((draft) => { draft.system.profile = profile; });
        writeAuth({ user: profile, locale, ts: Date.now() });
        if (ctx.notify) ctx.notify({ title: t("notifyTitle", "Settings"), message: `${t("notifyProfileChanged")} ${profile}.`, type: "info" });
        render();
    });

    refs.language.addEventListener("change", () => {
        const locale = normalizeLocale(refs.language.value);
        localStorage.setItem(LOCALE_KEY, locale);
        update((draft) => { draft.system.language = locale; });
        const auth = readAuth();
        writeAuth({ ...auth, locale });
        window.dispatchEvent(new CustomEvent("nexus:locale-change", { detail: { locale } }));
        if (ctx.notify) ctx.notify({ title: t("notifyTitle", "Settings"), message: `${t("notifyLanguageChanged")} ${locale.toUpperCase()}.`, type: "info" });
        render();
    });

    refs.resetSession.addEventListener("click", () => {
        update((draft) => { draft.session.windows = []; });
        if (ctx.notify) ctx.notify({ title: t("notifyTitle", "Settings"), message: t("notifySessionCleared"), type: "info" });
    });

    refs.resetNotes.addEventListener("click", () => {
        update((draft) => { draft.notes = ""; });
        if (ctx.notify) ctx.notify({ title: t("notifyTitle", "Settings"), message: t("notifyNotesCleared"), type: "warn" });
    });

    panelRefs.navItems.forEach((btn) => {
        btn.addEventListener("click", () => setPanel(btn.dataset.panel || "system"));
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

    readHardwareInfo()
        .then((info) => {
            hardware = info;
            hardwareLoading = false;
            render();
        })
        .catch(() => {
            hardwareLoading = false;
            render();
        });

    setPanel("system");
    render();
    return root;
}
