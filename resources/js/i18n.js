const STORAGE_KEY = "site_lang";
const DEFAULT_LANG = "cz";

const translations = {
    cz: {
        meta: {
            title: "Moje stránka",
        },
        nav: {
            home: "Domů",
            about: "O mně",
            skills: "Dovednosti",
            projects: "Projekty",
            experience: "Zkušenosti",
            stats: "Statistiky",
            learning: "Co se učím",
            references: "Doporučení",
            languages: "Jazyky",
        },
        hero: {
            subtitle: "Virtuální CV",
            tagline: "Modulární CLI hub pro moji práci, projekty a stack.",
            ctaDownload: "Stáhnout CV",
            ctaContact: "Kontakt",
            ctaDownloadLink: "resources/files/cv-cz.pdf",
            hint: "napi&scaron; <span class='cmd'>help</span>",
        },
        about: {
            title: "O mně",
            body: "Technologie mě baví dlouhodobě - ne jako seznam nástrojů, ale jako prostor, kde se potkává logika, kreativita a zodpovědnost. Rád stavím věci, které mají smysl dnes a obstojí i zítra.<br><br>V IT se pohybuji přes deset let. Nejvíc mě přitahují oblasti, kde se potkává provoz, automatizace a dlouhodobá udržitelnost. Když řeším problém, nejde mi jen o to, aby \"to fungovalo\", ale aby bylo jasné <em>proč</em> to funguje a jak se s tím bude pracovat dál.<br><br>Baví mě tvořit - infrastrukturu, nástroje i dokumentaci. Věřím, že dobře navržené řešení šetří čas, nervy a dává lidem kolem klid se soustředit na důležitější věci. A přesně o to se snažím.",
        },
        skills: {
            title: "Dovednosti, které používám v praxi",
            intro: "Technologie nevnímám jako checklist. Některé oblasti mám hluboce zažité z každodenní praxe, jiné cíleně rozvíjím podle potřeb provozu, automatizace a dlouhodobé udržitelnosti systému.",
            cloud: {
                title: "☁️ Cloud & Identity / Admin",
            },
            automation: {
                title: "⚙️ Automatizace & vývoj",
            },
            security: {
                title: "🔐 Security & Networking",
            },
            level: {
                advanced: "Pokročilý",
                working: "Pracovní znalost",
                learning: "Učím se",
                side: "Vedlejší projekty",
                exploring: "Objevování",
                foundations: "Základy",
            },
            legend: {
                title: "Legenda úrovní znalostí",
                body: "<span class=\"text-white-700 font-medium\">Core</span> - každodenní práce, návrh řešení, samostatné rozhodování<br><span class=\"text-white-700 font-medium\">Advanced</span> - složitější scénáře, troubleshooting, přesahy<br><span class=\"text-white-700 font-medium\">Working knowledge</span> - samostatné použití, občasná dokumentace<br><span class=\"text-white-700 font-medium\">Learning / Exploring</span> - aktivně se učím, labuju, testuji",
            },
        },
        tools: {
            title: "Nástroje, které mi denně pomáhají",
            intro: "V každodenní práci používám kombinaci nástrojů a platforem, které mi pomáhají zůstat produktivní, soustředěný a udržet si přehled i v komplexním prostředí.",
        },
        projects: {
            title: "Projekty & Ukázky práce",
            nexus: {
                desc: "Webový nástroj vytvořený pro systémové administrátory, který zjednodušuje správu Microsoft Entra, Intune a dalších služeb. Nabízí real-time logy, audit dashboard, možnost spouštět PowerShell skripty, integrované napojení na Graph API a další funkce zaměřené na bezpečnost a efektivitu.",
                list: {
                    1: "Moderní responzivní UI (světlý/tmavý režim)",
                    2: "Filtrování a export logů, auditování podezřelých aktivit",
                    3: "Správa zařízení, DNS a uživatelských dat přes Graph API",
                    4: "Navrženo s podporou více databázových backendů - výchozí je SQLite, ale připraven pro PostgreSQL i MySQL",
                },
            },
            homelab: {
                desc: "Projekt zaměřený na automatizované nasazení infrastruktury v domácím labu. Kombinuje sílu Terraformu, Proxmox API, cloud-init a Ansible pro rychlé a opakovatelné nasazení testovacích i produkčních prostředí. Používáno při vývoji a testování bezpečnostních scénářů i skriptování.",
                list: {
                    1: "Automatické vytváření VM přes Proxmox API s custom cloud-init ISO",
                    2: "Terraform moduly pro provisioning a síťování",
                    3: "Ansible role pro konfiguraci, SSH access a instalaci nástrojů",
                    4: "Podpora více image šablon (Ubuntu, Debian, Alpine, Windows)",
                    5: "Ideální základna pro testování automatizací, MDM a bezpečnostních scénářů",
                },
            },
        },
        experience: {
            title: "Profesní vývoj",
            intro: "Více než deset let v IT – od podpory koncových uživatelů až po návrh a provoz platformní infrastruktury. Každá role mě posunula blíž k pochopení systému v měřítku, pod tlakem a v reálném provozu.",
            platform: {
                title: "Platform Engineer",
                time: "Packeta Innovations s.r.o. · 04/2025 – současnost",
                desc: "Návrh a rozvoj platformní infrastruktury s důrazem na konektivitu, automatizaci a dlouhodobou udržitelnost prostředí.",
                list: {
                    1: "Návrh a správa hybridní infrastruktury (Azure ↔ on-prem)",
                    2: "Odpovědnost za síťovou konektivitu, VPN a Hub & Spoke topologii",
                    3: "Integrace a provoz MDM řešení v rámci firemního ekosystému",
                    4: "Spolupráce s DevOps a Security týmy",
                    5: "Dohled nad distribuovanou infrastrukturou dep",
                },
            },
            system: {
                title: "System Administrator",
                time: "Packeta Innovations s.r.o. · 10/2023 – 04/2025",
                desc: "Provozní správa infrastruktury a přechod od reaktivní podpory k systematičtějším a automatizovaným řešením.",
                list: {
                    1: "Správa serverové a síťové infrastruktury",
                    2: "Podpora distribuovaných poboček a jejich IT prostředí",
                    3: "Spolupráce na cloudové konektivitě a bezpečnosti",
                    4: "Správa MDM a integrace s dalšími službami",
                },
            },
            senior: {
                title: "Senior Infrastructure Engineer",
                time: "NTT Ltd. · 05/2022 – 10/2023",
                list: {
                    1: "1.–3. úroveň podpory pro tisíce uživatelů v evropském prostředí",
                    2: "Správa VMware infrastruktury a Windows Serverů",
                    3: "Monitoring dostupnosti klíčových aplikací",
                    4: "Onboarding uživatelů a IT procesy",
                },
            },
            early: {
                title: "IT Support & Service Desk",
                time: "2015 – 2022 · Telefónica / G4S / AutoCont / Dimension Data / NTT",
                desc: "Základ celé kariéry – každodenní práce s uživateli, incidenty, provozem a reálnými problémy v enterprise prostředí.",
            },
        },
        stats: {
            title: "Kontext mé práce",
            intro: "Čísla pro mě nejsou cílem, ale kontextem. Pomáhají ukázat rozsah prostředí, ve kterém jsem pracoval, a odpovědnost, kterou jednotlivé role a projekty přinášely.",
            users: "uživatelů v podporovaném prostředí",
            servers: "serverů v produkčním provozu",
            devices: "spravovaných a monitorovaných zařízení",
            years: "let praxe v IT provozu",
            tech: "technologií používaných v praxi",
            countries: "zemí v rámci mezinárodní spolupráce",
        },
        learning: {
            title: "Co se aktivně učím a kam směřuji",
            intro: "Věřím, že dobrý technik se nepřestává učit ve chvíli, kdy zvládne každodenní provoz. Aktivně sleduji oblasti, které mají dlouhodobý dopad na stabilitu, bezpečnost a automatizaci. Část z nich zkouším v praxi v HomeLabu, část postupně zapojuji do reálných projektů.",
            infrastructure: {
                title: "🌐 Infrastruktura & Cloud",
                desc: "Směr k deklarativní infrastruktuře a lepší správě identity.",
            },
            automation: {
                title: "⚙️ Automatizace & Vývoj",
                desc: "Nástroje, které mi pomáhají zmenšovat manuální práci a zvyšovat spolehlivost.",
            },
            security: {
                title: "🔐 Bezpečnost & Monitoring",
                desc: "Lepší viditelnost, reakce na incidenty a pochopení chování prostředí.",
            },
            homelab: {
                title: "🧪 HomeLab & Experimenty",
                desc: "Prostor pro testování bez kompromisu a učení se na vlastních chybách.",
            },
        },
        motivation: {
            title: "Co mě baví a dává mi smysl",
            intro: "Technologie pro mě nejsou jen práce. Jsou to problémy, které čekají na dobré řešení. Nejvíc mě baví chvíle, kdy se složitá věc podaří zjednodušit tak, aby dávala smysl i lidem kolem a dlouhodobě fungovala v praxi.",
            items: {
                routine: "<strong>Automatizace rutiny</strong> – nechci, aby lidé trávili čas opakováním věcí, které může spolehlivě řešit skript nebo systém.",
                homelab: "<strong>Budování vlastního HomeLabu</strong> – prostor, kde můžu testovat nápady, dělat chyby a pochopit technologie do hloubky.",
                docs: "<strong>Dokumentace a sdílení know-how</strong> – dobře popsané řešení šetří čas, nervy a pomáhá ostatním se rychle zorientovat.",
                security: "<strong>Bezpečnost a udržitelnost</strong> – rád přemýšlím nad tím, jak věci navrhnout tak, aby obstály i ve chvíli, kdy se něco pokazí.",
                clarity: "<strong>Přehlednost a rychlá orientace</strong> – logy, dashboardy a alerty mají sloužit lidem, ne je zahlcovat.",
            },
        },
        personal: {
            title: "Když zrovna nepracuji…",
            body: "Rád si dopřeju klid u dobrého filmu nebo seriálu a vyčistím si hlavu na procházkách s manželkou a dětmi.<br><br>Baví mě vzdělávání, čtení a objevování nových věcí – nejen v IT. Občas si zahraju hru jen proto, abych na chvíli vypnul a přepnul mozek jinam.<br><br>A když všichni spí a dům ztichne, přichází můj oblíbený čas. Vracím se k nápadům, zkouším nové technologie, píšu skripty nebo jen stavím věci pro radost a vlastní pochopení.",
        },
        languages: {
            title: "Jazyky, ve kterých pracuji",
            intro: "Jazyk beru jako nástroj. Nejde mi jen o porozumění, ale o schopnost vysvětlit problém, navrhnout řešení a domluvit se i ve složitějších technických situacích.",
            czech: "Čeština",
            czechLevel: "C2 · rodilý mluvčí",
            english: "Angličtina",
            englishLevel: "C1 · profesionální úroveň",
            noteTitle: "Poznámka k úrovním",
            noteBody: "<span class=\"text-white font-medium\">C2</span> – plná plynulost, přirozený projev, práce s detailem<br><span class=\"text-white font-medium\">C1</span> – každodenní profesionální komunikace, technické diskuze, dokumentace",
        },
        countries: {
            title: "Mezinárodní spolupráce a působení",
            intro: "V rámci projektů a provozu jsem spolupracoval s týmy napříč různými zeměmi. Nešlo jen o lokaci, ale o pochopení rozdílných procesů, kultur a provozních požadavků v mezinárodním prostředí.",
            list: {
                cz: "Česká republika",
                sk: "Slovensko",
                pl: "Polsko",
                hu: "Maďarsko",
                ro: "Rumunsko",
                si: "Slovinsko",
                de: "Německo",
                fr: "Francie",
                it: "Itálie",
                es: "Španělsko",
                nl: "Nizozemsko",
                uk: "Velká Británie",
                in: "Indie",
                us: "USA",
                za: "Jihoafrická republika",
            },
        },
        certifications: {
            title: "Certifikace a ověření znalostí",
            intro: "Certifikace vnímám jako způsob, jak si strukturovaně ověřit znalosti a ukotvit témata, která používám nebo rozvíjím v praxi. Nejsou cílem samy o sobě, ale přirozenou součástí dlouhodobého učení.",
        },
        footer: {
            about: {
                body: "Platform Engineer ve společnosti Packeta Innovations s. r. o., zaměřený na infrastrukturu, bezpečnost a automatizaci. Věřím v kvalitní dokumentaci, funkční řešení a nástroje, které zjednodušují život.",
            },
            links: {
                title: "Odkazy",
                about: "O mně",
                projects: "Projekty",
                experience: "Zkušenosti",
            },
            connect: {
                title: "Spojme se",
            },
            location: " kliment.xyz • Česko / Evropa",
            quote: "„Chytrý člověk vyřeší problém. Moudrý člověk se mu vyhne.“ - Albert Einstein",
            copyright: "© 2025 Martin Kliment - Všechna práva vyhrazena",
        },
        terminal: {
            coreTitle: "Nexus",
            coreSubtitle: "Osobní CV v terminálu.",
            helpIntro: "Napiš /help pro seznam příkazů.",
            help: {
                title: "Příkazy",
                lines: [
                    { cmd: "help", desc: "seznam příkazů" },
                    { cmd: "nexus", desc: "příkazy pro Nexus" },
                    { cmd: "sac", desc: "Svíčková as Code pipeline" },
                    { cmd: "lang cz|en", desc: "přepnout jazyk" },
                    { cmd: "cv", desc: "otevřít nebo stáhnout CV" },
                    { cmd: "download cv", desc: "stáhnout CV" },
                    { cmd: "about", desc: "kdo jsem" },
                    { cmd: "skills", desc: "stack / dovednosti" },
                    { cmd: "contact", desc: "kontakt" },
                    { cmd: "clear", desc: "vyčistit obrazovku" },
                ],
            },
            nexusHelp: {
                title: "Nexus",
                lines: [
                    { cmd: "nexus list", desc: "seznam modulů" },
                    { cmd: "nexus <id>", desc: "detail modulu" },
                    { cmd: "nexus status", desc: "stav projektu" },
                ],
            },
            modulesTitle: "Nexus moduly",
            modulesEmpty: "Žádné moduly k zobrazení.",
            modulesSearchEmpty: "Žádné výsledky.",
            modules: [
                {
                    id: "scripts",
                    label: "Skriptovací repozitář",
                    category: "Tools",
                    tags: ["automatizace", "skripty"],
                    order: 10,
                },
                {
                    id: "dns",
                    label: "DNS skener",
                    category: "Tools",
                    tags: ["dns", "spf", "dkim", "dmarc"],
                    order: 20,
                },
                {
                    id: "jwt",
                    label: "JWT dekodér",
                    category: "Tools",
                    tags: ["token", "security"],
                    order: 30,
                },
                {
                    id: "pi",
                    label: "PI Planning",
                    category: "Tools",
                    tags: ["planning", "portfolio"],
                    order: 40,
                },
                {
                    id: "ftc",
                    label: "FTC Hub",
                    category: "Projects",
                    tags: ["community", "retro"],
                    order: 50,
                },
            ],
            module: {
                scripts: {
                    title: "Skriptovací repozitář",
                    descriptionLines: [
                        "Modul pro správu a spouštění balíčků.",
                        "Běhy, logy a artefakty na jednom místě.",
                    ],
                },
                dns: {
                    title: "DNS skener",
                    descriptionLines: [
                        "SPF, DKIM a DMARC v jednom přehledu.",
                        "Výsledky ukládá pro porovnání v čase.",
                    ],
                },
                jwt: {
                    title: "JWT dekodér",
                    descriptionLines: [
                        "Inspektor hlaviček a claimů.",
                        "Bez odesílání na server (běží lokálně v prohlížeči).",
                    ],
                },
                pi: {
                    title: "PI Planning",
                    descriptionLines: [
                        "Plánování iterací, kapacit a tasků.",
                        "Přehled dostupnosti a priorit.",
                    ],
                },
                ftc: {
                    title: "FTC Hub",
                    descriptionLines: [
                        "Komunitní projekt s retro terminálovým stylem.",
                        "Prostor pro experimenty a společné nástroje.",
                    ],
                },
            },
            usage: {
                nexus: "Použití: nexus [list|status|<id>]",
                sac: "Použití: sac [--prod|--dry-run|reset]",
                lang: "Použití: lang [cz|en]",
                cv: "Použití: cv [open|download]",
                download: "Použití: download cv",
            },
            errors: {
                unknownModule: "Neznámý modul: {id}. Použij: nexus",
                unknownCommand: "Neznámý příkaz: {cmd}. Napiš /help.",
                noResults: "Nic jsem nenašel.",
            },
            status: {
                commandsLoading: "Načítám příkazy",
                modulesLoading: "Načítám seznam modulů",
                modulesSearching: "Hledám moduly",
                cvSearching: "Hledám poslední verzi CV",
                cvLoading: "Načítám soubor",
                cvOpen: "Otevírám CV v novém okně",
                cvDownload: "Stahuji CV",
            },
            nexusStatus: [
                "Stav projektu: 4 moduly dokončené.",
                "Aktuálně testujeme a ladíme další.",
            ],
            sac: {
                title: "Svíčková as Code",
                statusInit: "Inicializuji pipeline...",
                statusRunning: "Spouštím pipeline...",
                statusDone: "Dokončeno.",
                statusAborted: "Pipeline zrušena.",
                running: "SAC pipeline běží... napiš sac reset pro zrušení.",
                resetDone: "SAC reset dokončen.",
                resetIdle: "SAC pipeline neběží.",
                resetLabel: "Reset",
                modeLabel: "Režim: {mode}",
                modeDefault: "default",
                modeProd: "prod",
                modeDry: "dry-run",
                steps: [
                    "INFO :: Načítání konfigurace svickova.yaml (verze: 1.0-stable)",
                    "INFO :: Validace vstupů: maso=1.1kg, zelenina=1200g, halali=2 sklenice",
                    "OK :: Tajné přísady injektovány: HALALI_ENV=present (redacted)",
                    "INFO :: Příprava: rozmrazování mražené zeleniny (deterministický poměr)",
                    "INFO :: Opékání masa: sůl + pepř aplikovány, povrch zatáhnut",
                    "INFO :: Restování zeleniny: využívá se maso pro extrakci chuti",
                    "OK :: Přidáno máslo: 50g • tukový nosič aktivní",
                    "INFO :: Fáze slowcook: 150°C • 3h30m • batch režim",
                    "WARN :: Detekován aromatický spike: sousedé mohou požadovat pozvání",
                    "INFO :: Fáze reduce: 180°C • 1h • koncentrace chuti",
                    "INFO :: Fáze caramelize: 200°C • víko otevřeno • Maillard aktivní",
                    "OK :: Odpočinek masa: vlákna relaxují • připravenost k plátkování=high",
                    "INFO :: Orchestrace omáčky: inicializace ponorného mixéru",
                    "INFO :: Přidána smetana: 33% • cílová viskozita dosažena",
                    "INFO :: Horizontální škálování: mléko +1.0L (lze škálovat až +2.0L)",
                    "OK :: Konzistence stabilizována: zahuštění=zeleninové pyré (bez mouky)",
                    "OK :: Servírování: knedlík=mixik • SLA: satisfied_humans >= 99.9%",
                    "OK :: DEPLOY SUCCESS: svickova-as-code::prod ✔",
                    "INFO :: Upozornění: wife_access=deny_all • do_not_disclose_halali=true",
                ],
            },
            langSet: "Jazyk nastaven na {lang}",
            tip: "Tip: napiš help",
            quick: {
                help: "nápověda",
                about: "o mně",
                skills: "dovednosti",
                nexus: "nexus",
                cv: "cv",
                contact: "kontakt",
            },
            about: [
                "Platform / infrastructure engineer.",
                "Silná stránka: Linux + provoz + troubleshooting.",
                "CI/CD, automatizaci a Kubernetes se učím a postupně doplňuji do projektu.",
            ],
            skills: [
                "Linux, networking základy, Docker (basic)",
                "Azure / Entra / Intune (context)",
                "Automation / CI/CD / Kubernetes - learning",
            ],
            cv: {
                title: "CV",
                linkLabel: "PDF",
                linkText: "Otevřít CV v prohlížeči / stáhnout PDF",
                hintOpen: "Tip: napiš cv otevrit pro otevření v nové záložce.",
                hintDownload: "Tip: napiš download cv pro stažení.",
            },
            cvLink: "resources/files/cv-cz.pdf",
            contact: {
                title: "Kontakt",
                items: [
                    {
                        label: "Email",
                        value: "expancion2@gmail.com",
                        href: "mailto:expancion2@gmail.com",
                    },
                    {
                        label: "GitHub",
                        value: "github.com/expancion",
                        href: "https://github.com/expancion",
                    },
                    {
                        label: "LinkedIn",
                        value: "linkedin.com/in/martinkliment/",
                        href: "https://www.linkedin.com/in/martinkliment/",
                    },
                ],
            },
        },




    },
    en: {
        meta: {
            title: "My site",
        },
        nav: {
            home: "Home",
            about: "About",
            skills: "Skills",
            projects: "Projects",
            experience: "Experience",
            stats: "Stats",
            learning: "What I'm learning",
            references: "Recommendations",
            languages: "Languages",
        },
        hero: {
            subtitle: "Virtual CV",
            tagline: "Modular CLI hub for my work, projects and stack.",
            ctaDownload: "Download CV",
            ctaContact: "Contact",
            ctaDownloadLink: "resources/files/cv-en.pdf",
            hint: "type <span class='cmd'>help</span>",
        },
        about: {
            title: "About",
            body: "Technology has interested me for a long time - not as a checklist of tools, but as a space where logic, creativity and responsibility meet. I like building things that make sense today and hold up tomorrow.<br><br>I've been in IT for over ten years. I'm most drawn to areas where operations, automation and long-term sustainability meet. When I solve a problem, it's not just about \"it works\", but about why it works and how it will be maintained.<br><br>I enjoy creating infrastructure, tools and documentation. I believe well-designed solutions save time and energy and let people around me focus on what matters. That's exactly what I aim for.",
        },
        skills: {
            title: "Skills I use in practice",
            intro: "I do not see technologies as a checklist. Some areas are deeply ingrained from daily practice; others I develop intentionally based on the needs of operations, automation and long-term sustainability.",
            cloud: {
                title: "☁️ Cloud & Identity / Admin",
            },
            automation: {
                title: "⚙️ Automation & Development",
            },
            security: {
                title: "🔐 Security & Networking",
            },
            level: {
                advanced: "Advanced",
                working: "Working knowledge",
                learning: "Learning",
                side: "Side projects",
                exploring: "Exploring",
                foundations: "Foundations",
            },
            legend: {
                title: "Legend of proficiency levels",
                body: "<span class=\"text-white-700 font-medium\">Core</span> - day-to-day work, solution design, independent decisions<br><span class=\"text-white-700 font-medium\">Advanced</span> - more complex scenarios, troubleshooting, overlaps<br><span class=\"text-white-700 font-medium\">Working knowledge</span> - independent use, occasional documentation<br><span class=\"text-white-700 font-medium\">Learning / Exploring</span> - actively learning, labbing, testing",
            },
        },
        tools: {
            title: "Tools that help me every day",
            intro: "In everyday work I use a mix of tools and platforms that help me stay productive, focused and keep track even in complex environments.",
        },
        projects: {
            title: "Projects & work samples",
            nexus: {
                desc: "A web tool built for system administrators that simplifies management of Microsoft Entra, Intune and other services. It offers real-time logs, an audit dashboard, the ability to run PowerShell scripts, integrated Graph API connectivity and other features focused on security and efficiency.",
                list: {
                    1: "Modern responsive UI (light/dark mode)",
                    2: "Log filtering and export, auditing suspicious activity",
                    3: "Management of devices, DNS and user data via Graph API",
                    4: "Designed with support for multiple database backends - default is SQLite, with readiness for PostgreSQL and MySQL",
                },
            },
            homelab: {
                desc: "A project focused on automated infrastructure deployment in a home lab. It combines Terraform, the Proxmox API, cloud-init and Ansible for fast, repeatable deployments of test and production environments. Used for development, testing security scenarios and scripting.",
                list: {
                    1: "Automatic VM creation via Proxmox API with custom cloud-init ISO",
                    2: "Terraform modules for provisioning and networking",
                    3: "Ansible roles for configuration, SSH access and tool installation",
                    4: "Support for multiple image templates (Ubuntu, Debian, Alpine, Windows)",
                    5: "An ideal base for testing automation, MDM and security scenarios",
                },
            },
        },
        experience: {
            title: "Career path",
            intro: "More than ten years in IT - from end-user support to design and operation of platform infrastructure. Each role brought me closer to understanding systems at scale, under pressure and in real operations.",
            platform: {
                title: "Platform Engineer",
                time: "Packeta Innovations s.r.o. · 04/2025 – present",
                desc: "Design and development of platform infrastructure with emphasis on connectivity, automation and long-term sustainability of the environment.",
                list: {
                    1: "Design and management of hybrid infrastructure (Azure ↔ on-prem)",
                    2: "Responsibility for network connectivity, VPN and Hub & Spoke topology",
                    3: "Integration and operation of MDM solutions within the company ecosystem",
                    4: "Collaboration with DevOps and Security teams",
                    5: "Oversight of distributed infrastructure",
                },
            },
            system: {
                title: "System Administrator",
                time: "Packeta Innovations s.r.o. · 10/2023 – 04/2025",
                desc: "Operational infrastructure administration and a shift from reactive support to more systematic and automated solutions.",
                list: {
                    1: "Administration of server and network infrastructure",
                    2: "Support for distributed branches and their IT environments",
                    3: "Collaboration on cloud connectivity and security",
                    4: "MDM administration and integration with other services",
                },
            },
            senior: {
                title: "Senior Infrastructure Engineer",
                time: "NTT Ltd. · 05/2022 – 10/2023",
                list: {
                    1: "1st-3rd line support for thousands of users in a European environment",
                    2: "Management of VMware infrastructure and Windows Server",
                    3: "Monitoring availability of key applications",
                    4: "User onboarding and IT processes",
                },
            },
            early: {
                title: "IT Support & Service Desk",
                time: "2015 – 2022 · Telefonica / G4S / AutoCont / Dimension Data / NTT",
                desc: "The foundation of my career - daily work with users, incidents, operations and real problems in enterprise environments.",
            },
        },
        stats: {
            title: "Context of my work",
            intro: "Numbers are not the goal for me, but context. They help show the scale of environments I worked in and the responsibility carried by individual roles and projects.",
            users: "users in supported environments",
            servers: "servers in production",
            devices: "managed and monitored devices",
            years: "years in IT operations",
            tech: "technologies used in practice",
            countries: "countries in international cooperation",
        },
        learning: {
            title: "What I'm actively learning and where I'm heading",
            intro: "I believe a good engineer does not stop learning once daily operations are mastered. I actively follow areas that have a long-term impact on stability, security and automation. Some I test in practice in my HomeLab, others I gradually bring into real projects.",
            infrastructure: {
                title: "🌐 Infrastructure & Cloud",
                desc: "Direction toward declarative infrastructure and better identity management.",
            },
            automation: {
                title: "⚙️ Automation & Development",
                desc: "Tools that help me reduce manual work and increase reliability.",
            },
            security: {
                title: "🔐 Security & Monitoring",
                desc: "Better visibility, incident response and understanding of environment behavior.",
            },
            homelab: {
                title: "🧪 HomeLab & Experiments",
                desc: "Space for testing without compromise and learning from my own mistakes.",
            },
        },
        motivation: {
            title: "What I enjoy and what gives it meaning",
            intro: "Technology is not just work for me. It is a set of problems waiting for good solutions. I enjoy the moments when a complex thing becomes simpler so it makes sense to people around me and works in practice long term.",
            items: {
                routine: "<strong>Automating routine</strong> - I do not want people to spend time repeating things a script or system can reliably handle.",
                homelab: "<strong>Building my own HomeLab</strong> - a space where I can test ideas, make mistakes and understand technologies in depth.",
                docs: "<strong>Documentation and sharing know-how</strong> - well-described solutions save time, energy and help others get oriented quickly.",
                security: "<strong>Security and sustainability</strong> - I like thinking about how to design things so they hold up even when something breaks.",
                clarity: "<strong>Clarity and quick orientation</strong> - logs, dashboards and alerts should serve people, not overwhelm them.",
            },
        },
        personal: {
            title: "When I'm not working...",
            body: "I like to slow down with a good movie or series and clear my head on walks with my wife and kids.<br><br>I enjoy learning, reading and discovering new things - not only in IT. Sometimes I play a game just to switch off for a while and reset my brain.<br><br>And when everyone sleeps and the house gets quiet, my favorite time arrives. I return to ideas, try new technologies, write scripts, or just build things for fun and my own understanding.",
        },
        languages: {
            title: "Languages I use at work",
            intro: "I treat language as a tool. It's not only about understanding, but about being able to explain a problem, propose a solution and communicate even in more complex technical situations.",
            czech: "Czech",
            czechLevel: "C2 · native speaker",
            english: "English",
            englishLevel: "C1 · professional level",
            noteTitle: "Notes on levels",
            noteBody: "<span class=\"text-white font-medium\">C2</span> - full fluency, natural expression, detail work<br><span class=\"text-white font-medium\">C1</span> - everyday professional communication, technical discussions, documentation",
        },
        countries: {
            title: "International collaboration and exposure",
            intro: "Across projects and operations I worked with teams across many countries. It was not only about location, but about understanding different processes, cultures and operational requirements in an international environment.",
            list: {
                cz: "Czech Republic",
                sk: "Slovakia",
                pl: "Poland",
                hu: "Hungary",
                ro: "Romania",
                si: "Slovenia",
                de: "Germany",
                fr: "France",
                it: "Italy",
                es: "Spain",
                nl: "Netherlands",
                uk: "United Kingdom",
                in: "India",
                us: "USA",
                za: "South Africa",
            },
        },
        certifications: {
            title: "Certifications and validated knowledge",
            intro: "I see certifications as a way to validate knowledge in a structured way and anchor topics I use or develop in practice. They are not the goal on their own, but a natural part of long-term learning.",
        },
        footer: {
            about: {
                body: "Platform Engineer at Packeta Innovations s. r. o., focused on infrastructure, security and automation. I believe in quality documentation, working solutions and tools that simplify life.",
            },
            links: {
                title: "Links",
                about: "About",
                projects: "Projects",
                experience: "Experience",
            },
            connect: {
                title: "Let's connect",
            },
            location: " kliment.xyz • Czechia / Europe",
            quote: "\"A clever person solves a problem. A wise person avoids it.\" - Albert Einstein",
            copyright: "© 2025 Martin Kliment - All rights reserved",
        },
        terminal: {
            coreTitle: "Nexus",
            coreSubtitle: "Personal CV in a CLI.",
            helpIntro: "Type /help for the command list.",
            help: {
                title: "Commands",
                lines: [
                    { cmd: "help", desc: "show commands" },
                    { cmd: "nexus", desc: "Nexus commands" },
                    { cmd: "sac", desc: "Svíčková as Code pipeline" },
                    { cmd: "lang cz|en", desc: "switch language" },
                    { cmd: "cv", desc: "open or download CV" },
                    { cmd: "download cv", desc: "download CV" },
                    { cmd: "about", desc: "who am I" },
                    { cmd: "skills", desc: "tech stack" },
                    { cmd: "contact", desc: "contact" },
                    { cmd: "clear", desc: "clear screen" },
                ],
            },
            nexusHelp: {
                title: "Nexus",
                lines: [
                    { cmd: "nexus list", desc: "list modules" },
                    { cmd: "nexus <id>", desc: "module details" },
                    { cmd: "nexus status", desc: "project status" },
                ],
            },
            modulesTitle: "Nexus modules",
            modulesEmpty: "No modules to show.",
            modulesSearchEmpty: "No results.",
            modules: [
                {
                    id: "scripts",
                    label: "Script Repository",
                    category: "Tools",
                    tags: ["automation", "scripts"],
                    order: 10,
                },
                {
                    id: "dns",
                    label: "DNS Scanner",
                    category: "Tools",
                    tags: ["dns", "spf", "dkim", "dmarc"],
                    order: 20,
                },
                {
                    id: "jwt",
                    label: "JWT Decoder",
                    category: "Tools",
                    tags: ["token", "security"],
                    order: 30,
                },
                {
                    id: "pi",
                    label: "PI Planning",
                    category: "Tools",
                    tags: ["planning", "portfolio"],
                    order: 40,
                },
                {
                    id: "ftc",
                    label: "FTC Hub",
                    category: "Projects",
                    tags: ["community", "retro"],
                    order: 50,
                },
            ],
            module: {
                scripts: {
                    title: "Script Repository",
                    descriptionLines: [
                        "Module for managing and running packages.",
                        "Runs, logs and artifacts in one place.",
                    ],
                },
                dns: {
                    title: "DNS Scanner",
                    descriptionLines: [
                        "SPF, DKIM and DMARC in one overview.",
                        "Stores results to compare over time.",
                    ],
                },
                jwt: {
                    title: "JWT Decoder",
                    descriptionLines: [
                        "Inspector for headers and claims.",
                        "No server upload (runs locally in the browser).",
                    ],
                },
                pi: {
                    title: "PI Planning",
                    descriptionLines: [
                        "Planning iterations, capacity and tasks.",
                        "Availability and priority overview.",
                    ],
                },
                ftc: {
                    title: "FTC Hub",
                    descriptionLines: [
                        "Community project with a retro terminal style.",
                        "Space for experiments and shared tools.",
                    ],
                },
            },
            usage: {
                nexus: "Usage: nexus [list|status|<id>]",
                sac: "Usage: sac [--prod|--dry-run|reset]",
                lang: "Usage: lang [cz|en]",
                cv: "Usage: cv [open|download]",
                download: "Usage: download cv",
            },
            errors: {
                unknownModule: "Unknown module: {id}. Use: nexus",
                unknownCommand: "Unknown command: {cmd}. Type /help.",
                noResults: "Nothing found.",
            },
            status: {
                commandsLoading: "Loading commands",
                modulesLoading: "Loading module list",
                modulesSearching: "Searching modules",
                cvSearching: "Searching for the latest CV version",
                cvLoading: "Loading file",
                cvOpen: "Opening CV in a new tab",
                cvDownload: "Downloading CV",
            },
            nexusStatus: [
                "Project status: 4 modules completed.",
                "Currently testing and refining the rest.",
            ],
            sac: {
                title: "Svíčková as Code",
                statusInit: "Initializing pipeline...",
                statusRunning: "Running pipeline...",
                statusDone: "Completed.",
                statusAborted: "Pipeline aborted.",
                running: "SAC pipeline running... type sac reset to abort.",
                resetDone: "SAC reset complete.",
                resetIdle: "SAC pipeline is not running.",
                resetLabel: "Reset",
                modeLabel: "Mode: {mode}",
                modeDefault: "default",
                modeProd: "prod",
                modeDry: "dry-run",
                steps: [
                    "INFO :: Loading config svickova.yaml (version: 1.0-stable)",
                    "INFO :: Validating inputs: meat=1.1kg, vegetables=1200g, halali=2 jars",
                    "OK :: Secret ingredients injected: HALALI_ENV=present (redacted)",
                    "INFO :: Prep: thawing frozen vegetables (deterministic ratio)",
                    "INFO :: Searing meat: salt + pepper applied, surface sealed",
                    "INFO :: Veg saute: meat fond used for flavor extraction",
                    "OK :: Butter added: 50g • lipid carrier active",
                    "INFO :: Slowcook phase: 150°C • 3h30m • batch mode",
                    "WARN :: Aroma spike detected: neighbors may request invite",
                    "INFO :: Reduce phase: 180°C • 1h • flavor concentration",
                    "INFO :: Caramelize phase: 200°C • lid open • Maillard active",
                    "OK :: Meat resting: fibers relax • slicing readiness=high",
                    "INFO :: Sauce orchestration: immersion blender init",
                    "INFO :: Cream added: 33% • target viscosity reached",
                    "INFO :: Horizontal scaling: milk +1.0L (scalable up to +2.0L)",
                    "OK :: Consistency stabilized: thickener=vegetable puree (no flour)",
                    "OK :: Serving: dumplings=mixik • SLA: satisfied_humans >= 99.9%",
                    "OK :: DEPLOY SUCCESS: svickova-as-code::prod ✔",
                    "INFO :: Notice: wife_access=deny_all • do_not_disclose_halali=true",
                ],
            },
            langSet: "Language set to {lang}",
            tip: "Tip: type help",
            quick: {
                help: "help",
                about: "about",
                skills: "skills",
                nexus: "nexus",
                cv: "cv",
                contact: "contact",
            },
            about: [
                "Platform / infrastructure engineer.",
                "Strong in Linux + operations + troubleshooting.",
                "Currently learning CI/CD, automation and Kubernetes.",
            ],
            skills: [
                "Linux, networking basics, Docker (basic)",
                "Azure / Entra / Intune (context)",
                "Automation / CI/CD / Kubernetes - learning",
            ],
            cv: {
                title: "CV",
                linkLabel: "PDF",
                linkText: "Open CV in browser / download PDF",
                hintOpen: "Tip: type cv open to open it in a new tab.",
                hintDownload: "Tip: type download cv to download it.",
            },
            cvLink: "resources/files/cv-en.pdf",
            contact: {
                title: "Contact",
                items: [
                    {
                        label: "Email",
                        value: "expancion2@gmail.com",
                        href: "mailto:expancion2@gmail.com",
                    },
                    {
                        label: "GitHub",
                        value: "github.com/expancion",
                        href: "https://github.com/expancion",
                    },
                    {
                        label: "LinkedIn",
                        value: "linkedin.com/in/martinkliment/",
                        href: "https://www.linkedin.com/in/martinkliment/",
                    },
                ],
            },
        },




    },
};

