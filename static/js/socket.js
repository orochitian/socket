
$(function () {

    //  昵称验证
    function valid () {
        if( !this.val() ) {
            alert('请输入昵称。');
        } else {
            //  创建socket链接
            socketInit(this.val());
            //  浏览器session存储昵称
            sessionStorage.setItem('nickname', this.val());
            $('.nickname').hide();
        }
    }

    function socketInit(nickname) {
        var socket = io.connect('http://192.168.1.117');

        if( !sessionStorage.getItem('nickname') ) {
            socket.emit('create', nickname);
        }

        socket.emit('current user', nickname);

        socket.on('refresh user', function (userList) {
            $('.user-list').find('ul').html('');
            userList.forEach(function (user) {
                $('.user-list').find('ul').append($('<li>'+user+'</li>'));
            });
        });
        socket.on('sys', function (user) {
            $('#system').text(user + '，登录了聊天室').show();
            setTimeout(function () {
                $('#system').hide();
            }, 3000);
        });
        socket.on('logout', function (user) {
            $('#system').text(user + '，离开了聊天室').show();
            setTimeout(function () {
                $('#system').hide();
            }, 3000);
        });
        socket.on('is login', function (res) {
            if( !res ) {
                sessionStorage.removeItem('nickname');
                window.location.reload();
            }
        });

        socket.on('iSay', function (res) {

            var iSay = '<div class="message-line me">' +
                '<p class="who">：'+ res.name +'</p>' +
                '<p class="say">'+ res.message +'</p>' +
                '</div>';

            $('.message-show-box').append(iSay);
            $('.message-show-box').stop().animate({scrollTop: $('.message-show-box')[0].scrollHeight},1200);
        });

        socket.on('otherSay', function (res) {

            var iSay = '<div class="message-line other">' +
                '<p class="who">'+ res.name +'：</p>' +
                '<p class="say">'+ res.message +'</p>' +
                '</div>';

            $('.message-show-box').append(iSay);
            $('.message-show-box').stop().animate({scrollTop: $('.message-show-box')[0].scrollHeight},1200);

        });

        $('#send').on('click', function () {
            if( $('#message').val() === '' ) {
                alert('请输入聊天内容！');
                return false;
            }
            socket.emit('client', $('#message').val());
            $('#message').val('');
        });

        $('#message').on('keyup', function (ev) {
            if( ev.keyCode === 13 && ev.ctrlKey ) {
                if( $(this).val() === '' ) {
                    alert('请输入聊天内容！');
                    return;
                }
                socket.emit('client', $('#message').val());
                $('#message').val('');
            }
        });

    }

    //  如果当前窗口已经有昵称，直接进入聊天。
    if( sessionStorage.getItem('nickname') ) {
        socketInit(sessionStorage.getItem('nickname'));
        $('.nickname').hide();
    } else {

        $('#nickname').on('keyup', function (ev) {
            if( ev.keyCode === 13 ) {
                valid.call($(this));
            }
        });

        $('#nickname-btn').on('click', function () {
            valid.call($('#nickname'));
        });
    }
    
});
