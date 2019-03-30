let dropdowns = document.getElementsByClassName("dropdown"),
    searchBar = document.getElementById("template-search"),
    suggestions = document.getElementById("suggestions");

const url = "https://raw.githubusercontent.com/hms-bcl/Templates/master/templates.json";

var currentSuggestion = -1,
    potentialReturns = [],
    templateData = [];

let templates = {};

let backgroundColor = d3.scaleLinear()
    .domain([0, 8])
    .range(["rgb(231, 230, 230)", "#e47169"])
    .interpolate(d3.interpolateHcl);
let fontColor = d3.scaleLinear()
.domain([0, 12])
.range(["black", "grey"])
.interpolate(d3.interpolateHcl);

document.getElementById("add-custom").addEventListener("click", () => {
    let content = document.getElementById("template").children;
    if (content == "Use the search bar to begin.")
        return;
    var templateOutput = [];
    Array.from(content).forEach(element => {
        if (element.tagName == "SPAN") {
            templateOutput.push(element.innerHTML == "empty" ? "" : element.innerHTML);
        } else {
            enterDropdown(element, templateOutput);
        }
    });
    var editableTemplate = document.createElement("div");
    editableTemplate.contentEditable = "true";
    editableTemplate.innerHTML = templateOutput.join("").decodeHTML();
    document.getElementById("template-holder").appendChild(editableTemplate);
});

function enterDropdown(parent, templateOutput) {
    Array.from(parent.children[0].children).forEach(element => {
        if (element.tagName == "SPAN") {
            templateOutput.push(element.innerHTML == "empty" ? "" : element.innerHTML);
        } else {
            enterProgression(element, templateOutput);
        }
    });
}

function enterProgression(parent, templateOutput) {
    Array.from(parent.children).forEach(element => {
        if (element.tagName == "SPAN") {
            templateOutput.push(element.innerHTML);
        } else {
            enterDropdown(element, templateOutput);
        }
    });
}

function updateDropdownAnim() {
    Array.from(document.getElementsByClassName("dropdown")).forEach(dropdown => {
        //dropdown.children[0].addEventListener("click", () =>)
        dropdown.addEventListener("mouseenter", () => {
            dropdown.children[0].style.borderColor = "#e47169";
            dropdown.children[1].style.display = "block";
            /* console.log(dropdown.children[1].children)
            Array.from(dropdown.children[1].children).forEach(child => {
                if (child.innerHTML.includes("dropdown")) {
                    Array.from(child.getElementsByClassName("dropdown-content")).forEach(element => {
                        element.style.display = "none";
                    });
                }
            }); */
        })

        dropdown.addEventListener("mouseleave", () => {
            dropdown.children[0].style.borderColor = "transparent";
            dropdown.children[1].style.display = "none";
        })

        dropdown.addEventListener("click", () => {
            dropdown.children[0].style.borderColor = "transparent";
            dropdown.children[1].style.display = "none";
        });

        Array.from(dropdown.getElementsByClassName("dropdown-content")[0].getElementsByTagName("div")).forEach(element => {
            //console.log(element)
            element.addEventListener("click", () => {
                let prevContent = dropdown.getElementsByClassName("dropbtn")[0].innerHTML;
                dropdown.getElementsByClassName("dropdown-content")[0].style.display = "none";
                dropdown.children[0].style.borderColor = "transparent";
                dropdown.getElementsByClassName("dropbtn")[0].innerHTML = element.innerHTML;
                stylize(dropdown.getElementsByClassName("dropbtn")[0]);
                if (element.className == "search-type" && document.body.classList.contains("blurred")) {
                    runQuery(element.innerHTML);
                }
            });
        });
    });
}

document.addEventListener("keydown", key => {
    if (key.keyCode == 27)
        hideSuggestions();
});

searchBar.addEventListener("keydown", key => {
    if (key.keyCode == 13)
        runQuery(document.getElementById("search-type").getElementsByClassName("dropbtn")[0].innerHTML);
    else if (key.keyCode == 27)
        hideSuggestions();
    else if (key.keyCode == 38 && potentialReturns.length > 0) {
        currentSuggestion = currentSuggestion == -1 || currentSuggestion == 0 ? 0 : currentSuggestion - 1;
        highlightSuggestion(document.getElementById("suggestion-" + potentialReturns[currentSuggestion]));
    } else if (key.keyCode == 40 && potentialReturns.length > 0) {
        currentSuggestion = currentSuggestion == potentialReturns.length - 1 ? potentialReturns.length - 1 : currentSuggestion + 1;
        highlightSuggestion(document.getElementById("suggestion-" + potentialReturns[currentSuggestion]));
    }
})

