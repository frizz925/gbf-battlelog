function injected(context) {
  var port;

  function onMessage(evt) {
    console.log("in", evt.data);
  }

  function portSetup(evt) {
    if (evt.data !== "injectInit") return;
    evt.preventDefault();
    evt.stopImmediatePropagation();
    port = evt.ports[0];
    port.onmessage = onMessage;
  }

  window.addEventListener("message", portSetup, true);

  const origWebSocket = context.WebSocket;
  const newWebSocket = function() {
    const args = Array.prototype.concat.apply([null], arguments);
    const boundConstructor = Function.bind.apply(origWebSocket, args);
    var result = new boundConstructor();
    result.addEventListener("message", function(evt) {
      port.postMessage(evt.data);
    });
    return result;
  };
  for (var k in origWebSocket) {
    if (!origWebSocket.hasOwnProperty(k)) continue;
    newWebSocket[k] = origWebSocket[k];
  }

  newWebSocket.toString = function() {
    return origWebSocket.toString();
  };
  newWebSocket.prototype = origWebSocket;
  newWebSocket.prototype.constructor = newWebSocket;
  context.WebSocket = newWebSocket;
}

const parent = document.head || document.documentElement;
const script = document.createElement("script");
script.type = "text/javascript";
script.innerHTML = "(" + injected.toString() + ")(this);";
parent.appendChild(script);
setTimeout(function() {
  parent.removeChild(script);
}, 1);

const port = chrome.runtime.connect({name: "emitter"});
const channel = new MessageChannel();
channel.port1.onmessage = function(evt) {
  var data = evt.data;
  const idx = data.indexOf("[");
  if (idx < 0) return;
  data = data.substr(data.indexOf("["));
  data = JSON.parse(data);
  const type = data[0];
  data = data[1];
  if (type !== "raid") return;
  if (!data.logAdd) return;
  port.postMessage(data.logAdd);
};

window.postMessage("injectInit", "*", [channel.port2]);
