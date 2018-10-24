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
        let list = JSON.parse(arg.list);
        console.log('here is the list')
        console.log(list);
        for(var key in list){
            console.log(key);
            console.log(list[key]);

            $('.reg-list').append(
                `<div class="reg-list-item flex-row">`+
                `<div class="reg-list-var">${list[key].username}</div>`+
                `<div class="reg-list-var">${list[key].code}</div>`+
                `</div>`
            );
        }

    });
}
