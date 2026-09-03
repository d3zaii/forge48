/* FORGE48 — vanilla JS interactions */
const CONFIG = {
  // Replace this with your real registration/payment/form URL.
  registrationUrl: "https://example.com/register"
};

const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];

window.addEventListener("load", () => {
  setTimeout(() => $("#loader")?.classList.add("done"), 650);
});

const cursorGlow = $(".cursor-glow");
window.addEventListener("pointermove", (e) => {
  if (!cursorGlow) return;
  cursorGlow.animate(
    { left: `${e.clientX}px`, top: `${e.clientY}px` },
    { duration: 450, fill: "forwards" }
  );
});

const menu = $(".menu-toggle");
const navLinks = $(".nav-links");
menu?.addEventListener("click", () => navLinks?.classList.toggle("open"));
$$(".nav-links a").forEach(a => a.addEventListener("click", () => navLinks?.classList.remove("open")));

function addTilt(el, strength = 10) {
  el.addEventListener("pointermove", (e) => {
    if (window.innerWidth < 800) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    el.style.transform = `perspective(900px) rotateX(${(-y * strength).toFixed(2)}deg) rotateY(${(x * strength).toFixed(2)}deg) translateZ(4px)`;
  });
  el.addEventListener("pointerleave", () => {
    el.style.transform = "";
  });
}
$$(".tilt").forEach(el => addTilt(el, el.classList.contains("opportunity-panel") ? 4 : 9));

$$(".magnetic").forEach(btn => {
  btn.addEventListener("pointermove", (e) => {
    if (window.innerWidth < 800) return;
    const r = btn.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * .10;
    const y = (e.clientY - r.top - r.height / 2) * .18;
    btn.style.transform = `translate(${x}px,${y}px)`;
  });
  btn.addEventListener("pointerleave", () => btn.style.transform = "");
});

// Registration modal
const modal = $("#modal");
const modalContinue = $("#modalContinue");
const preview = $("#registrationUrlPreview");

function openModal() {
  if (!modal) return;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  if (modalContinue) modalContinue.href = CONFIG.registrationUrl;
  if (preview) preview.textContent = CONFIG.registrationUrl;
}
function closeModal() {
  modal?.classList.remove("open");
  modal?.setAttribute("aria-hidden", "true");
}
$("#registerBtn")?.addEventListener("click", openModal);
$(".modal-close")?.addEventListener("click", closeModal);
$(".modal-backdrop")?.addEventListener("click", closeModal);
window.addEventListener("keydown", e => e.key === "Escape" && closeModal());

// Subtle reveal on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.animate(
        [{ opacity: 0, transform: "translateY(28px)" }, { opacity: 1, transform: "translateY(0)" }],
        { duration: 750, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards" }
      );
      observer.unobserve(entry.target);
    }
  });
}, { threshold: .08 });
$$(".track-card,.time-node,.logo-box,.stack-card,.faq-list details").forEach(el => {
  el.style.opacity = "0";
  observer.observe(el);
});

// Three.js background: floating particles + rotating wireframe geometry.
(function initScene() {
  if (!window.THREE) return;
  const canvas = $("#scene");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, .1, 100);
  camera.position.z = 7;

  const group = new THREE.Group();
  scene.add(group);

  const particleCount = 900;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i*3] = (Math.random() - .5) * 18;
    positions[i*3+1] = (Math.random() - .5) * 12;
    positions[i*3+2] = (Math.random() - .5) * 14;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const pMat = new THREE.PointsMaterial({ color: 0x9c7cff, size: .018, transparent: true, opacity: .65 });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  const ico = new THREE.IcosahedronGeometry(2.0, 1);
  const wire = new THREE.MeshBasicMaterial({ color: 0x8b5cf6, wireframe: true, transparent: true, opacity: .12 });
  const shell = new THREE.Mesh(ico, wire);
  shell.position.set(2.8, .2, -2);
  group.add(shell);

  const torus = new THREE.TorusGeometry(2.65, .008, 12, 140);
  const torusMat = new THREE.MeshBasicMaterial({ color: 0x1ee5e1, transparent: true, opacity: .14 });
  const torusMesh = new THREE.Mesh(torus, torusMat);
  torusMesh.rotation.x = 1.15;
  torusMesh.rotation.z = -.35;
  torusMesh.position.set(2.8, .2, -2);
  group.add(torusMesh);

  const mouse = {x:0,y:0};
  window.addEventListener("pointermove", e => {
    mouse.x = (e.clientX / innerWidth - .5);
    mouse.y = (e.clientY / innerHeight - .5);
  });

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += .003;
    particles.rotation.y += .00025;
    shell.rotation.x += .0015;
    shell.rotation.y += .0022;
    torusMesh.rotation.z += .0015;
    group.rotation.y += (mouse.x * .16 - group.rotation.y) * .012;
    group.rotation.x += (-mouse.y * .10 - group.rotation.x) * .012;
    camera.position.x += (mouse.x * .32 - camera.position.x) * .01;
    camera.position.y += (-mouse.y * .18 - camera.position.y) * .01;
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
})();


