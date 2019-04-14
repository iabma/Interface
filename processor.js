const input = document.getElementById("input"),
    output = document.getElementById("output");

let p = document.getElementById("platelets");

let connections = {
    "templates" : [],
    "spans" : []
}

Array.from(input.children).forEach(span => {
    span.addEventListener("mouseenter", () => {
        showConnections(span);
    })
    span.addEventListener("mouseleave", () => {
        hideConnections(span)
    })
    span.addEventListener("click", () => {
        window.top.postMessage(["Platelets", [{"type":"text","content":"75,000"},{"type":"progression","content":[{"type":"text","content":" obtained <= "},{"type":"dropdown","content":[{"type":"text","content":"14"},{"type":"text","content":"21"},{"type":"text","content":"30"},{"type":"text","content":"OTHER"}]},{"type":"text","content":" days prior to registration"},{"type":"dropdown","content":[{"type":"text","content":""},{"type":"text","content":" (transfusion independent, defined as not receiving platelet transfusions for at least \n7 days prior to enrollment)"}]}]}]], "*");
    })
});

Array.from(output.children).forEach(template => {
    template.addEventListener("mouseenter", () => {
        showConnections(template);
    })
    template.addEventListener("mouseleave", () => {
        hideConnections(template)
    })
    template.addEventListener("click", () => {
        window.top.postMessage(["Platelets", null], "*");
    });
});

function showConnections(e) {
    if (e.tagName == "SPAN") {
        e.classList.add("span-hover");
        p.classList.add("template-highlight");
    } else {
        e.classList.add("template-highlight");
        Array.from(input.children).forEach(span => {
            span.classList.add("span-hover");
        });
    }
}

function hideConnections(e) {
    if (e.tagName == "SPAN") {
        e.classList.remove("span-hover");
        p.classList.remove("template-highlight");
    } else {
        e.classList.remove("template-highlight");
        Array.from(input.children).forEach(span => {
            span.classList.remove("span-hover");
        });
    }
}