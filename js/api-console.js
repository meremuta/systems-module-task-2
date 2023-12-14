var ApiConsole = function () {
    if (window.TryIt) {
        if (!window.API_CONSOLE_DATA) {
            this.load()
        } else {
            this.start()
        }
    }
}

ApiConsole.prototype.load = function () {
    let url
    let path = window.location.pathname
    let curVersion
    if (window.IS_CUSTOM_DOMAIN) {
        url = `/api/spec?path=${path}`
    } else {
        const pathArr = path.split('/')
        let owner = decodeURIComponent(pathArr[1])
        let urlName = decodeURIComponent(pathArr[2])
        curVersion = pathArr.length > 2 ? pathArr[3] : undefined
        url = `/api/specs/${owner}/${urlName}/tryitdata`
    }
    const headers = {'content-type': 'application/json'}
    if (curVersion)
        headers['Speca-Version'] = curVersion

    window.fetch(url, {
        method: 'GET',
        credentials: 'same-origin',
        headers: headers,
    }).then((response) => {
        if (response.ok) {
            response.json().then(data => {
                window.API_CONSOLE_DATA = data
                this.start()
            })
        } else {
            console.error('Unable to fetch API console data:', response.statusText)
        }
    }).catch((e)=>{
                console.error(e);
            })
}

ApiConsole.prototype.start = function () {
    this.enableButtons()
    this.createModal()
}

ApiConsole.prototype.enableButtons = function () {
    forEl(document.querySelectorAll('.spec-item-header[data-entity]'), el => {
        const type = el.getAttribute('data-entity')
        if (type === 'method') {
            const id = el.getAttribute('data-entity-id')
            const buttonsQueryResult = el.getElementsByClassName('spec-item-header__controls')
            let buttons
            if (buttonsQueryResult.length === 0) {
                buttons = document.createElement('div')
                buttons.classList.add('spec-item-header__controls')
                el.appendChild(buttons)
            } else {
                buttons = buttonsQueryResult.item(0)
            }
            const apiConsoleBtn = document.createElement('a')
            apiConsoleBtn.setAttribute('href', '')
            const apiConsoleBtnIcon = document.createElement('i')
            apiConsoleBtnIcon.classList.add('fa', 'fa-play')
            apiConsoleBtn.appendChild(apiConsoleBtnIcon)
            apiConsoleBtn.addEventListener('click', (event) => {
                event.preventDefault()
                this.show(id)
            })
            buttons.appendChild(apiConsoleBtn)
        }
    })
}

ApiConsole.prototype.createModal = function (operationId) {
    this.modal = document.createElement('div')
    this.modal.classList.add('modal')
    document.body.appendChild(this.modal)
    const content = document.createElement('div')
    content.classList.add('class', 'modal-content')
    this.modal.appendChild(content)
    TryIt.bootstrap(content, window.API_CONSOLE_DATA, operationId,
        () => {
            this.hide()
        },
        (id) => {
            console.log('Operation selected', id)
            if (id)
                window.location.hash = id
        })

    window.onclick = (event) => {
        if (event.target === this.modal) {
            this.hide();
        }
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            this.hide()
        }
    })
}

ApiConsole.prototype.show = function (operationId) {
    this.modal.style.display = 'block'
    TryIt.selectOperation(operationId)
}

ApiConsole.prototype.hide = function () {
    this.modal.style.display = 'none'
}