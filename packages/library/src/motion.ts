// Motion for the blocks whose originals animated (docs/m0/20-motion.md). The originals used
// Motion's React components; these are the same effects with the browser's own tools, driven by
// markers in the server-drawn HTML, so no page needs React to run in the browser:
//   data-m="reveal" (data-m-delay="ms")  fades in from a slight blur when it scrolls into view
//   data-m="marquee" (data-m-reverse)    an endless sideways strip; its child .m-track holds the
//                                        items twice, so the loop has no seam; pauses on hover
//   data-m="marquee-y"                   the same, upwards
//   data-m="gradient-text"               a slow gradient moving through the words
//   data-m="grid"                        squares of a grid lighting up and fading, at random
//   data-m="scroll-header"               gets data-scrolled once the page scrolls
//   data-m="rotate"                      shows its [data-m-item] children one at a time
// Nothing is hidden unless the script runs, and with motion turned off (prefers-reduced-motion)
// nothing moves. A page with no marker gets no script.

const CSS = `
[data-m=marquee],[data-m=marquee-y]{overflow:hidden}
[data-m=marquee]>.m-track{display:flex;width:max-content}
[data-m=marquee-y]>.m-track{display:flex;flex-direction:column}
[data-m=gradient-text]{background-size:300% 100%;-webkit-background-clip:text;background-clip:text;color:transparent}
@media (prefers-reduced-motion:no-preference){
.m-on [data-m=reveal]{opacity:0;filter:blur(4px);transform:translateY(-8px);transition:opacity .5s ease-out,filter .5s ease-out,transform .5s ease-out;transition-delay:var(--m-delay,0ms)}
.m-on [data-m=reveal].m-in{opacity:1;filter:none;transform:none}
[data-m=marquee]>.m-track{animation:m-x var(--m-duration,60s) linear infinite}
[data-m=marquee][data-m-reverse]>.m-track{animation-direction:reverse}
[data-m=marquee-y]>.m-track{animation:m-y var(--m-duration,20s) linear infinite}
[data-m=marquee]:hover>.m-track,[data-m=marquee-y]:hover>.m-track{animation-play-state:paused}
[data-m=gradient-text]{animation:m-grad 8s linear infinite}
}
@keyframes m-x{to{transform:translateX(-50%)}}
@keyframes m-y{to{transform:translateY(-50%)}}
@keyframes m-grad{to{background-position:300% 0}}
`

/** In the head: hides what will reveal, before the first paint, so nothing flashes. */
const EARLY = `(function(){var r=document.documentElement;if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;r.classList.add('m-on');setTimeout(function(){if(!window.__m)r.classList.remove('m-on')},3000)})()`

/** At the end of the body. */
const RUNTIME = `(function(){
window.__m=1;var d=document;
if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('m-in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'});
d.querySelectorAll('[data-m=reveal]').forEach(function(el){el.style.setProperty('--m-delay',(el.getAttribute('data-m-delay')||0)+'ms');io.observe(el)});
d.querySelectorAll('[data-m=scroll-header]').forEach(function(el){var f=function(){el.toggleAttribute('data-scrolled',scrollY>40)};f();addEventListener('scroll',f,{passive:true})});
d.querySelectorAll('[data-m=rotate]').forEach(function(el){var it=[].slice.call(el.querySelectorAll('[data-m-item]'));if(it.length<2)return;var i=0;it.forEach(function(x,j){x.hidden=j!==0});setInterval(function(){it[i].hidden=true;i=(i+1)%it.length;it[i].hidden=false;it[i].animate([{opacity:0},{opacity:1}],{duration:300,easing:'ease-out'})},6000)});
d.querySelectorAll('[data-m=grid]').forEach(function(el){
  var s=40,w=el.clientWidth,h=el.clientHeight,ns='http://www.w3.org/2000/svg',svg=d.createElementNS(ns,'svg');
  svg.setAttribute('width','100%');svg.setAttribute('height','100%');svg.setAttribute('aria-hidden','true');svg.style.position='absolute';svg.style.inset='0';
  el.appendChild(svg);
  var cells=Math.max(1,Math.floor(w/s))*Math.max(1,Math.floor(h/s)),cols=Math.max(1,Math.floor(w/s));
  for(var n=0;n<30;n++){(function(){var r=d.createElementNS(ns,'rect');r.setAttribute('width',s-1);r.setAttribute('height',s-1);r.setAttribute('fill','currentColor');r.style.opacity='0';svg.appendChild(r);
    var place=function(){var c=Math.floor(Math.random()*cells);r.setAttribute('x',(c%cols)*s+1);r.setAttribute('y',Math.floor(c/cols)*s+1)};
    var go=function(){place();r.animate([{opacity:0},{opacity:.1},{opacity:0}],{duration:3000,delay:Math.random()*3000,easing:'ease-in-out'}).onfinish=go};go()})()}
});
})()`

/** The style and scripts a page needs, or nothing when no block on it moves. */
export function motionFor(body: string): { head: string; end: string } {
  if (!/\sdata-m="/.test(body)) return { head: '', end: '' }
  return {
    head: `<style>${CSS.replace(/\n/g, '')}</style><script>${EARLY}</script>`,
    end: `<script>${RUNTIME.replace(/\n\s*/g, '')}</script>`,
  }
}
