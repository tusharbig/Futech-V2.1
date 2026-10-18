/* ===== FuTech settings: edit these ===== */
const CONFIG = {
  WHATSAPP_NUMBER: "91XXXXXXXXXX",   // country code + number, digits only, e.g. 919876543210
  NEWSLETTER_URL: "",                 // optional endpoint for the newsletter box. Empty = not connected.
  FORMSPREE_URL: "",                  // e.g. "https://formspree.io/f/yourFormId". Leave empty until connected.
};

document.documentElement.classList.add("js");
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = matchMedia("(pointer: fine)").matches;
const lite = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 2; // low-power devices skip heavy motion
if (lite) document.documentElement.classList.add("lite");

/* WhatsApp links */
const waLink = (text) => `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
$$("[data-wa]").forEach(a => a.href = waLink("Hi FuTech, I’d like a website for my business."));
$("#yr").textContent = new Date().getFullYear();

/* Hero headline: split into words for staggered reveal */
$$("[data-split]").forEach(el => {
  const text = el.textContent.trim();
  el.setAttribute("aria-label", text);
  let n = 0;
  el.innerHTML = text.split(" ").map(w =>
    `<span class="w" aria-hidden="true">${[...w].map(c => `<span style="--i:${n++}">${c}</span>`).join("")}</span>`).join(" ");
});

/* Mobile menu */
const burger = $(".burger"), menu = $("#menu");
const setMenu = (open) => {
  burger.setAttribute("aria-expanded", open);
  burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  menu.classList.toggle("open", open);
  document.body.style.overflow = open ? "hidden" : "";
};
burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
$$("a", menu).forEach(a => a.addEventListener("click", () => setMenu(false)));
addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });

/* Scroll state: nav background, back-to-top, parallax */
const nav = $(".nav"), topBtn = $(".to-top"), pars = $$("[data-par]");
let ticking = false;
const onScroll = () => {
  const y = scrollY;
  nav.classList.toggle("scrolled", y > 20);
  topBtn.classList.toggle("show", y > 700);
  if (!reduce && !lite && innerWidth > 960) pars.forEach(p => p.style.translate = `0 ${y * p.dataset.par}px`);
  ticking = false;
};
addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
onScroll();
topBtn.addEventListener("click", () => scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }));

/* Reveal on scroll + counters */
const countUp = (el) => {
  const to = +el.dataset.to;
  if (reduce || to === 0) { el.textContent = to; return; }
  const t0 = performance.now(), dur = 1400;
  const tick = (t) => {
    const p = Math.min((t - t0) / dur, 1);
    el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};
const io = new IntersectionObserver((entries) => entries.forEach(en => {
  if (!en.isIntersecting) return;
  en.target.classList.add("show");
  $$("[data-to]", en.target).forEach(countUp);
  io.unobserve(en.target);
}), { threshold: .15 });
$$(".rv").forEach(el => io.observe(el));
$$(".stats").forEach(el => io.observe(el));

/* Active nav link */
const links = $$("#menu a[href^='#']:not(.btn)");
const spy = new IntersectionObserver((entries) => entries.forEach(en => {
  if (!en.isIntersecting) return;
  links.forEach(a => a.toggleAttribute("aria-current", a.getAttribute("href") === "#" + en.target.id));
}), { rootMargin: "-45% 0px -50% 0px" });
links.forEach(a => { const s = $(a.getAttribute("href")); if (s) spy.observe(s); });

/* Magnetic hover */
if (!reduce && !lite && fine) {
  $$(".mag").forEach(el => {
    el.addEventListener("pointermove", e => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .22}px,${(e.clientY - r.top - r.height / 2) * .3}px)`;
    });
    el.addEventListener("pointerleave", () => el.style.transform = "");
  });
}

/* Portfolio filter + search */
const fbtns = $$(".filters button"), cards = $$(".pf"), q = $("#q"), none = $("#none");
let cat = "all";
const applyPf = () => {
  const s = q.value.trim().toLowerCase(); let n = 0;
  cards.forEach(c => {
    const show = (cat === "all" || c.dataset.c === cat) && (!s || ($("h3", c).textContent + " " + $("p", c).textContent + " " + c.dataset.c).toLowerCase().includes(s));
    const was = !c.hidden; c.hidden = !show;
    if (show) { n++; if (!was) { c.classList.remove("in-anim"); void c.offsetWidth; c.classList.add("in-anim"); } }
  });
  none.hidden = n > 0;
};
fbtns.forEach(b => b.addEventListener("click", () => { cat = b.dataset.f; fbtns.forEach(x => x.setAttribute("aria-pressed", x === b)); applyPf(); }));
q.addEventListener("input", applyPf);

/* FAQ accordion */
$$(".faq button").forEach(b => b.addEventListener("click", () => {
  const open = b.getAttribute("aria-expanded") === "true";
  $$(".faq button").forEach(x => x.setAttribute("aria-expanded", "false"));
  b.setAttribute("aria-expanded", String(!open));
}));

/* Before/after slider: drag, touch, click and keyboard, eased */
const ba = $(".ba"), range = $("input", ba);
let tgt = 50, curP = 50, raf = 0, used = false, drag = false;
const paint = () => {
  curP += (tgt - curP) * (reduce ? 1 : .3);
  if (Math.abs(tgt - curP) < .05) curP = tgt;
  ba.style.setProperty("--p", curP + "%");
  range.setAttribute("aria-valuetext", `Showing ${Math.round(curP)}% of the old website`);
  raf = curP === tgt ? 0 : requestAnimationFrame(paint);
};
const goTo = (v, user = true) => {
  tgt = Math.max(0, Math.min(100, v)); range.value = Math.round(tgt);
  if (user) { used = true; ba.classList.add("used"); }
  if (!raf) raf = requestAnimationFrame(paint);
};
const posX = e => { const r = ba.getBoundingClientRect(); return (e.clientX - r.left) / r.width * 100; };
ba.addEventListener("pointerdown", e => { drag = true; ba.setPointerCapture(e.pointerId); goTo(posX(e)); });
ba.addEventListener("pointermove", e => { if (drag) goTo(posX(e)); });
["pointerup", "pointercancel"].forEach(t => ba.addEventListener(t, () => { drag = false; }));
range.addEventListener("input", () => goTo(+range.value));
range.addEventListener("keydown", e => { const d = { ArrowLeft: -5, ArrowRight: 5 }[e.key]; if (d) { e.preventDefault(); goTo(tgt + d); } });
new IntersectionObserver((en, ob) => {
  if (!en[0].isIntersecting) return; ob.disconnect();
  if (reduce) return;
  const seq = [72, 28, 50]; let i = 0;
  const step = () => { if (used || i >= seq.length) return; goTo(seq[i++], false); setTimeout(step, 900); };
  setTimeout(step, 400);
}, { threshold: .6 }).observe(ba);
$("#ba-cta").addEventListener("click", () => { const m = $("#lead [name=message]"); if (!m.value) m.value = "I’d like to redesign my existing website. "; });

