// ===== SHOW/HIDE SECTIONS =====
window.showSection = function(sectionId) {
  document.querySelectorAll('.content-section').forEach(el => el.classList.remove('visible'));
  const target = document.getElementById(sectionId);
  if (target) {
    target.classList.add('visible');
    setTimeout(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }
};

// Button click handlers
document.querySelectorAll('.option-btn[data-target]').forEach(btn => {
  btn.addEventListener('click', function() {
    const targetId = this.getAttribute('data-target');
    if (targetId) showSection(targetId);
  });
});

// ===== HERO SLIDER (mini) =====
(function() {
  const slides = document.querySelectorAll('.hero-slider-mini .slide');
  const dots = document.querySelectorAll('.hero-slider-mini .dot');
  if (!slides.length) return;
  let current = 0,
    timer;

  function showSlide(index) {
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    slides[index].classList.add('active');
    dots[index].classList.add('active');
  }

  function rotate() { current = (current + 1) % slides.length;
    showSlide(current); }

  function startTimer() { timer = setInterval(rotate, 5000); }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearInterval(timer);
    else startTimer();
  });
  startTimer();
})();

// ===== TESTIMONIALS ROTATOR =====
(function() {
  const quotes = [
    { t: "Prime Programmers Hub gave me the confidence to build my first website. Now I'm teaching my friends how to code too!", a: "— Sarah, 15" },
    { t: "My mentor is so friendly and helpful. I love the community projects and challenges!", a: "— James, 16" },
    { t: "Before joining, I thought coding was too hard. But the bootcamps made it easy and fun!", a: "— Emily, 14" },
    { t: "I've learned Python, made a game, and even presented my app to my school! Thanks Prime Hub!", a: "— Aiden, 17" },
    { t: "Joining Prime Programmers Hub connected me with peers who pushed me to complete real projects and sharpen my skills.", a: "— Daniel, 18" },
    { t: "The community is amazing! I collaborated on web apps, attended bootcamps, and now mentor juniors.", a: "— Fatima, 19" },
    { t: "From coding my first app to presenting it online, the support from Prime Programmers Hub was incredible.", a: "— Leo, 20" },
    { t: "I never imagined I'd learn robotics and web development while making lifelong friends in one place.", a: "— Amaka, 21" },
    { t: "Prime Programmers Hub helped me turn my coding hobby into serious projects I'm proud of sharing.", a: "— Chike, 22" }
  ];
  let i = 0;
  const el = document.getElementById('tList');
  if (!el) return;

  function renderTesti() {
    el.style.opacity = 0;
    setTimeout(() => {
      el.innerHTML = `<div>“${quotes[i].t}”</div><div style="margin-top:.6rem;font-weight:800;color:var(--brand)">${quotes[i].a}</div>`;
      el.style.opacity = 1;
    }, 200);
  }
  renderTesti();
  setInterval(() => { i = (i + 1) % quotes.length;
    renderTesti(); }, 4200);
})();

// ===== JOIN FORM (from original source) =====
(function() {
  const form = document.getElementById('joinForm');
  const btn = document.getElementById('joinBtn');
  const anim = document.getElementById('successAnimation');
  if (!form) return;
  
  form.addEventListener('submit', e => {
    e.preventDefault();
    btn.disabled = true;
    btn.textContent = 'Applying...';

    const data = new FormData(form);

    // Replace the URL below with your deployed Google Apps Script Web App URL
    fetch('https://script.google.com/macros/s/AKfycbyTlZPuJi6oIdRBH5J_fA-3J8wTIAYuh1yIv3E7mAZI-SuuOjOm8fQGcswRLHX4J1AYdA/exec', {
      method: 'POST',
      body: data
    })
    .then(res => res.text())
    .then(response => {
      btn.textContent = 'Applied';
      form.reset();
      anim.style.display = 'block';
      anim.innerHTML = '<i style="color:#FFEA00; font-size:19px;">You have applied! Check your email for follow up.</i>';
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Submission failed. Please try again.');
      btn.disabled = false;
      btn.textContent = 'Apply';
    });
  });
})();

// ===== CERTIFICATE VERIFICATION =====
(function() {
  const verifyBtn = document.getElementById('verifyBtn');
  const resultDiv = document.getElementById('result');
  const certInput = document.getElementById('certificateId');
  if (!verifyBtn) return;
  
  const webAppURL = "https://script.google.com/macros/s/AKfycbwPp432y_PHVxKmJdvgS_hzacky8s_OiItnElY8mhfBXjEA0sUUAFhwa5qQv4oi_49P/exec";
  
  verifyBtn.addEventListener('click', () => {
    const certId = certInput.value.trim();
    resultDiv.innerHTML = "";
    
    if (!certId) { 
      resultDiv.innerHTML = '<p style="color:red;font-weight:600;">⚠️ Please enter a Certificate ID.</p>'; 
      return; 
    }
    
    resultDiv.innerHTML = '<p style="color:gray;">🔍 Verifying...</p>';
    
    fetch(`${webAppURL}?certificateId=${encodeURIComponent(certId)}`)
      .then(res => {
        if (!res.ok) throw new Error("Network error");
        return res.json();
      })
      .then(data => {
        if (data.found) {
          const studentName = data.record.Name || "a PPH Member";
          const courseName = data.record.Course || "a PPH Program";
          const issueDate = data.record.Date || "N/A";

          resultDiv.innerHTML = `
            <div style="border:2px solid #28a745; padding:15px; border-radius:8px; background-color:rgba(40,167,69,0.05); text-align:left; max-width:350px; margin:auto;">
              <p style="color:#28a745; font-weight:800; margin-bottom:10px; text-align:center;">✅ OFFICIAL VERIFICATION</p>
              <p style="margin:5px 0;"><strong>Name:</strong> ${studentName}</p>
              <p style="margin:5px 0;"><strong>Course:</strong> ${courseName}</p>
              <p style="margin:5px 0;"><strong>Date:</strong> ${issueDate}</p>
              <p style="margin:5px 0;"><strong>Status:</strong> ${data.record.Status || 'Verified'}</p>
            </div>`;
        } else {
          resultDiv.innerHTML = '<p style="color:red;font-weight:600;">❌ Certificate not found. Please check the ID.</p>';
        }
      })
      .catch(err => { 
        resultDiv.innerHTML = '<p style="color:red;font-weight:600;">⚠️ Connection error. Please try again.</p>';
        console.error(err);
      });
  });
})();