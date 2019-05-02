const ipcRenderer_dis = new require('electron').ipcRenderer;
const Discord = require('discord.js');
var dis_client = new Discord.Client();
var guild;
// var assignedCodes = `${__dirname}/lib/assignedcodes.json`;
var discordLoggedIn = false;

var succMessage = 'Thanks for subscribing! I\'ll send you a glyph code :heart:';
var failMessage = 'Sorry buddy! You already had a code sent to you :(\nI just sent your assigned code to you!';

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
                                msg.reply(failMessage);
                                msg.author.send("Here's your assigned code: " + prevCode);
                            }
                            else{
                                pcCodeGrab_single(msg.author, (code) => {
                                    addUserToDict(msg.author, code, (err, prevCode) => {
                                        console.log('New user grabbed a code! \nname: ' + msg.author + '\ncode:' + code);
                                        msg.reply(succMessage);
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
                                msg.reply(failMessage);
                                msg.author.send("Here's your assigned code: " + prevCode);
                            }
                            else{
                                ps4CodeGrab_single(msg.author, (code) => {
                                    addUserToDict(msg.author, code, (err, prevCode) => {
                                        console.log('New user grabbed a code! \nname: ' + msg.author + '\ncode:' + code);
                                        msg.reply(succMessage);
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
                                msg.reply(failMessage);
                                msg.author.send("Here's your assigned code: " + prevCode);
                            }
                            else{
                                xb1CodeGrab_single(msg.author, (code) => {
                                    addUserToDict(msg.author, code, (err, prevCode) => {
                                        console.log('New user grabbed a code! \nname: ' + msg.author + '\ncode:' + code);
                                        msg.reply(succMessage);
                                        msg.author.send("Here's your Xbox One code: " + code);
                                        notify('Code given to a new user');
                                    });
                                });
                            }
                            if(cfg.options.del_comm){
                                msg.delete()
                            }
                        });
                    }
                    else if(msg_content === ('*glyph switch')){
                        checkUserDict(msg.author, (err, prevCode) => {
                            if(err) {
                                console.warn('Someone just tried to get a second code.');
                                msg.reply(failMessage);
                                msg.author.send("Here's your assigned code: " + prevCode);
                            }
                            else{
                                switchCodeGrab_single(msg.author, (code) => {
                                    addUserToDict(msg.author, code, (err, prevCode) => {
                                        console.log('New user grabbed a code! \nname: ' + msg.author + '\ncode:' + code);
                                        msg.reply(succMessage);
                                        msg.author.send("Here's your Switch code: " + code);
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
                else{
                    msg.reply(`Sorry, you need to be a member of ${cfg.sub_role} to recieve a glyph code from me.`);
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
                                    pcCodeGrab_single(msg.author, (code) => {
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
                                    ps4CodeGrab_single(msg.author, (code) => {
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
                                    xb1CodeGrab_single(msg.author, (code) => {
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

                        else if(msg_content === ('*glyph switch')){
                            checkUserDict(msg.author, (err, prevCode) => {
                                if(err) {
                                    msg.reply("Here's your Switch code: " + prevCode);
                                }
                                else{
                                    xb1CodeGrab_single(msg.author, (code) => {
                                        addUserToDict(msg.author, code, (err, prevCode) => {
                                            msg.reply("Here's your Switch code: " + code);
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
                    else{
                        msg.reply(`Sorry, you need to be a member of ${subRole.name} to recieve a glyph code from me.`);
                    }
                });
            }
        }
        // if the user just wants to chat
        if(msg.content.includes('*chat')){

        }
    }
});

/**
 * Logs the bot into discord
 * @param  {Object}   token    Discord token object
 * @param  {Function} callback a callback function
 */
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
 * Logs the bot out of discord
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
 * @param  {Function} callback A function to call after completion
 */
function saveDiscordConfig(callback){
    let discord_config = {
        "client_id":     $('#client_id').val(),
        "token":         $('#token').val(),
        "sub_role":      $('#sub_role').val(),
        "time_as_sub":   $('#time_as_sub').val(),
        "success_message": checkMessages($('#success-message').val(), true),
        "fail_message": checkMessages($('#fail-message').val(), false),
        "options": {
            "del_comm":  $('#del-comm').prop('checked'),
            "auto_conn": $('#auto-conn').prop('checked')
        }
    };
    succMessage = $('#success-message').val();
    failMessage = $('#fail-message').val();
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

function checkMessages(message, status){
    if(message) return message;
    if(status) return succMessage;
    else return failMessage;
}

/**
 * [loadDiscordConfig description]
 * @param  {Function} callback a callack function
 */
function loadDiscordConfig(callback){
    getDiscordConfig( (discord_config) => {
        // Finish loading
        if($('#client_id').length){
            $('#client_id').val(discord_config.client_id);
            $('#token').val(discord_config.token);
            $('#sub_role').val(discord_config.sub_role);
            console.log(discord_config.sub_role);
            $('#success-message').val(checkMessages(discord_config.success_message, true) );
            $('#fail-message').val(checkMessages(discord_config.fail_message, false) );
            $('#time_as_sub').val(discord_config.time_as_sub);
            $('#del-comm').prop('checked', discord_config.options.del_comm);
            $('#auto-conn').prop('checked', discord_config.options.auto_conn);

            succMessage = checkMessages(discord_config.success_message, true);
            failMessage = checkMessages(discord_config.fail_message, false);
        }
        if(callback) callback(discord_config);
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
        try{
            let discord_config = JSON.parse(arg);
            if(callback)
                callback(discord_config);
        }
        catch(err){
            resetDiscordConfig();
            callback({});
        }

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
        "success_message": succMessage,
        "fail_message": failMessage,
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
    $scope.createBot = function(){
        ipcRenderer_dis.send('open-browser2', {url: `https://discordapp.com/developers/applications`});
    }

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
            if(data.token && data.token.length >= 32){
                dis_enableConnBtn();
            }
            // if the textbox is currently beng typed into
            else if($('#token').length && $('#token').val().length >= 32){
                dis_enableConnBtn();
            }
            // if there is no token
            else{
                dis_disableConnBtn();
            }
        });
    }
}

function pcCodeGrab_single(user, callback){
    ipcRenderer.send('grab-code',{
        "platform": "pc",
        "num_codes": 1,
        "user": user
    });
    ipcRenderer.once('grabbed-codes', (event, codes) => {
        if(callback){
            callback(codes.codes);
            notify('A discord user redeemed a code.')
        }
    });
}

function ps4CodeGrab_single(user, callback){
    ipcRenderer.send('grab-code',{
        "platform": "ps4",
        "num_codes": 1,
        "user": user
    });
    ipcRenderer.once('grabbed-codes', (event, codes) => {
        if(callback){
            callback(codes.codes);
            notify('A discord user redeemed a code.')
        }
    });
}

function xb1CodeGrab_single(user, callback){
    ipcRenderer.send('grab-code',{
        "platform": "xb1",
        "num_codes": 1,
        "user": user
    });
    ipcRenderer.once('grabbed-codes', (event, codes) => {
        if(callback){
            callback(codes.codes);
            notify('A discord user redeemed a code.')
        }
    });
}

function switchCodeGrab_single(user, callback){
    ipcRenderer.send('grab-code',{
        "platform": "switch",
        "num_codes": 1,
        "user": user
    });
    ipcRenderer.once('grabbed-codes', (event, codes) => {
        if(callback){
            callback(codes.codes);
            notify('A discord user redeemed a code.')
        }
    });
}
// These functions need to prevent copying to clipboard.


/**
 * This fuction adds a user to a dictionary of users once they recieve a code.
 * If they are already in the dictionary, it throws an error object and the code assigned to the user.
 *
 * @param {Object} user {User object definded by Discord.js or otherwise; Must have 'id' and 'username' properties}
 * @param {Strng} code {A string with the code that has been assigned to the user}
 * @param {function} callback {This is the callback function you want to call after completion}
 */
function addUserToDict(user, code, callback){
    ipcRenderer.send('addUserToDict', {
        user: user,
        code: code,
        platform: "N/A"
    });
    ipcRenderer.once('addedUserToDict', (event, arg) => {
        if(arg.err && arg.code) callback(arg.err, arg.code);
        else callback();
    });
}

function checkUserDict(user, callback){
    ipcRenderer.send('checkUserDict', {
        user: user
    });
    ipcRenderer.once('checkedUserDict', (event, arg) => {
        if(arg.err && arg.code) callback(arg.err, arg.code);
        else callback();
    });
}

function clearAssignedCodes(){
    ipcRenderer.send('clearAssignedCodes');
    ipcRenderer.once('clearedAssignedCodes', (event, arg) => {

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
