


function positionJail(){
    var container = $('#UnsaleableSquare-10').get(0).getBoundingClientRect();
    var width = container.width - 30;
    var height = container.height - 25;
    /*var top = container.top;
     var bottom = container.bottom - 30;*/
    var left = (container.left + container.width) - width;

    $('#jail').css('width',width+'px').css('height',height+'px').css('left',left+'px');
}


function bindQTips()
{

    $('.square, label.property-name').each(function () {
        var tooltip = $(this).find('.information-tooltip');
        if (tooltip.length > 0) {
            var my = '';
            var at = '';
            if ($(this).is(':first-child')) {
                my = 'center left';
                at = 'center right';
            } else if ($(this).is(':last-child')) {
                my = 'center right';
                at = 'center left';
            } else {
                var row = $(this).parent();
                if (row.is(':first-child')) {
                    my = 'top center';
                    at = 'bottom center';
                } else if (row.is(':last-child')) {
                    my = 'bottom center';
                    at = 'top center';
                }
            }

            $(this).qtip({
                content: {text: tooltip},
                style: {classes: 'qtip-bootstrap'},
                position: {at: at, my: my},
                /*show: { event: 'click'}*/
            });
        }
    });
}



function scrollToBottom($element)
{
    $element.stop().animate({"scrollTop": $element.prop("scrollHeight")}, 1000);
}
