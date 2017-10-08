const listeners = new Set();
var logCache;
var lastRaidId;

function resetLogCache() {
  logCache = window.logCache = {};
  lastRaidId = undefined;
}

function handleLogs(raidId, msg) {
  const cache = logCache[raidId] || [];
  const logs = [];
  msg.log.forEach(function(log) {
    log.timestamp = msg.timestamp;
    cache.push(log);
    logs.push(log);
  });
  logCache[raidId] = cache;

  listeners.forEach(function(listener) { 
    listener.postMessage({
      type: "update",
      payload: logs
    });
  });
}

function handleEmitter(emitter) {
  emitter.onMessage.addListener(function(msg) {
    const raidId = lastRaidId = msg.raidId;
    const log = msg.log;
    if (log) handleLogs(raidId, log);
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
