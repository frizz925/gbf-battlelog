import _ from "lodash";
import moment from "moment";

function genericFormatter(cache, options, preprocess) {
  var text = "";
  cache.forEach(function(log) {
    const comment = log.comment[options.lang];
    text += preprocess ? preprocess(comment) : comment;
    text += options.delimiter;
  });
  return {
    type: options.type,
    data: text,
    extension: options.extension
  };
}

const formatters = {
  "text": function(cache, lang) {
    const el = document.createElement("div");
    return genericFormatter(cache, {
      type: "text/plain",
      delimiter: "\r\n",
      extension: "txt",
      lang
    }, function(text) {
      text = text.replace(/<br>/g, " ");
      el.innerHTML = text;
      return el.textContent || el.innerText || text;
    });
  },
  "html": function(cache, lang) {
    return genericFormatter(cache, {
      type: "text/html",
      delimiter: "<br/>",
      extension: "html",
      lang
    });
  },
  "json": function(cache) {
    return {
      type: "application/json",
      data: JSON.stringify(_.map(cache, (log => log.log)), null, 2),
      extension: "json"
    };
  }
};

function downloadText(options, cache) {
  const formatter = formatters[options.format];
  if (!formatter) {
    throw new Error("No known formatter '" + options.format + "'");
  }
  const formatted = formatter(cache, options.lang);
  const dataUrl = "data:" + formatted.type + ";charset=UTF-8," + encodeURIComponent(formatted.data);
  const link = document.createElement("a");
  link.style.display = "none";
  link.download = options.name + "." + formatted.extension;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function saveLog(state) {
  const raidId = state.filter.raidId;
  const cache = state.repository.get(raidId);
  if (!cache) {
    throw new Error("Log for raid ID '" + raidId + "' not found!");
  }

  const momentObj = moment();
  const lang = state.filter.lang;
  downloadText({
    name: [raidId, momentObj.format("YYYYMMDD"), momentObj.format("HHmmss"), lang].join("-"),
    format: state.form.elements["format"].value, lang
  }, cache);
}
