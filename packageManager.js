/**
 * Package manager implementation
 */
var PackageManager = function(settings) {
	this.localPackageVersion = 0;
	this.latestServerPackageVersion = false;
	this.latestServerPackageUrl = false;
	this.events = {};
	this.setServerPackageVersionUrl(settings.serverPackageVersionUrl);
	this.setFileSystem(settings.fileSystem);
	this.setLocalVersionPointerFileName(settings.localVersionPointerFileName || 'current.version');
}

/**
 * Register an event observer
 */
PackageManager.prototype.register = function(eventName, callback){
	if ( ! this.eventExists(eventName)) {
		this.events[eventName] = [];
	}
	this.events[eventName].push(callback);
}

/**
 * Check if observers exist for an event
 */
PackageManager.prototype.eventExists = function(eventName){
	return typeof this.events[eventName] !== 'undefined';
}

/**
 * Fire an event
 */
PackageManager.prototype.fire = function(eventName, args){
	if (this.eventExists(eventName)){
		this.events[eventName].forEach(function(callback){
			callback(args);
		});
	}
}

/**
 * List of internal event names
 */
PackageManager.prototype.eventNames = {};
PackageManager.prototype.eventNames.NEW_PACKAGE_AVAILABLE = 'new_package';
PackageManager.prototype.eventNames.NO_NEW_PACKAGE_AVAILABLE = 'no_new_package';


/**
 * Check to see if an update is required
 */
PackageManager.prototype.isUpdateRequired = function() {
    if ( ! this.getLatestServerPackageVersion()){
        return false;
    }
	return (parseInt(this.getLocalPackageVersion()) < parseInt(this.getLatestServerPackageVersion()));
}

/**
 * Initialise the package manager by determining the different versions
 */
PackageManager.prototype.init = function(request){
	this.requestLatestServerPackageInfo(request, function(){
        log('Requested latest server package info. Version: ' + parseInt(this.getLatestServerPackageVersion()));
		this.requestLocalPackageVersion(function(){
			log('Requested local version. Version: ' + parseInt(this.getLocalPackageVersion()));
			if (this.isUpdateRequired()){
				this.fire('update-available');
			} else {
				this.fire('no-update');
			}
		});
	});
}

/**
 * Update to the latest package
 */