/* Pricing buttons pre-fill the form */
$$("[data-plan]").forEach(a => a.addEventListener("click", () => {
  const m = $("#lead [name=message]");
  if (!m.value) m.value = `I’m interested in the ${a.dataset.plan} package. `;
}));

/* Lead form: validates, then sends via Formspree if configured, otherwise opens WhatsApp. Never fakes a send. */
const form = $("#lead"), status = $("#status");
const rules = {
  name: v => v.trim().length >= 2 || "Please enter your name.",
  type: v => !!v || "Please choose a business type.",
  phone: v => /^[+()\d\s-]{10,15}$/.test(v.trim()) || "Enter a valid phone number (10 to 15 digits).",
  email: v => !v.trim() || /^\S+@\S+\.\S+$/.test(v.trim()) || "Enter a valid email address.",
  message: v => v.trim().length >= 10 || "Tell us a little more (at least 10 characters).",
};
const check = (name) => {
  const f = form.elements[name], lab = f.closest("label"), res = rules[name](f.value);
  lab.classList.toggle("err", res !== true);
  $("small", lab).textContent = res === true ? "" : res;
  f.setAttribute("aria-invalid", res !== true);
  return res === true;
};
Object.keys(rules).forEach(n => form.elements[n].addEventListener("blur", () => check(n)));

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  status.className = ""; status.textContent = "";
  const ok = Object.keys(rules).map(check).every(Boolean);
  if (!ok) { const bad = $("label.err input, label.err select, label.err textarea", form); bad && bad.focus(); status.className = "bad"; status.textContent = "Please fix the highlighted fields."; return; }
  const d = Object.fromEntries(new FormData(form));
  if (CONFIG.FORMSPREE_URL) {
    try {
      const r = await fetch(CONFIG.FORMSPREE_URL, { method: "POST", headers: { Accept: "application/json" }, body: new FormData(form) });
      if (!r.ok) throw new Error();
      form.reset(); status.className = "ok"; status.textContent = "Thank you! Your enquiry was sent. We will reply soon.";
    } catch (_) { status.className = "bad"; status.textContent = "Sorry, sending failed. Please try again or use WhatsApp."; }
    return;
  }
  const msg = `Hi FuTech! New enquiry:\nName: ${d.name}\nBusiness: ${d.type}\nPhone: ${d.phone}\nEmail: ${d.email || "-"}\nBudget: ${d.budget || "Not sure"}\nNeeds: ${d.message}`;
  status.className = "ok";
  status.textContent = "The enquiry form isn’t connected to a server yet, so nothing has been sent. WhatsApp will open with your details. Press send there to reach us.";
  window.open(waLink(msg), "_blank", "noopener");
});

/* ===== v2 upgrade ===== */

/* Loader */
const loader = $(".loader"), hideLoader = () => loader.classList.add("done");
if (reduce) hideLoader(); else addEventListener("load", () => setTimeout(hideLoader, 650));
setTimeout(hideLoader, 2500);

/* Scroll progress */
const prog = $(".prog");
addEventListener("scroll", () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  prog.style.setProperty("--s", max > 0 ? Math.min(scrollY / max, 1) : 0);
}, { passive: true });

