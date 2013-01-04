(function(obj) {

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
					entry.getData(new zip.BlobWriter(), function(blob){
						log(blob);
						
						var reader = new FileReader();
						
						reader.onloadend = function(data){
							log('onloadend');
							log(reader.result);
						}
						
						reader.readAsBinaryString(blob);
						
					});
				});
			});
		}, onerror);
	});

})(this);
