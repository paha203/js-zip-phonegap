log = function(str){
    console.log(str);
}

log('waiting for device ready');

document.addEventListener('deviceready', function(){
    view = new Status('status');

    log('device ready fired');

//    window.webkitRequestFileSystem(LocalFileSystem.PERSISTENT, 1024 * 1024 * 1024 * 5, function(filesystem){
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(filesystem){
        fs = filesystem.root;
        log('filesystem name is: '+filesystem.name);
        controller = new Controller(view);
        controller.update();
    });
});
