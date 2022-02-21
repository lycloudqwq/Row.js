// ==UserScript==
// @name         Row.js
// @version      0.4
// @author       lycloud
// @match        https://keylol.com/f*
// @match        https://www.chiphell.com/forum.php?*
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
    let rows = document.querySelectorAll(SITE_SELECTOR[SITE])
    const color = (rowElement) => {
        for (let index = 0; index < rowElement.length; index++) {
            rowElement[index].style.background = "#ccc"
        }
    }

    for (const row of rows) {
        let rowId = row.href.substring(row.href.lastIndexOf("/") + 1)
        let rowElement = row.closest("tr").children

        // Mark read rows in Gist storage
        if (remoteContent[SITE].includes(rowId)) {
            color(rowElement)
        } else {
            // addEventListener for unread rows
            row.addEventListener("mousedown", () => {

                color(rowElement)
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
