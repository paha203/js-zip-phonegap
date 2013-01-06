var Status = function(id){
    this.el = document.getElementById(id);
}
Status.prototype.show = function(){
    this.el.style.display = 'block';
}

Status.prototype.hide = function(){
    this.el.style.display = 'none';
}
Status.prototype.askQuestion = function(message, callback){
    var result = confirm(message);
    callback(result);
}

String.prototype.lpad = function(padString, length) {
    var str = this;
    while (str.length < length)
        str = padString + str;
    return str;
}

lines = 0;
Status.prototype.writeConsole = function(str){
    this.el.value = lines.toString().lpad(0, 5)+":"+ str + "\n";
    this.el.scrollTop = this.el.scrollHeight;
    lines++;
}


Status.prototype.showDownloadStart = function(){
    log("STATUS start");
    this.writeConsole('Download started...');
}
Status.prototype.showDownloadProgress = function(progress){
    log("STATUS progress");
    this.writeConsole('Downloaded '+progress.complete+'/'+progress.total+'( '+(progress.complete/progress.total*100)+'%)');
}
Status.prototype.showDownloadComplete = function(){
    log("READ THE ZIP FILE INTO MEMORY - I.E GOT FILENAMES");
    this.writeConsole('Download finished');
}
Status.prototype.showExtractStart = function(){
    this.writeConsole('Extracting...');
}
Status.prototype.showExtractProgress = function(progress){
    this.writeConsole('Reading entries into memory '+progress.complete+'/'+progress.total+'( '+(progress.complete/progress.total*100)+'%)');
}
Status.prototype.showExtractComplete = function(){
    this.writeConsole('Finished extracting');
}

Status.prototype.showInstallStart = function(){
    this.writeConsole('Installing...');
}
Status.prototype.showInstallProgress = function(progress){
    this.writeConsole('Installed '+progress.complete+'/'+progress.total+'( '+(progress.complete/progress.total*100)+'%)');
}
Status.prototype.showInstallComplete = function(summary){
    this.writeConsole('Finished installing');
    if (summary.errors.length){
        this.writeConsole("Warning: there were some errors during the installation");

        summary.errors.forEach(function(error){
            this.writeConsole("File : "+error.entry.filename + " error: "+error.error.toString());
        }, this);
    }
}
Status.prototype.showNoUpdate = function(evts){
    this.writeConsole('There was no update to proceed with');
}
Status.prototype.showUpdateSkipped = function(evts){
    this.writeConsole('The update was skipped');
}