//
// This ensures the main content will always take up the remaining real estate left by the footer.
//

function correctContSize(){
    var footerHeight = $('#bottom-bar').outerHeight();
    var titleBarHeight = $('#title-bar').outerHeight();
    var winHeight = $(window).innerHeight();
    var newContHeight = (winHeight - footerHeight - titleBarHeight);
    $('.main-cont').css('min-height', newContHeight);
    $('.main-cont').css('max-height', newContHeight);

    $('.sub-cont').css('min-height', newContHeight);
    $('.sub-cont').css('max-height', newContHeight);
    console.log('Resizing...');

    if ( $('#bottom-bar').outerHeight() === undefined) {
        var winHeight = $(window).innerHeight();
        $('.main-cont').css('min-height', winHeight);
        $('.main-cont').css('max-height', winHeight);

        $('.sub-cont').css('min-height', winHeight);
        $('.sub-cont').css('max-height', winHeight);
        console.log('Resizing (no footer)...');
    }
}

function fixBottomOverlay(){
    var winWidth = $(window).innerWidth();
    var itemWidth = $('.bottom-bar-overlay').width()/2;

    $('.bottom-bar-overlay').css('left', (winWidth/2)-itemWidth);
}

function fixMainCard2(){
    var topHeight = $('#top-bar').outerHeight();
    var titleBarHeight = $('#title-bar').outerHeight();
    var winHeight = $(window).innerHeight();
    var newContHeight = (winHeight - topHeight - titleBarHeight);
    $('.main-card2').css('min-height', newContHeight);
    $('.main-card2').css('max-height', newContHeight);

    console.log('Resizing...');

    if ( $('#top-bar').outerHeight() === undefined) {
        var winHeight = $(window).innerHeight();
        $('.main-card2').css('min-height', winHeight);
        $('.main-card2').css('max-height', winHeight);

        console.log('Resizing (no footer)...');
    }
}


$(window).resize( (event) => {
    correctContSize();
    fixBottomOverlay();
    fixMainCard2();
});
$(".main-cont").bind("DOMSubtreeModified", function(){
    correctContSize();
    fixBottomOverlay();
    fixMainCard2();
});