/* Dark / light mode */
const themeBtn = $(".theme");
const applyTheme = (t, persist) => {
  document.documentElement.dataset.theme = t;
  themeBtn.setAttribute("aria-label", t === "dark" ? "Switch to light mode" : "Switch to dark mode");
  $("use", themeBtn).setAttribute("href", t === "dark" ? "#i-sun" : "#i-moon");
  $("meta[name=theme-color]").content = t === "dark" ? "#04141A" : "#0E7C86";
  if (persist) { try { localStorage.setItem("ft-theme", t); } catch (_) {} }
};
applyTheme(document.documentElement.dataset.theme || "light", false);
themeBtn.addEventListener("click", () => applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark", true));

/* Tilt cards + hero spotlight */
if (!reduce && !lite && fine) {
  $$(".shot").forEach(s => {
    s.addEventListener("pointermove", e => {
      const r = s.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      s.style.transform = `perspective(700px) rotateX(${-y * 10}deg) rotateY(${x * 12}deg) translateY(-8px)`;
    });
    s.addEventListener("pointerleave", () => s.style.transform = "");
  });
  const hero = $(".hero"), bro = $(".bro");
  hero.addEventListener("pointermove", e => {
    const r = hero.getBoundingClientRect();
    hero.style.setProperty("--mx", e.clientX - r.left + "px"); hero.style.setProperty("--my", e.clientY - r.top + "px");
    const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
    bro.style.transform = `perspective(1000px) rotateY(${x * 10}deg) rotateX(${-y * 8}deg) rotate(-2.5deg)`;
  });
  hero.addEventListener("pointerleave", () => bro.style.transform = "");
}

/* Project cost estimator. Edit prices here (INR). */
const EST = {
  kinds: { landing: { base: 4999, pages: 1, days: 7 }, business: { base: 14999, pages: 6, days: 14 }, store: { base: 29999, pages: 8, days: 28 } },
  perPage: 1500, extras: { logo: 3000, copy: 2500, booking: 4000 }, rangePct: .15,
};
const ef = $("#est"), eo = $("#etotal"), inr = n => "₹" + Math.round(n).toLocaleString("en-IN");
let shown = 0, tid, last = {};
const tween = (to) => {
  if (reduce) { eo.textContent = inr(to); shown = to; return; }
  const from = shown, t0 = performance.now(); cancelAnimationFrame(tid);
  const f = (t) => { const p = Math.min((t - t0) / 450, 1); shown = from + (to - from) * (1 - Math.pow(1 - p, 3)); eo.textContent = inr(shown); if (p < 1) tid = requestAnimationFrame(f); };
  tid = requestAnimationFrame(f);
};
const calc = () => {
  const radio = $("input[name=kind]:checked", ef), k = EST.kinds[radio.value], pages = +ef.elements.pages.value;
  const extras = $$("input[name=extra]:checked", ef), more = Math.max(0, pages - k.pages);
  const total = k.base + more * EST.perPage + extras.reduce((s, c) => s + EST.extras[c.value], 0);
  const days = k.days + Math.ceil(more / 2) + extras.length * 2;
  $("#epv").textContent = pages;
  $("#erange").textContent = `Likely range: ${inr(total * (1 - EST.rangePct))} to ${inr(total * (1 + EST.rangePct))}`;
  $("#edays").textContent = `About ${days} days after we receive your content`;
  last = { total, days, pages, kind: radio.dataset.label, extras: extras.map(c => c.parentElement.textContent.trim()) };
  tween(total);
};
ef.addEventListener("input", calc);
ef.addEventListener("submit", e => e.preventDefault());
calc();
$("#ereq").addEventListener("click", () => {
  $("#lead [name=message]").value = `Project estimate: ${last.kind}, ${last.pages} page(s), extras: ${last.extras.join(", ") || "none"}. Estimated ${inr(last.total)} in about ${last.days} days. `;
  $("#contact").scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  setTimeout(() => $("#lead [name=name]").focus({ preventScroll: true }), reduce ? 0 : 600);
});

/* Newsletter: never pretends to subscribe when no endpoint is set */
const nf = $("#news"), ns = $("#nstat");
nf.addEventListener("submit", async (e) => {
  e.preventDefault(); ns.className = "";
  const em = $("#ne").value.trim();
  if (!/^\S+@\S+\.\S+$/.test(em)) { ns.className = "bad"; ns.textContent = "Enter a valid email address."; return; }
  if (!CONFIG.NEWSLETTER_URL) { ns.className = "ok"; ns.textContent = "The newsletter isn’t connected yet, so your email was not saved. Message us on WhatsApp for tips meanwhile."; return; }
  try {
    const r = await fetch(CONFIG.NEWSLETTER_URL, { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify({ email: em }) });
    if (!r.ok) throw new Error();
    nf.reset(); ns.className = "ok"; ns.textContent = "Subscribed. Thank you!";
  } catch (_) { ns.className = "bad"; ns.textContent = "Sorry, that failed. Please try again."; }
});

/* ===== v3: live storefront preview, scroll-linked process line, masked project reveals ===== */
const SITES = [
  { n: "Sharma Sweets", u: "sharmasweets.example", h: "Fresh sweets,<br>delivered today", c: "Order on WhatsApp", a: "#E5336D", b: "#FFB422" },
  { n: "Tandoor Tales", u: "tandoortales.example", h: "Dinner tonight?<br>Book a table", c: "Reserve a table", a: "#0B6B4F", b: "#2BB673" },
  { n: "BrightPath Classes", u: "brightpath.example", h: "New batches open.<br>Fees on one page", c: "Enquire for admission", a: "#2F4BB8", b: "#7FD6D0" },
  { n: "Lotus Clinic", u: "lotusclinic.example", h: "Timings, doctors<br>and map in one place", c: "Call the clinic", a: "#0E7C86", b: "#9BE3D6" },
];
const site = $(".bro"), tabs = $$(".tabs [role=tab]");
let cur = 0, auto = null;
const showSite = (i) => {
  cur = i; const s = SITES[i];
  tabs.forEach((t, j) => { t.setAttribute("aria-selected", j === i); t.tabIndex = j === i ? 0 : -1; });
  site.style.setProperty("--a", s.a); site.style.setProperty("--b", s.b);
  $("#bro-name").textContent = s.n; $("#bro-url").textContent = s.u; $("#bro-h").innerHTML = s.h; $("#bro-cta").textContent = s.c;
  const p = $(".mhero"); p.classList.remove("swap"); void p.offsetWidth; p.classList.add("swap");
};
const stopAuto = () => { clearInterval(auto); auto = null; };
tabs.forEach((t, i) => {
  t.addEventListener("click", () => { stopAuto(); showSite(i); });
  t.addEventListener("keydown", e => {
    const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (!d) return;
    e.preventDefault(); stopAuto(); const n = (i + d + tabs.length) % tabs.length; showSite(n); tabs[n].focus();
  });
});
const heroV = $(".hero-v"); heroV.addEventListener("pointerenter", stopAuto); heroV.addEventListener("focusin", stopAuto);
if (!reduce && !lite) auto = setInterval(() => { if (!document.hidden) showSite((cur + 1) % SITES.length); }, 4500);

const stepsEl = $(".steps"), stepLis = $$("li", stepsEl);
const updSteps = () => {
  const r = stepsEl.getBoundingClientRect(), v = innerWidth <= 960;
  const pg = reduce ? 1 : Math.max(0, Math.min(1, v ? (innerHeight * .7 - r.top - 24) / (r.height - 48) : (innerHeight * .85 - r.top) / (innerHeight * .45)));
  stepsEl.style.setProperty("--pg", pg);
  stepLis.forEach(li => {
    const l = li.getBoundingClientRect(), f = v ? (l.top - r.top) / (r.height - 48) : (l.left - r.left) / (r.width - 48);
    li.classList.toggle("on", pg >= Math.max(0, f) - .001 && pg > 0);
  });
};
addEventListener("scroll", updSteps, { passive: true }); addEventListener("resize", updSteps); updSteps();


/* ===== v5: industry guide, portfolio enquiry links, assistant link ===== */
const IND = [
  { w: "shop", sel: "Local shop", t: "Local shops and stores", d: "Product catalogs with cart, UPI-friendly checkout or WhatsApp ordering.", p: "Business", s: "Sharma Sweets", f: "shop" },
  { w: "restaurant or cafe", sel: "Restaurant or cafe", t: "Restaurants and cafes", d: "Menus, photos, table or delivery enquiries and Google Maps in one place.", p: "Business", s: "Tandoor Tales", f: "food" },
  { w: "coaching class", sel: "Coaching class", t: "Coaching classes", d: "Courses, batches, fees, results and admission enquiry forms.", p: "Business", s: "BrightPath Classes", f: "edu" },
  { w: "clinic or salon", sel: "Other", t: "Clinics, salons and service providers", d: "Clear multi-page sites that show your services, timings and how to reach you.", p: "Business", s: "", f: "all" },
  { w: "freelancer portfolio", sel: "Freelancer", t: "Freelancers and creators", d: "Show your work, case studies and contact details with style.", p: "Starter", s: "Maya Designs", f: "folio" },
  { w: "startup landing page", sel: "Startup", t: "Startups and campaigns", d: "One focused page for an offer, event or ad campaign.", p: "Starter", s: "Orbit Labs", f: "biz" },
];
const itabs = $$(".ind-tabs [role=tab]"), ipanel = $(".ind-body");
let ci = 0;
const showInd = (i) => {
  ci = i; const x = IND[i];
  itabs.forEach((t, j) => { t.setAttribute("aria-selected", j === i); t.tabIndex = j === i ? 0 : -1; });
  $("#ind-t").textContent = x.t; $("#ind-d").textContent = x.d;
  $("#ind-m").textContent = `Every project includes mobile design, basic SEO and a WhatsApp button. Usual starting point: the ${x.p} package.`;
  $("#ind-see").hidden = !x.s; $("#ind-see").textContent = x.s ? `See the ${x.s} sample` : "";
  ipanel.classList.remove("swap"); void ipanel.offsetWidth; ipanel.classList.add("swap");
};
itabs.forEach((t, i) => {
  t.addEventListener("click", () => showInd(i));
  t.addEventListener("keydown", e => {
    const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key]; if (!d) return;
    e.preventDefault(); const n = (i + d + itabs.length) % itabs.length; showInd(n); itabs[n].focus();
  });
});
showInd(0);
$("#ind-see").addEventListener("click", () => {
  cat = IND[ci].f; q.value = ""; fbtns.forEach(x => x.setAttribute("aria-pressed", x.dataset.f === cat)); applyPf();
});
$("#ind-cta").addEventListener("click", () => {
  const x = IND[ci], f = $("#lead");
  f.elements.type.value = x.sel; f.elements.message.value = `I’d like a quote for a ${x.w} website. `;
  setTimeout(() => f.elements.name.focus({ preventScroll: true }), reduce ? 0 : 700);
});
$$(".pf").forEach(c => {
  const n = $("h3", c).textContent, a = document.createElement("a");
  a.className = "pf-cta"; a.href = "#contact"; a.textContent = "Ask for a site like this"; a.setAttribute("aria-label", `Ask for a site like ${n}`);
  a.addEventListener("click", () => { $("#lead [name=message]").value = `I’d like a website in the style of the ${n} sample concept. `; });
  c.append(a);
});
$$("[data-chat]").forEach(b => b.addEventListener("click", () => { const f = $(".cb-fab"); if (f && f.getAttribute("aria-expanded") !== "true") f.click(); }));

