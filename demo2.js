var fetchData = function() {

	var fileInput  = document.getElementById("file-input");
	var fileButton = document.getElementById("fetch-zip");
	var onerror = function(message) {
		alert(message);
	}
	var log = function(str){
		alert(str);
		console.log(str);
	}

	fileButton.addEventListener('click', function() {
		fileInput.disabled = true;
		
		var fileURL = fileInput.value;		
		var httpReaderPrototype = new zip.HttpReader(fileURL);
		console.log('constructed reader');
		 zip.createReader(httpReaderPrototype, function(zipReader){
		 
			log('Created the zip reader');
			log('File url is: '+fileURL);

			zipReader.getEntries(function(entries){
				entries.forEach(function(entry){
					
					entry.getData(new zip.TextWriter(), function(text){
						fs.getFile('240.png', {create: true}, function(fileEntry) {
							fileEntry.createWriter(function(fileWriter){
								fileWriter.onwrite = function() {
									log('Finished writing the file');
								}
								
								fileWriter.write(text);
							});
						});
					});
				});
			});
		}, onerror);
	});

};

window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(filesystem){
	
	fs = window.FileSystem.root;
	
	fetchPackage();
});
