///<reference path="../globals.ts" />

/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell.  The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */

module TSOS {

    export class Console {
    
        // to hold buffer commands after enter
        // TODO: make it typescript like ...
        // http://www.typescriptlang.org/Handbook#basic-types-array
        // public commandHistory:Array<string>;
        public commandHistory = [];
        public commandHistoryPointer:number = this.commandHistory.length;

        constructor(public currentFont = _DefaultFontFamily,
                    public currentFontSize = _DefaultFontSize,
                    public currentXPosition = 0,
                    public currentYPosition = _DefaultFontSize,
                    public buffer = "") {

        }

        public init(): void {
            this.clearScreen();
            this.resetXY();
        }

        private clearScreen(): void {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }

        private resetXY(): void {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }

        public handleInput(): void {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { //     Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    
                    // put it in our command history
                    // increase our pointer to last element
                    this.commandHistory[this.commandHistory.length] = this.buffer;
                    this.commandHistoryPointer = this.commandHistory.length - 1;
                           
                    // ... and reset our buffer.
                    this.buffer = "";
                }else if(chr === "up" || chr === "down"){
                
                    // so the 'buffer' is needed to push the
                    // command to the shell - unless we do
                    // some overhaul so -- 
                    
                    // first let us clear the buffer
                    this.buffer = "";
                
                    // will we or will we not use this command?
                    // either way ... I am calling it a command
                    var tempCommand:string = this.commandRecall(chr);
                    
                    // show the "user" the command
                    this.putText(tempCommand);
                    
                    // in case we use this command - put it in buffer
                    this.buffer = tempCommand;
                
                //backspace
                }else if(chr === String.fromCharCode(8)){
                    
                    // grab the active buffer
                    var currBuff: string = this.buffer;
                    // substring it
                    currBuff = currBuff.substring(0, (currBuff.length-1));
					
                    this.clearLine();
                    
                    this.putText(currBuff);
                    
                    // reset the buffer dumbass
                    this.buffer = currBuff;          
                    
                }else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Write a case for Ctrl-C.
            }
        }

        public putText(text): void {
            // My first inclination here was to write two functions: putChar() and putString().
            // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
            // between the two.  So rather than be like PHP and write two (or more) functions that
            // do the same thing, thereby encouraging confusion and decreasing readability, I
            // decided to write one function and use the term "text" to connote string or char.
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
            if (text !== "") {
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;
            }
         }

        public advanceLine(): void {
            this.currentXPosition = 0;
            this.currentYPosition += _DefaultFontSize + _FontHeightMargin;
            // TODO: Handle scrolling. (Project 1)
        }
        
        // clears a line
        // resets x position
        // replaces prompt
        private clearLine(): void {
            _DrawingContext.clearRect(0, (this.currentYPosition - (this.currentFontSize + 1)), this.currentXPosition, this.currentFontSize + 6);
            this.currentXPosition = 0;
            _OsShell.putPrompt();
        }
        
        // recalls a command if provided with the proper
        // arguments - the only valid ones are "up" or "down"
        // returns a string of that command.
        private commandRecall(command): string{
            
            // string to return - cannot be slick because we need
            // to ensure the pointer stays at zero once at first element
            var returnString:string = "";
            
            // if the incoming command is up
            if(command === "up"){
                // if there already is something let us just clear it
                this.clearLine();
                // set our return string with something
                // TODO: how to handle no commands? 
                returnString = this.commandHistory[this.commandHistoryPointer--];
                //if we just returned the first element, stay there (how linux term works)
                if(this.commandHistoryPointer < 0){
                    this.commandHistoryPointer = 0;
                }
            // incoming command is down    
            }else if(command == "down"){
                // clear anything just in case
                this.clearLine();
                returnString = this.commandHistory[++this.commandHistoryPointer];
                if(this.commandHistoryPointer > this.commandHistory.length){
                    this.commandHistoryPointer = this.commandHistory.length;
                    returnString = "";
                }
            }
            // finally return the string;    
            return returnString;
        }
    }
 }
