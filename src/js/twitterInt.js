ipcRenderer.send('get-twi-keys');

function twitterPost(postString) {
    ipcRenderer.send('twitter-post', postString);
}
ipcRenderer.on('twitter-posted-data', (event, arg) => {
    console.log(arg);
});

function twitterOauth() {
    ipcRenderer.send('get-access_token-twit');
    ipcRenderer.once('send-access_token-twit', (event, args) => {
        console.log(args);
        let dat = args;
        ipcRenderer.send('open-browser2', {url: `https://twitter.com/oauth/authenticate?oauth_token=${dat.request_token}`});
    });
}

ipcRenderer.on('finished-twit-auth', (event, arg) => {
    console.log(arg);

});

ipcRenderer.on('back-to-home', (event, arg) => {
    console.log('Navigating to home page...')
    document.location.href = "#/!";
});
