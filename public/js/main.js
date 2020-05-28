
// This function returns the value of whichParam on the URL

function GetURLParameters(whichParam) {
    var pageURL = window.location.search.substring(1);
    var pageURLVariables = pageURL.split('&');
    for(var i = 0; i < pageURLVariables.length; i++){
        var parameterName = pageURLVariables[i].split('=');
        if(parameterName[0] == whichParam){
            return parameterName[1];
        }
    }
}

var username = GetURLParameters('username');
if('undefined' == typeof username || !username){
    username = 'Anonymous_'+Math.random();
}


// $('#messages').append('<h4>' +username+ '</h4>');

var chat_room = GetURLParameters('game_id');
if ('undefined' == typeof chat_room || !chat_room){
    chat_room = 'lobby';
}

// Connect to socket.io
var socket = io.connect();

// What to do when a server sends me a log message
socket.on('log', function(array){
    console.log.apply(console,array);
})

// What to do when someone joins a room
socket.on('join_room_response', function(payload){
    if(payload.result == 'fail'){
        alert(payload.message);
        return;
    }

    // If we are being notified that we joined the room, then ignore it.
    if(payload.socket_id == socket.id){
        return;
    }

    // Add new row when new player joins
    var dom_elements = $('.socket_'+payload.socket_id);

    if(dom_elements.length == 0){

        // Socket Assignment
        var nodeA = $('<div></div');
        nodeA.addClass('socket_'+payload.socket_id);

        var nodeB = $('<div></div');
        nodeB.addClass('socket_'+payload.socket_id);

        var nodeC = $('<div></div');
        nodeC.addClass('socket_'+payload.socket_id);

        // Style Assignment

        nodeA.addClass('w-100');

        nodeB.addClass('col-9 text-right');
        nodeB.append('<h4>'+payload.username+'</h4>');

        nodeC.addClass ('col-3 text-left');
        var buttonC = makeInviteButton(payload.socket_id);
        nodeC.append(buttonC);

        // Hide nodes so we can trigger appear
        nodeA.hide();
        nodeB.hide();
        nodeC.hide(); 

        // Add hidden nodes to player section
        $('#players').append(nodeA, nodeB, nodeC);
        nodeA.slideDown(1000);
        nodeB.slideDown(1000);
        nodeC.slideDown(1000);
    }

    // When someone has joined and a row already exists, making sure the row appears correctly

    else {
        uninvite(payload.socket_id);
        var buttonC = makeInviteButton(payload.socket_id);
        $('.socket_'+payload.socket_id+'button').replaceWith(buttonC);
        dom_elements.slideDown(1000);
    }

    // Manage the message "new player has joined"

    var newHTML = '<p>' +payload.username+ ' just entered lobby. </p>';
    var newNode = $(newHTML);
    newNode.hide();
    $('#messages').append(newNode);
    newNode.slideDown(1000);
});
// End when someone joins a room 


// When someone Leaves a room

socket.on('player_disconnected', function(payload){
    if(payload.result == 'fail'){
        alert(payload.message);
        return;
    }

    // If we are being notified that we left the room, then ignore it.
    if(payload.socket_id == socket.id){
        return;
    }

    // Add new row when new player leaves
    var dom_elements = $('.socket_'+payload.socket_id);

    if(dom_elements.length != 0){
        dom_elements.slideUp(1000);
    }

    // Manage the message "new player has left"

    var newHTML = '<p>'+payload.username+' just left lobby. </p>';
    var newNode = $(newHTML);
    newNode.hide();
    $('#messages').append(newNode);
    newNode.slideDown(1000);


});

// Inviting a player

function invite(who){
    var payload = {};
    payload.requested_user = who;

    console.log('*** Client log message: \'invite\' payload: '+JSON.stringify(payload));
    socket.emit('invite',payload);
};

// Change button to "invite"

