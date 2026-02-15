// resources/js/main.js
import { WindowManager } from "./windowManager.js";
import { openTerminal } from "./apps/terminal.js";
import { openSnake } from "./apps/snake.js";
import { open2048 } from "./apps/game2048.js";
import { openTetris } from "./apps/tetris.js";
import { openPipelines } from "./apps/pipelines.js";
import { openExplorer } from "./apps/explorer.js";
import { openSettings } from "./apps/settings.js";
import { openNotes } from "./apps/notes.js";
import { openCalculator } from "./apps/calculator.js";
import { openProcessManager } from "./apps/processManager.js";
import { openAppStore } from "./apps/appStore.js";
import { openNotificationsCenter } from "./apps/notificationsCenter.js";
import { initWeatherUI } from "./widgets/weather.js";
import { initDesktopWidgets } from "./widgets/desktopWidgets.js";
import { initAppList } from "./widgets/appList.js";
import { getLocale, subscribeLocale, tr } from "./os/i18n.js";
import {
    applyVisualState,
    clearNotifications,
    getOSState,
    getSessionWindows,
    isAppInstalled,
    setAppInstalled,
    setSessionWindows,
    subscribeOSState,
    updateOSState,
} from "./os/state.js";
import { initNotifications, notify, subscribeNotifications } from "./os/notifications.js";

const AUTH_KEY = "nexus.auth.session.v1";
const LOCALE_KEY = "nexus.locale.v1";

const UI_I18N = {
    cz: {
        app_terminal_title: "Terminál",
        app_terminal_desc: "Nexus shell",
        app_explorer_title: "Průzkumník",
        app_explorer_desc: "Falešný filesystem",
        app_settings_title: "Nastavení",
        app_settings_desc: "Systémové předvolby",
        app_notes_title: "Poznámky",
        app_notes_desc: "Automatické ukládání",
        app_calculator_title: "Kalkulačka",
        app_calculator_desc: "Matematická aplikace",
        app_notifications_title: "Notifikace",
        app_notifications_desc: "Centrum oznámení",
        app_process_title: "Správce procesů",
        app_process_desc: "Úlohy oken",
        app_appstore_title: "Obchod aplikací",
        app_appstore_desc: "Instalovatelné aplikace",
        app_cv_title: "CV",
        app_cv_desc: "Prohlížeč CV",
        app_pipelines_title: "Pipelines",
        app_pipelines_desc: "Pipeline dashboard",
        app_snake_title: "Snake",
        app_snake_desc: "Arkáda",
        app_game2048_title: "2048",
        app_game2048_desc: "Logická hra",
        app_tetris_title: "Tetris",
        app_tetris_desc: "Stavění bloků",

        quick_actions: "Rychlé akce",
        quick_hide: "Skrýt panel",
        quick_wifi: "Wi-Fi",
        quick_dnd: "Nerušit",
        quick_brightness: "Jas",
        quick_open_settings: "Otevřít nastavení",
        quick_restart_ui: "Restartovat UI",
        taskbar_quick: "Rychlé akce",
        taskbar_notifications: "Notifikace",
        taskbar_weather: "Počasí",
        taskbar_start: "Start",
        taskbar_restart: "Restart",
        taskbar_shutdown: "Vypnout",
        power_on: "Zapnout",
        system_off: "Systém je vypnutý",
        clock_panel_calendar: "Kalendář",
        clock_panel_notifications: "Notifikace",
        clock_panel_clear: "Vymazat vše",
        clock_panel_empty: "Žádné notifikace.",

        gadget_weather: "Počasí",
        gadget_core: "Nexus Core",
        gadget_status: "Status",
        gadget_modules: "Moduly",
        gadget_uptime: "Uptime",
        gadget_locating: "Zjišťuji polohu…",

        launch_warn_title: "Launcher",
        launch_warn_missing: "{app} není nainstalovaná.",
        safe_mode_title: "Boot profil",
        safe_mode_msg: "Safe mode je aktivní.",
    },
    en: {
        app_terminal_title: "Terminal",
        app_terminal_desc: "Nexus shell",
        app_explorer_title: "Explorer",
        app_explorer_desc: "Fake filesystem",
        app_settings_title: "Settings",
        app_settings_desc: "System preferences",
        app_notes_title: "Notes",
        app_notes_desc: "Autosave notes",
        app_calculator_title: "Calculator",
        app_calculator_desc: "Math app",
        app_notifications_title: "Notifications",
        app_notifications_desc: "Notification center",
        app_process_title: "Process Manager",
        app_process_desc: "Window tasks",
        app_appstore_title: "App Store",
        app_appstore_desc: "Installable apps",
        app_cv_title: "CV",
        app_cv_desc: "CV viewer",
        app_pipelines_title: "Pipelines",
        app_pipelines_desc: "Pipeline dashboard",
        app_snake_title: "Snake",
        app_snake_desc: "Arcade game",
        app_game2048_title: "2048",
        app_game2048_desc: "Puzzle game",
        app_tetris_title: "Tetris",
        app_tetris_desc: "Block stacker",

        quick_actions: "Quick Actions",
        quick_hide: "Hide panel",
        quick_wifi: "Wi-Fi",
        quick_dnd: "Do not disturb",
        quick_brightness: "Brightness",
        quick_open_settings: "Open Settings",
        quick_restart_ui: "Restart UI",
        taskbar_quick: "Quick actions",
        taskbar_notifications: "Notifications",
        taskbar_weather: "Weather",
        taskbar_start: "Start",
        taskbar_restart: "Restart",
        taskbar_shutdown: "Shutdown",
        power_on: "Power On",
        system_off: "System is off",
        clock_panel_calendar: "Calendar",
        clock_panel_notifications: "Notifications",
        clock_panel_clear: "Clear all",
        clock_panel_empty: "No notifications.",

        gadget_weather: "Weather",
        gadget_core: "Nexus Core",
        gadget_status: "Status",
        gadget_modules: "Modules",
        gadget_uptime: "Uptime",
        gadget_locating: "Locating…",

        launch_warn_title: "Launcher",
        launch_warn_missing: "{app} is not installed.",
        safe_mode_title: "Boot Profile",
        safe_mode_msg: "Safe mode is active.",
    },
};

