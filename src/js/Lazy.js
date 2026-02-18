class Lazy {
    constructor(options = {}) {
        this.settings = {
            selector: '.g--lazy-01',
            src: 'data-src',
            srcset: 'data-srcset',
            loadingClass: 'g--lazy-01--is-loading',
            successClass: 'g--lazy-01--is-active',
            errorClass: 'g--lazy-01--is-error',
            root: null,
            rootMargin: '100px 0px',
            threshold: 0,
            loadInvisible: false,
            onSuccess: null,
            onError: null,
            onLoading: null,
            onComplete: null,
            onDestroy: null,
            onRevalidate: null,
            ...options,
        };

        this.observer = null;
        this.count = 0;

        this._init();
    }

    _init() {
        const elements = document.querySelectorAll(this.settings.selector);

        if (!elements.length) return;

        this.count = elements.length;

        this.observer = new IntersectionObserver(
            (entries) => this._onIntersection(entries),
            {
                root: this.settings.root,
                rootMargin: this.settings.rootMargin,
                threshold: this.settings.threshold,
            }
        );

        elements.forEach((el) => {
            if (!this.settings.loadInvisible && this._isHidden(el)) return;
            this.observer.observe(el);
        });
    }

    _onIntersection(entries) {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const el = entry.target;
            this._unobserve(el);
            this.load(el);
        });
    }

    _unobserve(el) {
        if (this.observer) {
            this.observer.unobserve(el);
        }
    }

    _isHidden(el) {
        return el.offsetParent === null;
    }

    load(el, force = false) {
        if (!force && el.classList.contains(this.settings.successClass)) return;

        el.classList.add(this.settings.loadingClass);

        if (typeof this.settings.onLoading === 'function') {
            this.settings.onLoading(el);
        }

        this._loadElement(el);
    }

    _loadElement(el) {
        const tag = el.tagName.toLowerCase();

        if (tag === 'img') {
            this._loadImage(el);
        } else if (tag === 'picture') {
            this._loadPicture(el);
        } else if (tag === 'video') {
            this._loadVideo(el);
        } else if (tag === 'iframe') {
            this._loadIframe(el);
        } else {
            this._loadBackground(el);
        }
    }

    _loadImage(el) {
        const src = el.getAttribute(this.settings.src);
        const srcset = el.getAttribute(this.settings.srcset);

        if (!src && !srcset) {
            this._onError(el);
            return;
        }

        const img = new Image();

        img.onload = () => {
            if (src) el.src = src;
            if (srcset) el.srcset = srcset;
            this._onLoad(el);
        };

        img.onerror = () => {
            this._onError(el);
        };

        if (srcset) img.srcset = srcset;
        if (src) img.src = src;
    }

    _loadPicture(el) {
        const sources = el.querySelectorAll('source');

        sources.forEach((source) => {
            const srcset = source.getAttribute(this.settings.srcset);
            if (srcset) {
                source.srcset = srcset;
            }
        });

        const img = el.querySelector('img');
        if (img) {
            this._loadImage(img);
            // Relay success/error from inner img to picture element
            const origOnLoad = img.onload;
            const origOnError = img.onerror;

            // The _loadImage already handles onLoad/onError for the img,
            // but we also need to mark the picture element
            // Since _loadImage calls _onLoad(img), the img gets the class.
            // We also apply it to the picture parent.
            const checkImg = () => {
                if (img.classList.contains(this.settings.successClass)) {
                    this._onLoad(el);
                } else if (img.classList.contains(this.settings.errorClass)) {
                    this._onError(el);
                }
            };

            // Use MutationObserver to watch for class changes on the img
            const mo = new MutationObserver(() => {
                checkImg();
                mo.disconnect();
            });
            mo.observe(img, { attributes: true, attributeFilter: ['class'] });
        } else {
            this._onError(el);
        }
    }

    _loadVideo(el) {
        const sources = el.querySelectorAll('source');
        let hasSource = false;

        sources.forEach((source) => {
            const src = source.getAttribute(this.settings.src);
            if (src) {
                source.src = src;
                hasSource = true;
            }
        });

        const directSrc = el.getAttribute(this.settings.src);
        if (directSrc) {
            el.src = directSrc;
            hasSource = true;
        }

        if (hasSource) {
            el.load();
            this._onLoad(el);
        } else {
            this._onError(el);
        }
    }

    _loadIframe(el) {
        const src = el.getAttribute(this.settings.src);

        if (src) {
            el.src = src;
            el.onload = () => this._onLoad(el);
            el.onerror = () => this._onError(el);
        } else {
            this._onError(el);
        }
    }

    _loadBackground(el) {
        const src = el.getAttribute(this.settings.src);

        if (!src) {
            this._onError(el);
            return;
        }

        const img = new Image();

        img.onload = () => {
            el.style.backgroundImage = `url("${src}")`;
            this._onLoad(el);
        };

        img.onerror = () => {
            this._onError(el);
        };

        img.src = src;
    }

    _onLoad(el) {
        el.classList.remove(this.settings.loadingClass);
        el.classList.add(this.settings.successClass);

        el.removeAttribute(this.settings.src);
        el.removeAttribute(this.settings.srcset);

        if (typeof this.settings.onSuccess === 'function') {
            this.settings.onSuccess(el);
        }

        this.count--;
        this._checkComplete();
    }

    _onError(el) {
        el.classList.remove(this.settings.loadingClass);
        el.classList.add(this.settings.errorClass);

        if (typeof this.settings.onError === 'function') {
            this.settings.onError(el);
        }

        this.count--;
        this._checkComplete();
    }

    _checkComplete() {
        if (this.count <= 0) {
            if (typeof this.settings.onComplete === 'function') {
                this.settings.onComplete();
            }
            this.destroy();
        }
    }

    revalidate() {
        const elements = document.querySelectorAll(this.settings.selector);

        if (!this.observer) {
            this.observer = new IntersectionObserver(
                (entries) => this._onIntersection(entries),
                {
                    root: this.settings.root,
                    rootMargin: this.settings.rootMargin,
                    threshold: this.settings.threshold,
                }
            );
        }

        let newCount = 0;

        elements.forEach((el) => {
            if (
                el.classList.contains(this.settings.successClass) ||
                el.classList.contains(this.settings.errorClass)
            ) {
                return;
            }

            if (!this.settings.loadInvisible && this._isHidden(el)) return;

            this.observer.observe(el);
            newCount++;
        });

        this.count += newCount;

        if (typeof this.settings.onRevalidate === 'function') {
            this.settings.onRevalidate(newCount);
        }
    }

    destroy() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        this.count = 0;

        if (typeof this.settings.onDestroy === 'function') {
            this.settings.onDestroy();
        }
    }
}

export default Lazy;
