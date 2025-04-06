// ==UserScript==
// @name         Row.js
// @version      0.96
// @author       lycloud
// @match        https://keylol.com/f*
// @match        https://www.chiphell.com/forum.php?*
// @run-at       document-end
// @description  Personal use script to mark rows as read
// ==/UserScript==

(async () => {
    const PA_TOKEN = "github_pat_******"
    const GIST_ID = "******"
    const GIST_FILE = "rows.json"
    const SITE = window.location.hostname
    const SITE_SELECTOR = {
        "keylol.com": ".xst",
        "www.chiphell.com": ".s",
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
    let remoteContent = await fetch(`https://api.github.com/gists/${GIST_ID}/commits?per_page=1`, {
        cache: "no-store",
        headers: { "Authorization": "token " + PA_TOKEN }
    })
        .then(response => response.json())
        .then(data => {
            return fetch(`https://gist.githubusercontent.com/lycloudqwq/${GIST_ID}/raw/${data[0].version}`)
                .then(response => response.json())
                .then(remoteContent => { return remoteContent })
        })

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
                fetch(`https://api.github.com/gists/${GIST_ID}`, {
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