/* ===== v7: website customizer, project quiz, estimate on WhatsApp ===== */
const goForm = (msg, type) => {
  const f = $("#lead"); if (type) f.elements.type.value = type; f.elements.message.value = msg;
  $("#contact").scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  setTimeout(() => f.elements.name.focus({ preventScroll: true }), reduce ? 0 : 600);
};
const ico = (id, c = "ci") => `<svg class="${c}" aria-hidden="true"><use href="#${id}"/></svg>`;
const KINDS = [
  { n: "Shop", f: "Local shop", v: "shop", chip: "Fresh batch every morning", h: ["Fresh sweets,", "delivered today"], s: "Gulab jamun, jalebi, laddoo and barfi. Order in one tap.", c: "Order on WhatsApp", c2: "Order now", g: "View menu", links: ["Sweets", "Gifting", "Our story"], trust: ["Made fresh daily", "Free delivery above ₹499"],
    items: [{ a: "sw-jamun", t: "Gulab Jamun", d: "Soft, warm, syrup-soaked", m: "₹240 / 500 g" }, { a: "sw-jalebi", t: "Jalebi", d: "Crisp, golden, hot", m: "₹180 / 250 g" }, { a: "sw-laddoo", t: "Motichoor Laddoo", d: "Made with pure ghee", m: "₹320 / 500 g" }] },
  { n: "Café", f: "Restaurant or cafe", v: "cafe", chip: "Open now · till 10 pm", h: ["Slow mornings,", "strong coffee"], s: "See the menu, find us on the map and reserve a table in a tap.", c: "Reserve a table", c2: "Book", g: "See menu", links: ["Menu", "Visit us", "Events"], trust: ["Fresh roast daily", "Wi-Fi and quiet corners"],
    items: [{ a: "cz-cup", t: "Cappuccino", d: "Double shot, silky milk", m: "₹180" }, { a: "cz-croissant", t: "Butter Croissant", d: "Baked every morning", m: "₹140" }, { a: "cz-iced", t: "Cold Brew", d: "Steeped for 18 hours", m: "₹210" }] },
  { n: "Coaching class", f: "Coaching class", v: "coach", chip: "Admissions open", h: ["New batches open.", "Fees on one page"], s: "Courses, batch timings and admission enquiries in one place.", c: "Enquire for admission", c2: "Enquire", g: "See batches", links: ["Courses", "Batches", "Results"], trust: ["Free demo class", "Small batches"],
    items: [{ a: "cz-cap", t: "Class 10 Boards", d: "Maths and Science", m: "Mon to Fri · 5 pm", ic: 1 }, { a: "cz-atom", t: "JEE / NEET Foundation", d: "Weekly tests, doubt hours", m: "Sat and Sun · 9 am", ic: 1 }, { a: "cz-chat", t: "Spoken English", d: "Speak with confidence", m: "Evening batch", ic: 1 }] },
  { n: "Clinic", f: "Other", v: "clinic", chip: "Accepting appointments", h: ["Care you can", "book in a minute"], s: "Timings, services and directions in one place, so patients can reach you without searching.", c: "Call the clinic", c2: "Call now", g: "View services", links: ["Services", "Doctors", "Timings"], trust: ["Same-day slots", "Walk-ins welcome"],
    items: [{ a: "cz-steth", t: "General Checkup", d: "Consultation and advice", m: "Walk-ins till 1 pm", ic: 1 }, { a: "cz-tooth", t: "Dental Care", d: "Cleaning, fillings, braces", m: "By appointment", ic: 1 }, { a: "cz-heart", t: "Health Screening", d: "Heart, sugar, BP checks", m: "Mornings", ic: 1 }] },
  { n: "Freelancer portfolio", f: "Freelancer", v: "gen", chip: "Available for projects", h: ["Design that", "gets you noticed"], s: "Selected work, case studies and a simple way to get in touch.", c: "Start a project", c2: "Contact", g: "See work", links: ["Work", "Cases", "Contact"], trust: ["Fast replies", "Clear pricing"],
    items: [{ a: "i-globe", t: "Work", d: "Selected projects", m: "View all", ic: 1 }, { a: "i-book", t: "Case studies", d: "How it was made", m: "Read", ic: 1 }, { a: "i-user", t: "Contact", d: "Say hello", m: "Reply in 24 h", ic: 1 }] },
  { n: "Startup landing page", f: "Startup", v: "gen", chip: "Early access", h: ["One page.", "One clear offer"], s: "Explain your product and collect sign-ups in one place.", c: "Join the waitlist", c2: "Join", g: "How it works", links: ["Product", "How it works", "Updates"], trust: ["Free to join", "No spam"],
    items: [{ a: "i-bolt", t: "Product", d: "What it does", m: "Learn more", ic: 1 }, { a: "i-refresh", t: "How it works", d: "Three simple steps", m: "See steps", ic: 1 }, { a: "i-check", t: "Updates", d: "Be first to know", m: "Join", ic: 1 }] },
];
const PALS = [
  { n: "Saffron", ac: "#E8830C", acd: "#A65300", bg: "#FBF4E6", ink: "#3D1608" },
  { n: "Peacock", ac: "#0E7C86", acd: "#0A5F67", bg: "#EDF7F6", ink: "#062E3B" },
  { n: "Berry", ac: "#C72A63", acd: "#A81E50", bg: "#FDF0F4", ink: "#3E0F25" },
  { n: "Forest", ac: "#2E7D4F", acd: "#1F6A3E", bg: "#F0F7EF", ink: "#17331F" },
];
const STY = [{ n: "Classic", i: 0, f: '"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif' }, { n: "Modern", i: 1, f: "var(--f1)" }];
const czf = $("#cz"), czs = $("#czs"), czSite = $("#czs-site");
const VIS = {
  shop: `<div class="z-disc"></div><div class="z-ring"></div>
    <svg class="z-a" style="--dp:14;--n:0;left:4%;top:34%;width:48%"><use href="#sw-jamun"/></svg>
    <svg class="z-a" style="--dp:26;--n:1;right:2%;top:8%;width:40%"><use href="#sw-jalebi"/></svg>
    <svg class="z-a" style="--dp:34;--n:2;right:8%;bottom:6%;width:36%"><use href="#sw-laddoo"/></svg>
    <svg class="z-a" style="--dp:20;--n:3;left:16%;top:4%;width:30%"><use href="#sw-barfi"/></svg>
    <span class="z-tag" style="--dp:22;left:0;bottom:12%"><i class="z-dot"></i>Fresh batch · 4 pm</span>`,
  cafe: `<div class="z-disc"></div><div class="z-ring"></div>
    <svg class="z-steam" viewBox="0 0 60 60" aria-hidden="true" style="--dp:10;left:35%;top:2%;width:26%"><path d="M12 58c-7-9 7-15 0-25s7-15 0-25"/><path d="M30 58c-7-9 7-15 0-25s7-15 0-25"/><path d="M48 58c-7-9 7-15 0-25s7-15 0-25"/></svg>
    <svg class="z-a" style="--dp:16;--n:0;left:22%;top:24%;width:64%"><use href="#cz-cup"/></svg>
    <svg class="z-a" style="--dp:30;--n:1;left:-4%;bottom:0;width:32%"><use href="#cz-croissant"/></svg>
    <svg class="z-a" style="--dp:24;--n:2;right:0;top:4%;width:30%"><use href="#cz-iced"/></svg>
    <span class="z-tag" style="--dp:22;right:2%;bottom:10%"><i class="z-dot"></i>Open · till 10 pm</span>`,
  clinic: `<div class="z-disc"></div>
    <div class="z-a z-appt" style="--dp:10;--n:0"><div class="z-ah"><span class="z-av">${ico("i-user")}</span><div><b data-b="name"></b><small>General physician</small></div></div>
      <svg class="z-ecg" viewBox="0 0 120 32" preserveAspectRatio="none" aria-hidden="true"><path pathLength="100" vector-effect="non-scaling-stroke" d="M0 18h28l5-12 7 24 6-18 4 6h70"/></svg>
      <small class="z-lbl">Next available · today</small>
      <div class="z-slots"><span>10:30</span><span class="on">11:00</span><span>4:30</span></div>
      <span class="z-btn sm">Book a slot</span></div>
    <span class="z-badge" style="--dp:28;--n:2">${ico("cz-plus")}</span>
    <span class="z-tag" style="--dp:22;left:0;bottom:6%"><i class="z-dot"></i>Open · 9 am to 8 pm</span>`,
  coach: `<div class="z-disc"></div>
    <div class="z-a z-appt" style="--dp:10;--n:0"><div class="z-ah"><span class="z-av">${ico("cz-cap")}</span><div><b>Weekly progress</b><small>Class 10 · Batch A</small></div></div>
      <div class="z-bars"><div class="z-bar"><span>Maths</span><i style="--v:.82"></i><em>82%</em></div><div class="z-bar"><span>Science</span><i style="--v:.74"></i><em>74%</em></div><div class="z-bar"><span>English</span><i style="--v:.91"></i><em>91%</em></div></div>
      <div class="z-slots"><span class="on">Mon to Fri</span><span>5 pm</span></div></div>
    <span class="z-badge" style="--dp:28;--n:2">${ico("cz-cap")}</span>
    <span class="z-tag" style="--dp:22;left:0;bottom:6%"><i class="z-dot"></i>12 seats left</span>`,
  gen: `<div class="z-disc"></div>
    <div class="z-a z-sheet" style="--dp:8;--n:0;left:6%;top:14%;width:62%"><i></i><i></i><i></i></div>
    <div class="z-a z-sheet s2" style="--dp:22;--n:1;right:2%;bottom:8%;width:50%"><i></i><i></i></div>
    <span class="z-badge" style="--dp:28;--n:2">${ico("i-bolt")}</span>`,
};
const siteHTML = (k) => `
  <div class="z-nav a" style="--i:0"><b class="z-logo"><span class="z-mark" data-b="mark"></span><span data-b="name"></span></b><span class="z-links">${k.links.map(l => `<span>${l}</span>`).join("")}</span><span class="z-btn sm">${k.c2}</span></div>
  <div class="z-hero">
    <div class="z-copy">
      <span class="z-chip a" style="--i:1"><i class="z-dot"></i>${k.chip}</span>
      <div class="z-h"><span class="a" style="--i:2">${k.h[0]}</span><span class="a" style="--i:3"><em>${k.h[1]}</em></span></div>
      <p class="z-s a" style="--i:4">${k.s}</p>
      <div class="z-row a" style="--i:5"><span class="z-btn">${k.c}${ico("i-arrow")}</span><span class="z-btn ghost">${k.g}</span></div>
      <ul class="z-trust a" style="--i:6">${k.trust.map(t => `<li>${ico("i-check")}${t}</li>`).join("")}</ul>
    </div>
    <div class="z-vis">${VIS[k.v]}</div>
  </div>
  <div class="z-grid">${k.items.map((it, i) => `<div class="z-card a" style="--i:${7 + i}"><div class="z-pic">${ico(it.a, it.ic ? "ci" : "")}</div><b>${it.t}</b><p>${it.d}</p><span class="z-meta">${it.m}</span></div>`).join("")}</div>`;
