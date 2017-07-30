
function Tokenizer() {
    this.buffer="";
    this.savedTokens=[];
    this.currentPosition=-1;
    this.hasSavedM=false;
    this.M=null;
}
Tokenizer.prototype.clear=function () {
    this.buffer="";
    this.savedTokens=[];
    this.currentPosition=-1;
}
Tokenizer.prototype.setM=function (e) {

    this.M=e;
    this.hasSavedM=true;

}
Tokenizer.prototype.getM=function () {
    if(!this.hasSavedM){
        throw "no memory";
    }
    return this.M;
}
Tokenizer.prototype.setInput=function(str){
    this.buffer=str;
}

Tokenizer.prototype.hasMoreTokens=function(){
    var token=this.nextToken();
    this.savedTokens.push(token);
    return (token!="");

}

Tokenizer.prototype.skipSpaces=function () {
    while(true){
        var ch=this.get();
        if(ch==-1){
            return;
        }
        if(ch!=" "){
            this.unGet();
            return;
        }
    }
}

Tokenizer.prototype.isOperator=function (ch) {
    return ch=="+"||ch=="-"||ch=="*"||ch=="/"||ch=="!"||ch=="^"||ch=="("||ch==")"||ch=="%";
}
Tokenizer.prototype.isDigit=function (ch) {
    return "0"<=ch&&ch<="9";
}
Tokenizer.prototype.get=function(){
    if(this.buffer.length==(this.currentPosition+1)) {
        return -1;
    }
    else{
        this.currentPosition=this.currentPosition+1;
        return this.buffer[this.currentPosition];
    }
}
Tokenizer.prototype.unGet=function () {
    this.currentPosition-=1;
}
Tokenizer.prototype.isWordCharacter=function(char){
    return char=="_"||("a"<=char &&char<="z")||("A"<=char&&char<="Z");
}
Tokenizer.prototype.scanWord=function () {
    var token="";
    while(true){
        var ch=this.get();
        if(ch==-1){
            break;
        }
        if(!this.isWordCharacter(ch)){
            this.unGet();
            break;
        }
        token+=ch;
    }
    return token;
}
Tokenizer.prototype.scanNumber=function () {
    var token="";
    while(true) {
        var ch = this.get();
        if (ch == -1) {
            break;
        }
        if (!this.isDigit(ch)) {
            this.unGet();
            break;
        }
        token += ch;
    }
    return token;
}


Tokenizer.prototype.nextToken=function(){
    if(this.savedTokens.length!=0){
        var token=this.savedTokens.pop();
        return token;
    }
    while(true){
        this.skipSpaces();
        var ch=this.get();
        if(ch==-1){
            return "";
        }
        if(this.isWordCharacter(ch)){
            this.unGet();
            return this.scanWord();
        }
        if(this.isDigit(ch)){
            this.unGet();
            return this.scanNumber();
        }
        if(this.isOperator(ch)){
            return ch;
        }

        throw "error token in nextToken():"+ch;
    }
}
Tokenizer.prototype.getTokenType=function (token) {
    if(token==""){
        return "EOF";
    }
    var ch=token[0];
    if(this.isDigit(ch)){
        return "NUMBER";
    }
    if(this.isWordCharacter()){
        return "WORD";
    }
    if(this.isOperator(ch)){
        return "OPERATOR";
    }
    if(token=="R"){
        return "memory";
    }
    else{
        throw "error token in getTokenType(): "+token;
    }
}

function expression(tokenizer) {
    var left=term(tokenizer);
   while(tokenizer.hasMoreTokens()){
       var token=tokenizer.nextToken();
       if(token=="+"){
           left+=term(tokenizer);
       }
       else if(token=="-"){
           left-=term(tokenizer);
       }
       else if(token=="R"){
           throw "number together!";
       }
       else{
           tokenizer.unGet();
           break;
       }
   }
   return left;
}
function term(tokenizer){
    var left=primary(tokenizer);
    while(tokenizer.hasMoreTokens()){
        var token=tokenizer.nextToken();
        if(token=="*"){
            left*=primary(tokenizer)
        }
        else if(token=="/"){
            var right=primary(tokenizer);
            if(right==0){
                throw "divided by zero in term(tokenizer)";
            }
            left/=right;
        }
        else if(token=="%"){
            var right=primary(tokenizer);
            if(Math.floor(right)!=right||Math.floor(left)!=left){
                throw "search for integar in term()";
            }
            if(right==0){
                throw "%0 in ()";
            }
            left=left%right;
        }
        else{
            tokenizer.unGet();
            break;
        }

    }
    return left;
}
function primary(tokenizer) {
    if(!tokenizer.hasMoreTokens()){
        throw "primary expected in primary()";
    }
    var token=tokenizer.nextToken();
    var result=0;
    if(token=="("){
        var d=expression(tokenizer);
        token=tokenizer.nextToken();
        if(token!=")"){
            throw ") expected in primary()";
        }
        result+=d;
    }
    else if(tokenizer.getTokenType(token)=="NUMBER"){
        result+=parseFloat(token);
    }
    else if(token=="R"){
        result+=tokenizer.getM();
    }
    else if(token=="-") {
        result -= primary(tokenizer);
    }
    else if(token=="+"){
        result+=primary(tokenizer);
    }
    else{
        throw "unknown in primary()!";
    }
    while(tokenizer.hasMoreTokens()){
        token=tokenizer.nextToken();
        if(token=="!"){
            result=fac(result);
        }
        else{
            tokenizer.unGet();
            break;
        }
    }
    return result;
}

function  fac(i){
    if(i<0||Math.floor(i)-i){
        throw "error in fac";
    }
    else{
        if(i==0){
            return 1;
        }
        else{
            return i*fac(i-1);
        }
    }
}
function calculate(tokenizer) {
    var e=expression(tokenizer);
    if(tokenizer.hasMoreTokens()){
        var token=tokenizer.nextToken();
        if(token=="M"){
            tokenizer.setM(e);
        }
        else{
            throw "error suffix after an expression";
        }
    }
    if(tokenizer.hasMoreTokens()){
        throw "two many words after expression";
    }
    return e;
}







