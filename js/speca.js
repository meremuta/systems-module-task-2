window.IS_CUSTOM_DOMAIN = !["speca.io", "dev.io"].includes(window.location.host)
const tabClass = 'spec-item-examples__tab'
const tabActiveClass = 'spec-item-examples__tab--active'
const exampleClass = 'spec-item-examples__example'
const exampleActiveClass = 'spec-item-examples__example--active'
const sidebarExpandedCl = 'sidebar--expanded'
const sidebarCollapsedCl = 'sidebar--collapsed'

const forEl = (elementList, fn) => [...elementList].forEach(fn)

const Speca = function () {
    this.init()
    this.initExampleTabs()
    this.initPlugins()
}

Speca.prototype.initPlugins = function () {
    if (window.ApiConsole)
        new ApiConsole()
}

Speca.prototype.init = function () {
    const menu = document.querySelector('.sidebar-items')
    const menuItems = [...menu.getElementsByTagName('a')]
    this.initMenuItemsEvents(menuItems)
    const scrollItems = this.findContentItems(menuItems)
    this.initScrollHandler(menu, menuItems, scrollItems)

    let toggler
    const sidebar = document.querySelector('.sidebar')
    const addToggler = () => {
        toggler = document.createElement('div')
        toggler.classList.add('sidebar-toggler')
        const icon = document.createElement('i')
        icon.classList.add('fa', 'fa-angle-right')
        toggler.appendChild(icon)
        document.querySelector('.sidebar').appendChild(toggler)
        toggler.addEventListener('click', (e) => {
            sidebar.classList.replace(sidebarCollapsedCl, sidebarExpandedCl)
        })
    }
    const removeToggler = () => {
        if (toggler) {
            document.querySelector('.sidebar').removeChild(toggler)
            toggler = null
        }
    }

    const onhashChange = () => {
        sidebar.classList.replace(sidebarExpandedCl, sidebarCollapsedCl)
    }

    const applyWindowSize = (e) => {
        var width = document.body.clientWidth
        if (width < 760) {
            if (!toggler) {
                addToggler()
                window.addEventListener('hashchange', onhashChange)
                sidebar.classList.add(sidebarCollapsedCl)
            }
        } else {
            removeToggler()
            sidebar.classList.remove(sidebarExpandedCl)
            sidebar.classList.remove(sidebarCollapsedCl)
            window.removeEventListener('hashchange', onhashChange)
        }
    }

    applyWindowSize()

    window.addEventListener('resize', function () {
        applyWindowSize()
    })
}


Speca.prototype.initExampleTabs = function () {
    forEl(document.getElementsByClassName(tabClass), tab => tab.addEventListener('click', event => {
        const tab = event.target
        const tabs = tab.parentElement
        forEl(tabs.children, el => el.classList.remove(tabActiveClass))
        tab.classList.add(tabActiveClass)
        forEl(tabs.parentElement.getElementsByClassName(exampleClass), el => {
            if (el.dataset.exampleName === tab.textContent)
                el.classList.add(exampleActiveClass)
            else
                el.classList.remove(exampleActiveClass)
        })
    }))
}

Speca.prototype.initMenuItemsEvents = function (menuItems) {
    menuItems.forEach((aElement) => {
        aElement.addEventListener('click', (event) => {
            const liElement = aElement.parentElement
            const itemType = liElement.dataset.itemType
            if (itemType === 'group') {
                const icon = aElement.querySelector('i')
                const ulElement = liElement.querySelector('ul')
                if (ulElement) {
                    if (ulElement.classList.contains('expanded')) {
                        if (icon)
                            icon.classList.replace('fa-angle-down', 'fa-angle-right')
                        if (itemType === 'group') event.preventDefault()
                    } else {
                        if (icon) {
                            icon.classList.replace('fa-angle-right', 'fa-angle-down')
                        }

                    }
                    ulElement.classList.toggle('expanded')
                }

            }
        })
    })
}


Speca.prototype.findContentItems = function (menuItems) {
    const contentElements = []
    menuItems.forEach((aElement) => {
        var href = aElement.getAttribute('href')
        if (href) {
            href = href.replace(/'/g, "\\'").replace("#", "")
            try {
                const item = document.querySelector("[id='" + href + "']")
                if (item) {
//                    item._top = item.offsetTop
                    contentElements.push(item)
                }
            } catch (e) {
                console.error('invalid expression: ' + href)
            }
        } else {
            console.log('!!!', a, href)
        }
    })
    return contentElements
}

Speca.prototype.initScrollHandler = function (menu, menuItems, scrollItems) {
    let lastId

    this._handle = function () {
        const currentScroll = document.documentElement.scrollTop || document.body.scrollTop

        // Get container scroll position
        const fromTop = currentScroll + 50

        // Get id of current scroll item
        let cur
        for (let i = scrollItems.length - 1; i >= 0; i--) {
            cur = scrollItems[i]
            if (cur.offsetTop < fromTop)
                break
        }

        // Get the id of the current element
        const id = (cur && cur.id) || ''
        if (lastId !== id) {
            if (lastId) {
                const lastEl = menuItems.filter(i => i.getAttribute('href') === '#' + lastId)[0]
                lastEl.parentElement.classList.remove('active')
            }
            lastId = id
            const newActive = menuItems.filter(i => i.getAttribute('href') === '#' + id)[0]
            const li = newActive.parentElement
            li.classList.add('active')
            let newActiveType = li.dataset.itemType

            const expand = function (li) {
                let icon = li.querySelector('a > i')
                if (icon) {
                    icon.classList.remove('fa-angle-right')
                    icon.classList.add('fa-angle-down')
                }
                const ulElement = li.querySelector('ul')
                if (ulElement)
                    ulElement.classList.add('expanded')
            }

            if (newActiveType === 'group' || newActiveType === 'doc-with-subheaders') {
                expand(li)
            }

            for (let parentLi = li.parentNode.parentNode;
                 parentLi.dataset.itemType === 'group' || parentLi.dataset.itemType === 'doc-with-subheaders';
                 parentLi = parentLi.parentNode.parentNode) {
                expand(parentLi)
            }


        }
    }
    this.scrollIntervalID = setInterval(this._handle, 100)

}

Speca.prototype.destroy = function () {
    clearInterval(this.scrollIntervalID)
}

const Dropdowns = function () {

    let opened

    document.addEventListener('click', (event) => {
        let target = event.target
        while (target && target.dataset.toggle !== 'dropdown') {
            target = target.parentElement
        }
        if (target) {
            event.preventDefault()
            event.stopPropagation()
            if (opened && opened !== target.parentElement) {
                opened.classList.remove('open')
                opened = undefined
            }
            opened = target.parentElement
            opened.classList.toggle('open')
        } else {
            if (opened) {
                opened.classList.remove('open')
                opened = undefined
            }
        }
    })
}

new Dropdowns()

document.addEventListener("DOMContentLoaded", () => {
    new Speca();
});