/* Applies name, colours, style and (when the type changed) the layout to any preview root. Returns true when the layout was rebuilt. */
const fillMini = (root, biz, ki, p, s) => {
  const k = KINDS[ki], site = root.querySelector(".czs-site"), st = root.style;
  st.setProperty("--zac", p.ac); st.setProperty("--zacd", p.acd || `color-mix(in srgb, ${p.ac} 68%, #000)`);
  st.setProperty("--zbg", p.bg); st.setProperty("--zink", p.ink); st.setProperty("--zhf", s.f);
  root.dataset.style = s.i;
  let built = false;
  if (root.dataset.kind !== String(ki) || !site.firstElementChild) { root.dataset.kind = ki; site.innerHTML = siteHTML(k); built = true; }
  if (root !== czs) root.classList.add("vis");
  const mark = [...biz][0].toUpperCase(), url = (biz.toLowerCase().replace(/[^a-z0-9]+/g, "") || "yourbusiness") + ".example";
  root.querySelectorAll("[data-b]").forEach(e => {
    const v = { name: biz, mark, url }[e.dataset.b];
    if (e.textContent !== v) { e.textContent = v; if (e.dataset.b === "mark" && !built) { e.classList.remove("pop"); void e.offsetWidth; e.classList.add("pop"); } }
  });
  return built;
};
const czState = () => {
  const ki = +czf.elements.kind.value, pi = +czf.elements.pal.value, si = +czf.elements.style.value, raw = czf.elements.biz.value.trim();
  return { ki, k: KINDS[ki], p: PALS[pi], s: STY[si], biz: raw || "Your Business" };
};
const czSummary = () => {
  const { k, p, s, biz } = czState();
  return `I designed a website preview with the FuTech customizer.\nBusiness name: ${biz}\nBusiness type: ${k.n}\nColour: ${p.n} (${p.ac})\nStyle: ${s.n}\nI’d like to talk about building it.`;
};
let czT = 0, czLT = 0, czBusy = false;
const czPaint = () => {
  const { ki, p, s, biz } = czState(), prev = czs.dataset.style;
  const built = fillMini(czs, biz, ki, p, s);
  if (!built && prev !== String(s.i) && !reduce) { czs.classList.remove("flip"); void czs.offsetWidth; czs.classList.add("flip"); clearTimeout(czs._ft); czs._ft = setTimeout(() => czs.classList.remove("flip"), 800); }
};
const czRender = () => {
  const { ki, k, p, s, biz } = czState();
  $("#cz-count").textContent = `${czf.elements.biz.value.length}/24`;
  $("#cz-palname").textContent = p.n;
  $("#cz-wa").href = waLink("Hi FuTech, " + czSummary());
  const desc = `${k.n} · ${p.n} · ${s.n}`;
  czs.setAttribute("aria-label", `Live website preview for ${biz}: ${desc}`);
  clearTimeout(czLT); czLT = setTimeout(() => { $("#cz-live").textContent = `Preview updated: ${desc}`; }, 450);
  if (czBusy) return;
  if (!reduce && czs.dataset.kind !== "" && czs.dataset.kind !== String(ki)) {
    czBusy = true; czSite.classList.add("out");
    czT = setTimeout(() => { czBusy = false; czPaint(); czSite.classList.remove("out"); }, 170);
  } else czPaint();
};
czf.addEventListener("input", czRender); czf.addEventListener("submit", e => e.preventDefault());
$("#cz-req").addEventListener("click", () => goForm(czSummary() + " ", czState().k.f));
addEventListener("pageshow", czRender);   /* browsers can restore old form values after load */
czRender();
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { czs.classList.add("vis"); io.disconnect(); } }, { threshold: .15 });
  io.observe(czs);
} else czs.classList.add("vis");
if (fine && !reduce && !lite) {   /* subtle pointer parallax, throttled to one write per frame */
  let raf = 0, mx = 0, my = 0;
  const set = () => { raf = 0; czs.style.setProperty("--mx", mx.toFixed(3)); czs.style.setProperty("--my", my.toFixed(3)); };
  czs.addEventListener("pointermove", e => { const r = czs.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width * 2 - 1; my = (e.clientY - r.top) / r.height * 2 - 1; raf ||= requestAnimationFrame(set); });
  czs.addEventListener("pointerleave", () => { mx = my = 0; raf ||= requestAnimationFrame(set); });
}

