var listeners = new Set();

function handleEmitter(emitter) {
  emitter.onMessage.addListener(function(msg) {
    listeners.forEach(function(listener) { 
      listener.postMessage(msg);
    });
  });
}

function handleListener(listener) {
  listeners.add(listener);
  listener.onDisconnect.addListener(function() {
    listeners.delete(listener);
  });
}

chrome.runtime.onConnect.addListener(function(port) {
  switch (port.name) {
  case "emitter":
    handleEmitter(port);
    break;
  default:
    handleListener(port);
    break;
  }
});
