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
	  // Throw out './' or '/' and move on to prevent something like '/foo/.//bar'.
	  if (folders[0] == '.' || folders[0] == '') {
		folders = folders.slice(1);
	  }
	  rootDirEntry.getDirectory(folders[0], {create: true}, function(dirEntry) {
		// Recursively add the new subfolder (if we still have another to create).
		if (folders.length) {
		  createDir(dirEntry, folders.slice(1));
		}
	  }, fileErrorHandler);
	};
	
	var unzipPackage = function() {
		var x = 0;
		zip.createReader(new zip.HttpReader('http://192.168.1.50/js-zip/output.zip'), function(reader) {	
			// get all entries from the zip
			reader.getEntries(function(entries) {
				if (entries.length) {
					entries.forEach(function(entry){
						if (entry.directory) {
							console.log('creating directory: ' + entry.filename);
							createDir(window._fs, entry.filename);
						} else { 
							window._fs.getFile(entry.filename, {
								create: true
							}, function(fileEntry) {
								fileEntry.createWriter(function(fileWriter) {							  
								
									fileWriter.onerror = function(e) {
										console.log('Write failed: ' + e.toString());
									};
									
									fileWriter.onwriteend = function(e) {
										console.log('Write of the file entry ' + entry.filename + 'completed.');
									};
								
									entry.getData(new zip.TextWriter(), function(text) {
										// text contains the entry data as a String
										fileWriter.write(text);			
										
									}, function(current, total) {
										// onprogress callback
									});							  
							
								}, fileErrorHandler);
							}, fileErrorHandler);
						}
					});			
					
				}
			});
		}, errorHandler);
	}
	
	var onInitFs = function(fs) {
		window._fs = fs.root;
		unzipPackage();
	}
	
	window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
	
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onInitFs, fileErrorHandler);
}