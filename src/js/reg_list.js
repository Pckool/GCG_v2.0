app.controller('regListController', function($scope){
    $scope.$on('$routeChangeSuccess', function(event, current, prev){
        if(current.controller === 'regListController'){
            correctContSize();
            populateList();
        }
    });
});
function populateList(){
    ipcRenderer.send('get-reg-list');
    ipcRenderer.once('send-reg-list', function(event, arg){
        console.log(arg.list);
        console.log('here is the list')
        arg.list.assigned.forEach(function(el, i){
            console.log(el);

            $('.reg-list').append(
                `<div class="reg-list-item flex-row">`+
                `<div class="reg-list-var">${el.username}</div>`+
                `<div class="reg-list-var">${el.code}</div>`+
                `</div>`
            );
        });

    });
}
