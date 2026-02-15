// resources/js/apps/terminal.js
import { calculateExpression } from "./calculator.js";
import { tr } from "../os/i18n.js";

const I18N = {
    cz: {
        shell_title: "NEXUS SHELL",
        core_ok: "core: ok",
        user: "user",
        shell_version: "NEXUS SHELL v0.2",
        intro_help: "Napiš 'help' pro seznam příkazů.",
        cmd_not_found: "Příkaz nenalezen: {cmd} (zkus 'help')",
        error: "Chyba: {msg}",
        help_text: `Dostupné příkazy:
  help                      Zobrazit nápovědu
  clear                     Vyčistit obrazovku
  whoami                    Aktuální uživatel
  pwd                       Aktuální adresář
  ls                        Vypsat položky (fake)
  cd <path>                 Změnit adresář (fake)
  date                      Vytisknout datum/čas
  echo <text>               Vypsat text
  neofetch                  Informace o systému
  open <app>                Otevřít nainstalovanou app
  apps                      Výpis katalogu app
  install <appId>           Instalovat app
  uninstall <appId>         Odinstalovat app
  calc <expr>               Rychlá kalkulačka
  theme [set <name>]        Zobrazit/nastavit téma
  notify <msg>              Poslat notifikaci
  snap <left|right|max>     Přichytit aktivní okno
  session clear             Vymazat uloženou session oken
  hint                      Rychlé tipy`,
        usage_cd: "Použití: cd <path>",
        usage_calc: "Použití: calc <výraz>",
        no_catalog: "Katalog není dostupný.",
        usage_install: "Použití: install <appId>",
        usage_uninstall: "Použití: uninstall <appId>",
        install_api_unavailable: "Install API není dostupné.",
        installed_line: "Nainstalováno: {id}",
        uninstalled_line: "Odinstalováno: {id}",
        current_theme: "Aktuální téma: {theme}",
        usage_theme: "Použití: theme set <cyan|amber|mono>",
        theme_must: "Téma musí být: cyan | amber | mono",
        theme_set: "Téma přepnuto na {name}",
        usage_notify: "Použití: notify <zpráva>",
        notify_pushed: "Notifikace odeslána.",
        no_active_window: "Žádné aktivní okno.",
        snapped: "Přichyceno {mode}.",
        toggled_max: "Přepnuto maximalizování.",
        usage_snap: "Použití: snap <left|right|max>",
        session_cleared: "Uložená session vymazána.",
        usage_session_clear: "Použití: session clear",
        usage_open: "Použití: open <appId>",
        open_api_unavailable: "Open API není dostupné.",
        hint: "Zkus: open explorer | open notes | calc 2+2 | theme set amber",
        apps_installed: "{n} nainstalováno",
    },
    en: {
        shell_title: "NEXUS SHELL",
        core_ok: "core: ok",
        user: "user",
        shell_version: "NEXUS SHELL v0.2",
        intro_help: "Type 'help' to list commands.",
        cmd_not_found: "Command not found: {cmd} (try 'help')",
        error: "Error: {msg}",
        help_text: `Available commands:
  help                      Show this help
  clear                     Clear screen
  whoami                    Current user
  pwd                       Print working directory
  ls                        List items (fake)
  cd <path>                 Change directory (fake)
  date                      Print date/time
  echo <text>               Print text
  neofetch                  System info
  open <app>                Open installed app
  apps                      List app catalog
  install <appId>           Install app
  uninstall <appId>         Uninstall app
  calc <expr>               Quick calculator
  theme [set <name>]        Get/set theme
  notify <msg>              Push notification
  snap <left|right|max>     Snap active window
  session clear             Clear saved window session
  hint                      Quick navigation hints`,
        usage_cd: "Usage: cd <path>",
        usage_calc: "Usage: calc <expression>",
        no_catalog: "No catalog available.",
        usage_install: "Usage: install <appId>",
        usage_uninstall: "Usage: uninstall <appId>",
        install_api_unavailable: "Install API unavailable.",
        installed_line: "Installed: {id}",
        uninstalled_line: "Uninstalled: {id}",
        current_theme: "Current theme: {theme}",
        usage_theme: "Usage: theme set <cyan|amber|mono>",
        theme_must: "Theme must be: cyan | amber | mono",
        theme_set: "Theme set to {name}",
        usage_notify: "Usage: notify <message>",
        notify_pushed: "Notification pushed.",
        no_active_window: "No active window.",
        snapped: "Snapped {mode}.",
        toggled_max: "Toggled maximize.",
        usage_snap: "Usage: snap <left|right|max>",
        session_cleared: "Saved session cleared.",
        usage_session_clear: "Usage: session clear",
        usage_open: "Usage: open <appId>",
        open_api_unavailable: "Open API unavailable.",
        hint: "Try: open explorer | open notes | calc 2+2 | theme set amber",
        apps_installed: "{n} installed",
    },
};

