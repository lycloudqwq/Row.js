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
    const color = (index) => {
        ROWS[index].closest("tr").classList.add("row-read");
    }

    // Load saved read threads
    const readThreads = JSON.parse(localStorage.getItem('readThreads') || '[]');

    // Add event listener to unread rows and save read status to localStorage
    for (let index = 0; index < ROWS.length; index++) {
        const rowId = ROWS[index].href.match(/\d+/)[0];
        if (readThreads.includes(rowId)) {
            color(index);
        } else {
            ROWS[index].addEventListener("mousedown", () => {
                color(index);
                readThreads.push(rowId);
                if (readThreads.length > 1000) {
                    readThreads.splice(0, 400);
                }
                localStorage.setItem('readThreads', JSON.stringify(readThreads));
            }, { once: true })
        }
    }

    createHoverDrawer();

    function createHoverDrawer() {
        const threadList = document.querySelector("#threadlist");
        if (!threadList) return;

        const matches = [];
        for (const title of ROWS) {
            const row = title.closest("tr");
            const titleCell = title.parentElement;
            const author = row.querySelector("td.by cite");
            if (!author) continue;

            const cells = Array.from(row.children);
            const authorCell = author.closest("td");
            const forumCell = cells.find(cell => cell.matches("td.by, td.frm") && !cell.querySelector("cite"));
            const forumName = forumCell.textContent.trim();
            const authorName = author.textContent.trim();

            if (!UNINTERESTED_FORUMS.has(forumName) && !UNINTERESTED_AUTHORS.has(authorName)) continue;
            matches.push({ row, title, titleCell, forumCell, forumName, authorCell, author });
        }
        const forumOrder = new Map([...UNINTERESTED_FORUMS].map((name, index) => [name, index]));
        for (const { forumName } of matches) {
            if (!forumOrder.has(forumName)) forumOrder.set(forumName, forumOrder.size);
        }
        matches.sort((a, b) => forumOrder.get(a.forumName) - forumOrder.get(b.forumName));

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
                width: var(--row-toggle-w);
                height: var(--row-toggle-h);
                translate: 0 -50%;

                .row-drawer-toggle {
                    position: relative;
                    z-index: 2;
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
                    container-type: inline-size;
                    position: absolute;
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
                    opacity: 0;
                    translate: -100% -50%;
                    transition: translate .08s ease-out, opacity .08s ease-out, display .08s, overlay .08s, visibility .08s;
                    transition-behavior: allow-discrete;

                    &[popover] {
                        position: fixed;
                    }
                    &:not([popover], .is-open) {
                        visibility: hidden;
                        pointer-events: none;
                    }
                    &:is(:popover-open, .is-open) {
                        opacity: 1;
                        translate: 0 -50%;

                        @starting-style {
                            opacity: 0;
                            translate: -100% -50%;
                        }
                    }
                    @media (prefers-reduced-motion: reduce) {
                        transition: none;
                    }
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
                .row-drawer-forum { width: 100px; }
                .row-drawer-author { width: 112px; }
                .xst,
                .row-drawer-forum > a,
                & cite,
                & cite > a {
                    display: block;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                @container (max-width: 476px) {
                    .row-drawer-forum { width: 76px; }
                    .row-drawer-author { width: 84px; }
                }
            }
            #row-visibility-toggle {
                position: fixed;
                left: calc((var(--row-toggle-w) - var(--row-circle)) / 2);
                top: calc(50% + var(--row-toggle-h) / 2 + 8px);
                z-index: var(--row-z);
                display: flex;
                align-items: center;
                justify-content: center;
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
        toggle.type = "button";
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
        const supportsPopover = "popover" in HTMLElement.prototype;
        if (supportsPopover) panel.popover = "manual";

        panel.innerHTML = `
            <div class="th">
                <table><tbody><tr>
                    <th class="common">标题</th>
                    <td class="by row-drawer-forum">版块/群组</td>
                    <td class="by row-drawer-author">作者</td>
                </tr></tbody></table>
            </div>
            <div class="bm_c"><table><tbody></tbody></table></div>
        `;
        const body = panel.querySelector(".bm_c tbody");
        for (const { row, title, titleCell, forumCell, forumName, authorCell, author } of matches) {
            const drawerTitle = title.cloneNode(true);
            drawerTitle.title = title.textContent.trim();
            const drawerTitleCell = titleCell.cloneNode(false);
            drawerTitleCell.append(drawerTitle);

            const drawerForumCell = forumCell.cloneNode(true);
            drawerForumCell.classList.add("by", "row-drawer-forum");
            drawerForumCell.title = forumName;

            const drawerAuthorCell = authorCell.cloneNode(false);
            drawerAuthorCell.classList.add("row-drawer-author");
            drawerAuthorCell.append(author.cloneNode(true));
            drawerAuthorCell.title = author.textContent.trim();

            const drawerRow = row.cloneNode(false);
            drawerRow.append(drawerTitleCell, drawerForumCell, drawerAuthorCell);
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
            if (!supportsPopover) panel.classList.toggle("is-open", open);
            else if (panel.matches(":popover-open") !== open) panel.togglePopover();
            toggle.setAttribute("aria-pressed", String(pinned));
        };
        drawer.addEventListener("mouseenter", () => { hovered = true; update(); });
        drawer.addEventListener("mouseleave", () => { hovered = false; update(); });
        toggle.addEventListener("click", () => { pinned = !pinned; update(); });
        update();

        const visibilityToggle = document.createElement("button");
        visibilityToggle.type = "button";
        visibilityToggle.id = "row-visibility-toggle";
        let listHidden = localStorage.getItem("hideUninterested") !== "false";
        const updateList = () => {
            visibilityToggle.setAttribute("aria-pressed", String(!listHidden));
            visibilityToggle.textContent = listHidden ? "" : "✅";
        };
        visibilityToggle.addEventListener("click", () => {
            listHidden = !listHidden;
            localStorage.setItem("hideUninterested", String(listHidden));
            updateList();
        });
        updateList();
        document.body.appendChild(visibilityToggle);
    }

})();