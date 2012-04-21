function Message(data) {
	this.from = {
		name: data[0],
		id: +data[4]
	};
	this.title = data[1];
	this.id = +data[3];
	this.read = data[5] === 'false';

	this.textDate = data[2];
	if(this.textDate.match(/\d+:\d+/))
		this.textDate = "Today";

}
Message.prototype.getURL = function() {
	return 'http://www.roblox.com/My/PrivateMessage.aspx?MessageID=' + this.id + '&from=Inbox';
};

Message.prototype.getDate = function() {
	return this.textDate;
};

Message.prototype.loadContent = function(callback) {
	var that = this;
	if(that.content === undefined) {
		$.get(that.getURL(), function(html) {
			var body = $(html).find('#pBody');
			body.find('br').replaceWith('\n');
			that.content = body.text().split('------------------------------');

			
			that.date 
			

			console.log(that.content);
			callback(that.content);
		});
	}
};

function getMessages(callback) {
	$.get('http://www.roblox.com/My/MessagesHandler.ashx', {
		page: 1,
		msgsPerPage: 50,
		type: 'GetInbox',
		sort: '[Created] DESC'
	}, function(data) {
		var messages = data.Messages.map(function(e) {
			return new Message(e);	
		});
		console.log(messages);
		callback(messages);
	});

}

function goTo(url) {
	chrome.tabs.getAllInWindow(undefined, function (tabs) {
		var exists = false;
		$(tabs).each(function () {
			if (this.url && 0 == this.url.indexOf(url)) {
				exists = this.id;
				return;
			}
		});
		
		if(exists != false)
			chrome.tabs.update(exists, {selected: true});
		else
			chrome.tabs.create({url: url});
	});

}
wrappedDB.open('Roblox', 'messages', function() {
	getMessages(function(messages) {
		
	});
});

