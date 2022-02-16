// ==UserScript==
// @name         Row.js
// @version      0.4
// @author       lycloud
// @match        https://keylol.com/f*
// @match        https://www.chiphell.com/forum-*
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

    for (let i = 0; i < row.length; i++) {
        let rowId = row[i].href.substring(row[i].href.lastIndexOf("/") + 1)
        let rowElement = row[i].closest("tr").children

        // Mark read rows in Gist storage
        if (remoteContent[SITE].includes(rowId)) {
            for (let j = 0; j < rowElement.length; j++) {
                rowElement[j].style.background = "#ccc"
            }
        } else {
            // addEventListener for unread rows
            row[i].addEventListener("mousedown", () => {
                // Mark as read
                for (let j = 0; j < rowElement.length; j++) {
                    rowElement[j].style.background = "#ccc"
                }
                // remoteContent Push & Splice
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
