
app.controller('gsheetsSettingsController', function($scope){
    // On home load
    $scope.$on('$routeChangeSuccess', function(event, current, prev){
        if(current.controller === 'gsheetsSettingsController'){
            checkConnectBtns();
        }
    });
    // INIT FUNCTIONS
    $scope.gsheetsAuth = function(){
        ipcRenderer.send('gsheets-auth', {
            "callback": function(){

            }
        });
    }

    $scope.gsheetsExtract = function(){
        ipcRenderer.send('gsheets-extract', {
            "sheetID": $('#gsheets-id').val(),
            "tables": {
                "pc": $('#gsheets-table-pc').val(),
                "ps4": $('#gsheets-table-ps4').val(),
                "xb1": $('#gsheets-table-xb1').val()
            }
        });
        ipcRenderer.once('gsheets-extracted-pc', (event, status) => {
            console.log('Appending PC codes from GSheets: ' + status);
        });
        ipcRenderer.once('gsheets-extracted-ps4', (event, status) => {
            console.log('Appending PS4 codes from GSheets: ' + status);
        });
        ipcRenderer.once('gsheets-extracted-xb1', (event, status) => {
            console.log('Appending Xbox One codes from GSheets: ' + status);
        });
    }
});
