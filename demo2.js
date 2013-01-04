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
			fileURL = 'http://clients.de-facto.com/defacto/js-zip/package.zip';
		}
		var httpReaderPrototype = new zip.HttpReader(fileURL);
		console.log('constructed reader');
		 zip.createReader(httpReaderPrototype, function(zipReader){
		 
			log('Created the zip reader');
			log('File url is: '+fileURL);
			
			var totalElement = document.getElementById('total');

			zipReader.getEntries(function(entries){
			    var total = 0;
			    
				entries.forEach(function(entry){
                                    if(entry.directory) return;
                                    var filename = entry.filename.replace(/\//g, '-');
                                    if (filename.indexOf('json') === -1) return;
                                    console.log(filename);
				    total++;
				    totalElement.value = total;
				    
					entry.getData(new zip.Data64URIWriter(), function(text){
						fs.getFile(filename, {create: true}, function(fileEntry) {
							fileEntry.createWriter(function(fileWriter){								
								fileWriter.onwrite = function() {
									total--;
								    
								    totalElement.value = total;
								    
									if (total == 0){
										log('wrote all!');
									}
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