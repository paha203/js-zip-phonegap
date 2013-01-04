(function(obj) {

	var requestFileSystem = obj.webkitRequestFileSystem || obj.mozRequestFileSystem || obj.requestFileSystem;

	function onerror(message) {
		alert(message);
	}

	function createTempFile(callback) {
		var tmpFilename = "tmp.dat";
		requestFileSystem(TEMPORARY, 4 * 1024 * 1024 * 1024, function(filesystem) {
			function create() {
				filesystem.root.getFile(tmpFilename, {
					create : true
				}, function(zipFile) {
					callback(zipFile);
				});
			}

			filesystem.root.getFile(tmpFilename, null, function(entry) {
				entry.remove(create, create);
			}, create);
		});
	}

	var model = (function() {
		var URL = obj.webkitURL || obj.mozURL || obj.URL;

		return {
			getEntries : function(file, onend) {
				zip.createReader(new zip.BlobReader(file), function(zipReader) {
					zipReader.getEntries(onend);
				}, onerror);
			},
			getEntryFile : function(entry, creationMethod, onend, onprogress) {
				var writer, zipFileEntry;

				function getData() {
					entry.getData(writer, function(blob) {
						var blobURL = creationMethod == "Blob" ? URL.createObjectURL(blob) : zipFileEntry.toURL();
						onend(blobURL, function() {
							if (creationMethod == "Blob")
								URL.revokeObjectURL(blobURL);
						});
					}, onprogress);
				}

				if (creationMethod == "Blob") {
					writer = new zip.BlobWriter();
					getData();
				} else {
					createTempFile(function(fileEntry) {
						zipFileEntry = fileEntry;
						writer = new zip.FileWriter(zipFileEntry);
						getData();
					});
				}
			}
		};
	})();

	(function() {
			
		try{
			var b = new Blob(['ahahha'], { type: 'application/zip'})
			
			alert(b);
		}catch(e){
			alert(e);
			alert('it did not work :(');
		}
	
		var fileInput = document.getElementById("file-input");
		var unzipProgress = document.createElement("progress");
		var fileList = document.getElementById("file-list");
		var creationMethodInput = document.getElementById("creation-method-input");

		function download(entry, li, a) {
			model.getEntryFile(entry, creationMethodInput.value, function(blobURL, revokeBlobURL) {
				var clickEvent = document.createEvent("MouseEvent");
				if (unzipProgress.parentNode)
					unzipProgress.parentNode.removeChild(unzipProgress);
				unzipProgress.value = 0;
				unzipProgress.max = 0;
				clickEvent.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
				a.href = blobURL;
				a.download = entry.filename;
				a.dispatchEvent(clickEvent);
				setTimeout(revokeBlobURL, 1);
			}, function(current, total) {
				unzipProgress.value = current;
				unzipProgress.max = total;
				li.appendChild(unzipProgress);
			});
		}

		if (typeof requestFileSystem == "undefined")
			creationMethodInput.options.length = 1;
		
		function run(){
			window.URL = window.URL || window.webkitURL;  // Take care of vendor prefixes.

			var xhr = new XMLHttpRequest();
			xhr.open('GET', 'container.zip', true);
			//xhr.responseType = 'blob';
			
			xhr.onload = function(e) {
				console.log(this.status);
			  if (this.status == 200) {
			  
			  	try{
			  		var blob = new Blob([this.response], {type: 'application/zip'});
			  		console.log(blob);
			  	} catch(e){
			  		console.log('exception when creating blob');
			  		console.log(e);
			  	}
			  
			  // 	console.log('set blob, this.response');
// 			  	try{
// 			  	console.log(typeof this.response);
// 			  	console.log(this.response);
// 				var blob = this.response;
// 				}catch(e){
// 					console.log(e);
// 					console.log('caught an exception...');
// 				}
// 				console.log(blob);
// 				
				fooBlob = blob;
				
				fileInput.disabled = true;
				model.getEntries(blob, function(entries) {
					fileList.innerHTML = "";
					entries.forEach(function(entry) {
						var li = document.createElement("li");
						var a = document.createElement("a");
						a.textContent = entry.filename;
						a.href = "#";
						a.addEventListener("click", function(event) {
							if (!a.download) {
								download(entry, li, a);
								event.preventDefault();
								return false;
							}
						}, false);
						li.appendChild(a);
						fileList.appendChild(li);
					});
				});
					
			  }
			};
			
			xhr.send();
		}
		
		setTimeout(function(){
			console.log('running');
			run();
		}, 3000);
		
	
	})();

})(this);