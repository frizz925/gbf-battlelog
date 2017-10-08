import {forEach, isFunction, isObject} from "lodash";
import traverse from "~/helpers/traverse";

export default class State {
  constructor(port, container, form) {
    this.port = port;
    this.repository = new Map();
    this.container = container;
    this.form = form;
    this.filter = {
      text: "",
      lang: "en",
      caseSensitive: false,
      regexp: {
        enabled: false,
        pattern: null
      },
      raidId: 0,
      raidIds: new Set()
    };
    this.inputMap = {
      "text": "filter",
      "lang": "lang",
      "caseSensitive": "case",
      "regexp.enabled": "regexp",
      "regexp.pattern": (form) => {
        const text = form.elements["filter"].value;
        const caseSensitive = form.elements["case"].checked;
        try {
          return new RegExp(text, caseSensitive ? "" : "i");
        } catch(e) {
          return null;
        }
      },
      "raidId": {
        name: "raidId",
        parser(value) {
          return Number(value);
        },
        formatter(value) {
          return value;
        }
      },
    };
  }

  updateFilter() {
    forEach(this.inputMap, (options, key) => {
      var value;
      if (isFunction(options)) {
        value = options(this.form);
      } else {
        const el = this.form.elements[isObject(options) ? options.name : options];
        value = el.value || el.checked;
        if (isObject(options)) {
          value = options.parser(value);
        }
      }
      traverse(this.filter, key, value);
    });

    this.repository.forEach((cache) => {
      cache.forEach((log) => {
        log.filterView(this.filter);
      });
    });
  }

  updateView() {
    forEach(this.inputMap, (options, key) => {
      var value = traverse(this.filter, key);
      if (isFunction(options)) {
        // skip
        return;
      } else {
        const el = this.form.elements[isObject(options) ? options.name : options];
        if (isObject(options)) {
          value = options.formatter(value);
        }
        forEach(["selected", "value"], (prop) => {
          if (!el.hasOwnProperty(prop)) return;
          el[prop] = value;
        });
      }
    });

    const raidEl = this.form.elements["raidId"];
    raidEl.innerHTML = "";
    Array.from(this.filter.raidIds).sort((a, b) => b - a).forEach((raidId) => {
      const opt = document.createElement("option");
      opt.value = opt.innerHTML = raidId;
      opt.selected = this.filter.raidId === raidId;
      raidEl.appendChild(opt);
    });
  }
}
