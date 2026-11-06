const sig=document.getElementById("sig"),st=document.getElementById("status");
function markieren(){const r=document.createRange();r.selectNodeContents(sig);const s=getSelection();s.removeAllRanges();s.addRange(r);}
document.getElementById("kopieren").addEventListener("click",async()=>{
  const html=sig.innerHTML;
  try{await navigator.clipboard.write([new ClipboardItem({"text/html":new Blob([html],{type:"text/html"}),"text/plain":new Blob([sig.innerText],{type:"text/plain"})})]);st.textContent="Kopiert. Jetzt in Outlook einfügen.";}
  catch(e){markieren();try{if(document.execCommand("copy"))st.textContent="Kopiert. Jetzt in Outlook einfügen.";else throw 0;}catch(_){st.textContent="Signatur ist markiert. Jetzt Kopieren wählen.";}}
});
