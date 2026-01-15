import { setLang, t } from "./i18n.js";

const output = document.getElementById("terminal-output");
const input = document.getElementById("terminal-input");
const inputLine = document.querySelector(".terminal-input-line");
const promptText =
  document.querySelector(".terminal-prompt")?.textContent?.trim() ||
  "martin@kliment.xyz:~$";

const STOPWORDS = new Set(["list", "all", "show"]);
const ALIASES = {
  modules: "nexus",
  module: "nexus",
  project: "nexus",
  projects: "nexus",
  tools: "nexus",
};

const isWhitespace = (char) =>
  char === " " || char === "\t" || char === "\n" || char === "\r";

const collapseSpaces = (value) => {
  let out = "";
  let sawSpace = false;

  for (let i = 0; i < value.length; i += 1) {
    const char = value[i];
    if (isWhitespace(char)) {
      if (!sawSpace) {
        out += " ";
        sawSpace = true;
      }
      continue;
    }
    sawSpace = false;
    out += char;
  }

  return out;
};

const tokenize = (inputValue) => {
  const tokens = [];
  let current = "";

  for (let i = 0; i < inputValue.length; i += 1) {
    const char = inputValue[i];
    if (isWhitespace(char)) {
      if (current) {
        tokens.push(current);
        current = "";
      }
      continue;
    }
    current += char;
  }

  if (current) tokens.push(current);
  return tokens;
};

const parseCommand = (rawInput) => {
  const trimmed = rawInput.trim();
  const normalized = collapseSpaces(trimmed);
  const rawTokens = tokenize(normalized);
  const lowerTokens = rawTokens.map((token) => token.toLowerCase());

  let rawCmd = lowerTokens[0] || "";
  if (rawCmd.startsWith("/")) rawCmd = rawCmd.slice(1);

  const rawArgs = lowerTokens.slice(1);
  const args = rawArgs.filter((token) => !STOPWORDS.has(token));
  const cmd = ALIASES[rawCmd] || rawCmd;

  let aliasArgs = [];
  if (rawCmd === "projects") aliasArgs = ["projects"];
  if (rawCmd === "tools") aliasArgs = ["tools"];

  const searchIndex = rawArgs.indexOf("search");
  const searchQuery =
    searchIndex >= 0 ? rawTokens.slice(searchIndex + 2).join(" ").trim() : "";

  return {
    cmd,
    args,
    rawCmd,
    rawArgs,
    aliasArgs,
    searchQuery,
  };
};

const formatTemplate = (template, vars = {}) => {
  if (typeof template !== "string") return "";
  return template.replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? "");
};

const getTerminalData = () => t("terminal") || {};

const createLine = (text = "") => {
  const line = document.createElement("div");
  line.textContent = text === "" ? " " : text;
  return line;
};

const createStrongLine = (text) => {
  const line = document.createElement("div");
  const strong = document.createElement("strong");
  strong.textContent = text || "";
  line.appendChild(strong);
  return line;
};

const createDimLine = (text) => {
  const line = createLine(text);
  line.classList.add("dim");
  return line;
};

const createCommandLine = (cmd, desc) => {
  const line = document.createElement("div");
  const cmdSpan = document.createElement("span");
  cmdSpan.className = "cmd";
  cmdSpan.textContent = cmd;
  line.appendChild(cmdSpan);
  if (desc) {
    line.appendChild(document.createTextNode(` - ${desc}`));
  }
  return line;
};

const createTitleLine = (title, subtitle) => {
  const line = document.createElement("div");
  if (title) {
    const strong = document.createElement("strong");
    strong.textContent = title;
    line.appendChild(strong);
  }
  if (subtitle) {
    if (title) line.appendChild(document.createTextNode(" - "));
    line.appendChild(document.createTextNode(subtitle));
  }
  return line;
};

const createLinkLine = (label, text, href) => {
  const line = document.createElement("div");
  if (label) {
    line.appendChild(document.createTextNode(`${label}: `));
  }
  const link = document.createElement("a");
  link.href = href;
  link.textContent = text || href;
  link.target = "_blank";
  link.rel = "noopener";
  line.appendChild(link);
  return line;
};

