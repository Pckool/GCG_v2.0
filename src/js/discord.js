const ipcRenderer_dis = new require('electron').ipcRenderer;
const Discord = require('discord.js');
var dis_client = new Discord.Client();
var guild;
var assignedCodes = `${__dirname}/lib/assignedcodes.json`;
var discordLoggedIn = false;


dis_client.on('ready', () => {
    console.log(`Logged in as ${dis_client.user.tag}!`);
    guild = dis_client.guilds.first();
    console.log(guild);
});

dis_client.on('message', msg => {
    if(msg.channel.guild){
        console.log('Message sent in guild channel');
        // If the user is looking for a glyph code
        if(msg.content.includes('*glyph')){
            getDiscordConfig((cfg) => {
                var subRole = guild.roles.find(role => role.id === cfg.sub_role);
                if(cfg.sub_role === null || subRole.members.find(member => member.user === msg.author)){
                    console.log('You are a subscriber! I can send you a glyph!');
                    let msg_content = msg.content.toLowerCase();
                    if(msg_content === ('*glyph pc')){
                        checkUserDict(msg.author, (err, prevCode) => {
                            if(err) {
                                console.warn('Someone just tried to get a second code.');
                                msg.reply('Sorry buddy! You already had a code sent to you :(\nI just sent your assigned code to you!');
                                msg.author.send("Here's your assigned code: " + prevCode);
                            }
                            else{
                                pcCodeGrab_single( (code) => {
                                    addUserToDict(msg.author, code, (err, prevCode) => {
                                        console.log('New user grabbed a code! \nname: ' + msg.author + '\ncode:' + code);
                                        msg.reply('Thanks for subscribing! I\'ll send you a glyph code :heart:');
                                        msg.author.send("Here's your PC code: " + code);
                                        notify('Code given to a new user');
                                    });
                                });
                            }
                            if(cfg.options.del_comm){
                                msg.delete()
                            }
                        });

                    }
                    else if(msg_content === ('*glyph ps4')){
                        checkUserDict(msg.author, (err, prevCode) => {
                            if(err) {
                                console.warn('Someone just tried to get a second code.');
                                msg.reply('Sorry buddy! You already had a code sent to you :(\nI just sent your assigned code to you!');
                                msg.author.send("Here's your assigned code: " + prevCode);
                            }
                            else{
                                ps4CodeGrab_single( (code) => {
                                    addUserToDict(msg.author, code, (err, prevCode) => {
                                        console.log('New user grabbed a code! \nname: ' + msg.author + '\ncode:' + code);
                                        msg.reply('Thanks for subscribing! I\'ll send you a glyph code :heart:');
                                        msg.author.send("Here's your PlayStation 4 code: " + code);
                                        notify('Code given to a new user');
                                    });
                                });
                            }
                            if(cfg.options.del_comm){
                                msg.delete()
                            }
                        });
                    }
                    else if(msg_content === ('*glyph xb1')){
                        checkUserDict(msg.author, (err, prevCode) => {
                            if(err) {
                                console.warn('Someone just tried to get a second code.');
                                msg.reply('Sorry buddy! You already had a code sent to you :(\nI just sent your assigned code to you!');
                                msg.author.send("Here's your assigned code: " + prevCode);
                            }
                            else{
                                xb1CodeGrab_single( (code) => {
                                    addUserToDict(msg.author, code, (err, prevCode) => {
                                        console.log('New user grabbed a code! \nname: ' + msg.author + '\ncode:' + code);
                                        msg.reply('Thanks for subscribing! I\'ll send you a glyph code :heart:');
                                        msg.author.send("Here's your Xboc One code: " + code);
                                        notify('Code given to a new user');
                                    });
                                });
                            }
                            if(cfg.options.del_comm){
                                msg.delete()
                            }
                        });
                    }
                }

            });
        }

        // if the user just wants to chat
        if(msg.content.includes('*chat')){

        }
    }
    else{
        console.log('Message sent in DM');
        if(msg.content === 'dbg="true"'){
            msg.reply('You are now in debug mode!');
        }
        if(msg.content === 'dbg="false"'){
            msg.reply('You have left debug mode!')
        }

        // if th user is looking for a glyph
        if(msg.content.includes('*glyph')){
            if(guild.available){
                getDiscordConfig((cfg) => {
                    var subRole = guild.roles.find(role => role.id === cfg.sub_role);
                    if(cfg.sub_role === null || subRole.members.find(member => member.user === msg.author)){
                        console.log('You are a subscriber! I can send you a glyph!');
                        let msg_content = msg.content.toLowerCase();

                        if(msg_content === ('*glyph pc')){
                            checkUserDict(msg.author, (err, prevCode) => {
                                if(err) {
                                    msg.reply("Here's your PC code: " + prevCode);
                                }
                                else{
                                    pcCodeGrab_single( (code) => {
                                        addUserToDict(msg.author, code, (err, prevCode) => {
                                            msg.reply("Here's your PC code: " + code);
                                            console.log('New user grabbed a code! \nname: ' + msg.author + '\ncode:' + code);
                                            notify('Code given to a new user');
                                        });
                                    });
                                }
                                if(cfg.options.del_comm){
                                    msg.delete()
                                }
                            });
                        }
                        else if(msg_content === ('*glyph ps4')){
                            checkUserDict(msg.author, (err, prevCode) => {
                                if(err) {
                                    msg.reply("Here's your PlayStation 4 code: " + prevCode);
                                }
                                else{
                                    ps4CodeGrab_single( (code) => {
                                        addUserToDict(msg.author, code, (err, prevCode) => {
                                            msg.reply("Here's your PlayStation 4 code: " + code);
                                            console.log('New user grabbed a code! \nname: ' + msg.author + '\ncode:' + code);
                                            notify('Code given to a new user');
                                        });
                                    });
                                }
                                if(cfg.options.del_comm){
                                    msg.delete()
                                }
                            });
                        }
                        else if(msg_content === ('*glyph xb1')){
                            checkUserDict(msg.author, (err, prevCode) => {
                                if(err) {
                                    msg.reply("Here's your Xbox One code: " + prevCode);
                                }
                                else{
                                    xb1CodeGrab_single( (code) => {
                                        addUserToDict(msg.author, code, (err, prevCode) => {
                                            msg.reply("Here's your Xbox One code: " + code);
                                            console.log('New user grabbed a code! \nname: ' + msg.author + '\ncode:' + code);
                                            notify('Code given to a new user');
                                        });
                                    });
                                }
                                if(cfg.options.del_comm){
                                    msg.delete()
                                }
                            });
                        }
                    }
                    // Like this, the name given needs to EXACTLY match the name of the group.
                    // I should change this so that the input field is a dropdown of the different roles on the server
                    // (this would probably be the best option...)
                });

            }
        }

        // if the user just wants to chat
        if(msg.content.includes('*chat')){

        }
    }
});


