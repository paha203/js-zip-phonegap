(function(obj) {

	var requestFileSystem = obj.webkitRequestFileSystem || obj.mozRequestFileSystem || obj.requestFileSystem;

	function onerror(message) {
		alert(message);
	}

var i = 0;

	function createTempFile(callback) {
		var tmpFilename = i+"tmp.png";
		i++;
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
				zip.createReader(new zip.HttpReader(file), function(zipReader) {
					zipReader.getEntries(onend);
				}, onerror);
			},
			getEntryFile : function(entry, creationMethod, onend, onprogress) {
				var writer, zipFileEntry;

				function getData() {
					entry.getData(writer, function(blob) {
						var blobURL = creationMethod == "Blob" ? URL.createObjectURL(blob) : zipFileEntry.toURL();
						alert(blobURL);
						console.log(blobURL);
						
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
		var fileInput  = document.getElementById("file-input");
		var fileButton = document.getElementById("fetch-zip");
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

		
				fileButton.addEventListener('click', function() {
					fileInput.disabled = true;
					model.getEntries(fileInput.value, function(entries) {
						fileList.innerHTML = "";
						entries.forEach(function(entry) {
						
							try{
							
							model.getEntryFile(entry, creationMethodInput.value, function(blobURL, revokeBlobURL) {
								
								var li = document.createElement("li");
								var a = document.createElement("a");
								a.textContent = entry.filename;
								a.href = blobURL;
								li.appendChild(a);
								fileList.appendChild(li);
							});
										
							} catch (e){
								alert(e);
							}
							
						});
				});
			}, false);
	})();

})(this);