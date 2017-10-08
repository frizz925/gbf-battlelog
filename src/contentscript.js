import _ from "lodash";
import injected from "./injected";

function parseBoss(boss) {
  const bosses = [];
  [1, 2, 3].forEach((num) => {
    const prefix = "boss" + num;
    if (!boss.param[prefix + "_hp"]) return;

    const obj = {};
    ["hp", "mode", "mode_gauge"].forEach(function(attr) {
      obj[attr] = boss.param[prefix + "_" + attr];
    });
    bosses.push(obj);
  });

  return {
    bosses,
    timestamp: boss.timestamp,
  };
}

function parseLog(logs) {
  return _.map(logs.log, (log) => _.assign({
    timestamp: logs.timestamp
  }, log));
}

const parent = document.head || document.documentElement;
const script = document.createElement("script");
script.type = "text/javascript";
script.innerHTML = "(" + injected.toString() + ")(this);";
parent.appendChild(script);
setTimeout(function() {
  if (process.env.NODE_ENV === "production") {
    parent.removeChild(script);
  }
}, 1);

const port = chrome.runtime.connect({name: "emitter"});
const channel = new MessageChannel();
channel.port1.onmessage = function(evt) {
  var data = evt.data;
  const raidId = data.raidId;
  data = data.data;

  const idx = data.indexOf("[");
  if (idx < 0) return;

  data = data.substr(data.indexOf("["));
  data = JSON.parse(data);
  const type = data[0];
  data = data[1];

  if (type !== "raid") return;

  port.postMessage({
    raidId: raidId,
    boss: data.bossUpdate ? parseBoss(data.bossUpdate) : null,
    log: data.logAdd ? parseLog(data.logAdd) : null,
  });
};

window.postMessage("injectInit", "*", [channel.port2]);