function discordLogin(token, callback){
    dis_client.login(token)
    .then(function(res){
        discordLoggedIn = true;
        checkConnectBtns();
        if($('#token').length){
            saveDiscordConfig();
        }
        if(callback){
            callback();
        }
    })
    .catch(function(err){
        if(callback){
            callback(err);
        }
        else{
            console.warn(err);
        }
    });
}

/**
 * [discordLogout description]
 * @param  {Function} callback a callback function
 */
function discordLogout(callback){
    dis_client.destroy()
    .then(function(res) {
        discordLoggedIn = false;
        checkConnectBtns();
        if(callback){
            callback();
        }
    })
    .catch((err) => {
        callback(err);
        console.error(err);
    });
}

/**
 * This function saves a discord config file with the values currently present in the discord settings menu.
 */
function saveDiscordConfig(callback){
    let discord_config = {
        "client_id":     $('#client_id').val(),
        "token":         $('#token').val(),
        "sub_role":      $('#sub_role').val(),
        "time_as_sub":   $('#time_as_sub').val(),
        "options": {
            "del_comm":  $('#del-comm').prop('checked'),
            "auto_conn": $('#auto-conn').prop('checked')
        }
    };
    ipcRenderer_dis.send('save-data-dis', JSON.stringify(discord_config) );
    ipcRenderer_dis.once('saved-data-dis', (event, arg) => {
        if(callback){
            if(arg && arg.error){
                callback(arg.error);
            }
            else{
                callback();
            }

        }
    });
    console.log(discord_config);
}

