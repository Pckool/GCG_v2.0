import {dialog} from 'electron';
const fs = require('fs');
(function(){

    var AssignCodes = {};

    /**
     * This fuction adds a user to a dictionary of users once they recieve a code.
     * If they are already in the dictionary, it throws an error object and the code assigned to the user.
     *
     * @param {Object} user {User object definded by Discord.js or otherwise; Must have 'id' and 'username' properties}
     * @param {Strng} code {A string with the code that has been assigned to the user}
     * @param {function} callback {This is the callback function you want to call after completion}
     */
    AssignCodes.addUserToDict = function(user, code, location, callback){
        // if the assignedCodes file has been set
        fs.access(location, fs.constants.F_OK, (err) => {
            let newData = {};
            if(err){
                let createData = {assigned: []}
                newData.user_id = user.id;
                newData.code = code;
                newData.username = user.username;

                createData.assigned.push(newData);
                fs.writeFileSync(location, JSON.stringify(newData, null, 4) );
                if(callback) callback();
                else{
                    return;
                }
            }
            else{
                // get the list of users
                fs.readFile(location, (err, data) => {
                    let parsedData = JSON.parse(data);

                    let userExists = false;
                    let usr = {};
                    // if the user is not in the dictionary
                    if(parsedData.assigned && parsedData.assigned.length > 0){
                        parsedData.assigned.forEach(function(el, i){
                            if(el.user_id === user.id){
                                userExists = true;
                                usr = el;
                            }
                        });
                    }

                    if(! userExists || user.id === 'N/A'){
                        // append the new user and code to the list
                        newData.user_id = user.id;
                        newData.code = code;
                        newData.username = user.username;

                        if(typeof parsedData.assigned === "undefined"){
                            parsedData.assigned = [];
                        }
                        parsedData.assigned.push(newData);

                        // save the new list
                        fs.writeFileSync(location, JSON.stringify(parsedData, null, 4) );
                        console.log('New user added to the list! Here is the list now:\n');
                        console.log(parsedData);
                        // return success/callback
                        if(callback) callback();
                        else return;

                    }
                    else{
                        console.log('This is the Users code: ' +  usr.code);
                        // if the user is already in the dict, then return the code assigned to the user.
                        if(callback) callback(Error('This user already has a code assigned'), usr.code);
                    }
                });
            }
        });
    }

    AssignCodes.checkUserDict = function(user, location, callback){
        fs.access(location, fs.constants.F_OK, (err) => {
            let newData = {};
            if(err){
                console.log(err);
            }
            else{
                // get the list of users
                fs.readFile(location, (err, data) => {
                    let newData = JSON.parse(data);
                    // if the user is not in the dictionary

                    let userExists = false;
                    let usr = {};
                    if(newData.assigned && newData.assigned.length > 0){
                        // if the user is not in the dictionary
                        newData.assigned.forEach(function(el, i){
                            if(el.user_id === user.id){
                                userExists = true;
                                usr = el;
                            }
                        });
                    }

                    if(!userExists){
                        callback();
                    }
                    else{
                        console.log('This is the Users code: ' +  usr.code);
                        // if the user is already in the dict, then return the code assigned to the user.
                        callback(Error('the user already has a code registered.'), usr.code);
                    }
                });
            }
        });
    }

    AssignCodes.checkCodesDict = function(code, location, callback){
        fs.access(location, fs.constants.F_OK, (err) => {
            let newData = {};
            if(err){
                console.log(err);
            }
            else{
                // get the list of users
                fs.readFile(location, (err, data) => {
                    let newData = JSON.parse(data);
                    // if the user is not in the dictionary

                    let codeExists = false;
                    let usr = {};
                    if(newData.assigned && newData.assigned.length > 0){
                        newData.assigned.forEach(function(el, i){
                            // if the code is in the dictionary
                            if(el.code === code){
                                codeExists = true;
                                usr = el;
                            }
                        });
                    }

                    if(!codeExists){
                        if(callback) callback();
                        else{
                            return;
                        }
                    }
                    else{

                        console.log('This is the code: ' +  usr.code);
                        // if the user is already in the dict, then return the code assigned to the user.
                        if(callback) callback(Error('the code is already registered.'), usr.code);
                        else{
                            return true;
                        }
                    }
                });
            }
        });
    }


    AssignCodes.clearAssignedCodes = function(location){
        fs.writeFile(location, '{"assigned":[]}', (err) => {
            if(err){
                console.error(err);
            }
            else{
                console.log('Cleared the assigned glyph codes')
            }
        });
    }

    AssignCodes.checkAssignedCodes = function(location){
        console.log('checking...');
        // Last minute check to see the assigned codes file is valid.
        fs.access(location, fs.constants.F_OK, (err) => {
            if(err){

                if(err.message.includes('no such')){
                    AssignCodes.clearAssignedCodes(location);
                }
            }
            else{
                fs.readFile(location, (err, data) => {
                    var newdat;
                    try {
                        newdat = JSON.parse(data);

                        console.log('found a good assigned codes file.');
                    } catch (e) {
                        AssignCodes.clearAssignedCodes();
                    } finally {

                    }
                });
            }
        });
    }


    // Export the module
    if(typeof module === 'object' && module.exports){
        module.exports = AssignCodes;
    }
})();
