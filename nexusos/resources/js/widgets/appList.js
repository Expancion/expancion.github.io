// resources/js/widgets/appList.js
import { subscribeLocale, tr } from "../os/i18n.js";

const I18N = {
    cz: {
        title: "Aplikace",
        subtitle: "Launchpad styl prohlížeče aplikací",
        close: "Zavřít",
        search_placeholder: "Hledat aplikace, moduly, nástroje...",
        no_match: "Žádné odpovídající aplikace.",
        no_apps: "Žádné aplikace.",
        group_core_title: "Core",
        group_core_sub: "Systémová vrstva",
        group_productivity_title: "Produktivita",
        group_productivity_sub: "Nástroje a workflow",
        group_games_title: "Hry",
        group_games_sub: "Arcade aplikace",
        trigger_title: "Seznam aplikací",
    },
    en: {
        title: "Applications",
        subtitle: "Launchpad style app browser",
        close: "Close",
        search_placeholder: "Search apps, modules, tools...",
        no_match: "No matching apps.",
        no_apps: "No apps.",
        group_core_title: "Core",
        group_core_sub: "System layer",
        group_productivity_title: "Productivity",
        group_productivity_sub: "Tools and workflow",
        group_games_title: "Games",
        group_games_sub: "Arcade apps",
        trigger_title: "AppList",
    },
};

function t(key, fallback = "") {
    return tr(I18N, key, fallback || key);
}

