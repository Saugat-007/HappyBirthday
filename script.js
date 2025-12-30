// Simple page navigation with fireworks start/stop on page1
// Ensure there is a transition overlay element to animate fades
function ensureTransitionOverlay(){
  let overlay = document.getElementById('page-transition');
  if(!overlay){
    overlay = document.createElement('div');
    overlay.id = 'page-transition';
    document.body.appendChild(overlay);
  }
  return overlay;
}

function showPage(id){
  const pages = document.querySelectorAll('.page');
  const current = document.querySelector('.page.active');
  const overlay = ensureTransitionOverlay();
  const duration = 360; // matches CSS transition

  // If no active page (initial load), switch immediately without animation
  if(!current){
    pages.forEach(p=>{ p.style.display = 'none'; p.classList.remove('active'); });
    const el = document.getElementById(id);
    if(el){ el.style.display = 'block'; el.classList.add('active'); window.scrollTo(0,0); }
    if(id === 'page1') startFireworks(); else stopFireworks();
    return;
  }

  // Fade overlay in, then switch pages, then fade overlay out
  overlay.style.transition = `opacity ${duration}ms ease`;
  overlay.style.opacity = '1';

  setTimeout(()=>{
    pages.forEach(p=>{ p.style.display = 'none'; p.classList.remove('active'); });
    const el = document.getElementById(id);
    if(el){ el.style.display = 'block'; el.classList.add('active'); window.scrollTo(0,0); }
    if(id === 'page1') startFireworks(); else stopFireworks();

    // small delay before fading out so new page is visible underneath
    setTimeout(()=>{ overlay.style.opacity = '0'; }, 20);
  }, duration);
}

function nextpage0(){ showPage('page1'); }
function nextpage1(){ showPage('page2'); }
function nextpage2(){ showPage('page3'); }
function page4(){ showPage('page4'); }
function page5(){ showPage('page5'); }
function page6(){ showPage('page6'); }
function page7From3(){ showPage('page7'); }
function page7From4(){ showPage('page7'); }
function page7From5(){ showPage('page7'); }
function page7From6(){ showPage('page7'); }
function page8(){ showPage('page8'); }
function page9(){ showPage('page9'); }

// Fireworks implementation
const Fireworks = (function(){
  const canvas = document.getElementById('fireworks-canvas');
  const audio = document.getElementById('fireworks-audio');
  if(!canvas) return null;
  const ctx = canvas.getContext('2d');
  let DPR = window.devicePixelRatio || 1;
  let W = 0, H = 0;
  let rockets = [];
  let particles = [];
  let raf = null;
  let running = false;

  function resize(){
    DPR = window.devicePixelRatio || 1;
    W = canvas.width = Math.floor(window.innerWidth * DPR);
    H = canvas.height = Math.floor(window.innerHeight * DPR);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(DPR,0,0,DPR,0,0);
  }

  function rand(min, max){ return Math.random()*(max-min)+min; }

  // tweakable parameters for height/intensity
  const gravity = 0.12; // lower gravity => rockets go higher
  const explodeHeightFactor = 0.32; // explode when y < viewportHeight * factor

  function launchRocket(){
    rockets.push({
      x: rand(50, window.innerWidth-50),
      y: window.innerHeight + 10,
      vx: rand(-1.2,1.2),
      // stronger upward speed to reach higher peaks
      vy: rand(-14,-9),
      hue: Math.floor(rand(0,360)),
      life: 0
    });
  }

  function explode(r){
    const count = 30 + Math.floor(rand(10,40));
    for(let i=0;i<count;i++){
      const angle = Math.random()*Math.PI*2;
      const speed = rand(1,6);
      particles.push({
        x: r.x, y: r.y,
        vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed,
        hue: r.hue,
        life: 60 + Math.floor(rand(0,40)),
        size: rand(1.5,3.2)
      });
    }
  }

  function update(){
    ctx.clearRect(0,0,window.innerWidth, window.innerHeight);

    // rockets
    for(let i=rockets.length-1;i>=0;i--){
      const r = rockets[i];
      r.x += r.vx; r.y += r.vy; r.vy += gravity; r.life++;
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath(); ctx.arc(r.x, r.y, 2.5, 0, Math.PI*2); ctx.fill();
      // explode when slowing after peak, after long life, or when reaching a high altitude
      if(r.vy > -1 || r.life > 140 || r.y < window.innerHeight * explodeHeightFactor){ explode(r); rockets.splice(i,1); }
    }

    // particles
    for(let i=particles.length-1;i>=0;i--){
      const p = particles[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.vx *= 0.995; p.vy *= 0.995; p.life--;
      const alpha = Math.max(0, p.life/80);
      ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${alpha})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
      if(p.life <= 0 || p.y > window.innerHeight + 50) particles.splice(i,1);
    }

    // random launches
    if(Math.random() < 0.06) launchRocket();

    raf = requestAnimationFrame(update);
  }

  function start(){
    if(running) return; running = true; resize(); window.addEventListener('resize', resize);
    // try play audio (click that opened page likely lets it play)
    if(audio){ const p = audio.play(); if(p && p.catch) p.catch(()=>{}); }
    raf = requestAnimationFrame(update);
  }

  function stop(){
    running = false; window.removeEventListener('resize', resize); if(raf) cancelAnimationFrame(raf); raf = null;
    rockets = []; particles = []; ctx.clearRect(0,0,window.innerWidth, window.innerHeight);
    if(audio){ try{ audio.pause(); audio.currentTime = 0; }catch(e){} }
  }

  return { start, stop };
})();

function startFireworks(){ if(window.FireworksController) return; window.FireworksController = Fireworks; if(Fireworks) Fireworks.start(); }
function stopFireworks(){ if(window.FireworksController && Fireworks) Fireworks.stop(); }

// initial page
window.addEventListener('DOMContentLoaded', function(){ showPage('page0'); });