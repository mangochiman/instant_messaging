
$(document).on('click', '.panel-heading, span.icon_minim', function (e) {
    var $this = $(this);
    if (!$this.hasClass('panel-collapsed')) {
        $this.parents('.panel').find('.panel-body').slideUp();
        $this.addClass('panel-collapsed');
        //$this.removeClass('glyphicon-minus').addClass('glyphicon-plus');
    } else {
        $this.parents('.panel').find('.panel-body').slideDown();
        $this.removeClass('panel-collapsed');
        //$this.removeClass('glyphicon-plus').addClass('glyphicon-minus');
    }
});

$(document).on('focus', '.panel-footer input.chat_input', function (e) {
    var $this = $(this);
    if ($('#minim_chat_window').hasClass('panel-collapsed')) {
        $this.parents('.panel').find('.panel-body').slideDown();
        $('#minim_chat_window').removeClass('panel-collapsed');
        $('#minim_chat_window').removeClass('glyphicon-plus').addClass('glyphicon-minus');
    }
});

$(document).on('click', '#new_chat', function (e) {
    var size = $(".chat-window:last-child").css("margin-left");
    size_total = parseInt(size) + 400;
    alert(size_total);
    var clone = $(".chat-window").clone().appendTo(".container");
    clone.css("margin-left", size_total);
});

$(document).on('mousedown', '.icon_close', function (e) {
    chatWindow = $(this).closest('.chat-window');
    $(this).closest('.chat-window').remove();
    $(this).closest('.document-window').remove();
    resetPositions();
});

function buildPrivateChat(data) {
    if (data) {
        chatID = data.chat_id;
        recepient = data.recepient;
    }
    else {
        chatID = chatData.chat_id;
    }

    private_messages = privateMessages[chatID];
    
    html = '<div class="private-chat ' + chatID + '" id=' + chatID + '>';
    html += '<div class="row chat-window col-xs-5 col-md-3 chat_window">';
    html += '<div class="col-xs-12 col-md-12">';
    html += '<div class="panel panel-default">';
    html += '<div class="panel-heading top-bar">';
    html += '<div class="col-md-8 col-xs-8">';
    html += '<h3 class="panel-title"><i class="icon-circle userid header_' + chatID + '" style="color: green;"></i> ' + currentusername + '</h3>';
    html += '</div>';
    html += '<div class="col-md-4 col-xs-4" style="text-align: right;">';
    html += '<span class="glyphicon glyphicon-remove icon_close" data-id="chat_window_1"></span>';
    html += '</div>';
    html += '</div>';
    html += '<div class="panel-body msg_container_base" id="msg_container_base_' + chatID + '">';

    for (var i = 0; i <= private_messages.length - 1; i++) {
        html += '<div class="row msg_container base_sent" id="msg_container_' + chatID + '">';
        html += '<div class="col-md-10 col-xs-10">';

        html += '<div class="messages msg_sent">';
        html += '<p>' + private_messages[i][0] + '</p>';
        html += '<time datetime="2009-11-13T20:00">Timothy • 51 min</time>';
        html += '</div>';

        html += '</div>';
        html += '<div class="col-md-2 col-xs-2 avatar">';
        html += '<img src="assets/img/avata3.jpg" class=" img-responsive ">';
        html += '</div>';
        html += '</div>';
    }

    html += '<div class="panel-footer">';
    html += '<div class="input-group">';
    html += '<input chat_id="' + chatID + '" id="input_' + chatID + '" type="text" class="form-control input-sm chat_input" placeholder="Write your message here..." />';
    html += '<span class="input-group-btn">';
    html += '<button receiverid="' + receiverID + '" username="' + recepient + '" chat_id="' + chatID + '" class="btn btn-primary btn-sm" id="btn_' + chatID + '" onclick="sendPrivateMessage(this);">Send</button>';
    html += '</span>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    html += '</div>';

    $("." + chatID).remove();
    $("#msg_container_" + chatID).remove();

    $('body').append(html);
    resetPositions();

    $('#input_' + chatID).keypress(function (e) {
        chatID = ($(this).attr('chat_id'));
        if (e.which === 13) {
            $(this).blur();
            $('#btn_' + chatID).focus().click();
        }
    });
}

function resetPositions() {
    marginRight = -15;
    $('.chat-window').each(function (i, obj) {
        ($(this)).css("margin-right", marginRight);
        marginRight += 370;
    });
}