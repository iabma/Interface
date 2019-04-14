window.onmessage = e => {
    document.getElementById("index").contentWindow.postMessage(e.data, '*');
};