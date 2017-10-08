const listeners = new Set();
var logCache;
var lastRaidId;

function resetLogCache() {
  logCache = window.logCache = {};
  lastRaidId = undefined;
}

function handleLogs(msg) {
  const raidId = msg.raidId;
  const cache = logCache[raidId] || [];
  msg.log.forEach(function(log) {
    cache.push(log);
  });
  logCache[raidId] = cache;

  listeners.forEach(function(listener) { 
    listener.postMessage({
      type: "update",
      payload: msg
    });
  });
}

function handleEmitter(emitter) {
  emitter.onMessage.addListener(function(msg) {
    lastRaidId = msg.raidId;
    if (msg.log) handleLogs(msg);
  });
}

function handleListener(listener) {
  listeners.add(listener);

  listener.onMessage.addListener(function(msg) {
    if (msg !== "clear") return;
    resetLogCache();
  });
  listener.onDisconnect.addListener(function() {
    listeners.delete(listener);
  });

  listener.postMessage({
    type: "cache",
    payload: {
      lastRaidId: lastRaidId,
      cache: logCache
    }
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

resetLogCache();
