/**
 * Created by trouff on 08.05.2014.
 *
 * This class is used to store the data(name, path) of an animation, which is needed to fill the animation-selectbox.
 */
function AnimationData(name, value) {

    var _name = name;
    var _value = value;

    this.getName= function() {
        return _name;
    }

    this.setName = function(name) {
        _name = name;
    }

    this.setValue = function(value) {
        _value = value;
    }

    this.getValue = function() {
        return _value;
    }
}