var fetchPackage = function() {

	// recursively read a zip file
	function errorHandler(message) {
		alert(message);
	}
	
	function fileErrorHandler(e) {
	  var msg = '';
	
	  switch (e.code) {
		case FileError.QUOTA_EXCEEDED_ERR:
		  msg = 'QUOTA_EXCEEDED_ERR';
		  break;
		case FileError.NOT_FOUND_ERR:
		  msg = 'NOT_FOUND_ERR';
		  break;
		case FileError.SECURITY_ERR:
		  msg = 'SECURITY_ERR';
		  break;
		case FileError.INVALID_MODIFICATION_ERR:
		  msg = 'INVALID_MODIFICATION_ERR';
		  break;
		case FileError.INVALID_STATE_ERR:
		  msg = 'INVALID_STATE_ERR';
		  break;
		default:
		  msg = 'Unknown Error';
		  break;
	  };
	
	  console.log('Error: ' + msg);
	
	}
	
	function createDir(rootDirEntry, folders) {	  
		console.log('creating directory: ' + folders);
		
	  var folder = folders.substr(0, folders.indexOf('/'));
	  
	  rootDirEntry.getDirectory(folder, {create: true, exclusive: false }, function(dirEntry) {
		// Recursively add the new subfolder (if we still have another to create).
		var subfolders = folders.substr(folder.length+1);
		
		if (subfolders.length) {
		  createDir(dirEntry, subfolders);
		}
	  }, fileErrorHandler);
	};
	
	alert('build 16');	
	
	var unzipPackage = function() {
		alert('fetching the package');
		var x = 0;
		
		var zipFs = new zip.fs.FS();
          zipFs.importHTTPContent('http://clients.de-facto.com/shine/container.zip', false, function() {
         	 alert('imported zip');
            window._fs.getDirectory('api', function(dir) {
            	alert('getting the dir to export to');
            	 zipFs.exportFileEntry(dir, function() {
            	 	alert('exported zip');
            	 
            	 });
            
            });
            
           
          }, function(){ alert('Error occured'); });
		
		/*zip.createReader(new zip.HttpReader('http://clients.de-facto.com/shine/container.zip'), function(reader) {	
			alert('read the file from HTTP');
			
			// get all entries from the zip
			reader.getEntries(function(entries) {
				alert('got the entries');
				
				window._testEntries = entries;
				
				if (entries.length) {
					alert('many entries ('+entries.length+')');				
					
					
					entries.forEach(function(entry){
						if (entry.directory) {							
							createDir(window._fs, entry.filename);
						} else { 
							console.log('attempting to write: ' + 'api/' + entry.filename.replace(/\//g, '_'));
							window._fs.getFile('api/' + entry.filename.replace(/\//g, '_'), {
								create: true,
								exclusive: false,
							}, function(fileEntry) {
								//alert('got the file entry');
								fileEntry.createWriter(function(fileWriter) {							  
									//alert('created the file writer');
									fileWriter.onerror = function(e) {
										//alert('Write failed: ' + e.toString());
									};
									
									fileWriter.onwrite = function(e) {
										//alert('Write of the file entry ' + entry.filename + 'completed.');
									};
								
								
									entry.getData(new zip.BlobWriter('text/plain'), function(blob) {
										
										
										var foobar = new FileReader();
										
										foobar.onloadend = function(evt) {
        										fileWriter.write(evt.target.result);
        								}
										
										foobar.readAsText(blob)
																				
									}, function(current, total) {
										// onprogress callback
										console.log(entry.filename+' read: '+current+'/'+total);
									});							  
							
								}, fileErrorHandler);
									
							}, fileErrorHandler);
						}
					});			
					
				}
			});
		}, errorHandler);*/
	}
	
	var onInitFs = function(fs) {
		window._fs = fs.root;
		
		alert('filesystem initialized');
		unzipPackage();
	}
	
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onInitFs, fileErrorHandler);
}