function t(key, fallback = "") {
    return tr(I18N, key, fallback || key);
}

function fmt(key, vars = {}, fallback = "") {
    let msg = t(key, fallback);
    for (const [k, v] of Object.entries(vars)) msg = msg.replace(`{${k}}`, String(v));
    return msg;
}

export function openTerminal(env) {
    const root = document.createElement("div");
    root.className = "nx-term nx-terminal";

    root.innerHTML = `
    <div class="nx-term-header">
      <div class="nx-term-title">${t("shell_title", "NEXUS SHELL")}</div>
      <div class="nx-term-meta">
        <span class="pill">${t("core_ok", "core: ok")}</span>
        <span class="pill">${t("user", "user")}: exp</span>
      </div>
    </div>

    <div class="nx-term-output" role="log" aria-live="polite"></div>

    <div class="nx-term-row nx-term-inputrow">
      <span class="nx-term-prompt">exp@nexus:~$</span>
      <div class="nx-term-field">
        <input class="nx-term-input" type="text" spellcheck="false" autocomplete="off" />
      </div>
    </div>
  `;

    const out = root.querySelector(".nx-term-output");
    const input = root.querySelector(".nx-term-input");

    const state = {
        history: [],
        historyIndex: -1,
        cwd: "/home/exp",
        user: "exp",
    };

    const ctx = resolveCtx(env);
    const commands = buildCommands({ ctx, state, print, println, clear });

    println(t("shell_version", "NEXUS SHELL v0.2"));
    println(t("intro_help", "Type 'help' to list commands."));
    println("");

    input.focus();

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const line = input.value.trim();
            if (!line) return;

            println(renderPrompt(state) + " " + escapeHtml(line));

            state.history.push(line);
            state.historyIndex = state.history.length;
            input.value = "";

            runLine(line);
            out.scrollTop = out.scrollHeight;
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            if (!state.history.length) return;
            state.historyIndex = Math.max(0, state.historyIndex - 1);
            input.value = state.history[state.historyIndex] ?? "";
            queueCursorToEnd(input);
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            if (!state.history.length) return;
            state.historyIndex = Math.min(state.history.length, state.historyIndex + 1);
            input.value = state.history[state.historyIndex] ?? "";
            queueCursorToEnd(input);
        }

        if (e.key === "Tab") {
            e.preventDefault();
            const cur = input.value;
            const [first, ...rest] = cur.split(/\s+/);
            if (rest.length > 0) return;
            const hits = Object.keys(commands).filter((k) => k.startsWith(first));
            if (hits.length === 1) input.value = hits[0] + " ";
            else if (hits.length > 1) println(hits.join("  "));
        }
    });

    function runLine(line) {
        const { cmd, args } = parse(line);
        if (!cmd) return;

        const fn = commands[cmd];
        if (!fn) {
            println(fmt("cmd_not_found", { cmd: escapeHtml(cmd) }, `Command not found: ${escapeHtml(cmd)} (try 'help')`));
            return;
        }

        try {
            fn(args);
        } catch (err) {
            println(fmt("error", { msg: escapeHtml(String(err?.message ?? err)) }, `Error: ${escapeHtml(String(err?.message ?? err))}`));
        }
    }

    function print(html) {
        const div = document.createElement("div");
        div.className = "nx-term-line";
        div.innerHTML = html;
        out.appendChild(div);
    }

    function println(text) {
        print(escapeHtml(text).replace(/\n/g, "<br>"));
    }

    function clear() {
        out.innerHTML = "";
    }

    return root;
}

function resolveCtx(env) {
    const globalCtx = window.nexusOS || {};
    const wm = env?.wm || globalCtx.wm || env;
    return {
        ...globalCtx,
        ...env,
        wm,
    };
}

