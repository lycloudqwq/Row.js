// ==UserScript==
// @name         Row.js
// @version      0.4
// @author       lycloud
// @description  Personal use script to mark rows as read
// ==/UserScript==

(() => {

    const PA_TOKEN = "ghp_*****"
    const GIST_ID = "e259cb1aae0b7b129b29f762c42bec82"
    const GIST_FILE_NAME = "row.json"

    // Gist Read
    let response = await fetch("https://gist.githubusercontent.com/lycloudqwq/" + GIST_ID + "/raw/" + GIST_FILE_NAME)
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

            // remoteContent Unshift & Pop
            if (remoteContent["keylol.com"].includes(theadId) === false) {
                remoteContent["keylol.com"].unshift(theadId)
            }
            if (remoteContent.length > 200) {
                remoteContent["keylol.com"].pop()
            }

            // Gist Write
            fetch("https://api.github.com/gists/" + GIST_ID, {
                method: "PATCG",
                headers: {
                    "Authorization": PA_TOKEN
                },
                body: JSON.stringify({
                    files: {
                        GIST_FILE_NAME: {
                            content: remoteContent
                        }
                    }
                })
            })

        })

    }


})();
