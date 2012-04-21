var html5rocks = {};
var indexedDB = window.indexedDB || window.webkitIndexedDB ||
	window.mozIndexedDB;

if ('webkitIndexedDB' in window) {
	window.IDBTransaction = window.webkitIDBTransaction;
	window.IDBKeyRange = window.webkitIDBKeyRange;
}

wrappedDB = {};
wrappedDB.db = null;

wrappedDB.onerror = function(e) {
	console.log(e);
};

wrappedDB.open = function(dbName, storeId, callback) {
	var request = indexedDB.open(dbName);
 
	request.onsuccess = function(e) {
		var v = "1.1"; // Structural version of the DB
		var db = wrappedDB.db = e.target.result;

		// We can only create Object stores in a setVersion transaction
		if(v != db.version) {
			var setVrequest = db.setVersion(v);
 
			// onsuccess is the only place we can create Object Stores
			setVrequest.onfailure = wrappedDB.onerror;
			setVrequest.onsuccess = function(e) {
				if(db.objectStoreNames.contains(storeId)) {
					db.deleteObjectStore(storeId);
				}
 
				var store = db.createObjectStore(storeId, {keyPath: "id"}); // Create unique identifier for store
				wrappedDB.opened = true;
				callback();
			};
		}
		else {
			wrappedDB.opened = true;
			callback();
		}
	};
 
	request.onfailure = wrappedDB.onerror;
}
wrappedDB.putObject = function(storeId, object) {
	if(wrappedDB.opened === false)
		return;
		
	var trans = wrappedDB.db.transaction([storeId], IDBTransaction.READ_WRITE, 0);
	trans.onabort = function(e) {
		console.error(e);
	};

	var request = trans.objectStore(storeId).put(object);
	request.onsuccess = function(e) {
		console.log("Successfully stored object with key: " + object.id);
	};
	request.onerror = function(e) {
		console.error("An error occured while trying to store an object with key: " + object.id + ". " 
			+ this.webkitErrorMessage + " (code " + this.errorCode + ")");
	};
};

wrappedDB.deleteObject = function(storeId, key) {
	if(wrappedDB.opened === false)
		return;

	var db = wrappedDB.db;
	var trans = db.transaction([storeId], IDBTransaction.READ_WRITE, 0);
	var request = trans.objectStore(storeId).delete(key);
	request.onsuccess = function(e) {
		console.log("Successfully deleted object with key: " + key);
	};
	request.onerror = function(e) {
		console.error("An error occured while trying to delete an object with key: " + key + ". " 
			+ this.webkitErrorMessage + " (code " + this.errorCode + ")");
	};
};
wrappedDB.readAllObjects = function(storeId, objectFoundCallback, requestCompleteCallback) { 
	if(wrappedDB.opened === false)
		return;

	var trans = wrappedDB.db.transaction([storeId], IDBTransaction.READ_WRITE, 0);
 
	// Get everything in the store;
	var keyRange = IDBKeyRange.lowerBound(0);
	var cursorRequest = trans.objectStore(storeId).openCursor(keyRange);
 
	cursorRequest.onsuccess = function(e) {
		var cursor = e.target.result;

		if(!cursor) {
			if(requestCompleteCallback)
				requestCompleteCallback();
		} else { 
			if(objectFoundCallback)
				objectFoundCallback(cursor.value);

			cursor.continue();
		}
	};
 
	cursorRequest.onerror = wrappedDB.onerror;
};

wrappedDB.readObject = function(storeId, key, callback) { 
	if(wrappedDB.opened === false)
		return;

	var trans = wrappedDB.db.transaction([storeId], IDBTransaction.READ_WRITE, 0);
	var request = trans.objectStore(storeId).get(key);
 
	request.onsuccess = function(e) {
		if(callback) {
			if(this.result) {
				callback(this.result);
			} else {
				callback(null); // TODO: Better error handling
			}
		}
	};
 
	request.onerror = wrappedDB.onerror;
};