var Controller = function(status){
    this.status = status;
}

Controller.prototype.update = function(){
    var status = this.status;

        packageManager = new PackageManager({
            serverPackageVersionUrl: 'api/package/version',
            fileSystem: fs
        });

    // Downloading the Zip file
    packageManager.register('download-before', function(){
        status.showDownloadStart();
    });
    packageManager.register('download-progress', function(progress){
        status.showDownloadProgress(progress);
    });
    packageManager.register('download-after', function(){
        status.showDownloadComplete();
    });

    // Extracting the zip filenames
    packageManager.register('extract-before', function(){
        status.showExtractStart();
    });
    packageManager.register('extract-progress', function(progress){
        status.showExtractProgress(progress);
    });
    packageManager.register('extract-after', function(){
        status.showExtractComplete();
    });

    // Installing the files (writing them to disk)
    packageManager.register('install-before', function(){
        status.showInstallStart();
    });
    packageManager.register('install-progress', function(progress){
        status.showInstallProgress(progress);
    });
    packageManager.register('install-after', function(summary){
        status.showInstallComplete(summary);
    });


    packageManager.register('update-before');
    packageManager.register('update-fail');
    packageManager.register('update-success');
    packageManager.register('update-after');


    packageManager.register('update-available', function(args){
        status.askQuestion('Do you wish to update your local data?', function(result){
            result === true ? packageManager.update()
                : packageManager.skipUpdate();
        })
    });

    packageManager.register('no-update', function(args){
        status.showNoUpdate(args);
    });
    packageManager.register('update-skipped', function(args){
        status.showUpdateSkipped(args);
    });

    packageManager.init();
}