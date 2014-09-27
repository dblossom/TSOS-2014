module TSOS{

    export class Hex{

        public hex:string;

        constructor(char:string){
            // TODO: throw an error if not hex / 1 char
            if(char.length == 1){
                this.hex = char.toUpperCase(); // because hex looks nice uppercase
                if(!this.validate()){
                    this.hex = "";
                }
            }
        }
    
        public isValid(): boolean{
            return (this.hex.length > 0); // err make 1 ?
        }
    
        public toString(): string{
            return this.hex;
        }
    
        private validate(): boolean{
    
            var isValid:boolean = true;
    
            var tempCharInt:number = this.hex.charCodeAt(0); // always will be 0!

            switch(tempCharInt){
                
            // is the char A-F or 0-9? (or space)
            // if so set to true ... 
            // really we could do nothing since we start at true and set to false
            // if any other char comes our way -- BUT -- we will still "set" to true.
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
        }

    }
}