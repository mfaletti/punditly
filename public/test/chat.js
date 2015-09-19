window.onload = function() {
  var messages = [];
  var socket = io.connect('http://punditly.com');
  var field = document.getElementById("text-box");
  var sendButton = document.getElementById("send");
  var content = document.getElementById("content");
	
  socket.on('message', function (data) {
    if(data.message) {
      messages.push(data.message);
      var html = '';
      for(var i=0; i<messages.length; i++) {
          html += messages[i] + '<br />';
      }
      content.innerHTML = html;
    } else {
        console.log("There is a problem:", data);
    }
  });

	var handler = function(){
		var text = field.value;
		socket.emit('send', { message: text});
		field.value = "";
	};

  $(field).keypress(function(e){
		if (e.which == 13) {
			handler();
		}
	});
	
	$('#send').click(handler);
}