const QZ = [
  { q: "What kind of business do you run?", o: ["Shop", "Restaurant or cafe", "Coaching class", "Clinic or salon", "Freelancer", "Startup"], f: ["Local shop", "Restaurant or cafe", "Coaching class", "Other", "Freelancer", "Startup"] },
  { q: "What should your website do first?", o: ["Bring me calls and WhatsApp messages", "Take orders or sales online", "Take bookings or enquiries", "Show my work or services"] },
  { q: "How big should it be?", o: ["One page", "A few pages (2 to 5)", "Many pages or a product catalogue"] },
  { q: "When would you like to launch?", o: ["This week", "Within a month", "No rush"] },
];
const WHY = {
  Starter: "A focused one-page site that brings in calls and WhatsApp messages is the closest fit.",
  Business: "A few pages with enquiry or booking forms is the closest fit.",
  Premium: "An online store or a larger site usually needs our Premium package.",
};
let qi = 0, qa = [];
const qzOpts = $("#qz-opts"), qzNext = $("#qz-next"), qzForm = $("#qz-form"), qzRes = $("#qz-res");
const qzShow = (focus) => {
  const d = QZ[qi]; $("#qz-q").textContent = d.q;
  qzOpts.replaceChildren(...d.o.map((t, i) => {
    const l = document.createElement("label"), r = document.createElement("input");
    r.type = "radio"; r.name = "qz"; r.value = i; r.checked = qa[qi] === i;
    r.addEventListener("change", () => { qa[qi] = i; qzNext.disabled = false; });
    l.append(r, document.createTextNode(t)); return l;
  }));
  qzNext.disabled = qa[qi] === undefined; qzNext.textContent = qi === QZ.length - 1 ? "See my result" : "Next";
  $("#qz-back").hidden = qi === 0; $("#qz-step").textContent = `Question ${qi + 1} of ${QZ.length}`;
  $("#qz-prog").style.width = (qi / QZ.length * 100) + "%";
  if (focus) (qzOpts.querySelector("input:checked") || qzOpts.querySelector("input")).focus();
};
const qzSummary = () => `Project quiz: ${QZ.map((d, i) => d.o[qa[i]]).join("; ")}. Suggested package: ${$("#qz-pk").textContent.replace(" package", "")}.`;
const qzResult = () => {
  const pk = qa[1] === 1 || qa[2] === 2 ? "Premium" : (qa[1] === 2 || qa[2] === 1 ? "Business" : "Starter");
  $("#qz-pk").textContent = pk + " package"; $("#qz-why").textContent = WHY[pk];
  $("#qz-wa").href = waLink("Hi FuTech, " + qzSummary());
  qzForm.hidden = true; qzRes.hidden = false; $("#qz-prog").style.width = "100%"; $("#qz-pk").focus();
};
qzNext.addEventListener("click", () => { if (qi < QZ.length - 1) { qi++; qzShow(true); } else qzResult(); });
$("#qz-back").addEventListener("click", () => { qi--; qzShow(true); });
$("#qz-redo").addEventListener("click", () => { qi = 0; qa = []; qzRes.hidden = true; qzForm.hidden = false; qzShow(true); });
$("#qz-req").addEventListener("click", () => goForm(qzSummary() + " ", QZ[0].f[qa[0]]));
qzForm.addEventListener("submit", e => e.preventDefault());
qzShow(false);

