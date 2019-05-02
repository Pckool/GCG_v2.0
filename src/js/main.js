$('#app-close').on('click', () => {
    ipcRenderer.send('app-close');
});

$('#app-maximize').on('click', () => {
    ipcRenderer.send('app-max');
});

$('#app-minimize').on('click', () => {
    ipcRenderer.send('app-min');
});
