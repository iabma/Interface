let area = document.getElementById("main-area");

let suggestions = [],
    id = 0;

function getSuggestion(id) {
    let sugg = null
    suggestions.forEach(suggestion => {
        if (suggestion.id == id)
            sugg = suggestion;
    });
    return sugg;
}

function createPopup(pos, id, suggestion, template) {
    let fix = document.createElement("div");
    fix.className = "info";
    fix.innerHTML = suggestion;
    let bestTemplate = document.createElement("div");
    bestTemplate.className = "info"
    bestTemplate.innerHTML = template;
    let pop = document.createElement("div");
    pop.id = "p" + id;
    pop.className = "popup";
    pop.appendChild(fix);
    pop.appendChild(bestTemplate);
    document.body.appendChild(pop);
    pop.style.left = pos.x + "px";
    pop.style.top = pos.y + "px";
    pop.style.width = "fit-content";
    bestTemplate.onclick = e => {
        document.getElementById("library").contentWindow.postMessage(["openEmptyTemplate", template], "*");
        document.getElementById("library").style.display = "block";
        document.getElementById("close").style.display = "block";
    };
    fix.onclick = e => {
        let span = document.getElementById(id);
        span.innerHTML = suggestion;
        let wrap = document.getElementById("h" + id);
        span.outerHTML = span.innerHTML;
        wrap.outerHTML = wrap.innerHTML;
        pop.parentElement.removeChild(pop);
        //$("h" + id).contents().unwrap();
    };
    return pop;
}

function updatePopup(pop, pos) {
    pop.style.left = pos.x + "px";
    pop.style.top = pos.y + "px";
    //pop.style.width = (pos.width - 6) + "px";
    pop.style.transition = ".2s";
}

function togglePopup(id, area, span) {
    let popup = document.getElementById("p" + id);
    if (popup == null)
        popup = createPopup({ x: area.offsetLeft + span.offsetLeft, y: area.offsetTop + span.offsetTop + span.offsetHeight + 3, width: span.offsetWidth }, id, "suggestion", "Platelets");
    else if (popup.style.display == "none")
        popup.style.display = "block";
    else
        popup.style.display = "none";
    return popup;
}

function addSuggestion(s, e, id) { // ! INCLUSIVE EXCLUSIVE
    let prev = area.innerHTML;
    suggestions.push({
        id: id,
        content: prev.substring(s, e)
    })
    area.innerHTML = prev.slice(0, s) + "<span id='h" + id + "' contenteditable='false'><span contenteditable='true' class='suggest' id='" + id + "'>" + prev.slice(s, e) + "</span></span>" + prev.slice(e);
    let span = document.getElementById(id),
        popup = null;
    span.onclick = e => {
        popup = togglePopup(id, area, span);
    };
    span.onkeyup = e => {
        getSuggestion(id).content = span.innerHTML;
        if (popup != null)
            updatePopup(popup, { x: area.offsetLeft + span.offsetLeft, y: area.offsetTop + span.offsetTop + span.offsetHeight + 3, width: span.offsetWidth});
    };
}

area.onkeydown = e => {
    if (e.keyCode == 13) {
        e.preventDefault();
        console.log(e);
        return false;
    }
};

document.getElementById("close").onclick = e => {
    document.getElementById("library").style.display = "none";
    document.getElementById("close").style.display = "none";
};

addSuggestion(22, 31, id++);
console.log(suggestions)