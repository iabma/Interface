M.AutoInit();

let dropdowns = document.getElementsByClassName("dropdown"),
    searchBar = document.getElementById("template-search"),
    suggestions = document.getElementById("suggestions");

const templateNames = ["AST", "Allergic", "Antibody", "Bilirubin", "Biospecimen", "Board Approval", "Brentuximab", "CYPA", "Cancer", "Chemotherapy", "Consent", "Corticosteroids", "Creatinine", "Diabetes", "Echocardiogram", "Enrollment", "Exposure", "Gastrointestinal", "Hemoglobin", "Hepatitis", "History", "Hodgkin", "Hypertension", "Inhibitor", "Invading", "Investigational Agents", "Ions", "Lactating", "Lesion Size", "Life Expectancy", "Male", "Marrow", "Metastases", "Metastatic", "Mitomycin Mitomy", "Myelosuppresive", "Neuropathy", "Overlap", "Performance", "Platelets", "Pregnant", "Protein", "QTC", "Randomization", "Recist", "Registration", "Seizure", "Signs", "Squamous", "Surgery", "Swallow", "Thromboplastin", "Transaminase", "Transplant", "Triglyceride", "Tumors", "WBC"];

var currentSuggestion = -1,
    potentialTemplates;

Array.from(dropdowns).forEach(dropdown => {
    Array.from(dropdown.getElementsByClassName("dropdown-content")[0].getElementsByTagName("div")).forEach(element => {
        element.addEventListener("click", () => {
            dropdown.getElementsByClassName("dropbtn")[0].innerHTML = element.innerHTML;
        });
    });
});

searchBar.addEventListener("keydown", (key) => {
    if (key.keyCode == 27 || key.keyCode == 13) {
        hideSuggestions();
    } else if (key.keyCode == 38) {
        currentSuggestion = currentSuggestion == -1 || currentSuggestion == 0 ? 0 : currentSuggestion - 1;
        highlightSuggestion(document.getElementById("suggestion-" + potentialTemplates[currentSuggestion]));
    } else if (key.keyCode == 40) {
        currentSuggestion = currentSuggestion == potentialTemplates.length - 1 ? potentialTemplates.length - 1 : currentSuggestion + 1;
        highlightSuggestion(document.getElementById("suggestion-" + potentialTemplates[currentSuggestion]));
    }
})

searchBar.addEventListener("click", () => { 
    searchBar.value = "";
    suggestTemplates();
});

function clearHighlights() {
    Array.from(suggestions.getElementsByClassName("suggested-template")).forEach(template => {
        template.style.background = "rgb(65, 65, 65)"
    });
}

function highlightSuggestion(suggestion) {
    clearHighlights();
    suggestion.style.background = "#e47169";
    searchBar.value = suggestion.innerHTML;
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
    showTemplate(document.getElementById("template-search").value)
}

function showTemplate(templateName) {
    console.log(templateName)
}