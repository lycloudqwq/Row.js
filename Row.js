// ==UserScript==
// @name         Row.js
// @version      0.6
// @author       lycloud
// @match        https://keylol.com/f*
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
    const GIST_ID = "e259cb1aae0b7b129b29f762c42bec82"
    const GIST_FILE = "row.json"

    const SITE = window.location.hostname
    const SITE_SELECTOR = {
        "keylol.com": ".xst",
        "www.chiphell.com": ".s",
        "pterclub.com": ".torrentname a[title]",
        "www.beitai.pt": ".torrentname a[title]",
        "www.pthome.net": ".torrentname a[title]",
        "pt.btschool.club": ".torrentname a[title]",
    }

    // Gist Read
    let response = await fetch("https://api.github.com/gists/" + GIST_ID, {
        headers: {
            "Authorization": "token " + PA_TOKEN
        }
    })
    let text = await response.text()

    let remoteContent = JSON.parse(JSON.parse(text).files[GIST_FILE].content)
    let row = document.querySelectorAll(SITE_SELECTOR[SITE])

    const color = (index) => {
        let rowElement = row[index].closest("tr").children
        for (const element of rowElement) {
            element.style.background = "#ccc"
        }
        // PT sites only to color the outer tr
        for (const element of document.querySelectorAll(".torrents>tbody>tr")[index + 1].children) {
            element.style.background = "#ccc"
        }
    }

    for (let index = 0; index < row.length; index++) {

        let rowId = row[index].href.match(/\d+/)[0]
        // Mark read rows in Gist storage
        if (remoteContent[SITE].includes(rowId)) {
            color(index)
        } else {
            // addEventListener for unread rows
            row[index].addEventListener("mousedown", () => {
                color(index)
                // Control the size of remoteContent
                remoteContent[SITE].push(rowId)
                if (remoteContent[SITE].length > 400) {
                    remoteContent[SITE].splice(0, 200)
                }
                // Gist Write
                fetch("https://api.github.com/gists/" + GIST_ID, {
                    method: "PATCH",
                    headers: {
                        "Authorization": "token " + PA_TOKEN
                    },
                    body: JSON.stringify({
                        files: {
                            [GIST_FILE]: {
                                content: JSON.stringify(remoteContent)
                            }
                        }
                    })
                })
            })
        }
    }

})();
