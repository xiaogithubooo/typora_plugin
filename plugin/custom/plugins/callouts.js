class callouts extends BaseCustomPlugin {
    style = () => {
        const callouts = this.config.list.map(callout => {
            return `.plugin-callout[callout-type="${callout.type}"] {
                --callout-bg-color: ${callout.background_color};
                --callout-left-line-color: ${callout.left_line_color};
                --callout-icon: "${callout.icon}";
            }`
        }).join("\n");

        return `
            .plugin-callout {
                background-color: var(--callout-bg-color);
                border-left: 4px solid var(--callout-left-line-color);
                padding: 10px 10px 10px 15px;
                box-shadow: 0 0.2rem 0.5rem #0000000d, 0 0 0.05rem #0000001a;
                overflow: hidden;
            }
            
            .plugin-callout > p:first-child {
                margin: -10px -10px -10px -15px;
                padding: 10px 10px 10px 15px;
                letter-spacing: 1px;
            }
            
            .plugin-callout > p:first-child::before {
                font-family: ${this.config.font_family};
                content: var(--callout-icon);
                margin-right: 0.5em;
            }
            
            .callout-folded > p:first-child :not(:first-child) { display: none; }
            .callout-folded > p:not(:first-child) { display: none; }
            
            ${callouts}
        `
    }

    process = () => {
        this.utils.addEventListener(this.utils.eventType.firstFileInit, this.range);

        const write = document.querySelector("#write");
        const debounceRange = this.utils.debounce(this.range, 500);
        new MutationObserver(mutationList => {
            if (mutationList.some(m => m.type === "characterData")
                || mutationList.length && mutationList[0].addedNodes.length && mutationList[0].removedNodes.length) {
                debounceRange();
            }
        }).observe(write, {characterData: true, childList: true, subtree: true});

        write.addEventListener("click", ev => {
            const target = ev.target.closest(".callout-folded");
            target && target.classList.remove("callout-folded");
        })
    }

    range = () => {
        const pList = document.querySelectorAll("#write blockquote > p:first-child");
        pList.forEach(p => {
            const blockquote = p.parentElement;
            const result = p.textContent.match(/^\[!(?<type>\w+)\](?<fold>[+-]?)/);
            if (result && result.groups) {
                blockquote.classList.add("plugin-callout");
                blockquote.setAttribute("callout-type", result.groups.type.toLowerCase());
                (result.groups.fold === "-") && blockquote.classList.add("callout-folded");
            } else {
                blockquote.classList.remove("plugin-callout");
            }
        })
    }

    callback = anchorNode => this.utils.insertFence(anchorNode, `> [!NOTE]\n> this is note`)
}

module.exports = {
    plugin: callouts,
};