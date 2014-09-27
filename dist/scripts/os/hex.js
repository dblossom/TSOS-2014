var TSOS;
(function (TSOS) {
    var Hex = (function () {
        function Hex(char) {
            // TODO: throw an error if not hex / 1 char
            if (char.length == 1) {
                this.hex = char.toUpperCase(); // because hex looks nice uppercase
                if (!this.validate()) {
                    this.hex = "";
                }
            }
        }
        Hex.prototype.isValid = function () {
            return (this.hex.length > 0);
        };

        Hex.prototype.toString = function () {
            return this.hex;
        };

        Hex.prototype.validate = function () {
            var isValid = true;

            var tempCharInt = this.hex.charCodeAt(0);

            switch (tempCharInt) {
                case 32:
                case 48:
                case 49:
                case 50:
                case 51:
                case 52:
                case 53:
                case 54:
                case 55:
                case 56:
                case 57:
                case 65:
                case 66:
                case 67:
                case 68:
                case 69:
                case 70:
                    isValid = true;
                    break;
                default:
                    isValid = false;
                    break;
            }
            return isValid;
        };
        return Hex;
    })();
    TSOS.Hex = Hex;
})(TSOS || (TSOS = {}));