function mkContent(html) {
    const el = document.createElement("div");
    el.innerHTML = html;
    return el;
}

function getPreferredLocale() {
    const active = getLocale();
    if (active === "en" || active === "cz") return active;

    try {
        const osLang = getOSState?.()?.system?.language;
        if (osLang === "en" || osLang === "cz") return osLang;

        const authRaw = localStorage.getItem(AUTH_KEY);
        if (authRaw) {
            const auth = JSON.parse(authRaw);
            if (auth?.locale === "en" || auth?.locale === "cz") return auth.locale;
        }
        const locale = localStorage.getItem(LOCALE_KEY);
        if (locale === "en" || locale === "cz") return locale;
    } catch {
        // no-op
    }
    return "cz";
}

function renderCVMarkup(locale = "cz") {
    if (locale === "en") {
        return `
          <article class="nx-cv">
            <header class="nx-cv-hero">
              <div>
                <div class="nx-cv-kicker">Curriculum Vitae</div>
                <h2 class="nx-cv-name">Martin Kliment</h2>
                <div class="nx-cv-role muted">Platform Engineer / Infrastructure & Identity</div>
              </div>
              <div class="nx-cv-contact">
                <a href="mailto:expancion2@gmail.com">expancion2@gmail.com</a>
                <a href="https://www.kliment.xyz" target="_blank" rel="noopener">www.kliment.xyz</a>
                <span class="nx-badge">Prague, Czech Republic</span>
              </div>
            </header>

            <div class="nx-cv-tags">
              <span class="nx-badge">Azure</span>
              <span class="nx-badge">Entra ID</span>
              <span class="nx-badge">Intune</span>
              <span class="nx-badge">PowerShell</span>
              <span class="nx-badge">Python</span>
              <span class="nx-badge">Docker</span>
            </div>

            <div class="nx-cv-layout">
              <section class="nx-cv-card">
                <h3>Profile</h3>
                <p class="muted">
                  Platform engineer focused on cloud infrastructure, identity management and automation.
                  Strong practice with Azure, Entra ID, Intune, PowerShell, Python and Docker.
                  Long-term direction: technical lead / architect path.
                </p>
              </section>

              <section class="nx-cv-card">
                <h3>Languages</h3>
                <ul class="nx-cv-skills muted">
                  <li><b>Czech:</b> native speaker</li>
                  <li><b>English:</b> professional working proficiency</li>
                </ul>

                <div class="nx-cv-subsection-title">Certifications</div>
                <ul class="nx-cv-skills muted">
                  <li>Python Essentials (Cisco)</li>
                  <li>Linux Administrator</li>
                  <li>CCNA</li>
                </ul>
              </section>

              <section class="nx-cv-card nx-cv-card-span2">
                <h3>Work Experience</h3>
                <div class="nx-cv-timeline">
                  <article class="nx-cv-timeline-item">
                    <div class="nx-cv-time">04/2025 - present</div>
                    <div>
                      <b>Packeta Innovations s.r.o.</b>
                      <div class="muted">Platform Engineer</div>
                    </div>
                  </article>
                  <article class="nx-cv-timeline-item">
                    <div class="nx-cv-time">10/2023 - 04/2025</div>
                    <div>
                      <b>Packeta Innovations s.r.o.</b>
                      <div class="muted">System Administrator</div>
                    </div>
                  </article>
                  <article class="nx-cv-timeline-item">
                    <div class="nx-cv-time">05/2022 - 10/2023</div>
                    <div>
                      <b>NTT Ltd.</b>
                      <div class="muted">Senior Infrastructure Engineer</div>
                    </div>
                  </article>
                  <article class="nx-cv-timeline-item">
                    <div class="nx-cv-time">2015 - 2022</div>
                    <div>
                      <b>Telefonica / G4S / AutoCont / Dimension Data / NTT</b>
                      <div class="muted">IT Support & Service Desk roles</div>
                    </div>
                  </article>
                </div>
              </section>

              <section class="nx-cv-card">
                <h3>Technologies</h3>
                <ul class="nx-cv-skills muted">
                  <li><b>Cloud & Infra:</b> Azure, Exchange, Docker, Terraform, Ansible</li>
                  <li><b>Identity / MDM:</b> Entra ID, Intune, SOTI</li>
                  <li><b>Automation:</b> PowerShell, Python, Bash, API workflows</li>
                  <li><b>Virtualization:</b> Proxmox, VMware, Cloud-Init</li>
                  <li><b>OS & Network:</b> Windows Server, Linux, macOS, networking fundamentals</li>
                </ul>
              </section>

              <section class="nx-cv-card">
                <h3>Education</h3>
                <div><b>Smíchovská střední průmyslová škola (SSPŠ), IT</b></div>
                <div class="muted">2010 - 2014 (EQF 4)</div>
              </section>

              <section class="nx-cv-card nx-cv-card-span2">
                <h3>Selected Projects</h3>
                <div class="nx-cv-projects">
                  <article class="nx-cv-project">
                    <h4>Nexus Identity Admin</h4>
                    <div class="muted">Flask, Tailwind, JS ES modules, Microsoft Graph API, Azure AD, SQLite/PostgreSQL</div>
                    <p class="muted">Identity/device management, logging and audit dashboards.</p>
                  </article>
                  <article class="nx-cv-project">
                    <h4>HomeLab Automation Toolkit</h4>
                    <div class="muted">Proxmox API, Terraform, Ansible</div>
                    <p class="muted">Automated VM orchestration and environment provisioning.</p>
                  </article>
                </div>
              </section>
            </div>

            <footer class="nx-cv-foot muted">Tip: in terminal run <b>open cv</b>.</footer>
          </article>
        `;
    }

    return `
      <article class="nx-cv">
        <header class="nx-cv-hero">
          <div>
            <div class="nx-cv-kicker">Životopis</div>
            <h2 class="nx-cv-name">Martin Kliment</h2>
            <div class="nx-cv-role muted">Platform Engineer / Infrastruktura & Identita</div>
          </div>
          <div class="nx-cv-contact">
            <a href="mailto:expancion2@gmail.com">expancion2@gmail.com</a>
            <a href="https://www.kliment.xyz" target="_blank" rel="noopener">www.kliment.xyz</a>
            <span class="nx-badge">Praha, Česká republika</span>
          </div>
        </header>

        <div class="nx-cv-tags">
          <span class="nx-badge">Azure</span>
          <span class="nx-badge">Entra ID</span>
          <span class="nx-badge">Intune</span>
          <span class="nx-badge">PowerShell</span>
          <span class="nx-badge">Python</span>
          <span class="nx-badge">Docker</span>
        </div>

        <div class="nx-cv-layout">
          <section class="nx-cv-card">
            <h3>Profil</h3>
            <p class="muted">
              Platform engineer zaměřený na cloudovou infrastrukturu, správu identit a automatizaci.
              Silná praxe s Azure, Entra ID, Intune, PowerShell, Python a Docker.
              Dlouhodobě směřuji k roli technického leada / architekta.
            </p>
          </section>

          <section class="nx-cv-card">
            <h3>Jazyky</h3>
            <ul class="nx-cv-skills muted">
              <li><b>Čeština:</b> rodilý mluvčí</li>
              <li><b>Angličtina:</b> profesionální pracovní úroveň</li>
            </ul>

            <div class="nx-cv-subsection-title">Certifikace</div>
            <ul class="nx-cv-skills muted">
              <li>Python Essentials (Cisco)</li>
              <li>Linux Administrator</li>
              <li>CCNA</li>
            </ul>
          </section>

          <section class="nx-cv-card nx-cv-card-span2">
            <h3>Pracovní zkušenosti</h3>
            <div class="nx-cv-timeline">
              <article class="nx-cv-timeline-item">
                <div class="nx-cv-time">04/2025 - současnost</div>
                <div>
                  <b>Packeta Innovations s.r.o.</b>
                  <div class="muted">Platform Engineer</div>
                </div>
              </article>
              <article class="nx-cv-timeline-item">
                <div class="nx-cv-time">10/2023 - 04/2025</div>
                <div>
                  <b>Packeta Innovations s.r.o.</b>
                  <div class="muted">System Administrator</div>
                </div>
              </article>
              <article class="nx-cv-timeline-item">
                <div class="nx-cv-time">05/2022 - 10/2023</div>
                <div>
                  <b>NTT Ltd.</b>
                  <div class="muted">Senior Infrastructure Engineer</div>
                </div>
              </article>
              <article class="nx-cv-timeline-item">
                <div class="nx-cv-time">2015 - 2022</div>
                <div>
                  <b>Telefonica / G4S / AutoCont / Dimension Data / NTT</b>
                  <div class="muted">Role v IT supportu a service desku</div>
                </div>
              </article>
            </div>
          </section>

          <section class="nx-cv-card">
            <h3>Technologie</h3>
            <ul class="nx-cv-skills muted">
              <li><b>Cloud & Infra:</b> Azure, Exchange, Docker, Terraform, Ansible</li>
              <li><b>Identity / MDM:</b> Entra ID, Intune, SOTI</li>
              <li><b>Automatizace:</b> PowerShell, Python, Bash, API workflowy</li>
              <li><b>Virtualizace:</b> Proxmox, VMware, Cloud-Init</li>
              <li><b>OS & Síť:</b> Windows Server, Linux, macOS, síťové základy</li>
            </ul>
          </section>

          <section class="nx-cv-card">
            <h3>Vzdělání</h3>
            <div><b>Smíchovská střední průmyslová škola (SSPŠ), IT</b></div>
            <div class="muted">2010 - 2014 (EQF 4)</div>
          </section>

          <section class="nx-cv-card nx-cv-card-span2">
            <h3>Vybrané projekty</h3>
            <div class="nx-cv-projects">
              <article class="nx-cv-project">
                <h4>Nexus Identity Admin</h4>
                <div class="muted">Flask, Tailwind, JS ES modules, Microsoft Graph API, Azure AD, SQLite/PostgreSQL</div>
                <p class="muted">Správa identit a zařízení, logování a auditní dashboardy.</p>
              </article>
              <article class="nx-cv-project">
                <h4>HomeLab Automation Toolkit</h4>
                <div class="muted">Proxmox API, Terraform, Ansible</div>
                <p class="muted">Automatizovaná orchestrace virtuálních strojů a provisioning prostředí.</p>
              </article>
            </div>
          </section>
        </div>

        <footer class="nx-cv-foot muted">Tip: v terminálu spusť <b>open cv</b>.</footer>
      </article>
    `;
}