/**
 * [loadDiscordConfig description]
 * @param  {Function} callback a callack function
 */
function loadDiscordConfig(callback){
    ipcRenderer_dis.send('load-data-dis');

    ipcRenderer_dis.once('loaded-data-dis', (event, arg) => {
        // Finish loading
        let discord_config = JSON.parse(arg);
        if($('#client_id').length){
            $('#client_id').val(discord_config.client_id);
            $('#token').val(discord_config.token);
            $('#sub_role').val(discord_config.sub_role);
            console.log(discord_config.sub_role);
            $('#time_as_sub').val(discord_config.time_as_sub);
            $('#del-comm').prop('checked', discord_config.options.del_comm);
            $('#auto-conn').prop('checked', discord_config.options.auto_conn);
        }
        if(callback)
            callback(discord_config);
    });
}

/**
 * This functon gives a JSON obect of the current config for discord
 * @param  {Function} callback A callback function
 */
function getDiscordConfig(callback){
    ipcRenderer_dis.send('load-data-dis');

    ipcRenderer_dis.once('loaded-data-dis', (event, arg) => {
        // Finish loading
        let discord_config = JSON.parse(arg);
        if(callback)
            callback(discord_config);
    });
}

/**
 * This function resets the discord config
 */
function resetDiscordConfig(){
    let discord_config = {
        "client_id": "",
        "token": "",
        "sub_role": "",
        "time_as_sub": "",
        "options": {
            "del-comm": false,
            "auto-conn": false
        }
    };
    discordLogout((err) => {
        if(err){
            console.log('Discord wasn\'t logged in... Resetting data now...');
            ipcRenderer_dis.send('save-data-dis', JSON.stringify(discord_config) );
        }
        else{
            ipcRenderer_dis.send('save-data-dis', JSON.stringify(discord_config) );
        }
    });

}



app.controller('discordSettingsController', function($scope) {
    $scope.$on('$routeChangeStart', function(next, current){
            saveDiscordConfig();
    });

    $scope.$on('$routeChangeSuccess', function(event, current, prev){
        if(current.controller === 'discordSettingsController'){
            correctContSize();
            $scope.populateDropdown();
            loadDiscordConfig( () => {
                checkConnectBtns();
                checkVal();
            });

        }
    });
    // for the server connect button
    $scope.client_id_in = checkVal;
    $scope.token_in = checkConnectBtns;

    $('#server_connect').click(function() {
        console.log('the URl has been changed. Opening the browser...');
        ipcRenderer_dis.send('open-browser2', {url: `http://discordapp.com/api/oauth2/authorize?client_id=${$('#client_id').val()}&permissions=8&scope=bot`});
    });



    // if one of the buttons are pressed
    $scope.discordConnect = function(){
        if($('#token').length){
            saveDiscordConfig( err => {
                if(err){
                    notify('There was a problem saving your discord informaton...');
                }
                getDiscordConfig( data => {
                    discordLogin(data.token, () => {
                        dis_disableConnBtn();
                        dis_enableDisconnBtn();
                        $scope.populateDropdown();
                    });
                });
            });
        }

    }
    $scope.discordDisconnect = function(){
        discordLogout( () => {
            dis_disableDisconnBtn();
            dis_enableConnBtn();
        });

    }
    $scope.populateDropdown = function() {
        if(discordLoggedIn){
            let options = '';
            guild.roles.array().forEach((dat, i) => {
                options += `<option class="options" value="${dat.id}">${dat.name}</option>`;
            });
            $('#sub_role').html(options);
        }


    }

});