socket.on('invite_response', function(payload){
    if(payload.result === 'fail'){
        alert(payload.message);
        return;
    }

    var newNode = makeInvitedButton(payload.socket_id);
    $('.socket_'+payload.socket_id+' button').replaceWith(newNode);
});

// When user receives an invite

socket.on('invited', function(payload){
    if(payload.result === 'fail'){
        alert(payload.message);
        return;
    }
    console.log('makePlayButton');
    var newNode = makePlayButton(payload.socket_id);
    $('.socket_'+payload.socket_id+' button').replaceWith(newNode);
});

// Uninviting a player

function uninvite(who){
    var payload = {};
    payload.requested_user = who;

    console.log('*** Client log message: \'uninvite\' payload: '+JSON.stringify(payload));
    socket.emit('uninvite',payload);
};

// Change button to "invite"

socket.on('uninvite_response', function(payload){
    if(payload.result === 'fail'){
        alert(payload.message);
        return;
    }

    var newNode = makeInviteButton(payload.socket_id);
    $('.socket_'+payload.socket_id+' button').replaceWith(newNode);
});

// Handle a notification that we've been uninvited

socket.on('uninvited', function(payload){
    if(payload.result === 'fail'){
        alert(payload.message);
        return;
    }

    var newNode = makeInviteButton(payload.socket_id);
    $('.socket_'+payload.socket_id+' button').replaceWith(newNode);
});

// Send a game_start message to the server

function game_start(who){
    var payload = {};
    payload.requested_user = who;

    console.log('*** Client log message: \'game_start\' payload: '+JSON.stringify(payload));
    socket.emit('game_start',payload);
}

// Handle a notification that we have been engaged

socket.on('game_start', function(payload){
    if(payload.result === 'fail'){
        alert(payload.message);
        return;
    }

    var newNode = makeEngagedButton(payload.socket_id);
    $('.socket_'+payload.socket_id+' button').replaceWith(newNode);

    //Jump to a new page
    window.location.href = 'game.html?username='+username+' &game_id='+payload.game_id;
});


// End when someone leaves a room 
function send_message(){
    var payload = {};
    payload.room = chat_room;
    payload.message = $('#send_message_holder').val();
    console.log('*** Client Log Message: \'send_message\' payload: '+JSON.stringify(payload));
    socket.emit('send_message',payload);
};

socket.on('send_message_response', function(payload){
    if(payload.result === 'fail'){
        alert(payload.message);
        return;
    }

    var newHTML = '<p><b>'+payload.username+' says:</b> '+payload.message+'</p>';
    var newNode = $(newHTML);
    newNode.hide();
    $('#messages').append(newNode);
    newNode.slideDown(1000);
});




// Make invite button function

function makeInviteButton(socket_id){
    var newHTML = '<button type=\'button\' class=\'btn btn-outline-primary\'>Invite</button>';
    var newNode = $(newHTML);
    newNode.click(function(){
        invite(socket_id);
    });
    return(newNode);
};

// Make invited button function

function makeInvitedButton(socket_id){
    var newHTML = '<button type=\'button\' class=\'btn btn-primary\'>Invited</button>';
    var newNode = $(newHTML);
    newNode.click(function(){
        uninvite(socket_id);
    });
    return(newNode);
};

// Make play button function

function makePlayButton(socket_id){
    var newHTML = '<button type=\'button\' class=\'btn btn-success\'>Play</button>';
    var newNode = $(newHTML);
    newNode.click(function(){
        game_start(socket_id);
    });
    return(newNode);
};

// Make engaged button function

function makeEngagedButton(){
    var newHTML = '<button type=\'button\' class=\'btn btn-danger\'>Engaged</button>';
    var newNode = $(newHTML);
    return(newNode);
}

$(function(){
    var payload = {};
    payload.room = chat_room;
    payload.username = username;

    console.log('*** Client Log Message: \'join_room\' payload: '+JSON.stringify(payload));
    socket.emit('join_room', payload);
}); 