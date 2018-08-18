function correctContSize(){
    if (document.getElementById('bottom-bar') != null) {
        var footerHeight = $('#bottom-bar').outerHeight();
        var winHeight = $(window).innerHeight();
        var newContHeight = (winHeight - footerHeight);
        $('.main-cont').css('min-height', newContHeight);
        $('.main-cont').css('max-height', newContHeight);

        $('.sub-cont').css('min-height', newContHeight);
        $('.sub-cont').css('min-height', newContHeight);
        console.log('Resizing...');
    }
    else{
        var winHeight = $(window).innerHeight();
        $('.main-cont').css('min-height', winHeight);
        $('.main-cont').css('max-height', winHeight);

        $('.sub-cont').css('min-height', winHeight);
        $('.sub-cont').css('min-height', winHeight);
        console.log('Resizing (no footer)...');
    }
}
$(window).resize( (event) => {
    correctContSize();
});
// $(window).ready( (event) => {
//     correctContSize();
// });

// This ensures the main content will always take up the remaining real estate left by the footer.