let saveTimer = null;
const wm = new WindowManager({
    desktopEl: document.getElementById("desktop"),
    taskbarEl: document.getElementById("taskbar-apps"),
    onChange: (snapshot) => {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => setSessionWindows(snapshot), 220);
    },
});

const APP_CATALOG = [
    { id: "terminal", titleKey: "app_terminal_title", descKey: "app_terminal_desc", icon: ">_", launcher: ">_", core: true },
    { id: "explorer", titleKey: "app_explorer_title", descKey: "app_explorer_desc", icon: "📁", launcher: "📁" },
    { id: "settings", titleKey: "app_settings_title", descKey: "app_settings_desc", icon: "⚙", launcher: "⚙", core: true },
    { id: "notes", titleKey: "app_notes_title", descKey: "app_notes_desc", icon: "✎", launcher: "✎" },
    { id: "calculator", titleKey: "app_calculator_title", descKey: "app_calculator_desc", icon: "∑", launcher: "∑" },
    { id: "notifications", titleKey: "app_notifications_title", descKey: "app_notifications_desc", icon: "🔔", launcher: "🔔" },
    { id: "process", titleKey: "app_process_title", descKey: "app_process_desc", icon: "🧠", launcher: "🧠" },
    { id: "appstore", titleKey: "app_appstore_title", descKey: "app_appstore_desc", icon: "🛒", launcher: "🛒", core: true },
    { id: "cv", titleKey: "app_cv_title", descKey: "app_cv_desc", icon: "CV", launcher: "CV" },
    { id: "pipelines", titleKey: "app_pipelines_title", descKey: "app_pipelines_desc", icon: "⇄", launcher: "⧉" },
    { id: "snake", titleKey: "app_snake_title", descKey: "app_snake_desc", icon: "🐍", launcher: "🐍" },
    { id: "game2048", titleKey: "app_game2048_title", descKey: "app_game2048_desc", icon: "2K", launcher: "2K" },
    { id: "tetris", titleKey: "app_tetris_title", descKey: "app_tetris_desc", icon: "▦", launcher: "▦" },
];

