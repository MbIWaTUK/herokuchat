var socket = io.connect("https://afternoon-dusk-47102.herokuapp.com");
var messagesBox = $('#messages');
var userLogin = new String;

socket.on('setName', function(){

    function setName(){

      UIkit.modal.prompt('Введите ваш логин:', '', function(name){
         if(name.length>0)
             socket.emit('setName', name);
         else{
             setName();
         }

      });

    }



    console.log('Запрос имени...');
    if($('#login').html().length > 0){
        socket.emit('setName', $('#login').html());
    }
    else{
            setName();
    }
});



socket.on('userName', function(userData){
    console.log('Your nickname => '+userData.userName);
    $('#login').html(userData.userName);
    $('#messages').append('<div class="uk-panel uk-panel-box uk-panel-box-success uk-width-4-5 uk-align-left uk-margin-top-remove animated flipInX" id="info-message">Вы вошли под ником <b>'+userData.userName+'<b></div>');
    addUserToList(userData);
    messagesBox.scrollTop(messagesBox.prop('scrollHeight'));
});

socket.on('newUser', function(userData){
    console.log('New user has been connected to chat | ' + userData.userName);
    $('#messages').append('<div class="uk-panel uk-panel-box uk-panel-box-success uk-width-4-5 uk-align-left uk-margin-top-remove animated flipInX" id="info-message">Пользователь <b>'+userData.userName+'</b> присоединился к чату!</div>');
    addUserToList(userData);
    messagesBox.scrollTop(messagesBox.prop('scrollHeight'));
    $('input[name="message"]').focus();
});

socket.on('clientsList', function(clientsList){
    console.log(clientsList);
    for(var key in clientsList){
        if($('#'+key).length == 0){
            addUserToList(clientsList[key]);
        }
    }
});

socket.on('messageToClients', function(msg, name){
    console.log(name + ' | => ' + msg);
     $('#messages').append('<div class="uk-panel uk-panel-box  uk-panel-box-secondary uk-width-4-5 uk-align-right uk-margin-top-remove animated flipInX" id="user-message"><div class="uk-badge uk-badge-success uk-badge-notification" id="this-user-name">'+name+'</div>'+msg+'</div>');
    messagesBox.scrollTop(messagesBox.prop('scrollHeight'));
});

socket.on('messageFromClients', function(msg, name){
    console.log(name + ' | => ' + msg);
     $('#messages').append('<div class="uk-panel uk-panel-box uk-panel-box-primary uk-width-4-5 uk-align-left uk-margin-top-remove  animated flipInX"><div class="uk-badge uk-badge-notification" id="user-name">'+name+'</div>'+msg+'</div>');
     messagesBox.scrollTop(messagesBox.prop('scrollHeight'));
});

socket.on('userDisconnected', function(userData){
    console.log(userData.userName + ' is disconnected');
     $('#messages').append('<div class="uk-panel uk-panel-box uk-panel-box-warning uk-width-4-5 uk-align-left uk-margin-top-remove animated flipInX" id="info-message">Пользователь <b>'+userData.userName+'</b> покинул чат!</div>');
     removeUserFromList(userData);
     messagesBox.scrollTop(messagesBox.prop('scrollHeight'));
});

function addUserToList(userData){
    $('#clients-list').append('<div class="uk-button uk-width-1-1 uk-button-'+(userData.id == socket.id ? 'primary' : 'success')+' animated zoomIn" id="'+userData.id+'">'+userData.userName+'</div>');
}

function removeUserFromList(userData){
    $('#clients-list').find('#'+userData.id).each(function(){
        var elem = $(this);
        elem.removeClass('zoomIn').addClass('zoomOut');
        setTimeout(function(){
            elem.remove();
        }, 1000);
    });
}



$(document).ready(function(){

    function setHeighMessageViewport(){
        $('#messages').height($('#message-form').offset().top-25);
    }

    setHeighMessageViewport();

    $(window).resize(function(){
        setHeighMessageViewport();
    })

    $('button[name="send"]').click(function(){
        var message = $('input[name="message"]').val();
        if(message.length>0){
            socket.emit('message', message);
            $('input[name="message"]').val(null);
        }
        else{
            UIkit.modal.alert('Введите текст сообщения!');
        }
    });

    $('input[name="message"]').keyup(function(){
        if(event.keyCode==13)
        {
            $('button[name="send"]').click();
            return false;
        }
    });
});
