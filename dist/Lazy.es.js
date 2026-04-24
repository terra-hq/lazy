class c {
  constructor(s = {}) {
    this.settings = {
      selector: ".g--lazy-01",
      src: "data-src",
      srcset: "data-srcset",
      loadingClass: "g--lazy-01--is-loading",
      successClass: "g--lazy-01--is-active",
      errorClass: "g--lazy-01--is-error",
      root: null,
      rootMargin: "100px 0px",
      threshold: 0,
      loadInvisible: !1,
      onSuccess: null,
      onError: null,
      onLoading: null,
      onComplete: null,
      onDestroy: null,
      onRevalidate: null,
      ...s
    }, this.observer = null, this.count = 0, this._init();
  }
  _init() {
    const s = document.querySelectorAll(this.settings.selector);
    s.length && (this.count = s.length, this.observer = new IntersectionObserver(
      (t) => this._onIntersection(t),
      {
        root: this.settings.root,
        rootMargin: this.settings.rootMargin,
        threshold: this.settings.threshold
      }
    ), s.forEach((t) => {
      !this.settings.loadInvisible && this._isHidden(t) || this.observer.observe(t);
    }));
  }
  _onIntersection(s) {
    s.forEach((t) => {
      if (!t.isIntersecting) return;
      const i = t.target;
      this._unobserve(i), this.load(i);
    });
  }
  _unobserve(s) {
    this.observer && this.observer.unobserve(s);
  }
  _isHidden(s) {
    return s.offsetParent === null;
  }
  load(s, t = !1) {
    !t && s.classList.contains(this.settings.successClass) || (s.classList.add(this.settings.loadingClass), typeof this.settings.onLoading == "function" && this.settings.onLoading(s), this._loadElement(s));
  }
  _loadElement(s) {
    const t = s.tagName.toLowerCase();
    t === "img" ? this._loadImage(s) : t === "picture" ? this._loadPicture(s) : t === "video" ? this._loadVideo(s) : t === "iframe" ? this._loadIframe(s) : this._loadBackground(s);
  }
  _loadImage(s) {
    const t = s.getAttribute(this.settings.src), i = s.getAttribute(this.settings.srcset), o = s.getAttribute("sizes");
    if (!t && !i) {
      this._onError(s);
      return;
    }
    const e = new Image();
    o && (e.sizes = o), e.onload = async () => {
      if (i && (s.srcset = i), t && (s.src = t), "decode" in s)
        try {
          await s.decode();
        } catch {
        }
      requestAnimationFrame(() => {
        this._onLoad(s);
      });
    }, e.onerror = () => {
      this._onError(s);
    }, i && (e.srcset = i), t && (e.src = t);
  }
  _loadPicture(s) {
    s.querySelectorAll("source").forEach((o) => {
      const e = o.getAttribute(this.settings.srcset);
      e && (o.srcset = e);
    });
    const i = s.querySelector("img");
    if (i) {
      this._loadImage(i), i.onload, i.onerror;
      const o = () => {
        i.classList.contains(this.settings.successClass) ? this._onLoad(s) : i.classList.contains(this.settings.errorClass) && this._onError(s);
      }, e = new MutationObserver(() => {
        o(), e.disconnect();
      });
      e.observe(i, { attributes: !0, attributeFilter: ["class"] });
    } else
      this._onError(s);
  }
  _loadVideo(s) {
    const t = s.querySelectorAll("source");
    let i = !1;
    t.forEach((e) => {
      const r = e.getAttribute(this.settings.src);
      r && (e.src = r, i = !0);
    });
    const o = s.getAttribute(this.settings.src);
    o && (s.src = o, i = !0), i ? (s.load(), this._onLoad(s)) : this._onError(s);
  }
  _loadIframe(s) {
    const t = s.getAttribute(this.settings.src);
    t ? (s.src = t, s.onload = () => this._onLoad(s), s.onerror = () => this._onError(s)) : this._onError(s);
  }
  _loadBackground(s) {
    const t = s.getAttribute(this.settings.src);
    if (!t) {
      this._onError(s);
      return;
    }
    const i = new Image();
    i.onload = () => {
      s.style.backgroundImage = `url("${t}")`, this._onLoad(s);
    }, i.onerror = () => {
      this._onError(s);
    }, i.src = t;
  }
  _onLoad(s) {
    s.classList.remove(this.settings.loadingClass), s.classList.add(this.settings.successClass), s.removeAttribute(this.settings.src), s.removeAttribute(this.settings.srcset), typeof this.settings.onSuccess == "function" && this.settings.onSuccess(s), this.count--, this._checkComplete();
  }
  _onError(s) {
    s.classList.remove(this.settings.loadingClass), s.classList.add(this.settings.errorClass), typeof this.settings.onError == "function" && this.settings.onError(s), this.count--, this._checkComplete();
  }
  _checkComplete() {
    this.count <= 0 && (typeof this.settings.onComplete == "function" && this.settings.onComplete(), this.destroy());
  }
  revalidate() {
    const s = document.querySelectorAll(this.settings.selector);
    this.observer || (this.observer = new IntersectionObserver(
      (i) => this._onIntersection(i),
      {
        root: this.settings.root,
        rootMargin: this.settings.rootMargin,
        threshold: this.settings.threshold
      }
    ));
    let t = 0;
    s.forEach((i) => {
      i.classList.contains(this.settings.successClass) || i.classList.contains(this.settings.errorClass) || !this.settings.loadInvisible && this._isHidden(i) || (this.observer.observe(i), t++);
    }), this.count += t, typeof this.settings.onRevalidate == "function" && this.settings.onRevalidate(t);
  }
  destroy() {
    this.observer && (this.observer.disconnect(), this.observer = null), this.count = 0, typeof this.settings.onDestroy == "function" && this.settings.onDestroy();
  }
}
export {
  c as default
};
