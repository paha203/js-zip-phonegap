var log = function(str){
	alert(str);
	console.log(str);
}

var fetchData = function() {

	log('fetching data called');
	
	var fileInput  = document.getElementById("file-input");
	var fileButton = document.getElementById("fetch-zip");
	var onerror = function(message) {
		alert(message);
	}
	

	fileButton.addEventListener('click', function() {
		log('clicked');
		fileInput.disabled = true;
		
		var fileURL = fileInput.value;		
		if (window.location.href.indexOf('.local') === -1){
			fileURL = 'http://clients.de-facto.com/defacto/js-zip/container.zip';
		}
		var httpReaderPrototype = new zip.HttpReader(fileURL);
		console.log('constructed reader');
		 zip.createReader(httpReaderPrototype, function(zipReader){
		 
			log('Created the zip reader');
			log('File url is: '+fileURL);

			zipReader.getEntries(function(entries){
				entries.forEach(function(entry){
					log('doing new entry');
					entry.getData(new zip.BlobWriter(), function(text){
						log('wrote to blob');
						fs.getFile('240.png', {create: true}, function(fileEntry) {
							log('created 240.png');
							fileEntry.createWriter(function(fileWriter){
							
								log('fileEntry writer created');
								
								fileWriter.onwrite = function() {
									log('Finished writing the file');
								}
								
								var fileReader = new FileReader;
								fileReader.onload = function(){
									log('onload called, starting to write the result');
									//log(fileReader.result);
									//fileWriter.write(fileReader.result);
								}
								log('starting to read as text');
								fileReader.readAsText(text);
							});
						});
					});
				});
			});
		}, onerror);
	});

};

try{
	log('waiting for device ready');
	document.addEventListener('deviceready', function(){
		
		log('device ready fired');
		
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(filesystem){
			fs = filesystem.root;
			log(filesystem.name);	
			log('file system is:');
			log(fs);
			fetchData();
		});
	});
} catch (e){
	log(e);
}