// ===== PICK YOUR BATTLEFIELD =====
(function initMissionFiles(){
  const data = {
    ai: {
      title: "AI & AUTOMATION",
      kicker: "01 / AI & AUTOMATION",
      intro: "Build useful intelligence, not AI for AI's sake. These missions focus on removing repetitive work, improving decisions and making complex workflows feel simple.",
      items: [
        ["01","THE INVISIBLE ASSISTANT","Design an AI assistant that quietly handles repetitive admin work for a student, creator or small business without becoming another complicated dashboard."],
        ["02","FROM CHAOS TO ACTION","Build a system that turns messy notes, emails or documents into clear tasks, owners, deadlines and next steps."],
        ["03","THE AUTOMATION CHAIN","Create an AI-powered workflow where one trigger starts a sequence of useful actions across multiple tools or processes."],
        ["04","KNOWLEDGE WITHOUT THE SEARCH","Build a trustworthy question-answering experience over a private collection of documents, with clear source context and useful answers."],
        ["05","DECISION COPILOT","Create an AI tool that helps someone compare options, surface trade-offs and make a better decision instead of simply generating text."],
        ["06","OPEN AI TRACK","Your problem. Your workflow. Your idea. Use AI or automation to solve a real friction point that you understand personally."]
      ]
    },
    product: {
      title: "PRODUCT & SAAS",
      kicker: "02 / PRODUCT & SAAS",
      intro: "Think like a product team. Find a sharp problem, design the smallest useful solution and make the experience good enough that someone would come back tomorrow.",
      items: [
        ["01","THE 5-MINUTE STARTUP","Build a product that helps a user go from signup to meaningful value in five minutes or less."],
        ["02","ONE SCREEN, ONE JOB","Design a focused tool that does one important job exceptionally well, without the clutter of traditional software."],
        ["03","THE SMALL BUSINESS OS","Create a lightweight SaaS product that helps a local business manage one painful process such as leads, bookings, inventory or follow-ups."],
        ["04","COLLABORATION WITHOUT CHAOS","Build a collaboration product that makes it easier for small teams to know what is happening, what is blocked and what needs attention."],
        ["05","THE RETENTION PROBLEM","Create a product experience that gives users a strong reason to return regularly, and demonstrate what creates that habit."],
        ["06","OPEN PRODUCT TRACK","Choose a product problem you have experienced yourself. Define the user, the pain and the smallest product that could genuinely improve it."]
      ]
    },
    open: {
      title: "OPEN INNOVATION",
      kicker: "03 / OPEN INNOVATION",
      intro: "No prescribed lane. These prompts are deliberately broad. Pick a problem from your own life, campus, city, community or industry and build the strongest answer you can.",
      items: [
        ["01","THE CAMPUS FRICTION","Find one everyday university or student problem that everyone complains about but nobody has solved properly."],
        ["02","THE LOST MINUTE","Choose a process where people repeatedly waste small amounts of time. Turn those tiny losses into a measurable product opportunity."],
        ["03","THE ACCESS GAP","Build something that makes an existing service, experience or opportunity easier to access for people who are often left out."],
        ["04","THE LOCAL PROBLEM","Solve a problem specific to your city or community. Local knowledge is your unfair advantage."],
        ["05","THE FUTURE NOBODY ORDERED","Imagine a near-future behaviour or need that does not have a good product yet. Prototype what people would use."],
        ["06","OPEN TRACK","Ignore every prompt above. Bring your own problem, explain why it matters and prove your solution deserves to exist."]
      ]
    },
    cyber: {
      title: "CYBERSECURITY",
      kicker: "04 / CYBERSECURITY",
      intro: "Make security practical. Build tools and experiences that help people detect risks, understand what is happening and protect digital systems without needing to be a security expert.",
      items: [
        ["01","PHISHING, BUT PERSONAL","Design a safe educational experience that teaches users to recognise phishing and social-engineering patterns through realistic scenarios."],
        ["02","THE SECURITY HEALTH CHECK","Build a simple product that helps a small organisation understand basic security hygiene and prioritise its biggest gaps."],
        ["03","THE HUMAN FIREWALL","Create a tool that turns security awareness into an engaging habit instead of a once-a-year training presentation."],
        ["04","ALERT TO ANSWER","Prototype a workflow that helps a small team turn a noisy security alert into a clear, prioritised response."],
        ["05","PRIVACY BY DESIGN","Build a consumer product that gives people a clearer, more understandable view of what data they share and why it matters."],
        ["06","OPEN SECURITY TRACK","Choose a security problem you care about and build a safe, defensive prototype that helps people detect, prevent or understand risk."]
      ]
    },
    impact: {
      title: "IMPACT & FUTURE",
      kicker: "05 / IMPACT & FUTURE",
      intro: "Build for problems bigger than a screen. Think about education, sustainability, mobility, accessibility, communities and the systems people depend on every day.",
      items: [
        ["01","THE LEARNING GAP","Create a tool that helps a learner overcome one specific barrier such as feedback, practice, discovery, motivation or access to resources."],
        ["02","LESS WASTE","Build a digital product that helps people, businesses or communities reduce avoidable waste of food, energy, materials or resources."],
        ["03","MOVE BETTER","Prototype a solution that makes everyday movement around a city safer, simpler, more affordable or more predictable."],
        ["04","DESIGN FOR EVERYONE","Build an experience that is meaningfully easier to use for people with different accessibility needs."],
        ["05","THE COMMUNITY LAYER","Create a product that helps a community coordinate resources, opportunities, support or local action more effectively."],
        ["06","OPEN FUTURE TRACK","Choose a future-facing problem you believe will matter. Make a practical prototype that shows what could change."]
      ]
    }
  };

  const modal = document.getElementById("missionModal");
  const list = document.getElementById("missionList");
  const title = document.getElementById("missionTitle");
  const intro = document.getElementById("missionIntro");
  const kicker = document.getElementById("missionKicker");
  if(!modal || !list) return;

  function openTrack(key){
    const track = data[key];
    if(!track) return;
    title.textContent = track.title;
    intro.textContent = track.intro;
    kicker.textContent = track.kicker;
    list.innerHTML = track.items.map((item, index) => `
      <article class="mission-item ${index === 5 ? "open-file" : ""}">
        <div class="mission-number">${item[0]} / ${index === 5 ? "OPEN TRACK" : "MISSION"}</div>
        <div class="mission-spark">${index === 5 ? "∞" : "✦"}</div>
        <h4>${item[1]}</h4>
        <p>${item[2]}</p>
      </article>
    `).join("");
    modal.classList.add("open");
    modal.setAttribute("aria-hidden","false");
    document.body.style.overflow = "hidden";
  }

  function closeTrack(){
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden","true");
    document.body.style.overflow = "";
  }

  document.querySelectorAll(".track-open").forEach(card => {
    card.addEventListener("click", () => openTrack(card.dataset.track));
    card.addEventListener("keydown", e => {
      if(e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openTrack(card.dataset.track);
      }
    });
  });

  modal.querySelector(".mission-close").addEventListener("click", closeTrack);
  modal.querySelector(".mission-backdrop").addEventListener("click", closeTrack);
  window.addEventListener("keydown", e => {
    if(e.key === "Escape") closeTrack();
  });
})();

