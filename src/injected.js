export default function injected(context) {
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
      port.postMessage({
        raidId: context.Game.view.raid_id,
        data: evt.data
      });
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