function buildCommands({ ctx, state, print, println, clear }) {
    return {
        help: () => {
            println(t("help_text", "Available commands"));
        },

        clear: () => clear(),
        whoami: () => println(state.user),
        pwd: () => println(state.cwd),

        ls: () => {
            const items = ["docs/", "projects/", "pipelines/", "games/", "cv.nxdoc", "readme.txt"];
            println(items.join("  "));
        },

        cd: (args) => {
            const p = args[0];
            if (!p) { println(t("usage_cd", "Usage: cd <path>")); return; }
            if (p === "~") state.cwd = "/home/exp";
            else if (p === "/") state.cwd = "/";
            else if (p === "..") state.cwd = parentDir(state.cwd);
            else if (p.startsWith("/")) state.cwd = normalize(p);
            else state.cwd = normalize(state.cwd + "/" + p);
            println(state.cwd);
        },

        date: () => println(new Date().toString()),
        echo: (args) => println(args.join(" ")),

        calc: (args) => {
            if (!args.length) { println(t("usage_calc", "Usage: calc <expression>")); return; }
            const expr = args.join(" ");
            const out = calculateExpression(expr);
            println(String(out));
        },

        apps: () => {
            const catalog = ctx.catalog || [];
            const installed = ctx.getState ? ctx.getState().installedApps : {};
            if (!catalog.length) {
                println(t("no_catalog", "No catalog available."));
                return;
            }
            catalog.forEach((app) => {
                const mark = installed?.[app.id] || app.core ? "[x]" : "[ ]";
                println(`${mark} ${app.id.padEnd(14)} ${app.title}`);
            });
        },

        install: (args) => {
            const id = (args[0] || "").trim();
            if (!id) { println(t("usage_install", "Usage: install <appId>")); return; }
            if (!ctx.setInstalled) { println(t("install_api_unavailable", "Install API unavailable.")); return; }
            ctx.setInstalled(id, true);
            ctx.refreshLauncher?.();
            ctx.notify?.({ title: "Terminal", message: fmt("installed_line", { id }, `${id} installed.`), type: "info" });
            println(fmt("installed_line", { id }, `Installed: ${id}`));
        },

        uninstall: (args) => {
            const id = (args[0] || "").trim();
            if (!id) { println(t("usage_uninstall", "Usage: uninstall <appId>")); return; }
            if (!ctx.setInstalled) { println(t("install_api_unavailable", "Install API unavailable.")); return; }
            ctx.setInstalled(id, false);
            ctx.onUninstall?.(id);
            ctx.refreshLauncher?.();
            ctx.notify?.({ title: "Terminal", message: fmt("uninstalled_line", { id }, `${id} uninstalled.`), type: "warn" });
            println(fmt("uninstalled_line", { id }, `Uninstalled: ${id}`));
        },

        theme: (args) => {
            const st = ctx.getState?.();
            if (!args.length) {
                println(fmt("current_theme", { theme: st?.ui?.theme || "unknown" }, `Current theme: ${st?.ui?.theme || "unknown"}`));
                return;
            }
            if (args[0] !== "set") {
                println(t("usage_theme", "Usage: theme set <cyan|amber|mono>"));
                return;
            }
            const name = args[1];
            if (!["cyan", "amber", "mono"].includes(name)) {
                println(t("theme_must", "Theme must be: cyan | amber | mono"));
                return;
            }
            ctx.updateState?.((draft) => { draft.ui.theme = name; });
            ctx.applyVisual?.();
            println(fmt("theme_set", { name }, `Theme set to ${name}`));
        },

        notify: (args) => {
            const msg = args.join(" ").trim();
            if (!msg) { println(t("usage_notify", "Usage: notify <message>")); return; }
            ctx.notify?.({ title: "Terminal", message: msg, type: "info" });
            println(t("notify_pushed", "Notification pushed."));
        },

        snap: (args) => {
            const mode = (args[0] || "").toLowerCase();
            if (!ctx.wm?.activeId) { println(t("no_active_window", "No active window.")); return; }
            if (mode === "left" || mode === "right") {
                ctx.wm.snap(ctx.wm.activeId, mode);
                println(fmt("snapped", { mode }, `Snapped ${mode}.`));
                return;
            }
            if (mode === "max") {
                ctx.wm.toggleMaximize(ctx.wm.activeId);
                println(t("toggled_max", "Toggled maximize."));
                return;
            }
            println(t("usage_snap", "Usage: snap <left|right|max>"));
        },

        session: (args) => {
            if (args[0] === "clear") {
                ctx.updateState?.((draft) => { draft.session.windows = []; });
                println(t("session_cleared", "Saved session cleared."));
                return;
            }
            println(t("usage_session_clear", "Usage: session clear"));
        },

        neofetch: () => {
            const s = ctx.getState?.() || {};
            const installedCount = Object.values(s.installedApps || {}).filter(Boolean).length;
            let user = s.system?.profile || "admin";
            try {
                const raw = localStorage.getItem("nexus.auth.session.v1");
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (parsed?.user) user = parsed.user;
                }
            } catch {
                // no-op
            }
            print(`
            <div style="display:flex; gap:24px; align-items:flex-start;">
                <pre class="nx-term-pre" style="margin:0; line-height:1.1;">
            <span style="color:#22D3EE;">        ●●●●●        </span>
            <span style="color:#22D3EE;">    ●●●●●●●●●●●    </span>
            <span style="color:#22D3EE;">  ●●●●</span><span style="color:#34D399;">   NEXUS   </span><span style="color:#22D3EE;">●●●●  </span>
            <span style="color:#22D3EE;"> ●●●</span><span style="color:#34D399;">   CORE    </span><span style="color:#22D3EE;">●●● </span>
            <span style="color:#22D3EE;">  ●●●●</span><span style="color:#06B6D4;">   EXPE    </span><span style="color:#22D3EE;">●●●●  </span>
            <span style="color:#22D3EE;">    ●●●●●●●●●●●    </span>
            <span style="color:#22D3EE;">        ●●●●●        </span>
                </pre>
                <div style="font-family:ui-monospace; font-size:13px;">
                <div><span style="color:#22D3EE;">OS:</span> NEXUS // EXPE SYSTEM</div>
                <div><span style="color:#22D3EE;">User:</span> ${escapeHtml(String(user))}</div>
                <div><span style="color:#22D3EE;">Shell:</span> Nexus Shell v0.2</div>
                <div><span style="color:#22D3EE;">Theme:</span> ${escapeHtml(s.ui?.theme || "cyan")}</div>
                <div><span style="color:#22D3EE;">Boot:</span> ${escapeHtml(s.system?.bootProfile || "normal")}</div>
                <div><span style="color:#22D3EE;">Lang:</span> ${escapeHtml(s.system?.language || "cz")}</div>
                <div><span style="color:#22D3EE;">Apps:</span> ${fmt("apps_installed", { n: installedCount }, `${installedCount} installed`)}</div>
                <div><span style="color:#22D3EE;">Uptime:</span> ${Math.floor(performance.now() / 1000)}s</div>
                </div>
            </div>
            `);
        },

        open: (args) => {
            const raw = (args[0] || "").toLowerCase();
            const alias = {
                "2048": "game2048",
                files: "explorer",
                file: "explorer",
                store: "appstore",
                processes: "process",
                notif: "notifications",
            };
            const app = alias[raw] || raw;
            if (!app) { println(t("usage_open", "Usage: open <appId>")); return; }
            if (!ctx.openApp) {
                println(t("open_api_unavailable", "Open API unavailable."));
                return;
            }
            ctx.openApp(app);
        },

        hint: () => {
            println(t("hint", "Try: open explorer | open notes | calc 2+2 | theme set amber"));
        },
    };
}

function renderPrompt(state) {
    return `<span class="nx-term-prompt">${escapeHtml(state.user)}@nexus:${escapeHtml(shortCwd(state.cwd))}$</span>`;
}

function parse(line) {
    const parts = line.split(/\s+/).filter(Boolean);
    const cmd = (parts.shift() || "").toLowerCase();
    return { cmd, args: parts };
}

function queueCursorToEnd(input) {
    queueMicrotask(() => {
        input.selectionStart = input.selectionEnd = input.value.length;
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

function parentDir(path) {
    if (path === "/") return "/";
    const parts = path.split("/").filter(Boolean);
    parts.pop();
    return "/" + parts.join("/");
}

function normalize(path) {
    const parts = path.split("/").filter(Boolean);
    const out = [];
    for (const p of parts) {
        if (p === ".") continue;
        if (p === "..") out.pop();
        else out.push(p);
    }
    return "/" + out.join("/");
}

function shortCwd(cwd) {
    if (cwd === "/home/exp") return "~";
    if (cwd.startsWith("/home/exp/")) return "~/" + cwd.slice("/home/exp/".length);
    return cwd;
}