const printLines = (lines) => {
  if (!output) return;
  const items = Array.isArray(lines) ? lines : [lines];
  items.forEach((item) => {
    if (!item && item !== "") return;
    if (item instanceof Node) {
      output.appendChild(item);
    } else {
      output.appendChild(createLine(item));
    }
  });
  output.scrollTop = output.scrollHeight;
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const animateStatus = async (message, options = {}) => {
  if (!output || !message) return;
  const { duration = 700, interval = 220, maxDots = 3 } = options;

  const line = document.createElement("div");
  line.className = "terminal-status";
  const textSpan = document.createElement("span");
  textSpan.className = "status-text";
  textSpan.textContent = message;
  const dots = document.createElement("span");
  dots.className = "status-dots";
  line.append(textSpan, dots);

  output.appendChild(line);
  output.scrollTop = output.scrollHeight;

  let count = 0;
  const timer = setInterval(() => {
    count = (count + 1) % (maxDots + 1);
    dots.textContent = ".".repeat(count);
  }, interval);

  await wait(duration);
  clearInterval(timer);
  dots.textContent = ".".repeat(maxDots);
};

const animateStatusKey = async (key, options) => {
  const message = t(key);
  if (!message) return;
  await animateStatus(message, options);
};

const printPromptLine = (value) => {
  const line = document.createElement("div");
  const promptSpan = document.createElement("span");
  promptSpan.className = "dim";
  promptSpan.textContent = promptText;
  line.append(promptSpan, document.createTextNode(` ${value}`));
  printLines(line);
};

const updateCaret = () => {
  if (!inputLine || !input) return;
  inputLine.classList.toggle("is-empty", input.value.length === 0);
  inputLine.classList.toggle("is-focused", document.activeElement === input);
};

const insertCommand = (command) => {
  if (!input || !command) return;
  input.value = command;
  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);
  updateCaret();
};

const bindQuickCommands = () => {
  document.querySelectorAll("[data-terminal-cmd]").forEach((button) => {
    if (button.dataset.commandBound === "true") return;
    button.dataset.commandBound = "true";
    button.addEventListener("click", () => {
      const command = button.getAttribute("data-terminal-cmd");
      insertCommand(command);
    });
  });
};

const sortModules = (modules) =>
  modules.slice().sort((a, b) => {
    const orderA = typeof a.order === "number" ? a.order : 9999;
    const orderB = typeof b.order === "number" ? b.order : 9999;
    if (orderA !== orderB) return orderA - orderB;
    return (a.label || a.id || "").localeCompare(b.label || b.id || "");
  });

const buildModuleSearchText = (moduleItem, detail) => {
  const parts = [];
  if (moduleItem?.label) parts.push(moduleItem.label);
  if (moduleItem?.id) parts.push(moduleItem.id);
  if (moduleItem?.category) parts.push(moduleItem.category);
  if (Array.isArray(moduleItem?.tags)) parts.push(moduleItem.tags.join(" "));
  if (detail?.title) parts.push(detail.title);
  if (Array.isArray(detail?.descriptionLines)) {
    parts.push(detail.descriptionLines.join(" "));
  }
  return parts.join(" ").toLowerCase();
};

const renderCommandList = (listData) => {
  if (!listData) return;
  const lines = [];
  if (listData.title) {
    lines.push(createStrongLine(listData.title));
  }
  if (Array.isArray(listData.lines)) {
    listData.lines.forEach((line) => {
      if (!line?.cmd) return;
      lines.push(createCommandLine(line.cmd, line.desc));
    });
  }
  printLines(lines);
};

const renderHelp = () => {
  const terminal = getTerminalData();
  renderCommandList(terminal.help);
};

const renderModulesList = (modules, emptyText, titleText) => {
  const lines = [];
  if (titleText) {
    lines.push(createStrongLine(titleText));
  }
  if (!modules.length) {
    if (emptyText) {
      lines.push(createDimLine(emptyText));
      printLines(lines);
    }
    return;
  }
  modules.forEach((moduleItem) => {
    const label = moduleItem.label || moduleItem.id || "";
    const category = moduleItem.category ? ` [#${moduleItem.category}]` : "";
    lines.push(`- ${label} (${moduleItem.id})${category}`);
  });
  printLines(lines);
};

