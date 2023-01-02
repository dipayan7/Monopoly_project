"use strict";


function inherits (ctor, superCtor){
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
            value: ctor,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
};

/**
 * @param strClass:
 *          class name
 * @param optionals:
 *          constructor arguments
 */
function createNewInstance(strClass) {
    var args = Array.prototype.slice.call(arguments, 1);
    var clsClass = eval(strClass);
    function F() {
        return clsClass.apply(this, args);
    }
    F.prototype = clsClass.prototype;
    return new F();
}


var Group = function (data){

    this.name = data.name;
    this.constructionCost = data.constructionCost;
    this.owner = null;
    this.squares = [];
};


var Card = function (text, action) {
    this.text = text;
    this.action = action;
};

Array.prototype.shuffle = function() {
    var array = this;
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
};
Array.prototype.removeElement = function(index){
    this.splice(index,1);
    return this;
};
