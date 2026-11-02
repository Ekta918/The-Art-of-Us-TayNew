(() => {
    "use strict";
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => [...r.querySelectorAll(s)];
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------- Nav state, progress bar, active link ---------- */
    const nav = $("#nav"), bar = $("#progress");
    const onScroll = () => {
        nav.classList.toggle("is-scrolled", scrollY > 8);
        const max = document.documentElement.scrollHeight - innerHeight;
        bar.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + "%";
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });

    if ("IntersectionObserver" in window) {
        const spy = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (!e.isIntersecting) return;
                $$(".nav-links a").forEach(a => a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id));
            });
        }, { rootMargin: "-45% 0px -50% 0px" });
        ["about", "projects", "artists", "timeline", "memories"].forEach(id => spy.observe(document.getElementById(id)));
    }

    /* ---------- Scroll reveal ---------- */
    if ("IntersectionObserver" in window && !reduce) {
        const rv = new IntersectionObserver((entries, o) => {
            entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); o.unobserve(e.target); } });
        }, { threshold: 0.12 });
        $$(".reveal").forEach(el => rv.observe(el));
    } else {
        $$(".reveal").forEach(el => el.classList.add("visible"));
    }

    /* ---------- Photo fallbacks ---------- */
    $$("img[data-fallback]").forEach(img => {
        const holder = img.closest(".ph");
        if (!holder) return;
        const mark = () => {
            const ok = img.complete && img.naturalWidth > 0;
            holder.classList.toggle("has-image", ok);
            holder.classList.toggle("no-photo", img.complete && !ok);
        };
        img.addEventListener("load", mark);
        img.addEventListener("error", () => { holder.classList.remove("has-image"); holder.classList.add("no-photo"); });
        mark();
    });

    /* ---------- Memory wall lightbox ---------- */
    const lb = $("#lightbox"), lbImg = $("#lbImg"), lbPhoto = $("#lbPhoto");
    let opener = null;

    $$(".hang__btn").forEach(btn => btn.addEventListener("click", () => {
        opener = btn;
        const img = $("img", btn);
        $("#lbTitle").textContent = btn.dataset.title;
        $("#lbText").textContent = btn.dataset.caption;
        lbPhoto.dataset.initial = $(".hang__img", btn).dataset.initial;
        lbPhoto.classList.remove("has-image", "no-photo");
        if (img.complete && img.naturalWidth > 0) {
            lbImg.src = img.currentSrc || img.src;
            lbImg.alt = img.alt;
            lbPhoto.classList.add("has-image");
        } else {
            lbImg.removeAttribute("src");
            lbPhoto.classList.add("no-photo");
        }
        lb.showModal();
    }));
    $("#lbClose").addEventListener("click", () => lb.close());
    lb.addEventListener("click", e => { if (e.target === lb) lb.close(); });
    lb.addEventListener("close", () => opener && opener.focus());

    /* ---------- Postcard flip ---------- */
    const card = $("#postcardCard"), back = $("#postcardBack"), btn = $("#postcardBtn");
    btn.addEventListener("click", () => {
        const open = card.classList.toggle("is-open");
        btn.setAttribute("aria-pressed", String(open));
        btn.textContent = open ? "Turn it back over" : "Open your postcard";
        back.setAttribute("aria-hidden", String(!open));
    });
})();