const renderModules = async (parsed) => {
  const terminal = getTerminalData();
  const registry = Array.isArray(terminal.modules) ? terminal.modules : [];
  const details = terminal.module || {};

  const mergedArgs = [...(parsed.aliasArgs || []), ...(parsed.rawArgs || [])];
  const args = mergedArgs.filter((token) => !STOPWORDS.has(token));
  const mode = args[0] || "all";

  if (mode === "search") {
    const query = (parsed.searchQuery || args.slice(1).join(" ")).trim();
    if (!query) {
      const usage = terminal.usage?.nexus || terminal.usage?.modules;
      if (usage) {
        printLines(usage);
      }
      return;
    }
    await animateStatusKey("terminal.status.modulesSearching");
    const queryLower = query.toLowerCase();
    const result = registry.filter((moduleItem) => {
      const detail = details[moduleItem.id];
      const haystack = buildModuleSearchText(moduleItem, detail);
      return haystack.includes(queryLower);
    });
    await animateStatusKey("terminal.status.modulesLoading");
    renderModulesList(
      sortModules(result),
      terminal.modulesSearchEmpty || terminal.errors?.noResults,
      terminal.modulesTitle
    );
    return;
  }

  if (mode === "tools" || mode === "projects" || mode === "all") {
    const filtered =
      mode === "all"
        ? registry
        : registry.filter(
            (moduleItem) =>
              (moduleItem.category || "").toLowerCase() === mode
          );
    await animateStatusKey("terminal.status.modulesLoading");
    renderModulesList(
      sortModules(filtered),
      terminal.modulesEmpty || terminal.errors?.noResults,
      terminal.modulesTitle
    );
    return;
  }

  const usage = terminal.usage?.nexus || terminal.usage?.modules;
  if (usage) {
    printLines(usage);
  }
};

const renderModuleDetail = async (id) => {
  const terminal = getTerminalData();
  const details = terminal.module || {};
  const entry = details[id];
  if (!entry) {
    const message = formatTemplate(terminal.errors?.unknownModule, { id });
    if (message) printLines(message);
    return false;
  }

  const lines = [];
  if (entry.title) {
    lines.push(createStrongLine(entry.title));
  }
  if (Array.isArray(entry.descriptionLines)) {
    entry.descriptionLines.forEach((line) => lines.push(createLine(line)));
  }
  printLines(lines);
  return true;
};

const renderNexusStatus = () => {
  const status = t("terminal.nexusStatus");
  if (!status) return;
  if (Array.isArray(status)) {
    printLines(status);
  } else {
    printLines(status);
  }
};

const renderAbout = () => {
  const about = t("terminal.about");
  if (Array.isArray(about)) {
    printLines(about);
  }
};

const renderSkills = () => {
  const skills = t("terminal.skills");
  if (Array.isArray(skills)) {
    printLines(skills);
  }
};

const renderCv = () => {
  const terminal = getTerminalData();
  const cv = terminal.cv || {};
  const lines = [];
  if (cv.title) lines.push(createStrongLine(cv.title));
  if (terminal.cvLink && cv.linkText) {
    lines.push(createLinkLine(cv.linkLabel, cv.linkText, terminal.cvLink));
  }
  if (cv.hintOpen) lines.push(createDimLine(cv.hintOpen));
  if (cv.hintDownload) lines.push(createDimLine(cv.hintDownload));
  printLines(lines);
};

const renderContact = () => {
  const terminal = getTerminalData();
  const contact = terminal.contact;
  if (!contact) return;
  const lines = [];
  if (contact.title) lines.push(createStrongLine(contact.title));
  if (Array.isArray(contact.items)) {
    contact.items.forEach((item) => {
      if (!item?.value && !item?.href) return;
      const line = document.createElement("div");
      if (item.label) {
        line.appendChild(document.createTextNode(`${item.label}: `));
      }
      if (item.href) {
        const link = document.createElement("a");
        link.href = item.href;
        link.textContent = item.value || item.href;
        if (item.href.startsWith("http")) {
          link.target = "_blank";
          link.rel = "noopener";
        }
        line.appendChild(link);
      } else if (item.value) {
        line.appendChild(document.createTextNode(item.value));
      }
      lines.push(line);
    });
  }
  printLines(lines);
};

const openCv = () => {
  const link = t("terminal.cvLink");
  if (!link) return;
  window.open(link, "_blank", "noopener");
};

const downloadCv = () => {
  const link = t("terminal.cvLink");
  if (!link) return;
  const anchor = document.createElement("a");
  anchor.href = link;
  anchor.download = link.split("/").pop() || "cv.pdf";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
};