searchBar.addEventListener("click", () => {
    document.body.classList.add("blurred");
});

function clearHighlights() {
    Array.from(suggestions.getElementsByClassName("suggested")).forEach(template => {
        template.style.background = "rgb(65, 65, 65)"
    });
}

function highlightSuggestion(suggestion) {
    clearHighlights();
    suggestion.style.background = "#e47169";
    // searchBar.value = suggestion.innerHTML;
}

function suggestTemplates() {
    potentialTemplates = [];
    suggestions.innerHTML = "";
    templateNames.forEach(template => {
        if (template.toLowerCase().includes(searchBar.value.toLowerCase())) {
            potentialTemplates.push(template);
            let suggestion = document.createElement("div");
            suggestion.className = "suggested-template";
            suggestion.id = "suggestion-" + template;
            suggestion.innerHTML = template;
            suggestion.addEventListener("mousemove", () => {
                highlightSuggestion(suggestion);
                currentSuggestion = templateNames.indexOf(template);
            });
            suggestion.addEventListener("mouseleave", clearHighlights);
            suggestions.appendChild(suggestion);
        }
    });
}

function hideSuggestions() {
    suggestions.innerHTML = "";
    document.body.classList.remove("blurred");
    //showTemplate(searchBar.value);
}

function readTemplateData() {
    let req = new XMLHttpRequest();
    req.open("GET", url, true);
    req.send(null);
    req.onreadystatechange = () => {
        if (req.readyState == 4) {
            templateData = JSON.parse(req.responseText);
            findEveryPossibility();
        }
    };
}

async function findEveryPossibility() {
    templateData.forEach(template => {
        //console.log(template)
        var possibilites = [];
        iterate(possibilites, template.English);
        templates[template.name] = possibilites;
    });
    updateDropdownAnim();
}

function iterate(arr, obj, str) {
    if (str == null)
        str = "";

    //console.log(obj)
    obj.content.forEach(element => {
        if (element.type == "text") {
            if (obj.type == "dropdown")
                arr.push(str + element.content);
            else
                str += element.content;
        } else {
            iterate(arr, element, str);
        }
    });

    arr.push(str);
}

function getPossibleTemplates() {
    potentialReturns = [];
    Object.keys(templates).forEach(template => {
        var determined = false,
            i = 0;

        if (template.toLowerCase().includes(searchBar.value.toLowerCase())) {
            potentialReturns.push(template);
            determined = true;
        }

        while (!determined && i < templates[template].length) {
            if (templates[template][i].toLowerCase().includes(searchBar.value.toLowerCase())) {
                potentialReturns.push(template);
                determined = true;
            }
            i++;
        }
    });
    showPossibilities();
}

function getAllPossibilities() {
    potentialReturns = [];
    Object.keys(templates).forEach(template => {
        templates[template].forEach(possibility => {
            if (possibility.toLowerCase().includes(searchBar.value.toLowerCase()))
                potentialReturns.push(possibility);
        });
    });
    showPossibilities();
}

function noResults() {
    let res = document.createElement("div");
    res.className = "suggested";
    res.innerHTML = "no results";
    suggestions.appendChild(res);
}

function addSuggestion(label) {
    let suggestion = document.createElement("div");
    suggestion.className = "suggested";
    suggestion.id = "suggestion-" + label;
    suggestion.innerHTML = label;
    suggestion.addEventListener("mousemove", () => {
        highlightSuggestion(suggestion);
        currentSuggestion = potentialReturns.indexOf(label);
    });
    suggestion.addEventListener("mouseleave", clearHighlights);
    suggestion.addEventListener("click", () => {
        openSuggestion(label);
    });
    suggestions.appendChild(suggestion);
}

function openSuggestion(suggestion) {
    hideSuggestions();
    if (templates[suggestion] != null) {
        let templateObj = getTemplate(suggestion);
        createTemplateVisual(templateObj.English.content);
    } else {
        let content = document.createElement("span");
        content.innerHTML = suggestion
        document.getElementById("template").appendChild(content);
    }
}