function text(key, fallback = "") {
    return tr(UI_I18N, key, fallback || key);
}

function localeTag() {
    return getLocale() === "en" ? "en-US" : "cs-CZ";
}

function escapeHtml(s) {
    return String(s)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function mondayIndex(jsDay) {
    return (jsDay + 6) % 7;
}

function isoDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function localizeCatalog() {
    APP_CATALOG.forEach((app) => {
        app.title = text(app.titleKey, app.id);
        app.desc = text(app.descKey, "");
    });
}

function appTitle(appId, fallback = appId) {
    return APP_CATALOG.find((a) => a.id === appId)?.title || fallback;
}

localizeCatalog();

let appContext = null;

function openApp(appId, opts = {}) {
    const def = APP_CATALOG.find((a) => a.id === appId);
    if (!def) return;
    if (!def.core && !isAppInstalled(appId)) {
        notify({
            title: text("launch_warn_title", "Launcher"),
            message: text("launch_warn_missing", "{app} is not installed.").replace("{app}", def.title),
            type: "warn",
        });
        return;
    }

    const s = opts.state || {};
    const x = Number.isFinite(s.x) ? s.x : opts.x;
    const y = Number.isFinite(s.y) ? s.y : opts.y;
    const width = Number.isFinite(s.width) ? s.width : opts.width;
    const height = Number.isFinite(s.height) ? s.height : opts.height;

    if (appId === "terminal") {
        wm.createWindow({
            id: "terminal",
            title: appTitle("terminal", "Nexus Shell"),
            iconText: ">_",
            x: x ?? 120,
            y: y ?? 120,
            width: width ?? 760,
            height: height ?? 520,
            minimized: !!s.minimized,
            maximized: !!s.maximized,
            snap: s.snap || null,
            contentEl: openTerminal(appContext),
        });
        return;
    }

    if (appId === "explorer") {
        wm.createWindow({
            id: "explorer",
            title: appTitle("explorer", "Explorer"),
            iconText: "📁",
            x: x ?? 140,
            y: y ?? 90,
            width: width ?? 840,
            height: height ?? 600,
            minimized: !!s.minimized,
            maximized: !!s.maximized,
            snap: s.snap || null,
            contentEl: openExplorer(appContext),
        });
        return;
    }

    if (appId === "settings") {
        wm.createWindow({
            id: "settings",
            title: appTitle("settings", "Settings"),
            iconText: "⚙",
            x: x ?? 170,
            y: y ?? 100,
            width: width ?? 860,
            height: height ?? 680,
            minimized: !!s.minimized,
            maximized: !!s.maximized,
            snap: s.snap || null,
            contentEl: openSettings(appContext),
        });
        return;
    }

    if (appId === "notes") {
        wm.createWindow({
            id: "notes",
            title: appTitle("notes", "Notes"),
            iconText: "✎",
            x: x ?? 200,
            y: y ?? 110,
            width: width ?? 760,
            height: height ?? 560,
            minimized: !!s.minimized,
            maximized: !!s.maximized,
            snap: s.snap || null,
            contentEl: openNotes(appContext),
        });
        return;
    }

    if (appId === "calculator") {
        wm.createWindow({
            id: "calculator",
            title: appTitle("calculator", "Calculator"),
            iconText: "∑",
            x: x ?? 260,
            y: y ?? 120,
            width: width ?? 360,
            height: height ?? 520,
            minimized: !!s.minimized,
            maximized: !!s.maximized,
            snap: s.snap || null,
            contentEl: openCalculator(appContext),
        });
        return;
    }

    if (appId === "notifications") {
        wm.createWindow({
            id: "notifications",
            title: appTitle("notifications", "Notifications"),
            iconText: "🔔",
            x: x ?? 220,
            y: y ?? 120,
            width: width ?? 620,
            height: height ?? 560,
            minimized: !!s.minimized,
            maximized: !!s.maximized,
            snap: s.snap || null,
            contentEl: openNotificationsCenter(appContext),
        });
        return;
    }

    if (appId === "process") {
        wm.createWindow({
            id: "process",
            title: appTitle("process", "Process Manager"),
            iconText: "🧠",
            x: x ?? 240,
            y: y ?? 130,
            width: width ?? 700,
            height: height ?? 540,
            minimized: !!s.minimized,
            maximized: !!s.maximized,
            snap: s.snap || null,
            contentEl: openProcessManager(appContext),
        });
        return;
    }

    if (appId === "appstore") {
        wm.createWindow({
            id: "appstore",
            title: appTitle("appstore", "App Store"),
            iconText: "🛒",
            x: x ?? 190,
            y: y ?? 110,
            width: width ?? 740,
            height: height ?? 600,
            minimized: !!s.minimized,
            maximized: !!s.maximized,
            snap: s.snap || null,
            contentEl: openAppStore(appContext),
        });
        return;
    }

    if (appId === "cv") {
        wm.createWindow({
            id: "cv",
            title: appTitle("cv", "CV"),
            iconText: "CV",
            x: x ?? 160,
            y: y ?? 120,
            width: width ?? 920,
            height: height ?? 650,
            minimized: !!s.minimized,
            maximized: !!s.maximized,
            snap: s.snap || null,
            contentEl: mkContent(renderCVMarkup(getPreferredLocale())),
        });
        return;
    }

    if (appId === "pipelines") {
        wm.createWindow({
            id: "pipelines",
            title: appTitle("pipelines", "Pipelines"),
            iconText: "⇄",
            x: x ?? 190,
            y: y ?? 160,
            width: width ?? 860,
            height: height ?? 560,
            minimized: !!s.minimized,
            maximized: !!s.maximized,
            snap: s.snap || null,
            contentEl: openPipelines(),
        });
        return;
    }

    if (appId === "snake") {
        wm.createWindow({
            id: "snake",
            title: appTitle("snake", "Snake"),
            iconText: "🐍",
            x: x ?? 220,
            y: y ?? 140,
            width: width ?? 740,
            height: height ?? 780,
            minimized: !!s.minimized,
            maximized: !!s.maximized,
            snap: s.snap || null,
            contentEl: openSnake(),
        });
        return;
    }

    if (appId === "game2048") {
        wm.createWindow({
            id: "game2048",
            title: appTitle("game2048", "2048"),
            iconText: "2K",
            x: x ?? 260,
            y: y ?? 140,
            width: width ?? 520,
            height: height ?? 640,
            minimized: !!s.minimized,
            maximized: !!s.maximized,
            snap: s.snap || null,
            contentEl: open2048(),
        });
        return;
    }

    if (appId === "tetris") {
        wm.createWindow({
            id: "tetris",
            title: appTitle("tetris", "Tetris"),
            iconText: "▦",
            x: x ?? 300,
            y: y ?? 120,
            width: width ?? 760,
            height: height ?? 760,
            minimized: !!s.minimized,
            maximized: !!s.maximized,
            snap: s.snap || null,
            contentEl: openTetris(),
        });
        return;
    }
}

function renderLauncher() {
    const launcher = document.getElementById("launcher");
    if (!launcher) return;

    launcher.innerHTML = "";

    APP_CATALOG.forEach((app) => {
        if (!app.core && !isAppInstalled(app.id)) return;
        const btn = document.createElement("button");
        btn.className = "nx-launch";
        btn.dataset.app = app.id;
        btn.title = app.title;
        btn.textContent = app.launcher;
        btn.addEventListener("click", () => openApp(app.id));
        launcher.appendChild(btn);
    });
}

function renderDesktopStaticText() {
    const wxTitle = document.querySelector("#gadget-weather .nx-gadget-title");
    if (wxTitle) wxTitle.textContent = text("gadget_weather", "Weather");
    const wxCity = document.getElementById("wx-city");
    if (wxCity && (!wxCity.textContent || wxCity.textContent.includes("Locating") || wxCity.textContent.includes("Zjišťuji"))) {
        wxCity.textContent = text("gadget_locating", "Locating…");
    }

    const coreTitle = document.querySelector("#gadget-core .nx-gadget-title");
    if (coreTitle) coreTitle.textContent = text("gadget_core", "Nexus Core");

    const coreRows = document.querySelectorAll("#gadget-core .nx-gadget-kv .muted");
    if (coreRows[0]) coreRows[0].textContent = text("gadget_status", "Status");
    if (coreRows[1]) coreRows[1].textContent = text("gadget_modules", "Modules");
    if (coreRows[2]) coreRows[2].textContent = text("gadget_uptime", "Uptime");

    const notifyBtn = document.getElementById("taskbar-notify");
    if (notifyBtn) notifyBtn.title = text("taskbar_notifications", "Notifications");
    const weatherBtn = document.getElementById("taskbar-weather");
    if (weatherBtn) weatherBtn.title = text("taskbar_weather", "Weather");
}

function initClockPanel() {
    const desktop = document.getElementById("desktop");
    const clockEl = document.getElementById("clock");
    if (!desktop || !clockEl) return;

    const panel = document.createElement("section");
    panel.id = "clock-panel";
    panel.className = "nx-clock-panel";
    panel.setAttribute("aria-hidden", "true");
    panel.innerHTML = `
      <div class="nx-clock-head">
        <div>
          <div class="nx-clock-time" id="cp-time">--:--</div>
          <div class="muted nx-clock-date" id="cp-date">—</div>
        </div>
        <button class="nx-mini-btn" id="cp-close" title="Close">×</button>
      </div>
      <section class="nx-clock-section">
        <div class="nx-row">
          <b id="cp-cal-title"></b>
          <div class="nx-clock-nav">
            <button class="nx-mini-btn" id="cp-prev" title="Previous month">‹</button>
            <div class="nx-cal-month" id="cp-month">—</div>
            <button class="nx-mini-btn" id="cp-next" title="Next month">›</button>
          </div>
        </div>
        <div class="nx-cal-grid nx-clock-cal-grid" id="cp-grid"></div>
      </section>
      <section class="nx-clock-section">
        <div class="nx-row">
          <b id="cp-notes-title"></b>
          <button class="nx-mini-btn" id="cp-clear"></button>
        </div>
        <div class="nx-list nx-clock-notes" id="cp-notes"></div>
      </section>
    `;
    desktop.appendChild(panel);

    const timeEl = panel.querySelector("#cp-time");
    const dateEl = panel.querySelector("#cp-date");
    const closeBtn = panel.querySelector("#cp-close");
    const calTitleEl = panel.querySelector("#cp-cal-title");
    const notesTitleEl = panel.querySelector("#cp-notes-title");
    const clearBtn = panel.querySelector("#cp-clear");
    const prevBtn = panel.querySelector("#cp-prev");
    const nextBtn = panel.querySelector("#cp-next");
    const monthEl = panel.querySelector("#cp-month");
    const gridEl = panel.querySelector("#cp-grid");
    const notesEl = panel.querySelector("#cp-notes");

    let isOpen = false;
    let notes = [];
    const today = new Date();
    let cursor = new Date(today.getFullYear(), today.getMonth(), 1);
    let selectedIso = isoDate(today);

    clockEl.setAttribute("role", "button");
    clockEl.setAttribute("tabindex", "0");
    clockEl.setAttribute("aria-haspopup", "dialog");
    clockEl.setAttribute("aria-expanded", "false");

    function renderLabels() {
        const isEn = getLocale() === "en";
        calTitleEl.textContent = text("clock_panel_calendar", "Calendar");
        notesTitleEl.textContent = text("clock_panel_notifications", "Notifications");
        clearBtn.textContent = text("clock_panel_clear", "Clear all");
        closeBtn.title = text("quick_hide", "Hide panel");
        prevBtn.title = isEn ? "Previous month" : "Předchozí měsíc";
        nextBtn.title = isEn ? "Next month" : "Další měsíc";
    }

    function renderNow() {
        const now = new Date();
        timeEl.textContent = now.toLocaleTimeString(localeTag(), { hour: "2-digit", minute: "2-digit" });
        dateEl.textContent = now.toLocaleDateString(localeTag(), { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
        clockEl.title = now.toLocaleString(localeTag(), { weekday: "long", hour: "2-digit", minute: "2-digit" });
    }

    function renderCalendar() {
        const year = cursor.getFullYear();
        const month = cursor.getMonth();
        const first = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0).getDate();
        const start = mondayIndex(first.getDay());
        monthEl.textContent = cursor.toLocaleDateString(localeTag(), { month: "long", year: "numeric" });

        const mondayBase = new Date(2024, 0, 1); // Monday
        const dayNames = [];
        for (let i = 0; i < 7; i++) {
            dayNames.push(new Date(mondayBase.getFullYear(), mondayBase.getMonth(), mondayBase.getDate() + i).toLocaleDateString(localeTag(), { weekday: "short" }));
        }
        gridEl.innerHTML = dayNames.map((d) => `<div class="nx-cal-dow">${escapeHtml(d)}</div>`).join("");

        for (let i = 0; i < start; i++) {
            const pad = document.createElement("div");
            pad.className = "nx-cal-day is-empty";
            gridEl.appendChild(pad);
        }

        const todayIso = isoDate(new Date());
        for (let d = 1; d <= lastDay; d++) {
            const day = new Date(year, month, d);
            const dayIso = isoDate(day);
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "nx-cal-day nx-clock-day";
            if (dayIso === todayIso) btn.classList.add("is-today");
            if (dayIso === selectedIso) btn.classList.add("is-selected");
            btn.textContent = String(d);
            btn.addEventListener("click", () => {
                selectedIso = dayIso;
                renderCalendar();
            });
            gridEl.appendChild(btn);
        }
    }

    function renderNotifications() {
        notesEl.innerHTML = "";
        if (!notes.length) {
            notesEl.innerHTML = `<div class="muted">${text("clock_panel_empty", "No notifications.")}</div>`;
            clearBtn.disabled = true;
            return;
        }

        clearBtn.disabled = false;
        notes.slice(0, 6).forEach((n) => {
            const row = document.createElement("div");
            row.className = `nx-item nx-note-row nx-note-${n.type || "info"}`;
            const title = escapeHtml(n.title || text("taskbar_notifications", "Notifications"));
            const message = n.message ? `<div class="muted">${escapeHtml(n.message)}</div>` : "";
            const ts = new Date(n.ts).toLocaleTimeString(localeTag(), { hour: "2-digit", minute: "2-digit" });
            row.innerHTML = `
              <div class="nx-row">
                <div>
                  <div><b>${title}</b></div>
                  ${message}
                </div>
                <div class="muted">${ts}</div>
              </div>
            `;
            notesEl.appendChild(row);
        });
    }

    function openPanel() {
        isOpen = true;
        panel.classList.add("is-open");
        panel.setAttribute("aria-hidden", "false");
        clockEl.setAttribute("aria-expanded", "true");
    }

    function closePanel() {
        isOpen = false;
        panel.classList.remove("is-open");
        panel.setAttribute("aria-hidden", "true");
        clockEl.setAttribute("aria-expanded", "false");
    }

    function togglePanel() {
        if (isOpen) closePanel();
        else openPanel();
    }

    clockEl.addEventListener("click", (e) => {
        e.stopPropagation();
        togglePanel();
    });
    clockEl.addEventListener("keydown", (e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        togglePanel();
    });

    closeBtn.addEventListener("click", closePanel);
    clearBtn.addEventListener("click", () => clearNotifications());
    prevBtn.addEventListener("click", () => {
        cursor = new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1);
        renderCalendar();
    });
    nextBtn.addEventListener("click", () => {
        cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
        renderCalendar();
    });

    document.addEventListener("click", (e) => {
        if (!isOpen) return;
        if (panel.contains(e.target) || clockEl.contains(e.target)) return;
        closePanel();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && isOpen) closePanel();
    });

    subscribeNotifications((items) => {
        notes = Array.isArray(items) ? items : [];
        renderNotifications();
    });
    subscribeLocale(() => {
        renderLabels();
        renderNow();
        renderCalendar();
        renderNotifications();
    });

    renderLabels();
    renderNow();
    renderCalendar();
    renderNotifications();
    setInterval(renderNow, 15000);
}