PackageManager.prototype.update = function(action){
	var that = this,
        fs = this.getFileSystem(),
		progressCallback = function(evt) {
            log("calling our download progress");
			that.fire('download-progress', evt);
		},
		httpReader = new zip.HttpReader(this.getLatestServerPackageUrl(), { progressCallback: progressCallback });

	this.fire('download-before');

    // Download the file
	zip.createReader(httpReader, function(zipReader){

    // We now know the complete filesize - we have not downloaded the file though...


        // Extract the file
        zipReader.getEntries(function(entries){

            that.fire('download-after');

            log(entries);

            that.fire('extract-before');

            that.fire('extract-after', entries);

            var progress = {
                total: entries.length,
                complete: 0,
                entry:false
            };

            var summary = {
                errors: []
            };

            that.fire('install-before');

            // Write the files
            entries.forEach(function(entry){

               setTimeout((function(e){
                    return function(){
                        var entry = e;
                        progress.entry = entry;

                        var filename = entry.filename.replace(/\//g, '-');

                        if (entry.directory || filename.indexOf('json') === -1) {
                            progress.complete++;
                            that.fire('install-progress', progress);
                            return;
                        }

                        entry.getData(new zip.Data64URIWriter(), function(text){

                            fs.getFile(filename, {create: true}, function(fileEntry) {

                                fileEntry.createWriter(function(fileWriter){
                                    fileWriter.onwrite = function() {
                                        progress.complete++;

                                        that.fire('install-progress', progress);

                                        if (progress.complete === progress.total){
                                            that.fire('install-after', summary);
                                        }
                                    }
                                    fileWriter.onerror = function(){
                                        progress.complete++;
                                        summary.errors.push({
                                            error: fileWriter.error,
                                            entry: entry
                                        });

                                        that.fire('install-progress', progress);

                                        if (progress.complete === progress.total){
                                            that.fire('install-after', summary);
                                        }
                                    }

                                    setTimeout(function(){

                                        try{


                                            fileWriter.write(text);

                                        }catch(e){
                                            progress.complete++;

                                            summary.errors.push({
                                                error: e,
                                                entry: entry
                                            });
                                            that.fire('install-progress', progress);

                                            if (progress.complete === progress.total){
                                                that.fire('install-after', summary);
                                            }
                                        }

                                    }, 50);

                                }, function(){
                                    // error on createWriter
                                });
                            }, function(){
                                // error on getFile
                            });
                        });
                    }
                })(entry), 50);

            });


        }, function(progress){
            that.fire('extract-progress', progress);
        });

	}, function(e){
	    that.fire('download-after');
	});
}

/**
 * Skip the update (non-permanent)
 */
PackageManager.prototype.skipUpdate = function(){
	this.fire('update-skipped');
}

/**
 * Request the latest package version from the remote server
 */
PackageManager.prototype.requestLatestServerPackageInfo = function(request, complete){

	var that = this,
		request = request || new XMLHttpRequest();
		
		request.addEventListener('load', function(){
            try{
			    var packageInfo = JSON.parse(request.responseText);
                that.setLatestServerPackageVersion(packageInfo.version);
                that.setLatestServerPackageUrl(packageInfo.url);
            } catch (e){
                that.setLatestServerPackageVersion(false);
            }

			complete.call(that);
		}, false);
		
		request.addEventListener('error', function(){
			that.setLatestServerPackageVersion(false);
			complete.call(that);
		}, false);
		
		request.open("GET", this.getServerPackageVersionUrl());
		request.send();
}

/**
 * Request the package version from the local file system
 */
PackageManager.prototype.requestLocalPackageVersion = function(complete){
	var that = this;

	this.getFileSystem().getFile(this.getLocalVersionPointerFileName(), {}, function(versionFile){
		// success
		var reader = new FileReader();
    	
    	reader.onloadend = function() {
    		that.setLocalPackageVersion(reader.result);
    		complete.call(that);
   		};
   		
    	reader.readAsText(versionFile);
	}, function() {
		that.setLocalPackageVersion(false);
		complete.call(that);
	});
}


/**
 * Set the URL used to determine the remote server package version
 */
PackageManager.prototype.setServerPackageVersionUrl = function(str){
    if (typeof str !== 'string'){
        throw 'Server package url must be a string';
    }
    this.serverPackageVersionUrl = str;
}

/**
 * Get the URL used to determine the remote server package version
 */ 
PackageManager.prototype.getServerPackageVersionUrl = function(){
	return this.serverPackageVersionUrl;
}

/**
 * Set the filename of the local version pointer
 */
PackageManager.prototype.setLocalVersionPointerFileName = function(pointerFileName) {
	this.localVersionPointerFileName = pointerFileName;
}

/**
 * Get the filename of the local version pointer
 */
PackageManager.prototype.getLocalVersionPointerFileName = function() {
	return this.localVersionPointerFileName;
}

/**
 * Set the version of the locally installed package
 */
PackageManager.prototype.setLocalPackageVersion = function(version){
	this.localPackageVersion = parseInt(version) || 0;
}

/**
 * Get the local package version
 */
PackageManager.prototype.getLocalPackageVersion = function(){
    return this.localPackageVersion;
}

PackageManager.prototype.requestUpdateLocalPackageVersion = function(version, complete){
    // @todo
    // write to the local file system and update to the specified version
}

/**
 * Set the latest server package version
 */
PackageManager.prototype.setLatestServerPackageVersion = function(version){
	this.latestServerPackageVersion = parseInt(version) || 0;
}

/**
 * Get the latest server package version
 */
PackageManager.prototype.getLatestServerPackageVersion = function(){
	return this.latestServerPackageVersion;
}

/**
 * Set the latest server package url
 */
PackageManager.prototype.setLatestServerPackageUrl = function(packageUrl){
	this.latestServerPackageUrl = packageUrl || false;
}

/**
 * Get the latest server package URL
 */
PackageManager.prototype.getLatestServerPackageUrl = function(){
	return this.latestServerPackageUrl;
}

/**
 * Set the filesystem instance
 * @param fileSystem
 */
PackageManager.prototype.setFileSystem = function(fileSystem){
	if (typeof fileSystem !== 'object'){
		throw 'Package Manager must be an object';
	}
	this.fileSystem = fileSystem;
}

/**
 * Get the filesystem instance
 */
PackageManager.prototype.getFileSystem = function(){
	return this.fileSystem;
}