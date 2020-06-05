
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

        nodeB.addClass('row col-9');
        nodeB.append('<div class="alert alert-secondary w-100" style="padding:.5rem 1rem">'+payload.username+'</div>');

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

    var newHTML = '<p class="font-weight-bold" style="color: #28a745">'+payload.username+' just entered room. </p>';
    var newNode = $(newHTML);
    newNode.hide();
    $('#messages').prepend(newNode);
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

    var newHTML = '<p class="text-muted">'+payload.username+' just left room. </p>';
    var newNode = $(newHTML);
    newNode.hide();
    $('#messages').prepend(newNode);
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
    window.location.href = 'game.html?username='+username+'&game_id='+payload.game_id;
});


// End when someone leaves a room 
function send_message(){
    var payload = {};
    payload.room = chat_room;
    payload.message = $('#send_message_holder').val();
    console.log('*** Client Log Message: \'send_message\' payload: '+JSON.stringify(payload));
    socket.emit('send_message',payload);
    payload.message = $('#send_message_holder').val('');
};

socket.on('send_message_response', function(payload){
    if(payload.result === 'fail'){
        alert(payload.message);
        return;
    }

    var newHTML = '<p><b>'+payload.username+' says:</b> '+payload.message+'</p>';
    var newNode = $(newHTML);
    newNode.hide();
    $('#messages').prepend(newNode);
    newNode.slideDown(1000);
});




// Make invite button function

function makeInviteButton(socket_id){
    var newHTML = '<button type=\'button\' class=\'btn btn-lg btn-outline-success btn-block\' style=\'font-size:1rem;\'>Invite</button>';
    var newNode = $(newHTML);
    newNode.click(function(){
        invite(socket_id);
    });
    return(newNode);
};

// Make invited button function

function makeInvitedButton(socket_id){
    var newHTML = '<button type=\'button\' class=\'btn btn-lg btn-info btn-block\' style=\'font-size:1rem;\'>Uninvite</button>';
    var newNode = $(newHTML);
    newNode.click(function(){
        uninvite(socket_id);
    });
    return(newNode);
};

// Make play button function

function makePlayButton(socket_id){
    var newHTML = '<button type=\'button\' class=\'btn btn-lg btn-success btn-block\' style=\'font-size:1rem;\'>Play</button>';
    var newNode = $(newHTML);
    newNode.click(function(){
        game_start(socket_id);
    });
    return(newNode);
};

// Make engaged button function

function makeEngagedButton(){
    var newHTML = '<button type=\'button\' class=\'btn btn-lg btn-warning btn-block\' disabled style=\'font-size:1rem;\'><span class=\'spinner-border spinner-border-sm text-light\' role=\'status\' aria-hidden=\'true\'></span></button>';
    var newNode = $(newHTML);
    return(newNode);
}

$(function(){
    var payload = {};
    payload.room = chat_room;
    payload.username = username;

    console.log('*** Client Log Message: \'join_room\' payload: '+JSON.stringify(payload));
    socket.emit('join_room', payload);

    $('#quit').append('<a href="lobby.html?username='+username+'"class="btn btn-link" role="button" aria-pressed="true">Quit</a>')
}); 


// Old board

var old_board = [
    
    ['?', '?', '?', '?', '?', '?', '?', '?'],
    ['?', '?', '?', '?', '?', '?', '?', '?'],
    ['?', '?', '?', '?', '?', '?', '?', '?'],
    ['?', '?', '?', '?', '?', '?', '?', '?'],
    ['?', '?', '?', '?', '?', '?', '?', '?'],
    ['?', '?', '?', '?', '?', '?', '?', '?'],
    ['?', '?', '?', '?', '?', '?', '?', '?'],
    ['?', '?', '?', '?', '?', '?', '?', '?']
];

var my_color = ' ';
var interval_timer;