function initPowerControls() {
    const desktop = document.getElementById("desktop");
    const brandBtn = document.getElementById("taskbar-brand");
    if (!desktop || !brandBtn) return;

    // Legacy layout cleanup (old inline power buttons in taskbar-right).
    document.getElementById("taskbar-power")?.remove();

    let menu = document.getElementById("taskbar-power-menu");
    if (!menu) {
        menu = document.createElement("div");
        menu.id = "taskbar-power-menu";
        menu.className = "nx-power-menu";
        menu.setAttribute("aria-hidden", "true");
        menu.innerHTML = `
          <button id="tb-restart" class="nx-pill nx-power-btn" type="button">Restart</button>
          <button id="tb-shutdown" class="nx-pill nx-power-btn nx-power-btn-danger" type="button">Vypnout</button>
        `;
        desktop.appendChild(menu);
    }

    let off = document.getElementById("power-off-screen");
    if (!off) {
        off = document.createElement("section");
        off.id = "power-off-screen";
        off.className = "nx-power-off-screen";
        off.innerHTML = `
          <div class="nx-power-off-shell">
            <div id="power-off-text" class="muted">System is off</div>
            <button id="power-on-btn" class="nx-power-on-btn" type="button">Power On</button>
          </div>
        `;
        document.body.appendChild(off);
    }

    const restartBtn = menu.querySelector("#tb-restart");
    const shutdownBtn = menu.querySelector("#tb-shutdown");
    const offText = document.getElementById("power-off-text");
    const onBtn = document.getElementById("power-on-btn");
    let menuOpen = false;

    function setPowerMenuOpen(next) {
        menuOpen = !!next;
        menu?.classList.toggle("is-open", menuOpen);
        menu?.setAttribute("aria-hidden", menuOpen ? "false" : "true");
        brandBtn?.setAttribute("aria-expanded", menuOpen ? "true" : "false");
    }

    function renderLabels() {
        if (restartBtn) restartBtn.textContent = text("taskbar_restart", "Restart");
        if (shutdownBtn) shutdownBtn.textContent = text("taskbar_shutdown", "Shutdown");
        if (onBtn) onBtn.textContent = text("power_on", "Power On");
        if (offText) offText.textContent = text("system_off", "System is off");
        if (brandBtn) {
            const startText = text("taskbar_start", "Start");
            brandBtn.title = startText;
            brandBtn.setAttribute("aria-label", startText);
        }
    }

    function setPoweredOff(next) {
        const isOff = !!next;
        off?.classList.toggle("is-on", isOff);
        document.body.classList.toggle("nx-system-off", isOff);
        if (isOff) setPowerMenuOpen(false);
        if (isOff) onBtn?.focus();
    }

    if (brandBtn && brandBtn.dataset.startWired !== "1") {
        brandBtn.dataset.startWired = "1";
        brandBtn.classList.add("is-clickable");
        brandBtn.setAttribute("role", "button");
        brandBtn.setAttribute("tabindex", "0");
        brandBtn.setAttribute("aria-haspopup", "menu");
        brandBtn.setAttribute("aria-expanded", "false");
        brandBtn.setAttribute("aria-label", text("taskbar_start", "Start"));
        brandBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            setPowerMenuOpen(!menuOpen);
        });
        brandBtn.addEventListener("keydown", (e) => {
            if (e.key !== "Enter" && e.key !== " ") return;
            e.preventDefault();
            setPowerMenuOpen(!menuOpen);
        });
    }
    restartBtn?.addEventListener("click", () => {
        setPowerMenuOpen(false);
        location.reload();
    });
    shutdownBtn?.addEventListener("click", () => {
        setPowerMenuOpen(false);
        setPoweredOff(true);
    });
    onBtn?.addEventListener("click", () => setPoweredOff(false));

    document.addEventListener("click", (e) => {
        if (!menuOpen) return;
        if (menu?.contains(e.target) || brandBtn?.contains(e.target)) return;
        setPowerMenuOpen(false);
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && menuOpen) setPowerMenuOpen(false);
    });

    subscribeLocale(renderLabels);
    renderLabels();
}

