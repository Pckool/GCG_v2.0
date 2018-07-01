function correctContSize(){
    if (typeof $('#bottom-bar') != "undefined") {
        var footerHeight = $('#bottom-bar').outerHeight();
        var winHeight = $(window).innerHeight();
        var newContHeight = (winHeight - footerHeight);
        $('.main-cont').css('min-height', newContHeight);
        $('.main-cont').css('max-height', newContHeight);

        $('.sub-cont').css('min-height', newContHeight);
        $('.sub-cont').css('min-height', newContHeight);
    }
}
$(window).resize( (event) => {
    correctContSize();
});
$(window).ready( (event) => {
    correctContSize();
});

// This ensures the main content will always take up the remaining real estate left by the footer.
