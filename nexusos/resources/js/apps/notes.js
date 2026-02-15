// resources/js/apps/notes.js
import { tr } from "../os/i18n.js";

const I18N = {
    cz: {
        title: "Poznámky",
        autosave: "Automatické ukládání zapnuto",
        clear: "Vymazat",
        placeholder: "Napiš něco...",
        idle: "Nečinné.",
        saving: "Ukládám...",
        saved: "Uloženo.",
        cleared: "Vymazáno.",
    },
    en: {
        title: "Notes",
        autosave: "Autosave enabled",
        clear: "Clear",
        placeholder: "Write something...",
        idle: "Idle.",
        saving: "Saving...",
        saved: "Saved.",
        cleared: "Cleared.",
    },
};

function t(key, fallback = "") {
    return tr(I18N, key, fallback || key);
}

export function openNotes(ctx = {}) {
    const root = document.createElement("div");
    root.className = "nx-notes";

    root.innerHTML = `
      <div class="nx-game-top">
        <div><b>${t("title", "Notes")}</b> <span class="muted">${t("autosave", "Autosave enabled")}</span></div>
        <button class="nx-mini-btn" id="nt-clear">${t("clear", "Clear")}</button>
      </div>
      <textarea class="nx-notes-area" id="nt-area" placeholder="${t("placeholder", "Write something...")}"></textarea>
      <div class="nx-game-bottom muted" id="nt-status">${t("idle", "Idle.")}</div>
    `;

    const area = root.querySelector("#nt-area");
    const status = root.querySelector("#nt-status");
    const clearBtn = root.querySelector("#nt-clear");

    function load() {
        const s = ctx.getState ? ctx.getState() : null;
        area.value = s?.notes || "";
    }

    let saveTimer = null;
    area.addEventListener("input", () => {
        status.textContent = t("saving", "Saving...");
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
            if (ctx.updateState) {
                ctx.updateState((draft) => {
                    draft.notes = area.value;
                });
            }
            status.textContent = t("saved", "Saved.");
        }, 180);
    });

    clearBtn.addEventListener("click", () => {
        area.value = "";
        if (ctx.updateState) {
            ctx.updateState((draft) => {
                draft.notes = "";
            });
        }
        status.textContent = t("cleared", "Cleared.");
    });

    load();
    return root;
}