const commands = {
  help() {
    renderHelp();
  },
  about() {
    renderAbout();
  },
  skills() {
    renderSkills();
  },
  async nexus(args, parsed) {
    const rawArgs = parsed?.rawArgs || args || [];
    const tokens = [...(parsed?.aliasArgs || []), ...rawArgs].filter(
      (token) => !STOPWORDS.has(token)
    );
    const first = (tokens[0] || "").toLowerCase();
    const second = (tokens[1] || "").toLowerCase();
    const listRequested =
      rawArgs.includes("list") || rawArgs.includes("seznam");

    if (!rawArgs.length) {
      const terminal = getTerminalData();
      if (terminal.nexusHelp) {
        renderCommandList(terminal.nexusHelp);
        return null;
      }
      const usage = terminal.usage?.nexus || terminal.usage?.modules;
      if (usage) {
        printLines(usage);
      }
      return null;
    }

    if (
      listRequested ||
      first === "all" ||
      first === "projects" ||
      first === "tools"
    ) {
      return renderModules(parsed || { rawArgs: [], aliasArgs: [] });
    }

    if (
      first === "status" ||
      first === "stav" ||
      first === "stavprojektu" ||
      first === "stav-projektu" ||
      (first === "stav" && second === "projektu")
    ) {
      renderNexusStatus();
      return null;
    }

    if (first === "search") {
      return renderModules(parsed || { rawArgs: rawArgs, aliasArgs: [] });
    }

    const id = first;
    const found = await renderModuleDetail(id);
    if (!found) {
      const terminal = getTerminalData();
      const usage = terminal.usage?.nexus || terminal.usage?.modules;
      if (usage) {
        printLines(usage);
      }
    }
    return null;
  },
  async cv(args) {
    const action = (args?.[0] || "").toLowerCase();
    if (action === "open" || action === "otevrit") {
      await animateStatusKey("terminal.status.cvSearching");
      await animateStatusKey("terminal.status.cvLoading");
      openCv();
      await animateStatusKey("terminal.status.cvOpen");
      renderCv();
      return;
    }
    if (action === "download" || action === "stahnout") {
      await animateStatusKey("terminal.status.cvSearching");
      await animateStatusKey("terminal.status.cvLoading");
      downloadCv();
      await animateStatusKey("terminal.status.cvDownload");
      renderCv();
      return;
    }
    await animateStatusKey("terminal.status.cvSearching");
    await animateStatusKey("terminal.status.cvLoading");
    renderCv();
  },
  async download(args) {
    const target = (args?.[0] || "").toLowerCase();
    const terminal = getTerminalData();
    if (!target || target === "cv") {
      await animateStatusKey("terminal.status.cvSearching");
      await animateStatusKey("terminal.status.cvLoading");
      downloadCv();
      await animateStatusKey("terminal.status.cvDownload");
      renderCv();
      return;
    }
    if (terminal.usage?.download) {
      printLines(terminal.usage.download);
    }
  },
  contact() {
    renderContact();
  },
  clear() {
    if (output) output.innerHTML = "";
  },
  lang(args) {
    const value = (args?.[0] || "").toLowerCase();
    if (value === "cz" || value === "en") {
      setLang(value);
      const terminal = getTerminalData();
      const message = formatTemplate(terminal.langSet, { lang: value });
      if (message) printLines(message);
      return;
    }
    const terminal = getTerminalData();
    if (terminal.usage?.lang) {
      printLines(terminal.usage.lang);
    }
  },
};

const routeCommand = async (parsed) => {
  if (!parsed.cmd) return;
  const action = commands[parsed.cmd];
  if (action) {
    const result = action(parsed.args, parsed);
    if (result && typeof result.then === "function") {
      await result;
    }
    return;
  }

  const terminal = getTerminalData();
  const unknown = formatTemplate(terminal.errors?.unknownCommand, {
    cmd: parsed.rawCmd || parsed.cmd,
  });
  if (unknown) {
    printLines(unknown);
  }
};

const boot = () => {
  if (!output) return;
  const terminal = getTerminalData();
  if (terminal.coreTitle || terminal.coreSubtitle) {
    printLines(createTitleLine(terminal.coreTitle, terminal.coreSubtitle));
  }
  if (terminal.helpIntro) {
    printLines(createDimLine(terminal.helpIntro));
  }
  printLines("");
  renderHelp();
  bindQuickCommands();
  input?.focus();
  updateCaret();
};

const resetTerminal = () => {
  if (!output) return;
  output.innerHTML = "";
  boot();
  updateCaret();
};

input?.addEventListener("keydown", async (event) => {
  if (event.key !== "Enter") return;

  const value = input.value.trim();
  input.value = "";
  updateCaret();
  if (!value) return;

  printPromptLine(value);

  const parsed = parseCommand(value);
  await routeCommand(parsed);
});

input?.addEventListener("input", updateCaret);
input?.addEventListener("focus", updateCaret);
input?.addEventListener("blur", updateCaret);

window.addEventListener("languageChanged", resetTerminal);

boot();
