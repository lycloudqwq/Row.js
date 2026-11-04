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
        "旅游摄影","美食烹饪",
        "华语汉化","游戏互鉴",
        "平台技术问题","平台购物问题","其乐社区问题","资源问题","游戏／成就／汉化问题","软件硬件／其他问题",
        "移动平台","GOG","战网","Windows 商店","杉果","方块游戏平台","腾讯 WeGame",
        "刀塔","明日方舟","动视暴雪"
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
            #row-hover-drawer {
                position: fixed;
                left: 0;
                top: 50%;
                z-index: 10000;
                width: 36px;
                height: 132px;
                transform: translateY(-50%);
            }
            #row-hover-drawer .row-drawer-toggle {
                position: relative;
                z-index: 2;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 6px;
                box-sizing: border-box;
                width: 36px;
                height: 132px;
                padding: 8px 5px;
                border: 1px solid #d9dfe3;
                border-radius: 8px;
                background: oklch(95.6% 0.045 203.388);
                color: #4e616d;
                cursor: pointer;
            }
            #row-hover-drawer .row-drawer-label {
                writing-mode: vertical-rl;
                letter-spacing: 2px;
            }
            #row-hover-drawer .row-drawer-divider {
                width: 16px;
                border-top: 1px solid currentColor;
                opacity: .4;
            }
            #row-hover-drawer .row-drawer-count {
                color: #884898;
                font-family: ui-monospace, Consolas, monospace;
                white-space: nowrap;
            }
            #row-hover-drawer .row-drawer-toggle:hover {
                background: oklch(91.7% 0.08 205.041);
            }
            #row-hover-drawer .row-drawer-toggle.is-pinned {
                border-color: #4e616d;
            }
            #row-hover-drawer .row-drawer-panel {
                position: absolute;
                left: 100%;
                top: 50%;
                box-sizing: border-box;
                width: min(700px, calc(100vw - 42px));
                max-height: min(90vh, 900px);
                margin: 0;
                overflow: auto;
                overscroll-behavior: contain;
                border: 1px solid #d9dfe3;
                border-radius: 8px;
                box-shadow: 3px 3px 12px rgb(0 0 0 / 15%);
                visibility: hidden;
                pointer-events: none;
                opacity: 0;
                transform: translate(-100%, -50%);
                transition: transform .08s ease-out, opacity .08s ease-out, visibility .08s;
            }
            #row-hover-drawer.is-open .row-drawer-panel {
                visibility: visible;
                pointer-events: auto;
                opacity: 1;
                transform: translate(0, -50%);
            }
            #row-hover-drawer .th {
                position: sticky;
                top: 0;
                z-index: 1;
                margin: 0;
                padding: 0;
            }
            #row-hover-drawer .bm_c { padding: 0; }
            #row-hover-drawer table {
                border-spacing: 0;
            }
            #row-hover-drawer th, #row-hover-drawer td {
                box-sizing: border-box;
                padding: 6px 8px !important;
                text-align: left;
                vertical-align: middle;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }
            #row-hover-drawer .row-drawer-forum { width: 100px; }
            #row-hover-drawer .row-drawer-author { width: 112px; }
            #row-hover-drawer .xst,
            #row-hover-drawer .row-drawer-forum > a,
            #row-hover-drawer cite,
            #row-hover-drawer cite > a {
                display: block;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            @media (max-width: 520px) {
                #row-hover-drawer .row-drawer-forum { width: 76px; }
                #row-hover-drawer .row-drawer-author { width: 84px; }
            }
            @media (prefers-reduced-motion: reduce) {
                #row-hover-drawer .row-drawer-panel { transition: none; }
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
            titleCell.replaceChildren(title);
            title.title = title.textContent.trim();

            forumCell.classList.add("by", "row-drawer-forum");
            forumCell.title = forumName;
            authorCell.classList.add("row-drawer-author");
            authorCell.replaceChildren(author);
            authorCell.title = author.textContent.trim();

            row.replaceChildren(titleCell, forumCell, authorCell);
            body.appendChild(row);
        }
        drawer.appendChild(panel);

        let hovered = false;
        let pinned = false;
        const update = () => {
            drawer.classList.toggle("is-open", hovered || pinned);
            toggle.classList.toggle("is-pinned", pinned);
        };
        drawer.addEventListener("mouseenter", () => { hovered = true; update(); });
        drawer.addEventListener("mouseleave", () => { hovered = false; update(); });
        toggle.addEventListener("click", () => { pinned = !pinned; update(); });
    }

})();
