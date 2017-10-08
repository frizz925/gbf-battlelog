import LogTemplate from "../templates/Log.handlebars";

export default class Log {
  constructor(raidId, log, timestamp) {
    this.raidId = raidId;
    this.log = log;
    this.el = null;
    this.textEls = {};
    this.comment = log.comment;
    this.timestamp = Number(timestamp) || Number(log.timestamp) || new Date().getTime();
  }

  createView(root) {
    const el = document.createElement("div");
    el.innerHTML = LogTemplate(this.log);

    el.childNodes.forEach((node) => {
      this.el = node;
      this.textEls.en = node.querySelector(".comment-en");
      this.textEls.ja = node.querySelector(".comment-ja");
      root.appendChild(node);
    });
    return el;
  }

  filterView(filter) {
    if (filter.lang === "ja") {
      this.textEls.en.style.display = "none";
      this.textEls.ja.style.display = null;
    } else {
      this.textEls.en.style.display = null;
      this.textEls.ja.style.display = "none";
    }
    this.el.style.display = this.checkFilter(filter) ? null : "none";
  }
  
  checkFilter(filter) {
    var shouldDisplay = this.raidId === filter.raidId;
    if (shouldDisplay && filter.text.length > 0) {
      var text = filter.text.trim();
      var comment = this.comment[filter.lang || "en"];
      if (!filter.caseSensitive) {
        text = text.toLowerCase();
        comment = comment.toLowerCase();
      }

      if (filter.regexp.enabled) {
        if (filter.regexp.pattern) {
          shouldDisplay = !!comment.match(filter.regexp.pattern);
        } else {
          shouldDisplay = false;
        }
      } else {
        shouldDisplay = comment.indexOf(text) > -1;
      }
    }
    return shouldDisplay;
  }
}
