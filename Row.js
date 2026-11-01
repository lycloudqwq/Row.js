// ==UserScript==
// @name        Row.js_local
// @namespace   https://github.com/lycloudqwq/Row.js
// @version     0.97
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
        for (const element of ROWS[index].closest("tr").children) {
            element.style.background = "#98D98E";
        }
    }

    // Initialize readThreads array and localStorage
    if (!localStorage.getItem('readThreads')) {
        localStorage.setItem('readThreads', JSON.stringify([]));
    }
    let readThreads = JSON.parse(localStorage.getItem('readThreads') || '[]');

    // Add event listener to unread rows and save read status to localStorage
    for (let index = 0; index < ROWS.length; index++) {
        let rowId = ROWS[index].href.match(/\d+/)[0];
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
        if (!threadList || document.getElementById("row-hover-drawer")) return;

        const matches = [];
        const seenRows = new Set();
        for (const title of ROWS) {
            const row = title.closest("tr");
            if (!row || !threadList.contains(row) || seenRows.has(row)) continue;
            seenRows.add(row);

            const cells = Array.from(row.children);
            const authorCell = cells.find(cell => cell.matches("td.by") && cell.querySelector("cite"));
            const author = authorCell?.querySelector("cite");
            const forumCell = cells.find(cell => cell.matches("td.by, td.frm") && !cell.querySelector("cite"));
            const forumName = forumCell.textContent.trim();
            const authorName = author?.textContent.trim() || "";

            if (!UNINTERESTED_FORUMS.has(forumName) && !UNINTERESTED_AUTHORS.has(authorName)) continue;
            if (!author || !title.closest("th, td")) continue;
            matches.push({ row, title, forumCell, forumName, authorCell, author });
        }
        const forumOrder = new Map([...UNINTERESTED_FORUMS].map((name, index) => [name, index]));
        for (const { forumName } of matches) {
            if (!forumOrder.has(forumName)) forumOrder.set(forumName, forumOrder.size);
        }
        matches.sort((a, b) => forumOrder.get(a.forumName) - forumOrder.get(b.forumName));

        const style = document.createElement("style");
        style.textContent = `
            #row-hover-drawer {
                position: fixed;
                left: 0;
                top: 50%;
                z-index: 10000;
                width: 30px;
                height: 132px;
                transform: translateY(-50%);
            }
            #row-hover-drawer .row-drawer-toggle {
                position: relative;
                z-index: 2;
                display: block;
                box-sizing: border-box;
                width: 30px;
                height: 132px;
                margin: 0;
                padding: 8px 5px;
                border: 1px solid #d9dfe3;
                border-left: 0;
                border-radius: 0 4px 4px 0;
                background: #f7f7f7;
                color: #4e616d;
                font: inherit;
                font-size: 12px;
                line-height: 18px;
                writing-mode: vertical-rl;
                cursor: pointer;
            }
            #row-hover-drawer .row-drawer-toggle[aria-pressed="true"] {
                background: #4e616d;
                border-color: #4e616d;
                color: #fff;
            }
            #row-hover-drawer .row-drawer-panel {
                position: absolute;
                left: 100%;
                top: 50%;
                box-sizing: border-box;
                width: min(700px, calc(100vw - 42px));
                max-height: min(70vh, 600px);
                margin: 0;
                overflow: auto;
                overscroll-behavior: contain;
                border: 1px solid #d9dfe3;
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
                width: 100%;
                table-layout: fixed;
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
                white-space: nowrap;
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
        toggle.textContent = `不感兴趣 [${matches.length}]`;
        toggle.disabled = matches.length === 0;
        toggle.setAttribute("aria-controls", "row-hover-drawer-panel");

        const panel = document.createElement("div");
        panel.id = "row-hover-drawer-panel";
        panel.className = "row-drawer-panel tl bm bmw";
        panel.setAttribute("role", "region");
        panel.setAttribute("aria-label", "不感兴趣的帖子");

        const header = document.createElement("div");
        header.className = "th";
        const headerTable = document.createElement("table");
        const headerBody = document.createElement("tbody");
        const headerRow = document.createElement("tr");
        for (const [tag, name, className] of [
            ["th", "标题", "common"],
            ["td", "版块/群组", "by row-drawer-forum"],
            ["td", "作者", "by row-drawer-author"],
        ]) {
            const cell = document.createElement(tag);
            cell.className = className;
            cell.textContent = name;
            headerRow.appendChild(cell);
        }
        headerBody.appendChild(headerRow);
        headerTable.appendChild(headerBody);
        header.appendChild(headerTable);

        const content = document.createElement("div");
        content.className = "bm_c";
        const table = document.createElement("table");
        const body = document.createElement("tbody");
        for (const { row, title, forumCell, forumName, authorCell, author } of matches) {
            const titleCell = title.closest("th, td");
            titleCell.removeAttribute("colspan");
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
        table.appendChild(body);
        content.appendChild(table);

        panel.append(header, content);
        drawer.append(toggle, panel);
        document.body.appendChild(drawer);

        let hovered = false;
        let pinned = false;
        const update = () => {
            const open = matches.length > 0 && (hovered || pinned);
            drawer.classList.toggle("is-open", open);
            toggle.setAttribute("aria-expanded", String(open));
            toggle.setAttribute("aria-pressed", String(pinned));
            panel.setAttribute("aria-hidden", String(!open));
        };
        drawer.addEventListener("mouseenter", () => { hovered = true; update(); });
        drawer.addEventListener("mouseleave", () => { hovered = false; update(); });
        toggle.addEventListener("click", () => { pinned = !pinned; update(); });
        update();
    }

})();
