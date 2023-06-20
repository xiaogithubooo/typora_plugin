window.onload = () => {
    const config = {
        caseSensitive: false,
        separator: " ",
        allowedExtensions: ["", "md", "markdown", "mdown", "mmd", "text", "txt", "rmarkdown",
            "mkd", "mdwn", "mdtxt", "rmd", "mdtext", "apib"],
        hotkey: event => event.ctrlKey && event.shiftKey && event.keyCode === 80, // 懒得写keycodes映射函数,能用就行
    };

    (() => {
        // insert css
        const modal_css = `
            #typora-search-multi {
                position: fixed;
                left: 50%;
                width: 420px;
                margin-left: -200px;
                z-index: 9999;
                padding: 4px;
                background-color: #f8f8f8;
                box-shadow: 0 4px 10px rgba(0, 0, 0, .5);
                border: 1px solid #ddd;
                border-top: none;
                color: var(--text-color);
                margin-top: 0;
                transform: translate3d(0, 0, 0)
            }
            
            #typora-search-multi .ty-quick-open-category-title {
                border-top: none;
            }
            
            .mac-seamless-mode #typora-search-multi {
                top: 30px
            }
            
            .mac-seamless-mode .modal-dialog {
                margin-top: 40px
            }
            
            #typora-search-multi-input {
                position: relative;
            }
            
            #typora-search-multi-input input {
                width: 100%;
                font-size: 14px;
                line-height: 25px;
                max-height: 27px;
                overflow: auto;
                border: 1px solid #ddd;
                box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);
                border-radius: 2px;
                padding-left: 5px
            }
            
            #typora-search-multi-input input:focus {
                outline: 0
            }
            
            #typora-search-multi-input svg.icon {
                width: 20px;
                height: 14px;
                stroke: none;
                fill: currentColor
            }
            
            #typora-search-multi-input .searchpanel-search-option-btn {
                position: absolute;
                right: 6px;
                top: 6px;
                opacity: .5;
                border: none
            }
            
            #typora-search-multi-input .searchpanel-search-option-btn.select,
            #typora-search-multi-input .searchpanel-search-option-btn:hover {
                background: var(--active-file-bg-color);
                color: var(--active-file-text-color);
                opacity: 1
            }
            
            .typora-search-multi-item {
                display: block;
                font-size: 14px;
                height: 40px;
                padding-left: 20px;
                padding-right: 20px;
                padding-top: 2px;
                overflow: hidden
            }
            
            .typora-search-multi-item:hover,
            .typora-search-multi-item.active {
                background-color: var(--active-file-bg-color);
                border-color: var(--active-file-text-color);
                color: var(--active-file-text-color);
                cursor: pointer;
            }
            
            .typora-search-multi-item-title {
                line-height: 24px;
                max-height: 24px;
                overflow: hidden
            }
            
            .typora-search-multi-list {
                margin-top: 0;
                cursor: default;
                max-height: 320px;
                overflow-x: hidden;
                overflow-y: auto;
            }
            
            .typora-search-multi-list-inner {
                position: relative
            }
            
            
            .typora-search-multi-item-path {
                opacity: .5;
                font-size: 11px;
                margin-top: -4px;
                text-overflow: ellipsis;
                width: 100%;
                overflow: hidden;
                white-space: nowrap;
                line-height: 14px
            }
            
            .typora-search-multi-info-item {
                opacity: .7;
                font-size: 12px;
                line-height: 40px;
                position: relative;
                padding-left: 20px
            }`
        const style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = modal_css;
        document.getElementsByTagName("head")[0].appendChild(style);

        // insert html
        const search_div = `
            <div id="typora-search-multi-input">
                <input type="text" class="input" tabindex="1" autocorrect="off" spellcheck="false"
                    autocapitalize="off" value="" placeholder="多关键字查找，空格为分隔符"
                    data-localize="Search by file name" data-lg="Front">
                <span ty-hint="区分大小写" id="typora-search-multi-case-option-btn" class="searchpanel-search-option-btn" aria-label="区分大小写">
                    <svg class="icon">
                        <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#find-and-replace-icon-case"></use>
                    </svg>
                </span>
            </div>
        
            <div class="typora-search-multi-list" id="typora-search-multi-list" style="display:none">
                <div class="ty-quick-open-category ty-has-prev" id="ty-quick-open-infolder-category">
                    <div class="ty-quick-open-category-title" data-localize="File Results" data-lg="Menu" style="height: auto;">
                        匹配的文件
                    </div>
                    <div class="typora-search-multi-list-inner" style="height: 520px;">
                        <div class="quick-open-group-block" data-block-index="0"
                            style="position: absolute; top: 0; width: 100%;">
                        </div>
                    </div>
                </div>
            </div>
        
            <div class="typora-search-multi-info-item" style="display:none">
                <div class="typora-search-multi-info" data-localize="Searching" data-lg="Front">Searching</div>
                <div class="typora-search-spinner">
                    <div class="rect1"></div>
                    <div class="rect2"></div>
                    <div class="rect3"></div>
                    <div class="rect4"></div>
                    <div class="rect5"></div>
                </div>
            </div>`;
        const searchModal = document.createElement("div");
        searchModal.id = 'typora-search-multi';
        searchModal.className = 'modal-dialog';
        searchModal.style.display = "none";
        searchModal.innerHTML = search_div;
        const quickOpenNode = document.getElementById("typora-quick-open");
        quickOpenNode.parentNode.insertBefore(searchModal, quickOpenNode.nextSibling);

        // init case sensitive
        config.caseSensitive = document.querySelector("#typora-search-multi-case-option-btn").classList.contains("select")
    })();

    const modal = {
        searchModal: document.getElementById('typora-search-multi'),
        searchInfo: document.querySelector(".typora-search-multi-info-item"),
        searchList: document.querySelector("#typora-search-multi-list"),
        searchBlock: document.querySelector(".typora-search-multi-list-inner .quick-open-group-block"),
        searchInput: document.querySelector("#typora-search-multi-input input"),
        searchCaseOption: document.querySelector("#typora-search-multi-case-option-btn"),
        searchResultTitle: document.querySelector(".typora-search-multi-list .ty-quick-open-category-title")
    }

    const hiddenDivWrapped = () => {
        let once = true;
        let hiddenNode;

        return (filePath) => {
            if (once || !hiddenNode) {
                (() => {
                    const hidden_div = `
                <div class="typora-multi-search-hidden-node file-library-node file-tree-node file-library-file-node active" 
                        data-path="{{}}" data-has-sub="false" tabindex="-1" data-is-directory="false" style="display: none;">
                    <div class="file-node-background"></div>
                    <div class="file-node-content" draggable="true">
                        <span class="file-node-open-state">
                            <i class="fa fa-caret-right"></i>
                            <i class="fa fa-caret-down"></i>
                        </span>
                    <i class="file-node-icon fa fa-file-text-o"></i>
                    <span class="file-node-title" title="{{}}">
                        <span class="file-node-title-name-part"></span>
                        <span class="file-node-title-ext-part"></span>
                    </span>
                    <div class="file-tree-rename-div">
                        <input class="file-tree-rename-input">
                    </div>
                    </div>
                        <div class="file-node-children">
                    </div>
                </div>`
                    let firstDir = document.querySelector("#file-library-tree .file-node-children")
                    firstDir.insertAdjacentHTML('beforeend', hidden_div);
                    hiddenNode = firstDir.querySelector(".typora-multi-search-hidden-node")
                    once = false;
                })();
            }

            hiddenNode.setAttribute("data-path", filePath)
            hiddenNode.querySelector(".file-node-title").click()
            console.log("click")
        }
    }

    const openFileInThisWindow = hiddenDivWrapped()

    const pkg = {path: reqnode('path'), fs: reqnode('fs'),}
    const separator = File.isWin ? "\\" : "/";
    const getRootPath = File.getMountFolder

    const openFileOrFolder = (path, isFolder) => {
        // 路径是否在挂载文件夹下
        const isUnderMountFolder = (path, mountFolder) => {
            const subPath = mountFolder.replace(/[\/\\]$/, "") + separator + path;
            return path && mountFolder && subPath.startsWith(mountFolder);
        }

        if (File.isMac) {
            const handler = isFolder ? "controller.openFolder" : "path.openFile";
            bridge.callHandler(handler, path);
        } else if (File.isNode) {
            if (isFolder) {
                JSBridge.invoke("app.openFolder", path, true);
            } else {
                const folder = File.getMountFolder();
                const mountFolder = isUnderMountFolder(path, folder) ? folder : undefined;
                JSBridge.invoke("app.openFileOrFolder", path, {mountFolder: mountFolder});
            }
        }
    }

    const traverseDir = (dir, filter, callback) => {
        return new Promise((resolve, reject) => {
            pkg.fs.readdir(dir, (err, files) => {
                if (err) {
                    reject(err);
                    return
                }

                for (const file of files) {
                    const filePath = pkg.path.join(dir, file);
                    pkg.fs.stat(filePath, (err, stats) => {
                        if (err) {
                            reject(err);
                            return
                        }
                        if (stats.isFile()) {
                            if (filter && !filter(filePath)) {
                                resolve();
                                return
                            }
                            pkg.fs.readFile(filePath, 'utf8', (err, data) => {
                                if (err) {
                                    reject(err);
                                    return
                                }
                                callback(filePath, data);
                            });
                        } else if (stats.isDirectory()) {
                            traverseDir(filePath, filter, callback);
                        }
                    });
                }
            });
        })
    }

    const canOpenByTypora = (filename) => {
        if (filename[0] === ".") {
            return false
        }
        let ext = pkg.path.extname(filename).replace(/^\./, '');
        if (~config.allowedExtensions.indexOf(ext.toLowerCase())) {
            return true
        }
    }

    const appendItemFunc = (keyArr) => {
        let index = 0;
        let once = true;

        return (filePath, data) => {
            if (!config.caseSensitive) {
                data = data.toLowerCase();
            }
            for (const keyword of keyArr) {
                if (data.indexOf(keyword) === -1) {
                    return false
                }
            }

            index++;
            const parseUrl = pkg.path.parse(filePath);
            const item = `
                <div class="typora-search-multi-item" data-is-dir="false"
                    data-path="${filePath}" data-index="${index}">
                    <div class="typora-search-multi-item-title">${parseUrl.base}</div>
                    <div class="typora-search-multi-item-path">${parseUrl.dir}${separator}</div>
                </div>`;
            modal.searchBlock.insertAdjacentHTML('beforeend', item);
            modal.searchResultTitle.textContent = `匹配的文件: ${index}`;

            if (once) {
                modal.searchList.style.display = "block";
                once = false;
            }
        }
    }

    async function searchMulti(rootPath, keys) {
        if (!rootPath) {
            return
        }
        let keyArr = keys.split(config.separator).filter(Boolean);
        if (!keyArr) {
            return
        }
        if (!config.caseSensitive) {
            keyArr = keyArr.map(ele => ele.toLowerCase());
        }
        const appendItem = appendItemFunc(keyArr);
        await traverseDir(rootPath, canOpenByTypora, appendItem);
    }

    modal.searchInput.addEventListener("keydown", (event) => {
        if (event.keyCode === 13) {
            modal.searchList.style.display = "none";
            modal.searchInfo.style.display = "block";
            modal.searchBlock.innerHTML = "";
            const workspace = getRootPath();
            searchMulti(workspace, modal.searchInput.value).then(
                () => modal.searchInfo.style.display = "none"
            );
        } else if (event.keyCode === 27) {
            modal.searchModal.style.display = "none";
            modal.searchInfo.style.display = "none";
        }
    });

    modal.searchBlock.addEventListener("click", event => {
        for (const ele of event.path) {
            if (ele.className === "typora-search-multi-item") {
                const filepath = ele.getAttribute("data-path");
                if (event.ctrlKey) {
                    openFileOrFolder(filepath, false);
                    event.preventDefault();
                    event.stopPropagation();
                    return
                } else {
                    openFileInThisWindow(filepath)
                    return
                }
            }
        }
    });

    window.onkeydown = event => {
        if (config.hotkey(event)) {
            modal.searchModal.style.display = "block";
            modal.searchInput.select();
            event.preventDefault();
            event.stopPropagation();
        }
    }

    modal.searchCaseOption.addEventListener("click", event => {
        modal.searchCaseOption.classList.toggle("select");
        config.caseSensitive = !config.caseSensitive;
        event.preventDefault();
        event.stopPropagation();
    })

    console.log("search_multi.js had been injected");
}