$("#ewa").addEventListener("click", () => window.open(waLink(`Hi FuTech, I used your estimator: ${last.kind}, ${last.pages} page(s), extras: ${last.extras.join(", ") || "none"}. Estimated ${inr(last.total)} in about ${last.days} days. I’d like to discuss it.`), "_blank", "noopener"));

/* ===== v8: project preview dialog, service quotes, header behaviour, theme transition ===== */
const pdlg = $("#pdlg"), KIND_OF = { shop: 0, food: 1, edu: 2, folio: 4, biz: 5 };
const DEMOS = {
  "Sharma Sweets": { eyebrow:"HANDCRAFTED WITH LOVE", headline:"A little sweetness\nfor every moment.", desc:"Traditional Indian mithai, made fresh for celebrations big and small.", cta:"Build a sweet box", items:[["🍡","Gulab Jamun","₹320 / kg"],["🟠","Motichoor Laddoo","₹360 / kg"],["🍥","Kaju Katli","₹720 / kg"]], accent:"#e94b70", bg:"#fff4e8", type:"shop" },
  "Tandoor Tales": { eyebrow:"FIRE. FLAVOUR. FAMILY.", headline:"Gather around\ngood food.", desc:"Smoky tandoor favourites, vibrant plates and a table waiting for you.", cta:"Reserve a table", items:[["🍢","Paneer Tikka","₹280"],["🍛","Dal Makhani","₹260"],["🫓","Butter Naan","₹60"]], accent:"#d57b39", bg:"#fff4df", type:"food" },
  "BrightPath Classes": { eyebrow:"LEARN WITH CONFIDENCE", headline:"Your next chapter\nstarts here.", desc:"Small batches, expert mentors and a learning plan built around your goals.", cta:"Explore batches", items:[["01","Foundation","Classes 8–10"],["02","Competitive prep","JEE · NEET"],["03","Skill workshops","Weekend batches"]], accent:"#287c80", bg:"#edf9f6", type:"edu" },
  "Orbit Labs": { eyebrow:"IDEAS INTO ORBIT", headline:"Build what\ncomes next.", desc:"A launchpad for ambitious teams turning bold ideas into useful products.", cta:"Join the waitlist", items:[["✳","Discover","Find your next idea"],["↗","Build","Turn plans into products"],["◎","Launch","Grow with intention"]], accent:"#8c65ff", bg:"#f2efff", type:"biz" },
  "Maya Designs": { eyebrow:"INDEPENDENT DESIGN STUDIO", headline:"Thoughtful design.\nMeaningful impact.", desc:"Brand identities and digital experiences for people building something good.", cta:"Start a project", items:[["01","Identity system","Branding"],["02","Digital storefront","Web design"],["03","Campaign art","Art direction"]], accent:"#c96c4d", bg:"#fff2e9", type:"folio" },
  "Urban Threads": { eyebrow:"EVERYDAY, REIMAGINED", headline:"Wear your\nown kind of story.", desc:"Considered essentials, expressive colour and pieces made to move with you.", cta:"Explore collection", items:[["✦","Everyday tee","₹899"],["◈","Studio overshirt","₹1,899"],["✧","Relaxed trousers","₹1,499"]], accent:"#217c91", bg:"#eaf8f7", type:"shop" }
};
const demoDocument = (name) => {
  const d = DEMOS[name] || DEMOS["Sharma Sweets"];
  const items = d.items.map((x,i)=>`<article class="item"><div class="item-art art${i}">${x[0]}</div><div><b>${x[1]}</b><small>${x[2]}</small></div><button class="add" data-action="${d.type==='food'?'Add to order':d.type==='edu'?'View details':'Explore'}">↗</button></article>`).join('');
  const logo = name.split(' ').map(x=>x[0]).join('').slice(0,2);
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{box-sizing:border-box}body{margin:0;background:${d.bg};color:#172c2b;font:14px/1.5 Inter,system-ui,sans-serif}button{font:inherit;cursor:pointer}.site{min-height:560px;overflow:hidden}.nav{height:62px;display:flex;align-items:center;justify-content:space-between;padding:0 6%;border-bottom:1px solid #172c2b12;background:#ffffffb8}.brand{font-weight:850;letter-spacing:-.7px;display:flex;align-items:center;gap:9px}.mark{display:grid;place-items:center;width:29px;height:29px;background:${d.accent};color:white;border-radius:10px}.links{display:flex;gap:19px;color:#52615d;font-size:12px}.navbtn,.primary{border:0;border-radius:99px;padding:10px 16px;background:${d.accent};color:#fff;font-weight:750}.hero{padding:48px 7% 30px;display:grid;grid-template-columns:1.15fr .85fr;gap:18px;align-items:center}.eyebrow{font-size:10px;font-weight:850;letter-spacing:2px;color:${d.accent};margin-bottom:14px}.hero h1{white-space:pre-line;font-size:clamp(34px,5vw,56px);letter-spacing:-2px;line-height:.98;margin:0 0 17px;font-weight:850}.hero p{max-width:360px;color:#687773;line-height:1.7;margin:0 0 22px}.visual{min-height:220px;border-radius:25px;background:linear-gradient(145deg,${d.accent},${d.accent}88);display:grid;place-items:center;position:relative;overflow:hidden;box-shadow:0 20px 35px ${d.accent}25}.visual:before,.visual:after{content:"";position:absolute;border:1px solid #ffffff66;border-radius:50%;width:240px;height:240px}.visual:after{width:170px;height:170px}.orb{font-size:82px;filter:drop-shadow(0 15px 12px #0002);z-index:1;animation:float 4s ease-in-out infinite}.label{position:absolute;bottom:14px;left:16px;color:#fff;font-size:10px;letter-spacing:1.5px;font-weight:800}@keyframes float{50%{transform:translateY(-9px) rotate(4deg)}}.strip{padding:5px 7% 12px;color:#7c8984;font-size:10px;letter-spacing:1.7px;font-weight:800}.items{padding:0 7% 35px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.item{padding:11px;background:#fff;border:1px solid #172c2b10;border-radius:16px;min-width:0;box-shadow:0 8px 25px #172c2b08}.item-art{height:72px;border-radius:11px;display:grid;place-items:center;background:${d.accent}18;font-size:32px;margin-bottom:11px}.art1{background:${d.accent}25}.art2{background:${d.accent}12}.item b{display:block;font-size:12px}.item small{display:block;color:#7b8883;margin-top:4px;font-size:10px}.add{float:right;margin-top:-25px;border:1px solid #e3e8e5;background:#fff;border-radius:50%;width:27px;height:27px;color:${d.accent}}.bottom{margin:0 7% 25px;padding:15px 17px;background:#fff;border-radius:15px;display:flex;align-items:center;justify-content:space-between;gap:12px}.bottom b{font-size:12px}.bottom span{display:block;color:#7b8883;font-size:10px;margin-top:3px}.toast{position:sticky;bottom:12px;margin:0 auto 12px;width:max-content;max-width:90%;padding:10px 16px;border-radius:99px;background:#172c2b;color:#fff;font-size:12px;opacity:0;transform:translateY(8px);transition:.25s}.toast.show{opacity:1;transform:none}@media(max-width:560px){.links{display:none}.hero{grid-template-columns:1fr;padding-top:35px}.visual{min-height:130px}.orb{font-size:58px}.items{gap:6px;padding-left:5%;padding-right:5%}.item{padding:7px}.item-art{height:55px}.bottom{margin-left:5%;margin-right:5%}}</style></head><body><main class="site"><header class="nav"><div class="brand"><span class="mark">${logo}</span>${name}</div><div class="links"><span>Discover</span><span>Our story</span><span>What we do</span></div><button class="navbtn" data-action="Contact us">Let's talk ↗</button></header><section class="hero"><div><div class="eyebrow">${d.eyebrow}</div><h1>${d.headline}</h1><p>${d.desc}</p><button class="primary" data-action="${d.cta}">${d.cta} ↗</button></div><div class="visual"><div class="orb">${d.type==='food'?'🍲':d.type==='edu'?'✦':d.type==='biz'?'◉':d.type==='folio'?'✳':d.type==='shop'&&name==='Urban Threads'?'✦':'🍬'}</div><span class="label">MADE FOR YOUR NEXT CHAPTER</span></div></section><div class="strip">${d.type==='food'?'FAVOURITES FROM OUR KITCHEN':d.type==='edu'?'FIND YOUR LEARNING PATH':d.type==='biz'?'A BETTER WAY TO BUILD':d.type==='folio'?'SELECTED WORK & SERVICES':d.type==='shop'&&name==='Urban Threads'?'THE CURRENT EDIT':'CUSTOMER FAVOURITES'}　✳</div><section class="items">${items}</section><div class="bottom"><div><b>A good experience starts here.</b><span>Thoughtful details. Easy next steps. Built around you.</span></div><button class="primary" data-action="${d.cta}">${d.cta} ↗</button></div><div class="toast" role="status"></div></main><script>document.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;const t=document.querySelector('.toast');t.textContent=b.dataset.action+' — this is a demo interaction.';t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2300)})</script></body></html>`;
};
const openProject = (card) => {
  const name = $("h3", card).textContent;
  const demo = DEMOS[name] || DEMOS["Sharma Sweets"];
  const iframe = document.createElement("iframe");
  iframe.className = "pd-demo-frame"; iframe.title = `${name} interactive demo website`;
  iframe.setAttribute("sandbox", "allow-scripts"); iframe.srcdoc = demoDocument(name);
  $("#pd-view").replaceChildren(iframe);
  $("#pd-t").textContent = name; $("#pd-d").textContent = $("p", card).textContent;
  $("#pd-i").textContent = `Explore a ${demo.type === "food" ? "restaurant" : demo.type === "edu" ? "education" : demo.type === "biz" ? "startup" : demo.type === "folio" ? "creative portfolio" : "business"} website with working demo interactions.`;
  $("#pd-m").textContent = "Concept demo by FuTech · Fictional business · Buttons demonstrate the experience and do not submit real orders.";
  const msg = `I’d like a website in the style of the ${name} sample concept. `;
  $("#pd-wa").href = waLink("Hi FuTech, " + msg);
  $("#pd-ask").onclick = () => { pdlg.close(); goForm(msg, demo.type === "food" ? "food" : demo.type === "edu" ? "edu" : demo.type === "folio" ? "folio" : demo.type === "biz" ? "biz" : "shop"); };
  document.documentElement.classList.add("noscroll"); pdlg.showModal();
};
pdlg.addEventListener("click", e => { if (e.target === pdlg) pdlg.close(); });
pdlg.addEventListener("close", () => document.documentElement.classList.remove("noscroll"));
$("[data-close]", pdlg).addEventListener("click", () => pdlg.close());
$$(".pf").forEach(c => {
  const b = document.createElement("button"), n = $("h3", c).textContent;
  b.type = "button"; b.className = "pf-view"; b.textContent = "Open interactive demo ↗"; b.setAttribute("aria-label", `View a preview of ${n}`);
  b.addEventListener("click", () => openProject(c));
  $(".pf-cta", c).before(b);
  $(".shot", c).addEventListener("click", () => openProject(c));
});
$$(".svc li").forEach(li => {
  const t = $("h3", li).textContent, a = document.createElement("a");
  a.className = "svc-go"; a.href = "#contact"; a.textContent = "Get a quote for this"; a.setAttribute("aria-label", `Get a quote for ${t}`);
  a.addEventListener("click", () => { $("#lead [name=message]").value = `I’d like to know more about your ${t} service. `; });
  li.append(a);
});
const hdr = $(".nav"); let lastY = scrollY;
addEventListener("scroll", () => {
  const y = scrollY, open = hdr.querySelector("[aria-expanded=true]");
  hdr.classList.toggle("hide", y > lastY && y > 480 && !open && !hdr.contains(document.activeElement)); lastY = y;
}, { passive: true });
new MutationObserver(() => { const r = document.documentElement; r.classList.add("tt"); setTimeout(() => r.classList.remove("tt"), 600); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