// ===== CRACK THE VAULT MINI-GAME =====
// Easy puzzle: 2, 4, 6, ? => 8.
// The player enters 0008 to keep the keypad interaction simple.
(function initVaultGame(){
  const vault = document.getElementById("vaultGame");
  const display = document.getElementById("codeDisplay");
  const keypad = document.getElementById("keypad");
  const status = document.getElementById("vaultStatus");
  if(!vault || !display || !keypad) return;

  let code = "";
  const secret = "0008";

  function render(){
    display.textContent = code.padEnd(4, "_").split("").join(" ");
  }

  function fail(){
    vault.classList.remove("shake");
    void vault.offsetWidth;
    vault.classList.add("shake");
    status.textContent = "ACCESS DENIED · LOOK AT THE PATTERN";
    status.classList.remove("success");
    code = "";
    render();
  }

  function unlock(){
    vault.classList.add("unlocked");
    status.textContent = "ACCESS GRANTED · ₹25K PRIZE POOL UNLOCKED";
    status.classList.add("success");
    document.body.animate(
      [
        {transform:"translateX(0)"},
        {transform:"translateX(-5px)"},
        {transform:"translateX(6px)"},
        {transform:"translateX(-3px)"},
        {transform:"translateX(0)"}
      ],
      {duration:460, easing:"ease-out"}
    );
  }

  keypad.addEventListener("click", e => {
    const btn = e.target.closest("button");
    if(!btn || vault.classList.contains("unlocked")) return;
    const key = btn.dataset.key;

    if(key === "clear"){
      code = "";
      status.textContent = "SYSTEM LOCKED · FIND THE NEXT NUMBER";
      render();
      return;
    }

    if(key === "enter"){
      code === secret ? unlock() : fail();
      return;
    }

    if(/^\d$/.test(key) && code.length < 4){
      code += key;
      render();
      if(code.length === 4) setTimeout(() => code === secret ? unlock() : fail(), 180);
    }
  });

  render();
})();
