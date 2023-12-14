function highlight(keyword, context) {
    var instance = new Mark(context, {
        accuracy: {
            value: "exactly",
        }
    })
    instance.mark(keyword)
    return instance
}

function throttle(func, delay) {
    let timeout = null
    return function (...args) {
        if (!timeout) {
            timeout = setTimeout(() => {
                func.call(this, ...args)
                timeout = null
            }, delay)
        }
    }
}

function byClassName(context, className) {
    return [...context.getElementsByClassName(className)]
}

function scanDoc() {
    const elements = new Map()
    const titleById = new Map()
    const documents = []
    byClassName(document, 'spec-item').forEach((el => {
        const a = el.getElementsByClassName('spec-item-header')[0]
        if (a) {
            const id = a.dataset.entityId
            const titleElement = a.children[0]
            const title = titleElement.textContent.trim()
            const contentElements = byClassName(el, 'description')
            const content = []
            contentElements.forEach(descriptionEl => {
                content.push(descriptionEl.textContent.trim())
            })
            documents.push({
                id,
                title,
                content: content.join(',')
            })
            titleById.set(id, title)
            elements.set(id, [titleElement, ...contentElements])
        }
    }))
    return [documents, titleById, elements]
}

function createSearchControls(onSearchCallback, onClearCallback) {
    const sidebar = document.querySelector('.sidebar')
    const search = document.createElement("div")
    search.classList.add("sidebar-search")
    const icon = document.createElement("i")
    icon.classList.add("search-icon", "fa", "fa-search")
    search.append(icon)
    const input = document.createElement("input")
    input.setAttribute("type", "text")
    input.setAttribute("placeholder", "Search")
    const results = document.createElement("ul")
    results.classList.add("sidebar-search-results")
    search.append(input)


    const iconClear = document.createElement("i")
    iconClear.classList.add("search-clear", "fa", "fa-close")
    iconClear.setAttribute("title", "Clear filter")
    iconClear.addEventListener("click", onClearCallback)

    search.append(iconClear)


    search.append(results)
    const sidebarItems = document.querySelector('.sidebar-items')
    sidebarItems.before(search);

    input.addEventListener("keyup", (e) => onSearchCallback(e, results))

    return {results, input}
}

function createResultItem(id, title) {
    const li = document.createElement("li")
    const link = document.createElement("a")
    link.setAttribute('href', '#' + id)
    link.textContent = title
    li.append(link)
    return li
}

function createFSIndex(documents) {
    const index = FlexSearch.create({
        profile: "score",
        doc: {
            id: "id",
            field: {
                title: "score",
                content: "score"
            }
        }
    })
    index.add(documents)
    return index
}

function init() {
    const [documents, titleById, elements] = scanDoc()
    const index = createFSIndex(documents)
    const MARK_TIMEOUT = 500
    const SEARCH_DELAY = 300
    const MAX_RESULT = 25
    let lastSearch, marks, markTimeout, searchResultsElements
    const onKeyUpHandler = function (e, searchResultsElement) {

        const val = e.target.value.trim()
        if (lastSearch === val) {

        } else {
            searchResultsElement.innerHTML = ''
            if (marks)
                marks.unmark();

            marks = undefined
        }
        if (val.length < 2)
            return

        lastSearch = val
        const result = index.search(val, {limit: MAX_RESULT})

        if (result.length) {
            const fragment = document.createDocumentFragment()
            const toMark = [];
            if (markTimeout) {
                clearTimeout(markTimeout)
            }
            result.forEach((i) => {
                fragment.append(createResultItem(i.id, titleById.get(i.id)))
                toMark.push(...elements.get(i.id))
            })
            markTimeout = setTimeout(() => {
                marks = highlight(val, toMark)
            }, MARK_TIMEOUT)

            searchResultsElement.append(fragment)
        } else {
            searchResultsElement.innerHTML = '<div>no results</div>'
        }
    }
    const onClear = () => {
        searchResultsElements.results.innerHTML = ''
        searchResultsElements.input.value = ''
        if (marks)
            marks.unmark();
    }
    searchResultsElements = createSearchControls(throttle(onKeyUpHandler, SEARCH_DELAY), onClear)

}

document.addEventListener("DOMContentLoaded", () => {
    init()
})
