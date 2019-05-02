
app.controller('slController', function($scope){
    $scope.slAuth = function(){
        ipcRenderer.send('slAuth', {});
    }
});
