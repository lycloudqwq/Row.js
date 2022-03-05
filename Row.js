// ==UserScript==
// @name         Row.js
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
    const PA_TOKEN = "ghp_******"
    const GIST_ID = "59a8d548d1029b5b78089154efabd01a"
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
            element.style.background = "#ccc"
        }
        // PT sites only to color the outer tr
        if (document.querySelector(".torrents")) {
            for (const element of document.querySelectorAll(".torrents>tbody>tr")[index + 1].children) {
                element.style.background = "#ccc"
            }
        }
    }

    (() => {
        if (SITE === "share.dmhy.org") {
            for (const element of document.querySelectorAll(".tablesorter tr.even")) {
                element.setAttribute("class", "odd")
            }
        }
    })()

    // Gist Read
    let response = await fetch("https://api.github.com/gists/" + GIST_ID, {
        cache: "no-store",
        headers: { "Authorization": "token " + PA_TOKEN }
    })
    let remoteContent = JSON.parse((await response.json()).files[GIST_FILE].content)

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
                fetch("https://api.github.com/gists/" + GIST_ID, {
                    method: "PATCH",
                    headers: { "Authorization": "token " + PA_TOKEN },
                    body: JSON.stringify({
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
