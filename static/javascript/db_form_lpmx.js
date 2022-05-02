/* jshint esversion: 8 */
//01-06-2022

// let ALPHABETIC = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzàèéìòù";
// let NUMERIC = "0123456789";
// var ULACHARSET = ALPHABETIC + NUMERIC;
var UAPUNCTS = `,.;::?!^~()[]{}<>=+-*#@£&%/«»“‘’"\`'`;
//key corpus con formkey duplicate
const KEY_OMOGR = "ula_omogr";
// key nome testo nello store
const KEY_TEXT_NAME = "ula_text_name";
// key nome dati
const KEY_DATA = "ula_data";
const KEY_DATA_FORM = "ula_form";
const KEY_DATA_TOKEN = "ula_token";
// url data
const URL_TEXT_LIST = "/data/text_list.txt";
const DATA_DIR = "/data";
const URL_CORPUS_OMOGR = "/data_corpus/corpus_omogr.json";



var DbFormLpmx = {
  text_name: null,
  token_file: null,
  form_file: null,
  token_lst: null,
  form_lst: [],
  omogr_json: {},
  len_row: 70,
  rows_js: [],
  get_text_name: function () {
    const store_text_name = localStorage.getItem(KEY_TEXT_NAME);
    const text_name = store_text_name || "";
    return text_name;
  },
  set_text_name: function (text_name_) {
    this.text_name = text_name_;
    this.token_file = `${text_name_}.token.csv`;
    this.form_file = `${text_name_}.form.csv`;
  },
  load_text_list: async function () {
    const url = URL_TEXT_LIST;
    let rows = [];
    const resp = await fetch(url, {
      method: 'GET',
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      cache: 'default'
    });
    if (resp.ok) {
      const csv_data = await resp.text();
      rows = csv_data.trim().split("\n");
    }
    else {
      alert(`${url} Not Found. `);
      rows = [];
    }
    return rows;
  },
  get_store: function () {
    let ok = false;
    let s = localStorage.getItem(KEY_DATA_FORM);
    if (s) {
      let lst = s.trim().split("\n");
      this.form_lst = lst.map((x) => x.split("|"));

      s = localStorage.getItem(KEY_DATA_TOKEN);
      if (s) {
        lst = s.trim().split("\n");
        this.token_lst = lst.map((x) => x.split("|"));
        this.sort_form_lst();
        this.get_omogr_json();
        ok = true;
      }
    }
    return ok;
  },
  set_store: function () {
    let lst = this.form_lst.map((x) => x.join("|"));
    let s = lst.join("\n");
    //AAA provare JSON
    // let x = JSON.parse(JSON.stringify(this.form_lst));
    // let x = JSON.stringify(this.form_lst);
    // console.log(x);
    try {
      localStorage.setItem(KEY_TEXT_NAME, this.text_name);
      localStorage.setItem(KEY_DATA_FORM, s);
    }
    catch (e) {
      alert("Error in LocalStore. => Clean Store\n" + e);
    }
    lst = this.token_lst.map((x) => x.join("|"));
    s = lst.join("\n");
    try {
      localStorage.setItem(KEY_DATA_TOKEN, s);
    }
    catch (e) {
      alert("Error in LocalStore. => Clean Store\n" + e);
    }
  },
  clear_store: function () {
    localStorage.clear();
    try {
      localStorage.setItem(KEY_TEXT_NAME, this.text_name);
    }
    catch (e) {
      alert("Error in LocalStore.\n" + e);
    }
  },
  show_store: function () {
    UaLog.log_show("-------------");
    let s = localStorage.getItem(KEY_TEXT_NAME) || "";
    UaLog.log(`${s}`);
    s = localStorage.getItem(KEY_DATA_FORM) || "";
    let size = s.length;
    UaLog.log(`form:${size}`);
    s = localStorage.getItem(KEY_DATA_TOKEN) || "";
    size = s.length;
    UaLog.log(`token:${size}`);
    d= localStorage.getItem(KEY_OMOGR) || "";
    size = s.length;
    UaLog.log(`homograf:${size}`);
    // for(let i=0; i<localStorage.length; i++) {
    //   let key = localStorage.key(i);
    //   UaLog.log(`${key}`);
    // }
    UaLog.log("-------------");
  },
  save_data: function () {
    const t = get_time();
    this.save_csv(this.form_lst, this.form_file);
    this.save_csv(this.token_lst, this.token_file);
    cmd_log("Save Data   " + t);
    this.set_store();
  },
  save_csv: function (rows, file_name) {
    const rs = rows.map((x) => x.join("|"));
    const data = rs.join("\n");
    const url = `/write/data/${file_name}`;
    fetch(url, {
      method: "POST",
      cache: 'default',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data
    }).then((resp) => {
      if (!resp.ok)
        throw new Error('HTTP error, status=' + resp.status);
      return resp.json();
    }).then((json) => {
    }).catch((error) => {
      alert(`ERROR post()\n${url}\n${error}`);
    });
  },
  update_corpus: function (call) {
    const text_name = `${this.text_name}.form.csv`;
    const url = `/updatecorpus/${text_name}`;
    fetch(url, {
      method: "POST",
      cache: 'default',
      headers: {
        'Content-Type': 'application/json',
      },
      body: ""
    }).then((resp) => {
      if (!resp.ok) {
        throw new Error('HTTP error, status=' + resp.status);
      }
      return resp.json();
    }).then((json) => {
      const t = get_time();
      cmd_log("Update Corpus Data   " + t);
      call(json);
    }).catch((error) => {
      alert(`ERROR post()\n${url}\n${error}`);
    });

  },
  update_text: function () {
    const text_name = `${this.text_name}.form.csv`;
    const url = `/updatetext/${text_name}`;
    fetch(url, {
      method: "POST",
      cache: 'default',
      headers: {
        'Content-Type': 'application/json',
      },
      body: ""
    }).then((resp) => {
      if (!resp.ok)
        throw new Error('HTTP error, status=' + resp.status);
      return resp.json();
    }).then((json) => {
      const t = get_time();
      cmd_log("Update Tex " + this.text_name + "  " + t);
      FormLpmx.load_data();
    }).catch((error) => {
      alert(`ERROR post()\n${url}\n${error}`);
    });
  },
  load_data: async function () {
    this.clear_store();
    const t = get_time();
    cmd_log("Load Data  " + t);
    if (!this.text_name)
      return false;
    this.form_lst = await this.load_csv(this.form_file);
    if (this.form_lst.length == 0)
      return false;
    this.token_lst = await this.load_csv(this.token_file);
    this.sort_form_lst();
    this.set_store();
    this.load_omogr_json();
    return true;
  },
  load_csv: async function (file_name) {
    const url = `${DATA_DIR}/${file_name}`;
    let csv_data = "";
    const resp = await fetch(url, {
      method: 'GET',
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      cache: 'default'
    });
    if (resp.ok)
      csv_data = await resp.text();

    if (!csv_data || csv_data.trim().length == 0) {
      const msg = `${file_name} Not Found.`;
      alert(msg);
      csv_data = "|||||||";
    }
    const rows = csv_data.trim().split("\n");
    return rows.map((x) => x.split("|"));
  },
  get_omogr_json: function () {
    const omogr_str = localStorage.getItem(KEY_OMOGR);
    if (!!omogr_str)
      this.omogr_json = JSON.parse(omogr_str);
    else
      this.load_omogr_json();
  },
  load_omogr_json: function () {
    const url = URL_CORPUS_OMOGR;
    fetch(url)
      .then((resp) => {
        if (!resp.ok)
          return "";
        return resp.text();
      })
      .then((text) => {
        if (text.length > 10) {
          localStorage.setItem(KEY_OMOGR, text);
          this.omogr_json = JSON.parse(text);
        } else {
          this.omogr_json = {};
          localStorage.removeItem(KEY_OMOGR);
        }
      })
      .catch((error) => {
        alert(`load_omogr_json() \n${url}\n${error}`);
      });
  },
  load_diff_text_corpus: function (call) {
    const text_name = `${this.text_name}.txt`;
    const url = `/diff?name=${text_name}`;
    fetch(url, {
      method: "GET",
      headers: { 'Content-Type': 'application/json' }
    })
      .then((resp) => {
        if (!resp.ok) {
          alert("ERROR compare text corpus ");
          return {};
        }
        return resp.json();
      })
      .then((js) => {
        call(js);
      })
      .catch((error) => {
        alert(`load_diff_text_corpus() \n${url}\n${error}`);
      });
  },
  get_formakey_context: function (formakey, cnt_size) {
    let build_context = (i) => {
      let lft = Math.max(i - cnt_size, 0);
      let rgt = Math.min(i + cnt_size + 1, le);
      let array = DbFormLpmx.token_lst.slice(lft, rgt);
      //AAA controlla json
      let row = JSON.parse(JSON.stringify(array));
      for (let i = 0; i < row.length; i++)
        row[i].push(lft + i);
      return row;
    };
    // filtra utilizzando formakey
    let rows = [];
    let le = this.token_lst.length;
    for (let i = 0; i < le; i++)
      if (this.token_lst[i][1] == formakey)
        rows.push(build_context(i));
    return rows;
  },
  get_forma_context: function (forma, cnt_size) {
    let build_context = function (i) {
      let lft = Math.max(i - cnt_size, 0);
      let rgt = Math.min(i + cnt_size + 1, le);
      // AAA controlla JSON
      let array = DbFormLpmx.token_lst.slice(lft, rgt);
      let row = JSON.parse(JSON.stringify(array));
      for (let i = 0; i < row.length; i++)
        row[i].push(lft + i);
      return row;
    };
    // filtra utilizzando forma
    let rows = [];
    let le = this.token_lst.length;
    for (let i = 0; i < le; i++)
      if (this.token_lst[i][0] == forma)
        rows.push(build_context(i));
    return rows;
  },
  sort_form_lst: function () {
    let sortFn = function (a, b) {
      if (a[1] == b[1]) return 0;
      if (a[1] < b[1]) return -1;
      if (a[1] > b[1]) return 1;
    };
    this.form_lst.sort(sortFn);
  },
  fill_rows_text: function () {
    // popola this.rows_js chiamatto da Form_text
    let t_tk_lst = DbFormLpmx.token_lst;
    this.rows_js = [];
    let len_row_text = 0;
    let row_num = 0;
    let row_t = [];
    let row_tk = [];
    const le = t_tk_lst.length;
    const last = le - 1;
    for (let i = 0; i < le; i++) {
      const t_tk = t_tk_lst[i];
      const t = t_tk[0];
      const tk = t_tk[1];
      len_row_text += t.length;
      row_t.push(t);
      row_tk.push(tk);
      if (len_row_text > this.len_row || i == last) {
        //token successivo
        if (i == last || !UAPUNCTS.includes(t_tk_lst[i + 1][1])) {
          const row_js = {
            row_n: row_num,
            row_text: row_t.join(" "),
            t: row_t,
            tk: row_tk
          };
          this.rows_js.push(row_js);
          row_num += 1;
          row_t = [];
          row_tk = [];
          len_row_text = 0;
        }
      }
    }
  },
  filter_rows_js: function (js) {
    // setta this.rows_js
    // i nomi dei campi derivano dall'input di filtraggio
    let formkey = js.formkey.trim();
    let form = js.form.trim();
    let lemma = js.lemma.trim();
    let etimo = js.etimo.trim();
    let pos = js.pos.trim();
    let phon = js.phon.trim();
    let rows = this.rows_js;

    let filter_token = () => {
      if (form != "")
        rows = rows.filter((x) => {
          return x.t.indexOf(form) > -1;
        });
      if (formkey != "")
        rows = rows.filter((x) => {
          return x.tk.indexOf(formkey) > -1;
        });
    };

    let filter_lemma = () => {
      let rs = this.form_lst.slice();
      let le_start = rs.length;
      if (lemma != "")
        rs = rs.filter((x) => {
          return x[2] == lemma;
        });
      if (etimo != "")
        rs = rs.filter((x) => {
          return x[3] == etimo;
        });
      if (pos != "")
        rs = rs.filter((x) => {
          return x[4] == pos;
        });
      if (phon != "")
        rs = rs.filter((x) => {
          return x[5] == phon;
        });
      // set dei token corrispondenti al lemma
      let tks = [];
      for (let x of rs) {
        tks.push(x[1]); // tokemkey
      }
      // nessuna selezionae
      if (rs.length == le_start)
        return [];
      return tks;
    };
    filter_token();
    let tk_set = filter_lemma();
    if (tk_set.length > 0) {
      rows = rows.filter((x) => {
        let n = 0;
        for (let tk of tk_set)
          if (x.tk.indexOf(tk) > -1) n += 1;
        return n > 0;
      });
    }
    if (rows.length == 0) {
      this.rows_js = [];
      return;
    }
    //evidenzazione form,formkey e attribuzione numero
    let row_num = 0;
    for (let row of rows) {
      let ws = [];
      for (let i = 0; i < row.t.length; i++) {
        const t = row.t[i];
        const tk = row.tk[i];
        if (tk == formkey) {
          ws.push("<span class='t'>" + t + "</span>");
          continue;
        }
        if (t == form) {
          ws.push("<span class='t'>" + t + "</span>");
          continue;
        }
        if (tk_set.indexOf(tk) > -1) {
          ws.push("<span class='t'>" + t + "</span>");
          continue;
        }
        ws.push(t);
      }
      row.row_text = ws.join(" ");
      row.row_n = row_num;
      row_num++;
    }
    this.rows_js = rows;
  },
  get_row_token_form: function (row_i) {
    //utilizzato da form_text
    const row_js = this.rows_js[row_i];
    const le = row_js.t.length;
    let row_token_form = [];
    for (let i = 0; i < le; i++) {
      const t = row_js.t[i];
      if (UAPUNCTS.indexOf(t) > -1) continue;
      const tk = row_js.tk[i];
      const form_lemma = this.form_lst.find((x) => x[1] == tk);
      if (form_lemma)
        row_token_form.push({
          t: t,
          tk: tk,
          f: form_lemma[0],
          fk: form_lemma[1],
          l: form_lemma[2],
          e: form_lemma[3],
          ph: form_lemma[4],
          pm: form_lemma[5],
          fn: form_lemma[6],
          m: form_lemma[7]
        });
      else
        row_token_form.push({
          t: t,
          tk: tk,
          f: "",
          fk: "",
          l: "",
          e: "",
          ph: "",
          pm: "",
          fn: "",
          m: ""
        });
    }
    return row_token_form;
  },
};
