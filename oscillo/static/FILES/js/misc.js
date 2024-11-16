/*
╔══════════════════════════════════════════════════════╗
║                     MISC / GENERAL                   ║
╚══════════════════════════════════════════════════════╝
*/
function showToast(message, status) {
    let toast = document.getElementById("toast");
    toast.innerHTML = message;
    toast.className = "";
    toast.classList.add("show", status);
    setTimeout(function(){ toast.className = toast.className.replace("show", ""); }, 3000);
};

function getMedian(array){
    let total = 0;
    for (let i = 0; i < array.length; i++){
        total = total + array[i];
    }
    return total / array.length
};

function formatFrequency(hertz) {
    if (hertz < 1e3) {
        return `${hertz} Hz`;
    } else if (hertz < 1e6) {
        return `${(hertz / 1e3).toFixed(1)} kHz`;
    } else if (hertz < 1e9) {
        return `${(hertz / 1e6).toFixed(1)} MHz`;
    }
};
