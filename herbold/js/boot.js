/* Früh geladen: setzt html.js, erkennt Touch und reduzierte Bewegung, Failsafe nach 4 s. */
(function(){
  var d=document.documentElement;
  d.classList.add('js');
  try{if(matchMedia('(pointer:coarse)').matches)d.classList.add('touch');}catch(e){}
  try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('failsafe','reduced');}catch(e){}
  try{if(sessionStorage.getItem('intro-seen'))d.classList.add('no-intro');}catch(e){}
  window.__failsafe=setTimeout(function(){d.classList.add('failsafe');},4500);
})();