function createTemplateVisual(content) {
    document.getElementById("template").innerHTML = "";
    content.forEach(element => {
        if (element.type == "text") {
            let text = document.createElement("span")
            text.innerHTML = element.content == "" ? "empty" : element.content;
            document.getElementById("template").appendChild(text);
        } else if (element.type == "dropdown") {
            document.getElementById("template").innerHTML += addDropdown(element.name, element.content, 1);
        }
    });

    updateDropdownAnim();
}

function addProgression(content, depth) {
    let progression = document.createElement("div");
    progression.className = "progression";
    progression.style.background = backgroundColor(depth);
    progression.style.color = fontColor(depth);

    content.forEach(element => {
        if (element.type == "text") {
            let text = document.createElement("span")
            text.innerHTML = element.content == "" ? "empty" : element.content;
            progression.appendChild(text);
        } else if (element.type == "dropdown") {
            progression.innerHTML += addDropdown(element.name, element.content, depth + 1);
        }
    });
    stylize(progression);

    return progression.outerHTML;
}

function addDropdown(name, options, depth) {
    let container = document.createElement("div");
    container.className = "dropdown";
    container.id = name;

    let button = document.createElement("div");
    button.className = "dropbtn";
    button.style.background = backgroundColor(depth);
    button.style.color = fontColor(depth);
    if (options[0])
        button.innerHTML = options[0].type == "text" ? options[0].content == "" ? "<span>empty</span>" : "<span>" + options[0].content + "</span>" : options[0].type == "progression" ? addProgression(options[0].content, depth + 1) : addDropdown(options[0].name, options[0].content, depth + 1);
    else
        button.innerHTML = "";
    stylize(button)

    let content = document.createElement("div");
    content.className = "dropdown-content";
    content.style.display = "none";
    content.style.background = backgroundColor(depth);
    content.style.color = fontColor(depth);

    options.forEach(option => {
        let opt = document.createElement("div");
        if (option.type == "text") {
            opt.innerHTML = option.content == "" ? "<span>empty</span>" : "<span>" + option.content + "</span>";
        } else if (option.type == "progression") {
            opt.innerHTML = addProgression(option.content, depth + 1);
        } else if (option.type == "dropdown") {
            opt.innerHTML = addDropdown(option.name, option.content, depth + 1);
        }
        stylize(opt);
        opt.style.background = backgroundColor(depth + 1);
        opt.style.color = fontColor(depth);
        content.appendChild(opt);
    });

    container.appendChild(button);
    container.appendChild(content);

    return container.outerHTML;
}

function showPossibilities() {
    suggestions.innerHTML = "";
    if (potentialReturns.length == 0) {
        noResults();
    } else {
        potentialReturns.forEach(suggestion => {
            addSuggestion(suggestion);
        });
    }
}

function runQuery(param) {
    if (param == "Templates") {
        getPossibleTemplates();
    } else {
        getAllPossibilities();
    }
}

function getTemplate(name) {
    var templt = null;
    templateData.forEach(template => {
        if (template.name == name) {
            templt = template;
        }
    })
    return templt;
}

function stylize(element) {
    if (element.innerHTML == "<span>empty</span>") {
        element.style.color = "gray";
        element.style.fontSize = "12px";
        element.style.fontWeight = "bold";
        element.style.padding = "6px 12px";
    } else {
        element.style.color = "black";
        element.style.fontSize = "16px";
        element.style.fontWeight = "normal";
        element.style.padding = "6px";
        if (element.parentNode && element.parentNode.id == "search-type")
            element.style.color = "white";
    }
}

String.prototype.decodeHTML = function () {
    var map = {"gt":">", "lt":"<" /* , … */};
    return this.replace(/&(#(?:x[0-9a-f]+|\d+)|[a-z]+);?/gi, ($0, $1) => {
        if ($1[0] === "#") {
            return String.fromCharCode($1[1].toLowerCase() === "x" ? parseInt($1.substr(2), 16)  : parseInt($1.substr(1), 10));
        } else {
            return map.hasOwnProperty($1) ? map[$1] : $0;
        }
    });
};

readTemplateData();