function checkVal(){
    try{
        if($('#client_id').val().length < 18){
            $('#server_connect').prop('disabled', true);
            $('#server_connect').addClass('btn-disabled');
            console.log('Not Enough');
        }
        else{
            console.log('Enough');
            $('#server_connect').prop('disabled', false);
            $('#server_connect').removeClass('btn-disabled');
        }
    }
    catch(e){
        console.log('Disabling the button because of an error: ' + e);
        $('#server_connect').prop('disabled', true);
        $('#server_connect').addClass('btn-disabled');
        console.log('Not Enough because there is litterally nothing in here.');
    }

}
function checkConnectBtns(){
    console.log('Checking discord the buttons...');
    // for the connect  buttons
    if(discordLoggedIn){
        dis_disableConnBtn();
        dis_enableDisconnBtn();
    }
    // if discord is not logged in
    else{
        dis_disableDisconnBtn();
        getDiscordConfig( data => {
            // if there is a token
            if(data.token && data.token.length >= 50){
                dis_enableConnBtn();
            }
            // if the textbox is currently beng typed into
            else if($('#token').length && $('#token').val().length >= 50){
                dis_enableConnBtn();
            }
            // if there is no token
            else{
                dis_disableConnBtn();
            }
        });
    }
}

function pcCodeGrab_single(callback){
    console.log('pc: ' + config.pc);
    var codez = '';
    var newList = '';
    if(config.pc){
        fs.readFile(config.pc, (err, text) => {
            if(err) throw err;
            var counter = 1;
            text.toString().split('\n').forEach( (ln) => {
                if(err){throw err;return;}
                else{
                    if (counter <= 1){
                        console.log('Code ' + counter + ': ' + ln);
                        codez += ln;
                        counter++;
                    }
                    else if (counter > 1){
                        newList += ln + "\n";
                    }
                }

            });
            jetpack.write(config.pc, newList.trim());
            counter = 1;
            if(callback){
                callback(codez.trim());
            }
        });
    }
    else{
        dialog.showErrorBox('No File Location Chosen!', 'You did not choose ' +
        'a PC Location! Please choose a location before trying to grab codes!');
        return '';
    }
}

function ps4CodeGrab_single(callback){
    var codez = '';
    var newList = '';
    if(config.ps4){
        fs.readFile(config.ps4, function(err, text){
            if(err) throw err;
            var counter = 1;
            text.toString().split('\n').forEach(function(ln){
                if(err){throw err;return;}
                else{
                    if (counter <= 1){
                        console.log('Code ' + counter + ': ' + ln)
                        codez += ln;
                        counter++;
                    }
                    else if (counter > 1){
                        newList += ln + "\n";
                    }
                }

            });
            jetpack.write(config.ps4, newList.trim());
            counter = 1;
            if(callback){
                callback(codez.trim());
            }
        });
    }
    else{
        dialog.showErrorBox('No File Location Chosen!', 'You did not choose a PS4 ONE Location! Please choose a location before trying to grab codes!');
        return '';
    }
}

function xb1CodeGrab_single(callback){
    var codez = '';
    var newList = '';
    if(config.xb1){
        fs.readFile(config.xb1, function(err, text){
            if(err) throw err;
            var counter = 1;
            text.toString().split('\n').forEach(function(ln){
                if(err){throw err;return;}
                else{
                    if (counter <= 1){
                        console.log('Code ' + counter + ': ' + ln)
                        codez += ln;
                        counter++;
                    }
                    else if (counter > 1){
                        newList += ln + "\n";
                    }
                }
            });
            console.log(codez);
            jetpack.write(config.xb1, newList.trim());
            counter = 1;
            if(callback){
                callback(codez.trim());
            }
        });
    }
    else{
        dialog.showErrorBox('No File Location Chosen!', 'You did not choose a ' +
        'XBOX ONE Location! Please choose a location before trying to grab codes!');
        return '';
    }
}

