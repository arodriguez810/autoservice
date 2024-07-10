date = function(){
    this.now = function (){
        return moment().format('YYYY-MM-DD h:mm:ss');
    };
};