function initQuickActions() {
    const quickBtn = document.getElementById("taskbar-quick");
    if (!quickBtn) return;
    quickBtn.title = text("taskbar_quick", "Quick actions");

    const panel = document.createElement("div");
    panel.id = "quick-panel";
    panel.className = "nx-quick-panel";
    panel.setAttribute("aria-hidden", "true");
    panel.innerHTML = `
      <div class="nx-quick-head">
        <b id="qa-title"></b>
        <button class="nx-mini-btn" id="qa-close" title="">×</button>
      </div>
      <label class="nx-set-toggle"><input type="checkbox" id="qa-wifi" /> <span id="qa-wifi-label"></span></label>
      <label class="nx-set-toggle"><input type="checkbox" id="qa-dnd" /> <span id="qa-dnd-label"></span></label>
      <label class="nx-set-row"><span id="qa-bright-label"></span> <input type="range" id="qa-bright" class="nx-input" min="50" max="120" step="1" /></label>
      <button class="nx-mini-btn" id="qa-settings"></button>
      <button class="nx-mini-btn" id="qa-restart"></button>
    `;
    document.getElementById("desktop")?.appendChild(panel);

    const wifiEl = panel.querySelector("#qa-wifi");
    const dndEl = panel.querySelector("#qa-dnd");
    const brightEl = panel.querySelector("#qa-bright");
    const closeBtn = panel.querySelector("#qa-close");
    const titleEl = panel.querySelector("#qa-title");
    const wifiLabelEl = panel.querySelector("#qa-wifi-label");
    const dndLabelEl = panel.querySelector("#qa-dnd-label");
    const brightLabelEl = panel.querySelector("#qa-bright-label");
    const settingsBtn = panel.querySelector("#qa-settings");
    const restartBtn = panel.querySelector("#qa-restart");
    let panelOpen = false;

    function renderLabels() {
        quickBtn.title = text("taskbar_quick", "Quick actions");
        titleEl.textContent = text("quick_actions", "Quick Actions");
        closeBtn.title = text("quick_hide", "Hide panel");
        wifiLabelEl.textContent = text("quick_wifi", "Wi-Fi");
        dndLabelEl.textContent = text("quick_dnd", "Do not disturb");
        brightLabelEl.textContent = text("quick_brightness", "Brightness");
        settingsBtn.textContent = text("quick_open_settings", "Open Settings");
        restartBtn.textContent = text("quick_restart_ui", "Restart UI");
    }

    function openPanel() {
        panelOpen = true;
        panel.classList.add("is-open");
        panel.setAttribute("aria-hidden", "false");
        quickBtn.setAttribute("aria-expanded", "true");
    }

    function closePanel() {
        panelOpen = false;
        panel.classList.remove("is-open");
        panel.setAttribute("aria-hidden", "true");
        quickBtn.setAttribute("aria-expanded", "false");
    }

    function togglePanel() {
        if (panelOpen) closePanel();
        else openPanel();
    }

    function render() {
        const s = getOSState();
        wifiEl.checked = !!s.system.wifi;
        dndEl.checked = !!s.system.dnd;
        brightEl.value = String(s.system.brightness);
    }

    quickBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        togglePanel();
    });

    document.addEventListener("click", (e) => {
        if (!panelOpen) return;
        if (panel.contains(e.target) || quickBtn.contains(e.target)) return;
        closePanel();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && panelOpen) closePanel();
    });

    closeBtn.addEventListener("click", closePanel);

    wifiEl.addEventListener("change", () => updateOSState((draft) => { draft.system.wifi = wifiEl.checked; }));
    dndEl.addEventListener("change", () => updateOSState((draft) => { draft.system.dnd = dndEl.checked; }));
    brightEl.addEventListener("input", () => updateOSState((draft) => { draft.system.brightness = Number(brightEl.value); }));

    settingsBtn.addEventListener("click", () => {
        closePanel();
        openApp("settings");
    });
    restartBtn.addEventListener("click", () => location.reload());

    subscribeOSState(() => {
        applyVisualState();
        render();
    });
    subscribeLocale(() => renderLabels());

    renderLabels();
    render();
    closePanel();
}

