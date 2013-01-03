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
	
	alert('build 6');	
	
	var unzipPackage = function() {
		alert('fetching the package');
		var x = 0;
		zip.createReader(new zip.HttpReader('http://192.168.1.50/js-zip/output.zip'), function(reader) {	
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
							window._fs.getFile(entry.filename, {
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
								
									fileWriter.write('hello world');
								
									/*entry.getData(new zip.TextWriter(), function(text) {
										//alert('read the text from zip');
										console.log(text);
										//alert(text);
										// text contains the entry data as a String
										fileWriter.write(text);			
										
									}, function(current, total) {
										// onprogress callback
										console.log(entry.filename+' read: '+current+'/'+total);
									});*/							  
							
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
		
		alert('filesystem initialized');
		unzipPackage();
	}
	
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onInitFs, fileErrorHandler);
}