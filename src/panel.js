import State from "./panel/models/State";
import Log from "./panel/models/Log";
import saveLog from "./panel/saveLog";

const state = window.state = new State(
  chrome.runtime.connect({name: "listener"}),
  document.querySelector(".log-container"),
  document.querySelector(".filter-container")
);


function scrollToBottom() {
  state.container.scrollTo(0, state.container.scrollHeight);
}

function handleLog(cache, raidId, log, timestamp) {
  const model = new Log(raidId, log, timestamp);
  model.createView(state.container);
  model.filterView(state.filter);
  cache.push(model);
}

function handleUpdate(msg) {
  const raidId = Number(msg.raidId);
  const cache = state.repository.has(raidId) ? state.repository.get(raidId) : [];
  state.filter.raidIds.add(raidId);

  msg.log.forEach(function(log) {
    handleLog(cache, raidId, log);
  });

  state.repository.set(raidId, cache);
  state.updateView();

  if (!state.filter.raidId) {
    state.filter.raidId = raidId;
    state.updateFilter();
  }
  scrollToBottom();
}

function handleCache(msg) {
  Object.keys(msg.cache).forEach(function(raidId) {
    raidId = Number(raidId);
    const cache = [];
    (msg.cache[raidId] || []).forEach(function(log) {
      handleLog(cache, raidId, log);
    });
    state.repository.set(raidId, cache);
    state.filter.raidIds.add(raidId);
  });
  state.filter.raidId = Number(msg.lastRaidId);
  state.updateView();
  state.updateFilter();
}

const messageHandlers = {
  update: handleUpdate,
  cache: handleCache
};

state.port.onMessage.addListener(function(msg) {
  const handler = messageHandlers[msg.type] || function() {
    console.error("Unknown handler '" + msg.type + "'");
  };
  handler(msg.payload);
});

state.form.elements["filter"].addEventListener("keyup", ::state.updateFilter);
["case", "lang", "raidId", "regexp"].forEach(function(name) {
  state.form.elements[name].addEventListener("change", ::state.updateFilter);
});
state.form.addEventListener("submit", function(evt) {
  evt.preventDefault();
  evt.stopImmediatePropagation();
  state.updateFilter();
});
state.form.elements["reset"].addEventListener("click", function() {
  setTimeout(::state.updateFilter, 1);
});
state.form.elements["clear"].addEventListener("click", function() {
  state.repository.clear();
  state.container.innerHTML = "";
  state.filter.raidIds.clear();
  state.filter.raidId = 0;
  state.updateView();
  state.port.postMessage("clear");
});
state.form.elements["save"].addEventListener("click", function() {
  saveLog(state);
});