function initNotificationUI() {
    initNotifications();

    const btn = document.getElementById("taskbar-notify");
    const count = document.getElementById("tb-notify-count");

    if (btn) {
        btn.addEventListener("click", () => openApp("notifications"));
    }

    subscribeNotifications((items) => {
        if (!count) return;
        const unread = items.length;
        count.textContent = String(unread);
        count.style.display = unread ? "inline-block" : "none";
    });
}

function restoreSession() {
    const state = getOSState();
    if (state.system.bootProfile === "safe") return;

    const windows = getSessionWindows();
    if (!windows?.length) return;

    for (const snap of windows) {
        if (!APP_CATALOG.find((a) => a.id === snap.id)) continue;
        if (!isAppInstalled(snap.id)) continue;
        openApp(snap.id, { state: snap });
    }
}

appContext = {
    wm,
    getState: getOSState,
    updateState: updateOSState,
    subscribeState: subscribeOSState,
    applyVisual: () => applyVisualState(),
    notify,
    clearNotifications,
    openApp,
    setInstalled: setAppInstalled,
    refreshLauncher: renderLauncher,
    catalog: APP_CATALOG,
    onUninstall: (id) => wm.close(id),
};

// expose for terminal and debugging
window.nexusOS = appContext;

applyVisualState();
initNotificationUI();
initClockPanel();
initPowerControls();
initQuickActions();
renderDesktopStaticText();
renderLauncher();

initWeatherUI({ wm });
try {
    initDesktopWidgets({ notify });
} catch (err) {
    console.error("[NexusOS] Widget manager init failed", err);
    notify({
        title: "Widgets",
        message: "Widget manager failed to initialize.",
        type: "error",
        force: true,
    });
}
initAppList({
    catalog: APP_CATALOG,
    openApp,
    isInstalled: isAppInstalled,
    subscribeState: subscribeOSState,
});

subscribeLocale(() => {
    localizeCatalog();
    renderDesktopStaticText();
    renderLauncher();
    window.dispatchEvent(new CustomEvent("nexus:catalog-updated"));
});

const uptimeEl = document.getElementById("nx-uptime");
setInterval(() => {
    if (!uptimeEl) return;
    const s = Math.floor(performance.now() / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const mm = String(m % 60).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    uptimeEl.textContent = `${h}:${mm}:${ss}`;
}, 1000);

restoreSession();

if (getOSState().system.bootProfile === "safe") {
    notify({
        title: text("safe_mode_title", "Boot Profile"),
        message: text("safe_mode_msg", "Safe mode is active."),
        type: "warn",
        force: true,
    });
}
