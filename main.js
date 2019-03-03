let dropdowns = document.getElementsByClassName("dropdown"),
    searchBar = document.getElementById("template-search"),
    suggestions = document.getElementById("suggestions");

const url = "https://raw.githubusercontent.com/iabma/Templates/master/templates.json?token=ANUf8hSAkaJF3-8mmOo6skwZxZ3G3Zooks5cfDABwA%3D%3D";

var currentSuggestion = -1,
    potentialReturns = [],
    templateData = [],
    currentTemplateData,
    variableData = {};

let templates = {};

let backgroundColor = d3.scaleLinear()
    .domain([0, 15])
    .range(["gainsboro", "rgb(24, 24, 24)"])
    .interpolate(d3.interpolateHcl);

document.getElementById("add-custom").addEventListener("click", () => {
    let content = document.getElementById("template").innerHTML;
    if (content == "Use the search bar to begin.")
        return;
    console.log(currentTemplateData);
    currentTemplateData.forEach((str, i) => {
        let variable = document.getElementById(str);
        if (variable != null) {
            let content = variable.children[0].innerHTML;
            if (!content.includes("<")) {
                if (content == "empty") {
                    currentTemplateData[i] = ""
                } else {
                    currentTemplateData[i] = content;
                }
            } else
                currentTemplateData[i] = getVariableData(variable);
        }
    });
    console.log(currentTemplateData.join());
});

function getVariableData(variable) {
    let data = variableData[variable.id];
    data.forEach((str, i) => {
        let variable = document.getElementById(str);
        if (variable != null) {
            let content = variable.children[0].innerHTML;
            if (!content.includes("<")) {
                if (content == "empty") {
                    data[i] = ""
                } else {
                    data[i] = content;
                }
            } else
                data[i] = getVariableData(variable);
        }
    });
    return data.join("");
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
        console.log(template)
        var possibilites = [];
        iterate(possibilites, template.English);
        templates[template.name] = possibilites;
    });
    updateDropdownAnim();
}

function iterate(arr, obj, str) {
    if (str == null)
        str = "";

    obj.content.forEach(element => {
        if (element.type == "text") {
            if (obj.type == "variable")
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
        document.getElementById("template").innerHTML = suggestion;
    }
}

function createTemplateVisual(content) {
    document.getElementById("template").innerHTML = "";
    currentTemplateData = [];
    content.forEach(element => {
        if (element.type == "text") {
            currentTemplateData.push(element.content);
            document.getElementById("template").innerHTML += element.content;
        } else if (element.type == "variable") {
            currentTemplateData.push(element.name);
            document.getElementById("template").innerHTML += addDropdown(element.name, element.content, 1);
        }
    });

    updateDropdownAnim();
}

function addProgression(content, depth, dataArr) {
    let progression = document.createElement("div");
    progression.className = "progression";
    progression.style.background = backgroundColor(depth);

    content.forEach(element => {
        if (element.type == "text") {
            currentTemplateData.push(element.content);
            progression.innerHTML += element.content == "" ? "empty" : element.content;
        } else if (element.type == "variable") {
            progression.innerHTML += addDropdown(element.name, element.content, depth + 1);
        }
    });
    stylize(progression);

    return progression.outerHTML;
}

function addDropdown(name, options, depth) {
    variableData[name] = [];

    if (options[0].type == "text") {
        variableData[name].push(options[0].content)
    }

    let container = document.createElement("div");
    container.className = "dropdown";
    container.id = name;

    let button = document.createElement("div");
    button.className = "dropbtn";
    button.style.background = backgroundColor(depth);
    if (options[0])
        button.innerHTML = options[0].type == "text" ? options[0].content == "" ? "empty" : options[0].content : options[0].type == "progression" ? addProgression(options[0].content, depth + 1, variableData[name]) : addDropdown(options[0].name, options[0].content, depth + 1);
    else
        button.innerHTML = "";
    stylize(button)

    let content = document.createElement("div");
    content.className = "dropdown-content";
    content.style.display = "none";
    content.style.background = backgroundColor(depth);

    options.forEach(option => {
        let opt = document.createElement("div");
        if (option.type == "text") {
            opt.innerHTML = option.content == "" ? "empty" : option.content;
        } else if (option.type == "progression") {
            opt.innerHTML = addProgression(option.content, depth + 1);
        } else if (option.type == "dropdown") {
            opt.innerHTML = addDropdown(option.name, option.content, depth + 1);
        }
        stylize(opt);
        opt.style.background = backgroundColor(depth + 1);
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
    if (element.innerHTML == "empty") {
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

readTemplateData();