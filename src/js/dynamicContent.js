function correctContSize(){
    if (typeof document.getElementById('bottom-bar') != "undefined") {
        var footerHeight = window.getElementById('bottom-bar').height;
        document.getElementById('main-card').style.marginBottom = footerHeight;
        console.log(footerHeight);
    }
}



// This ensures the main content will always take up the remaining real estate left by the footer.
