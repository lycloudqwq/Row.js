// ==UserScript==
// @name         Row.js-Gitee
// @version      0.9
// @author       lycloud
// @match        https://keylol.com/f*
// @match        https://share.dmhy.org/*
// @match        https://www.chiphell.com/forum.php?*
// @match        https://pterclub.com/torrents.php*
// @match        https://www.beitai.pt/torrents.php*
// @match        https://www.pthome.net/torrents.php*
// @match        https://pt.btschool.club/torrents.php*
// @run-at       document-end
// @description  Personal use script to mark rows as read
// ==/UserScript==

(async () => {
    const PA_TOKEN = "******"
    const GIST_ID = "31qp50jf7movgsr2hxciu73"
    const GIST_FILE = "row.json"
    const SITE = window.location.hostname
    const SITE_SELECTOR = {
        "keylol.com": ".xst",
        "www.chiphell.com": ".s",
        "share.dmhy.org": ".title > a",
        "pterclub.com": ".torrentname a[title]",
        "www.beitai.pt": ".torrentname a[title]",
        "www.pthome.net": ".torrentname a[title]",
        "pt.btschool.club": ".torrentname a[title]",
    }

    let row = document.querySelectorAll(SITE_SELECTOR[SITE])
    const color = (index) => {
        for (const element of row[index].closest("tr").children) {
            element.style.background = "#98D98E"
        }
        // PT sites only to color the outer tr
        if (document.querySelector(".torrents")) {
            for (const element of document.querySelectorAll(".torrents>tbody>tr")[index + 1].children) {
                element.style.background = "#98D98E"
            }
        }
        // Disable alternating row colors in dmhy
        if (SITE === "share.dmhy.org") {
            for (const element of document.querySelectorAll(".tablesorter tr.even")) {
                element.setAttribute("class", "odd")
            }
        }
    }

    // Gist Read
    let remoteContent = await fetch(`https://gitee.com/api/v5/gists/${GIST_ID}?access_token=${PA_TOKEN}`)
        .then(response => response.json())
        .then(content => content.files[GIST_FILE].content)
        .then(remoteContent => { return JSON.parse(remoteContent) })

    for (let index = 0; index < row.length; index++) {
        let rowId = row[index].href.match(/\d+/)[0]
        if (remoteContent[SITE].includes(rowId)) {
            // Mark read rows in Gist storage
            color(index)
        } else {
            // addEventListener for unread rows
            row[index].addEventListener("mousedown", () => {
                color(index)
                // Control the size of remoteContent
                remoteContent[SITE].push(rowId)
                if (remoteContent[SITE].length > 1000) {
                    remoteContent[SITE].splice(0, 400)
                }
                // Gist Write
                fetch(`https://gitee.com/api/v5/gists/${GIST_ID}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        access_token: PA_TOKEN,
                        files: {
                            [GIST_FILE]: {
                                content: JSON.stringify(remoteContent)
                            }
                        }
                    })
                })
            }, { once: true })
        }
    }
})();
