// resources/js/apps/explorer.js
import { tr } from "../os/i18n.js";

const I18N = {
    cz: {
        welcome: "Vítej v Nexus Exploreru.\nPoužij to jako svůj fake filesystem.",
        todo: "- Sestavit fake OS\n- Přidat aplikace\n- Vydat",
        readme: "V tomto mock buildu nejsou binární soubory.",
        note: "Soubor poznámky průzkumníka",
        up: "Nahoru",
        select_file: "Vyber soubor…",
        not_found: "Nenalezeno.",
        folder: "složka",
        items: "položek",
        mounted: "Fake filesystem připojen.",
    },
    en: {
        welcome: "Welcome to Nexus Explorer.\nUse this as your fake filesystem.",
        todo: "- Build fake OS\n- Add apps\n- Ship",
        readme: "No binary files in this mock build.",
        note: "Explorer note file",
        up: "Up",
        select_file: "Select a file…",
        not_found: "Not found.",
        folder: "folder",
        items: "item(s)",
        mounted: "Fake filesystem mounted.",
    },
};

function t(key, fallback = "") {
    return tr(I18N, key, fallback || key);
}

const FS = {
    home: {
        type: "dir",
        children: {
            docs: {
                type: "dir",
                children: {
                    "welcome.txt": { type: "text", content: "" },
                    "todo.md": { type: "text", content: "" },
                },
            },
            projects: {
                type: "dir",
                children: {
                    "nexus-os.json": { type: "json", content: { version: "0.9", mode: "prototype", modules: 12 } },
                },
            },
            media: {
                type: "dir",
                children: {
                    "readme.txt": { type: "text", content: "" },
                },
            },
            "notes.txt": { type: "text", content: "" },
        },
    },
};

function pathParts(path) {
    return path.split("/").filter(Boolean);
}

function getNode(path) {
    const parts = pathParts(path);
    let node = { type: "dir", children: FS };
    for (const p of parts) {
        if (node.type !== "dir") return null;
        node = node.children?.[p];
        if (!node) return null;
    }
    return node;
}

export function openExplorer(ctx = {}) {
    FS.home.children.docs.children["welcome.txt"].content = t("welcome");
    FS.home.children.docs.children["todo.md"].content = t("todo");
    FS.home.children.media.children["readme.txt"].content = t("readme");
    FS.home.children["notes.txt"].content = t("note");

    const root = document.createElement("div");
    root.className = "nx-explorer";

    root.innerHTML = `
      <div class="nx-explorer-head">
        <button class="nx-mini-btn" id="ex-up">${t("up", "Up")}</button>
        <div class="nx-explorer-path" id="ex-path">/</div>
      </div>
      <div class="nx-explorer-main">
        <div class="nx-explorer-list" id="ex-list"></div>
        <pre class="nx-explorer-preview" id="ex-preview">${t("select_file", "Select a file…")}</pre>
      </div>
    `;

    const pathEl = root.querySelector("#ex-path");
    const listEl = root.querySelector("#ex-list");
    const previewEl = root.querySelector("#ex-preview");
    const upBtn = root.querySelector("#ex-up");

    let cwd = "/home";

    function renderPreview(node, name) {
        if (!node) {
            previewEl.textContent = t("not_found", "Not found.");
            return;
        }

        if (node.type === "dir") {
            const count = Object.keys(node.children || {}).length;
            previewEl.textContent = `${name || t("folder", "folder")}/\n${count} ${t("items", "item(s)")}`;
            return;
        }

        if (node.type === "json") {
            previewEl.textContent = JSON.stringify(node.content, null, 2);
            return;
        }

        previewEl.textContent = String(node.content || "");
    }

    function openItem(name) {
        const nextPath = `${cwd.replace(/\/$/, "")}/${name}`;
        const node = getNode(nextPath);
        if (!node) return;

        if (node.type === "dir") {
            cwd = nextPath;
            render();
            return;
        }

        renderPreview(node, name);
    }

    function render() {
        const node = getNode(cwd);
        if (!node || node.type !== "dir") {
            cwd = "/";
            return render();
        }

        pathEl.textContent = cwd;
        listEl.innerHTML = "";

        const entries = Object.entries(node.children || {})
            .sort((a, b) => {
                const ad = a[1].type === "dir" ? 0 : 1;
                const bd = b[1].type === "dir" ? 0 : 1;
                if (ad !== bd) return ad - bd;
                return a[0].localeCompare(b[0]);
            });

        for (const [name, child] of entries) {
            const row = document.createElement("button");
            row.className = "nx-explorer-item";
            row.innerHTML = `<span>${child.type === "dir" ? "📁" : "📄"}</span><span>${name}</span>`;
            row.addEventListener("click", () => openItem(name));
            listEl.appendChild(row);
        }

        renderPreview(node, cwd);
    }

    upBtn.addEventListener("click", () => {
        const parts = pathParts(cwd);
        if (!parts.length) return;
        parts.pop();
        cwd = `/${parts.join("/")}`;
        render();
    });

    render();
    if (ctx.notify) ctx.notify({ title: "Explorer", message: t("mounted", "Fake filesystem mounted."), type: "info" });
    return root;
}
