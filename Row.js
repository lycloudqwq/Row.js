// ==UserScript==
// @name         Row.js
// @version      0.4
// @author       lycloud
// @description  Personal use script to mark rows as read
// ==/UserScript==

(() => {

    const PA_TOKEN = "ghp_*****"
    const GIST_USER = "lycloudqwq"
    const GIST_ID = "e259cb1aae0b7b129b29f762c42bec82"
    const GIST_FILE = "row.json"

    // Gist Read
    let response = await fetch("https://gist.githubusercontent.com/" + GIST_USER + "/" + GIST_ID + "/raw/" + GIST_FILE)
    let text = await response.text()
    let remoteContent = JSON.parse(text)

    // Keylol Prototype with basic function
    let rows = document.querySelectorAll("table>tbody>tr>th.common>a")
    for (let i = 0; i < rows.length; i++) {

        // Mark as read from Gist storage
        let theadId = rows[i].href.substring(rows[i].href.lastIndexOf('/') + 1)
        if (remoteContent["keylol.com"].includes(theadId)) {
            // 适用于无特殊效果
            // rows[i].closest("tbody").style.background = "#ccc"

            // 适用于有特殊效果
            let elementGrey = rows[i].closest("tr").children
            for (let j = 0; j < elementGrey.length; j++) {
                elementGrey[j].style.background = "#ccc"
            }
        }

        // addEventListener for mousedown
        rows[i].addEventListener("mousedown", () => {

            // Mark as read
            elementGrey = rows[i].closest("tr").children
            for (let j = 0; j < elementGrey.length; j++) {
                elementGrey[j].style.background = "#ccc"
            }

            // remoteContent Push & Splice
            if (remoteContent["keylol.com"].includes(theadId) === false) {
                remoteContent["keylol.com"].push(theadId)
            }
            if (remoteContent.length > 400) {
                remoteContent["keylol.com"].splice(0, 200)
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


})();
