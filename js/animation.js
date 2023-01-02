// TODO: add animation for every event emitted...

function animateCardOpen(container, card, callBack)
{
   $('#'+container).html('<span>'+card.text+'</span>').animate({'background-color':'#efefef'}, 1000, callBack);

}

function animateCardClose(container)
{
   $('#'+container).html('');
}

