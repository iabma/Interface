let dropdowns = document.getElementsByClassName("dropdown"),
    searchBar = document.getElementById("template-search"),
    suggestions = document.getElementById("suggestions");

const url = "https://raw.githubusercontent.com/iabma/Templates/master/templates.json?token=ANUf8nJdZv_X_zy_EYCvZw6CIYxo4FZFks5cd_RYwA%3D%3D";

var currentSuggestion = -1,
    potentialReturns = [],
    templateData = [];

let templates = {};


function updateDropdownAnim() {
    Array.from(dropdowns).forEach(dropdown => {
        dropdown.addEventListener("mouseenter", () => {
            dropdown.children[0].style.background = "#e47169";
            dropdown.children[1].style.display = "block";
        })

        dropdown.addEventListener("mouseleave", () => {
            dropdown.children[0].style.background = "rgb(65, 65, 65)";
            dropdown.children[1].style.display = "none";
        })

        Array.from(dropdown.getElementsByClassName("dropdown-content")[0].getElementsByTagName("div")).forEach(element => {
            element.addEventListener("click", () => {
                dropdown.getElementsByClassName("dropbtn")[0].innerHTML = element.innerHTML;
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
}

function iterate(arr, obj, str) {
    if (str == null)
        str = "";
    console.log(str, obj, obj.content)

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
    showPossibilities()
}

function getAllPossibilities() {
    potentialReturns = [];
    Object.keys(templates).forEach(template => {
        templates[template].forEach(possibility => {
            if (possibility.toLowerCase().includes(searchBar.value.toLowerCase()))
                potentialReturns.push(possibility);
        });
    });
    showPossibilities()
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
        console.log(templateObj)
        createTemplateVisual(templateObj.English.content);
    } else {
        document.getElementById("template").innerHTML = suggestion;
    }
}

function createTemplateVisual(content) {
    document.getElementById("template").innerHTML = "";
    content.forEach(element => {
        if (element.type == "text") {
            document.getElementById("template").innerHTML += element.content;
        } else if (element.type == "variable") {
            console.log(addDropdown(element.name, element.content));
            document.getElementById("template").innerHTML += addDropdown(element.name, element.content);
        }
    });

    updateDropdownAnim();
}

function addProgression(content) {
    let progression = document.createElement("div");
    progression.className = "progression";

    content.forEach(element => {
        if (element.type == "text") {
            progression.innerHTML += element.content;
        } else if (element.type == "variable") {
            progression.innerHTML += addDropdown(element.name, element.content);
        }
    });

    return progression.outerHTML;
}

function addDropdown(name, options) {
    let container = document.createElement("div");
    container.className = "dropdown";
    container.id = name;

    let button = document.createElement("div");
    button.className = "dropbtn";
    if (options[0])
        button.innerHTML = options[0].type == "text" ? options[0].content : options[0].type == "progression" ? addProgression(options[0].content) : addDropdown(options[0].name, options[0].content);
    else
        button.innerHTML = "";

    let content = document.createElement("div");
    content.className = "dropdown-content";

    options.forEach(option => {
        let opt = document.createElement("div");
        if (option.type == "text") {
            opt.innerHTML = option.content;
        } else if (option.type == "progression") {
            opt.innerHTML = addProgression(option.content);
        } else if (option.type == "dropdown") {
            opt.innerHTML = addDropdown(option.name, option.content);
        }
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
    if (param == "templates") {
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

readTemplateData();