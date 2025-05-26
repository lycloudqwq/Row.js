// ==UserScript==
// @name        Row.js_local
// @namespace   https://github.com/lycloudqwq/Row.js
// @version     0.96
// @author      lycloud
// @include     https://keylol.com/f*
// @run-at      document-end
// ==/UserScript==

(() => {
    // const USER_HIDE = [];
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

})();
