log = function(str){
    console.log(str);
}

log('waiting for device ready');

document.addEventListener('DOMContentLoaded', function(){
    view = new Status('status');

    log('device ready fired');

    window.webkitRequestFileSystem(TEMPORARY, 1024 * 1024 * 1024 * 5, function(filesystem){
        fs = filesystem.root;
        log('filesystem name is: '+filesystem.name);
        controller = new Controller(view);
        controller.update();
    });
});