socket.on('game_update' ,function(payload){

    console.log('*** Client Log Message: \'game_update\' \n\tpayload: '+JSON.stringify(payload));

    // We will check for a good board update
    if(payload.result == 'fail'){
        console.log(payload.message);
        window.location.href = 'lobby.html?username='+username;
        alert(payload.message);
        return;
    }

    // Check for a good board in the payload
    var board = payload.game.board;
    if ('undefined' == typeof board || !board){
        console.log('Internal error: received a malformed board update from the server');
        return;
    }

    // Update my color
    if(socket.id == payload.game.player_white.socket){
        my_color = 'white';
    }

    else if(socket.id == payload.game.player_black.socket){
        my_color = 'black';
    }

    // Something weird is going on, like three people playing at once
    // Send the client back to the lobby
    else{
        window.location.href = 'lobby.html?username='+username;
        return;
    }

    $('#my_color').html('<h5 id="my_color" class="mt-3"><span class="badge-info badge badge-pill text-capitalize">My token color: '+my_color+'</span></h5>');
    $('#my_color').append('<div class="alert alert-info text-capitalize text-sm" style="font-size:.85rem;" role="alert">'+payload.game.whose_turn+' token\'s turn.</div>');

    clearInterval(interval_timer);
    interval_timer = setInterval(function(last_time){
            return function(){
                // Do the work of updating the UI

                var d = new Date();
                var elapsedmilli = d.getTime() - last_time;
                var minutes = Math.floor(elapsedmilli / (60 * 1000));
                var seconds = Math.floor((elapsedmilli % (60 * 1000)) / 1000);

                if(seconds < 10){
                    $('#elapsed').html(minutes+':0'+seconds)
                }
                else{
                    $('#elapsed').html(minutes+':'+seconds)
                }

        }} (payload.game.last_move_time), 1000);
    


    // Animate changes to the board

    var blacksum = 0;
    var whitesum = 0;
    var row,column;

    var row,column;
    for(row = 0; row < 8; row++){
        for(column = 0; column < 8; column++){

            if(board[row][column] == 'b'){
                blacksum++;
            }

            if(board[row][column] == 'w'){
                whitesum++;
            }

            // If a board space has changed
            if(old_board[row][column] != board [row][column]){
                if(old_board[row][column] == '?' && board[row][column] == ' '){
                    $('#'+row+'_'+column).html('<img src="assets/img/gif/empty.gif" alt="empty square" />');
                }

                else if(old_board[row][column] == '?' && board[row][column] == 'w'){
                    $('#'+row+'_'+column).html('<img src="assets/img/gif/empty-to-white.gif" alt="white square" />');
                }

                else if(old_board[row][column] == '?' && board[row][column] == 'b'){
                    $('#'+row+'_'+column).html('<img src="assets/img/gif/empty-to-black.gif" alt="black square" />');
                }

                else if(old_board[row][column] == ' ' && board[row][column] == 'w'){
                    $('#'+row+'_'+column).html('<img src="assets/img/gif/empty-to-white.gif" alt="white square" />');
                }

                else if(old_board[row][column] == ' ' && board[row][column] == 'b'){
                    $('#'+row+'_'+column).html('<img src="assets/img/gif/empty-to-black.gif" alt="black square" />');
                }

                else if(old_board[row][column] == 'w' && board[row][column] == ' '){
                    $('#'+row+'_'+column).html('<img src="assets/img/gif/white-to-empty.gif" alt="empty square" />');
                }

                else if(old_board[row][column] == 'b' && board[row][column] == ' '){
                    $('#'+row+'_'+column).html('<img src="assets/img/gif/black-to-empty.gif" alt="empty square" />');
                }

                else if(old_board[row][column] == 'w' && board[row][column] == 'b'){
                    $('#'+row+'_'+column).html('<img src="assets/img/gif/white-to-black.gif" alt="black square" />');
                }

                else if(old_board[row][column] == 'b' && board[row][column] == 'w'){
                    $('#'+row+'_'+column).html('<img src="assets/img/gif/black-to-white.gif" alt="white square" />');
                }

                else{
                    $('#'+row+'_'+column).html('<img src="assets/img/gif/error-state.gif" alt="error" />')
                }
            }

            // Add some interactivity

            $('#'+row+'_'+column).off('click');
            $('#'+row+'_'+column).removeClass('hovered_over');

            if(payload.game.whose_turn === my_color){
                if(payload.game.legal_moves[row][column] === my_color.substr(0,1)){
                    $('#'+row+'_'+column).addClass('hovered_over');
                    $('#'+row+'_'+column).click(function(r,c){
                        return function(){
                            var payload = {};
                            payload.row = r;
                            payload.column = c;
                            payload.color = my_color;
                            console.log('***Client log message: \'play_token\' payload: '+JSON.stringify(payload));
                            socket.emit('play_token',payload);
                        };
                    }(row,column));
                }
            }
        }
    }

    $('#blacksum').html(blacksum);
    $('#whitesum').html(whitesum);

    old_board = board;


});

socket.on('play_token_response' ,function(payload){

    console.log('*** Client Log Message: \'play_token_response\' \n\tpayload: '+JSON.stringify(payload));

    // We will check for a good play_token response
    if(payload.result == 'fail'){
        console.log(payload.message);
        alert(payload.message);
        return;
    }
});

// Game over message

socket.on('game_over' ,function(payload){

    console.log('*** Client Log Message: \'game_over\'\n\tpayload: '+JSON.stringify(payload));

    // We will check for a good play_token response
    if(payload.result == 'fail'){
        console.log(payload.message);
        return;
    }

    // If game is over, put in a button to jump to new page
    $('#game_over').html('<div class="alert alert-success" role="alert"><h4 class="alert-heading">Game over</h4><p class="text-capitalize">'+payload.who_won+' won!</p></div>');
    $('#game_over').append('<a href="lobby.html?username='+username+'" class="btn btn-outline-primary btn-sm" role="button" aria-pressed="true">Return to Lobby</a>');
});