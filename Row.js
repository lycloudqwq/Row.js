// ==UserScript==
// @name        Row.js_local
// @namespace   https://github.com/lycloudqwq/Row.js
// @version     1.0
// @author      lycloud
// @include     https://keylol.com/f*
// @run-at      document-end
// ==/UserScript==

(() => {
    const UNINTERESTED_FORUMS = new Set([
        "旅游摄影", "美食烹饪", "开箱晒物",
        "华语汉化", "游戏互鉴", "成就指南",
        "平台技术问题", "平台购物问题", "其乐社区问题", "资源问题", "游戏／成就／汉化问题", "软件硬件／其他问题",
        "移动平台", "GOG", "战网", "Windows 商店", "杉果", "方块游戏平台", "腾讯 WeGame",
        "刀塔", "明日方舟", "动视暴雪"
    ]);
    const UNINTERESTED_AUTHORS = new Set([]);
    const ROWS = document.querySelectorAll(".xst");

    // Load saved read threads
    const readThreads = JSON.parse(localStorage.getItem('readThreads') || '[]');

    // Add event listener to unread rows and save read status to localStorage
    for (const title of ROWS) {
        const row = title.closest("tr");
        const rowId = title.href.match(/\d+/)[0];
        if (readThreads.includes(rowId)) {
            row.classList.add("row-read");
        } else {
            title.addEventListener("mousedown", () => {
                row.classList.add("row-read");
                readThreads.push(rowId);
                if (readThreads.length > 1000) {
                    readThreads.splice(0, 400);
                }
                localStorage.setItem('readThreads', JSON.stringify(readThreads));
            }, { once: true })
        }
    }

    if (!document.querySelector("#threadlist")) return;

    const matches = [];
    for (const title of ROWS) {
        const row = title.closest("tr");
        const author = row.querySelector("td.by cite");
        if (!author) continue;

        const forumName = row.querySelector(":is(td.by, td.frm):not(:has(cite))").textContent.trim();
        const authorName = author.textContent.trim();

        if (!UNINTERESTED_FORUMS.has(forumName) && !UNINTERESTED_AUTHORS.has(authorName)) continue;
        matches.push({ row, title, forumName, authorName });
    }
    const order = [...UNINTERESTED_FORUMS];
    matches.sort((a, b) => order.indexOf(a.forumName) - order.indexOf(b.forumName));

    const style = document.createElement("style");
    style.textContent = `
        tr.row-read > * { background: #98D98E !important; }
        body:has(> #row-visibility-toggle[aria-pressed="false"]) #threadlist tr.row-uninterested {
            display: none;
        }
        #row-hover-drawer, #row-visibility-toggle {
            --row-toggle-w: 36px;
            --row-toggle-h: 132px;
            --row-circle: 32px;
            --row-border: #d9dfe3;
            --row-ink: #4e616d;
            --row-z: 10000;
        }
        #row-hover-drawer {
            position: fixed;
            left: 0;
            top: 50%;
            z-index: var(--row-z);
            translate: 0 -50%;

            .row-drawer-toggle {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 6px;
                box-sizing: border-box;
                width: var(--row-toggle-w);
                height: var(--row-toggle-h);
                padding: 8px 5px;
                border: 1px solid var(--row-border);
                border-radius: 8px;
                background: oklch(95.6% 0.045 203.388);
                color: var(--row-ink);
                cursor: pointer;

                &:hover:not(:disabled) {
                    background: oklch(91.7% 0.08 205.041);
                }
                &[aria-pressed="true"] {
                    border-color: var(--row-ink);
                }
            }
            .row-drawer-label {
                writing-mode: vertical-rl;
                letter-spacing: 2px;
            }
            .row-drawer-divider {
                width: 16px;
                border-top: 1px solid currentColor;
                opacity: .4;
            }
            .row-drawer-count {
                color: #884898;
                font-family: ui-monospace, Consolas, monospace;
                white-space: nowrap;
            }
            .row-drawer-panel {
                position: fixed;
                inset: 50% auto auto var(--row-toggle-w);
                box-sizing: border-box;
                width: min(700px, calc(100dvw - var(--row-toggle-w) - 6px));
                max-height: min(90dvh, 900px);
                margin: 0;
                padding: 0;
                overflow: auto;
                overscroll-behavior: contain;
                border: 1px solid var(--row-border);
                border-radius: 8px;
                box-shadow: 3px 3px 12px rgb(0 0 0 / 15%);
                color: inherit;
                translate: 0 -50%;
            }
            .th {
                position: sticky;
                top: 0;
                z-index: 1;
                margin: 0;
                padding: 0;
            }
            .bm_c { padding: 0; }
            & table {
                border-spacing: 0;
            }
            & th, & td {
                box-sizing: border-box;
                padding: 6px 8px !important;
                text-align: left;
                vertical-align: middle;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }
            .icn {
                padding: 0 !important;
                text-align: center;

                > a {
                    display: block;
                    padding-block: 6px;
                    line-height: 1;
                }
            }
            & td:nth-of-type(2) { width: 100px; }
            & td:nth-of-type(3) { width: 112px; }
            & td:nth-of-type(n+4),
            & td > em {
                display: none;
            }
            & cite {
                overflow: hidden;
                text-overflow: ellipsis;
            }
        }
        #row-visibility-toggle {
            position: fixed;
            left: calc((var(--row-toggle-w) - var(--row-circle)) / 2);
            top: calc(50% + var(--row-toggle-h) / 2 + 8px);
            z-index: var(--row-z);
            box-sizing: border-box;
            width: var(--row-circle);
            height: var(--row-circle);
            padding: 0;
            border: 1px solid var(--row-border);
            border-radius: 50%;
            font-size: 1rem;
            line-height: 1;
            cursor: pointer;

            &[aria-pressed="true"] {
                background: oklch(95% 0.052 163.051);

                &:hover {
                    background: oklch(90.5% 0.093 164.15);
                }
            }
            &[aria-pressed="false"] {
                background: oklch(87.2% 0.01 258.338);

                &:hover {
                    background: oklch(70.7% 0.022 261.325);
                }
            }
        }
    `;
    document.head.appendChild(style);

    const drawer = document.createElement("div");
    drawer.id = "row-hover-drawer";
    const toggle = document.createElement("button");
    toggle.className = "row-drawer-toggle";
    toggle.innerHTML = `
        <span class="row-drawer-label">不感兴趣</span>
        <span class="row-drawer-divider"></span>
        <span class="row-drawer-count">${matches.length}</span>
    `;
    toggle.disabled = matches.length === 0;
    drawer.appendChild(toggle);
    document.body.appendChild(drawer);
    if (toggle.disabled) return;

    const panel = document.createElement("div");
    panel.className = "row-drawer-panel tl bm bmw";
    panel.popover = "manual";
    panel.innerHTML = `
        <div class="th">
            <table><tbody><tr>
                <td class="icn"></td>
                <th>标题</th>
                <td class="by">版块/群组</td>
                <td class="by">作者</td>
            </tr></tbody></table>
        </div>
        <div class="bm_c"><table><tbody></tbody></table></div>
    `;
    const body = panel.querySelector(".bm_c tbody");
    for (const { row, title, forumName, authorName } of matches) {
        const drawerRow = row.cloneNode(true);
        const drawerTitle = drawerRow.querySelector(".xst");
        drawerTitle.parentElement.replaceChildren(drawerTitle);
        drawerTitle.title = drawerTitle.textContent.trim();
        drawerRow.cells[2].title = forumName;
        drawerRow.cells[3].title = authorName;
        body.appendChild(drawerRow);
        row.classList.add("row-uninterested");

        title.addEventListener("mousedown", () => drawerRow.classList.add("row-read"), { once: true });
        drawerTitle.addEventListener("mousedown", () => title.dispatchEvent(new MouseEvent("mousedown")), { once: true });
    }
    drawer.appendChild(panel);

    let hovered = false;
    let pinned = false;
    const update = () => {
        const open = hovered || pinned;
        if (panel.matches(":popover-open") !== open) panel.togglePopover();
        toggle.setAttribute("aria-pressed", pinned);
    };
    drawer.addEventListener("mouseenter", () => { hovered = true; update(); });
    drawer.addEventListener("mouseleave", () => { hovered = false; update(); });
    toggle.addEventListener("click", () => { pinned = !pinned; update(); });
    update();

    const visibilityToggle = document.createElement("button");
    visibilityToggle.id = "row-visibility-toggle";
    let listHidden = localStorage.getItem("hideUninterested") !== "false";
    const updateList = () => {
        visibilityToggle.setAttribute("aria-pressed", !listHidden);
        visibilityToggle.textContent = listHidden ? "" : "✅";
    };
    visibilityToggle.addEventListener("click", () => {
        listHidden = !listHidden;
        localStorage.setItem("hideUninterested", listHidden);
        updateList();
    });
    updateList();
    document.body.appendChild(visibilityToggle);

})();