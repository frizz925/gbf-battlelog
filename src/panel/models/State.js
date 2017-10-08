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
  }

  updateFilter() {
    const filter = this.filter;
    const form = this.form;

    filter.text = form.elements["filter"].value;
    filter.lang = form.elements["lang"].value;
    filter.caseSensitive = form.elements["case"].checked; // true if case sensitive
    filter.regexp.enabled = form.elements["regexp"].checked;
    filter.raidId = Number(form.elements["raidId"].value);

    try {
      filter.regexp.pattern = new RegExp(filter.text, filter.caseSensitive ? "" : "i");
    } catch(e) {
      filter.regexp.pattern = null;
    }
    
    this.repository.forEach((cache) => {
      cache.forEach((log) => {
        log.filterView(filter);
      });
    });
  }

  updateView() {
    const raidEl = this.form.elements["raidId"];
    raidEl.innerHTML = "<option disabled hidden></option>";
    Array.from(this.filter.raidIds).sort((a, b) => b - a).forEach((raidId) => {
      const opt = document.createElement("option");
      opt.value = opt.innerHTML = raidId;
      opt.selected = this.filter.raidId === raidId;
      raidEl.appendChild(opt);
    });
  }
}