/**
 * This fuction adds a user to a dictionary of users once they recieve a code.
 * If they are already in the dictionary, it throws an error object and the code assigned to the user.
 *
 * @param {Object} user {User object definded by Discord.js}
 * @param {Strng} code {A string with the code that has been assigned to the user}
 * @param {function} callback {This is the callback function you want to call after completion}
 */
function addUserToDict(user, code, callback){
    // if the assignedCodes file has been set
    fs.access(assignedCodes, fs.constants.F_OK, (err) => {
        let newData = {};
        if(err){
            newData[user.id] = {};
            newData[user.id].code = code;
            fs.writeFile(assignedCodes, JSON.stringify(newData), (err) => {
                if(err){
                    console.log(err);
                }
                else{
                    console.log('No assignedCodes file was set. I made one for you!');
                    callback();
                }
            });
        }
        else{
            // get the list of users
            fs.readFile(assignedCodes, (err, data) => {
                let newData = JSON.parse(data);
                // if the user is not in the dictionary
                if(!newData[user.id]){
                    // append the new user and code to the list
                    newData[user.id] = {};
                    newData[user.id].code = code;
                    // save the new list
                    fs.writeFile(assignedCodes, JSON.stringify(newData), (err) => {
                        if(err) throw err;
                        console.log('New user added to the list! Here is the list now:\n' + newData);
                        // return success/callback
                        callback();
                    });
                }
                else{
                    console.log('This is the Users code: ' +  newData[user.id].code);
                    // if the user is already in the dict, then return the code assigned to the user.
                    callback(Error('This user already has a code assigned'), newData[user.id].code);
                }
            });
        }
    });
}

function checkUserDict(user, callback){
    fs.access(assignedCodes, fs.constants.F_OK, (err) => {
        let newData = {};
        if(err){
            newData[user.id] = {};
            newData[user.id].code = code;
            fs.writeFile(assignedCodes, JSON.stringify(newData), (err) => {
                if(err){
                    console.log(err);
                }
                else{
                    console.log('No assignedCodes file was set. I made one for you!');
                    callback();
                }
            });
        }
        else{
            // get the list of users
            fs.readFile(assignedCodes, (err, data) => {
                let newData = JSON.parse(data);
                // if the user is not in the dictionary
                if(!newData[user.id]){
                    callback();
                }
                else{
                    console.log('This is the Users code: ' +  newData[user.id].code);
                    // if the user is already in the dict, then return the code assigned to the user.
                    callback(Error('the user already has a code registered.'), newData[user.id].code);
                }
            });
        }
    });
}

function clearAssignedCodes(){
    fs.writeFile(assignedCodes, '{}', (err) => {
        if(err){
            console.error(err);
        }
        else{
            console.log('Cleared the assigned glyph codes')
        }
    });
}

// discord connect buttons
function dis_disableConnBtn(){
    // console.log('Disabling the connect button...');
    $('#dis-connect').prop('disabled', true);
    $('#dis-connect').addClass('btn-disabled');
}
function dis_enableConnBtn(){
    // console.log('Enabling the connect button...');
    $('#dis-connect').prop('disabled', false);
    $('#dis-connect').removeClass('btn-disabled');
}
function dis_disableDisconnBtn(){
    // console.log('Disabling the disconnect button...');
    $('#dis-disconnect').prop('disabled', true);
    $('#dis-disconnect').addClass('btn-disabled');
}
function dis_enableDisconnBtn(){
    // console.log('Enabling the disconnect button...');
    $('#dis-disconnect').prop('disabled', false);
    $('#dis-disconnect').removeClass('btn-disabled');
}