export function initAppList({ catalog = [], openApp, isInstalled, subscribeState } = {}) {
    const desktop = document.getElementById("desktop");
    const taskbar = document.getElementById("taskbar");
    if (!desktop || !taskbar || typeof openApp !== "function") return;

    if (document.getElementById("taskbar-applist")) return;

    const trigger = document.createElement("button");
    trigger.id = "taskbar-applist";
    trigger.className = "nx-pill nx-applist-toggle";
    trigger.type = "button";
    trigger.title = t("trigger_title", "AppList");
    trigger.textContent = "◎";

    const taskbarApps = document.getElementById("taskbar-apps");
    if (taskbarApps?.nextSibling) taskbar.insertBefore(trigger, taskbarApps.nextSibling);
    else taskbar.appendChild(trigger);

    const overlay = document.createElement("div");
    overlay.id = "applist-overlay";
    overlay.className = "nx-applist-overlay";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = `
      <div class="nx-applist-panel">
        <div class="nx-applist-head">
          <div>
            <div id="applist-title" class="nx-applist-title"></div>
            <div id="applist-subtitle" class="muted"></div>
          </div>
          <button type="button" class="nx-mini-btn" id="applist-close"></button>
        </div>
        <div class="nx-applist-search-wrap">
          <input id="applist-search" class="nx-input nx-applist-search" />
        </div>
        <div id="applist-entities" class="nx-applist-entities"></div>
      </div>
    `;
    desktop.appendChild(overlay);

    const closeBtn = overlay.querySelector("#applist-close");
    const titleEl = overlay.querySelector("#applist-title");
    const subtitleEl = overlay.querySelector("#applist-subtitle");
    const searchInput = overlay.querySelector("#applist-search");
    const entitiesEl = overlay.querySelector("#applist-entities");
    let isOpen = false;

    function groups() {
        return [
            { id: "core", title: t("group_core_title", "Core"), subtitle: t("group_core_sub", "System layer") },
            { id: "productivity", title: t("group_productivity_title", "Productivity"), subtitle: t("group_productivity_sub", "Tools and workflow") },
            { id: "games", title: t("group_games_title", "Games"), subtitle: t("group_games_sub", "Arcade apps") },
        ];
    }

    function classifyGroup(app) {
        if (["snake", "game2048", "tetris"].includes(app.id)) return "games";
        if (app.core || ["terminal", "settings", "explorer", "notifications", "process", "appstore"].includes(app.id)) return "core";
        return "productivity";
    }

    function listApps(query = "") {
        const q = String(query || "").toLowerCase().trim();
        return catalog.filter((app) => {
            const installed = typeof isInstalled === "function" ? isInstalled(app.id) : true;
            if (!app.core && !installed) return false;
            if (!q) return true;
            return (
                app.title.toLowerCase().includes(q)
                || app.id.toLowerCase().includes(q)
                || app.desc.toLowerCase().includes(q)
            );
        });
    }

    function renderEntities(query = "") {
        const items = listApps(query);
        entitiesEl.innerHTML = "";
        if (!items.length) {
            entitiesEl.innerHTML = `<div class="muted">${escapeHtml(t("no_match", "No matching apps."))}</div>`;
            return;
        }

        const gList = groups();
        const grouped = new Map(gList.map((g) => [g.id, []]));
        for (const app of items) {
            const groupId = classifyGroup(app);
            if (!grouped.has(groupId)) grouped.set(groupId, []);
            grouped.get(groupId).push(app);
        }

        for (const group of gList) {
            const section = document.createElement("section");
            section.className = "nx-applist-entity";

            const apps = grouped.get(group.id) || [];
            const head = document.createElement("div");
            head.className = "nx-applist-entity-head";
            head.innerHTML = `
              <div class="nx-applist-entity-title">${escapeHtml(group.title)}</div>
              <div class="muted">${escapeHtml(group.subtitle)}</div>
            `;
            section.appendChild(head);

            const grid = document.createElement("div");
            grid.className = "nx-applist-grid";

            if (!apps.length) {
                grid.innerHTML = `<div class="muted">${escapeHtml(t("no_apps", "No apps."))}</div>`;
            } else {
                for (const app of apps) {
                    const btn = document.createElement("button");
                    btn.type = "button";
                    btn.className = "nx-applist-item";
                    btn.innerHTML = `
                      <span class="nx-applist-icon">${escapeHtml(app.icon)}</span>
                      <span class="nx-applist-name">${escapeHtml(app.title)}</span>
                    `;
                    btn.addEventListener("click", () => {
                        close();
                        openApp(app.id);
                    });
                    grid.appendChild(btn);
                }
            }
            section.appendChild(grid);
            entitiesEl.appendChild(section);
        }
    }

    function open() {
        isOpen = true;
        overlay.classList.add("is-open");
        overlay.setAttribute("aria-hidden", "false");
        trigger.setAttribute("aria-expanded", "true");
        requestAnimationFrame(() => searchInput.focus());
    }

    function close() {
        isOpen = false;
        overlay.classList.remove("is-open");
        overlay.setAttribute("aria-hidden", "true");
        trigger.setAttribute("aria-expanded", "false");
    }

    function toggle() {
        if (isOpen) close();
        else open();
    }

    function renderLocale() {
        trigger.title = t("trigger_title", "AppList");
        titleEl.textContent = t("title", "Applications");
        subtitleEl.textContent = t("subtitle", "Launchpad style app browser");
        closeBtn.textContent = t("close", "Close");
        searchInput.placeholder = t("search_placeholder", "Search apps, modules, tools...");
    }

    trigger.addEventListener("click", (e) => {
        e.stopPropagation();
        toggle();
    });
    closeBtn.addEventListener("click", close);

    searchInput.addEventListener("input", () => renderEntities(searchInput.value));

    document.addEventListener("click", (e) => {
        if (!isOpen) return;
        if (overlay.querySelector(".nx-applist-panel").contains(e.target)) return;
        if (trigger.contains(e.target)) return;
        close();
    });

    document.addEventListener("keydown", (e) => {
        if (!isOpen) return;
        if (e.key === "Escape") close();
    });

    if (typeof subscribeState === "function") {
        subscribeState(() => renderEntities(searchInput.value));
    }
    window.addEventListener("nexus:catalog-updated", () => renderEntities(searchInput.value));

    subscribeLocale(() => {
        renderLocale();
        renderEntities(searchInput.value);
    });

    renderLocale();
    renderEntities("");
}

function escapeHtml(s) {
    return String(s)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