const normalizeLang = (value) => {
    if (!value) return null;
    const lang = value.toLowerCase();
    if (lang === "cz" || lang === "cs") return "cz";
    if (lang === "en") return "en";
    return null;
};

const resolveKey = (dictionary, key) => {
    if (!dictionary || !key) return undefined;
    return key.split(".").reduce((acc, part) => {
        if (acc && Object.prototype.hasOwnProperty.call(acc, part)) {
            return acc[part];
        }
        return undefined;
    }, dictionary);
};

let currentLang = normalizeLang(localStorage.getItem(STORAGE_KEY)) || DEFAULT_LANG;
if (!translations[currentLang]) {
    currentLang = DEFAULT_LANG;
}

const getLang = () => currentLang;

const t = (key) => resolveKey(translations[currentLang], key);

const applyTranslations = (root = document) => {
    if (!root) return;

    document.documentElement.lang = currentLang === "cz" ? "cs" : currentLang;

    root.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.getAttribute("data-i18n");
        const value = resolveKey(translations[currentLang], key);
        if (value === undefined) return;

        if (el.hasAttribute("data-i18n-html")) {
            el.innerHTML = value;
        } else {
            el.textContent = value;
        }
    });

    root.querySelectorAll("[data-i18n-attr]").forEach((el) => {
        const mapping = el.getAttribute("data-i18n-attr");
        if (!mapping) return;

        mapping.split(",").forEach((pair) => {
            const [attr, key] = pair.split(":").map((part) => part.trim());
            if (!attr || !key) return;
            const value = resolveKey(translations[currentLang], key);
            if (value === undefined) return;
            el.setAttribute(attr, value);
        });
    });
};

const updateLangButtons = () => {
    const btnCZ = document.getElementById("lang-cz");
    const btnEN = document.getElementById("lang-en");
    btnCZ?.classList.toggle("is-active", currentLang === "cz");
    btnEN?.classList.toggle("is-active", currentLang === "en");
};

const bindLangButtons = () => {
    document.querySelectorAll("[data-lang]").forEach((button) => {
        if (button.dataset.langBound === "true") return;
        button.dataset.langBound = "true";
        button.addEventListener("click", () => setLang(button.dataset.lang));
    });
};

const setLang = (nextLang) => {
    const normalized = normalizeLang(nextLang);
    if (!normalized || !translations[normalized]) return;
    if (normalized === currentLang) return;

    currentLang = normalized;
    localStorage.setItem(STORAGE_KEY, currentLang);

    if (document.readyState !== "loading") {
        applyTranslations();
        updateLangButtons();
    }

    window.dispatchEvent(
        new CustomEvent("languageChanged", { detail: { lang: currentLang } })
    );
};

const init = () => {
    localStorage.setItem(STORAGE_KEY, currentLang);
    applyTranslations();
    updateLangButtons();
    bindLangButtons();
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}

export { getLang, setLang, t, applyTranslations };
