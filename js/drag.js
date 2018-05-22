/**
 * author levi
 * url http://levi.cg.am
 * 
 * Modified by Percy
 * 2016-12-12
 */
$(function() {
    $(document).mousemove(function(e) {
        if (this.move != undefined) {
            var posix = !document.move_target ? {'x': 0, 'y': 0} : document.move_target.posix,
                callback = document.call_down || function() {
                    $(this.move_target).css({
                        'top': e.pageY - posix.y,
                        'left': e.pageX - posix.x
                    });
                };
            callback.call(this, e, posix);
        }
    }).mouseup(function(e) {
        if (this.move != undefined) {
            var callback = document.call_up || function(){};
            callback.call(this, e);
            $.extend(this, {
                'move': false,
                'move_target': null,
                'call_down': false,
                'call_up': false
            });
        }
    });

    $('.box-table .remove').mousedown(function(e) {
        var offset = $('.box-table').offset();
        var moveTarget = document.getElementsByClassName('box-table')[0];

        moveTarget.posix = {'x': e.pageX - offset.left, 'y': e.pageY - offset.top};
        $.extend(document, {'move': true, 'move_target': moveTarget});
    });
    var $boxtb = $('.box-table');
    $('.box-table').on('mousedown', '.coor', function(e) {
        var posix = {
            'w': $boxtb.width(), 
            'h': $boxtb.height(), 
            'x': e.pageX, 
            'y': e.pageY
        };
        $.extend(document, {'move': true, 'call_down': function(e) {
            $boxtb.css({
                'width': Math.max(30, e.pageX - posix.x + posix.w),
                'height': Math.max(30, e.pageY - posix.y + posix.h)
            });
        }});
        return false;
    });
});
