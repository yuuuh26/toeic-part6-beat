(() => {
  'use strict';
  const DATA=window.PART6_DATA;
  const $=s=>document.querySelector(s);
  const $$=s=>[...document.querySelectorAll(s)];
  const defaults={ttsEnabled:true,ttsRate:'1',voice:'',timeLimit:'75',timeEffects:true,effectStrength:'STRONG'};
  const settings={...defaults,...JSON.parse(localStorage.getItem('part6-settings')||'{}')};
  const state={screen:'homeScreen',mode:'standard',doc:null,q:0,answers:[],combo:0,startedAt:0,qStartedAt:0,limit:90,timeLeft:90,timedOut:false,timer:null,history:[],recentDocs:JSON.parse(localStorage.getItem('part6-recent')||'[]')};
  let db;

  function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),2200)}
  function stopSpeech(){if('speechSynthesis'in window)speechSynthesis.cancel()}
  function showScreen(id){stopSpeech();clearInterval(state.timer);$$('.screen').forEach(x=>x.classList.toggle('active',x.id===id));state.screen=id;$('#backBtn').hidden=id==='homeScreen';scrollTo({top:0,behavior:'smooth'});if(id==='statsScreen')renderStats()}
  function saveSettings(){localStorage.setItem('part6-settings',JSON.stringify(settings));$('#timeAttackLabel').textContent=settings.timeLimit}

  function openDB(){return new Promise((resolve,reject)=>{const req=indexedDB.open('toeic-part6-beat',1);req.onupgradeneeded=()=>{const d=req.result;if(!d.objectStoreNames.contains('answers')){const s=d.createObjectStore('answers',{keyPath:'entryId',autoIncrement:true});s.createIndex('questionId','questionId');s.createIndex('documentId','documentId');s.createIndex('answeredAt','answeredAt')}};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
  function readHistory(){return new Promise((resolve,reject)=>{const tx=db.transaction('answers','readonly');const req=tx.objectStore('answers').getAll();req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
  function addHistory(entry){return new Promise((resolve,reject)=>{const tx=db.transaction('answers','readwrite');tx.objectStore('answers').add(entry);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)})}
  function clearHistory(){return new Promise((resolve,reject)=>{const tx=db.transaction('answers','readwrite');tx.objectStore('answers').clear();tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}

  function pickDocument(){
    let pool=DATA.documents;
    if(state.mode==='review'){
      const wrong=new Set(state.history.filter(h=>!h.correct).map(h=>h.documentId));
      const review=pool.filter(d=>wrong.has(d.id));if(review.length)pool=review;else toast('復習対象がないため、未出問題から出題します');
    }
    const unseen=pool.filter(d=>!state.history.some(h=>h.documentId===d.id));
    if(unseen.length)pool=unseen;
    const fresh=pool.filter(d=>!state.recentDocs.includes(d.id));if(fresh.length)pool=fresh;
    return pool[Math.floor(Math.random()*pool.length)];
  }
  function startMode(mode){state.mode=mode;startDocument(pickDocument())}
  function startDocument(doc){
    state.doc=doc;state.q=0;state.answers=[];state.startedAt=Date.now();state.qStartedAt=Date.now();state.timedOut=false;
    state.limit=state.mode==='timeattack'?Number(settings.timeLimit):90;state.timeLeft=state.limit;
    state.recentDocs=[doc.id,...state.recentDocs.filter(x=>x!==doc.id)].slice(0,12);localStorage.setItem('part6-recent',JSON.stringify(state.recentDocs));
    showScreen('quizScreen');renderQuestion();startTimer();
  }
  function startTimer(){clearInterval(state.timer);updateTimer();state.timer=setInterval(()=>{const elapsed=(Date.now()-state.startedAt)/1000;state.timeLeft=Math.max(0,state.limit-elapsed);if(!state.timeLeft)state.timedOut=true;updateTimer()},200)}
  function updateTimer(){
    const row=$('.timer-row'),remaining=Math.ceil(state.timeLeft),elapsed=Math.floor((Date.now()-state.startedAt)/1000);
    $('#timerText').textContent=state.timedOut?`+${formatTime(elapsed-state.limit)}`:formatTime(remaining);
    $('#timerFill').style.width=`${Math.max(0,state.timeLeft/state.limit*100)}%`;
    row.classList.toggle('warning',settings.timeEffects&&state.timeLeft<=15&&!state.timedOut);row.classList.toggle('critical',settings.timeEffects&&state.timeLeft<=5&&!state.timedOut);
  }
  function formatTime(sec){sec=Math.max(0,Math.floor(sec));return`${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`}
  function completedAnswer(index){const a=state.answers[index];return a?state.doc.questions[index].options[state.doc.questions[index].answer]:null}
  function renderBody(complete=false){
    let html=escapeHtml(state.doc.body).replace(/\{\{(\d)\}\}/g,(_,raw)=>{const i=Number(raw),answer=complete?state.doc.questions[i].options[state.doc.questions[i].answer]:completedAnswer(i);const status=state.answers[i]&&!state.answers[i].correct?' wrong':'';if(answer)return`<span class="blank filled${status}">${escapeHtml(answer)}</span>`;return`<span class="blank${i===state.q?' current':''}">(${i+1})</span>`});
    return html.replace(/\n/g,'<br>');
  }
  function renderQuestion(){
    const d=state.doc,item=d.questions[state.q];
    $('#docProgress').textContent=`DOCUMENT ${Number(d.id.slice(1))} / ${DATA.documents.length}`;$('#questionProgress').textContent=`Q ${state.q+1} / 4`;
    $('#comboValue').textContent=state.combo;$('#comboBox').classList.toggle('hot',state.combo>=3);$('#difficultyBadge').textContent=d.level;$('#docType').textContent=d.type;$('#docTitle').textContent=d.title;$('#documentBody').innerHTML=renderBody();$('#questionType').textContent=item.type.toUpperCase();
    $('#feedback').hidden=true;$('#choices').innerHTML='';
    item.options.forEach((option,i)=>{const b=document.createElement('button');b.className='choice';b.innerHTML=`<span class="letter">${'ABCD'[i]}</span><span>${escapeHtml(option)}</span>`;b.addEventListener('click',()=>answer(i));$('#choices').appendChild(b)});
    state.qStartedAt=Date.now();
  }
  async function answer(selected){
    const item=state.doc.questions[state.q],buttons=$$('.choice');if(buttons.some(b=>b.disabled))return;
    const correct=selected===item.answer,seconds=(Date.now()-state.qStartedAt)/1000,rank=correct?rankFor(seconds,item.type):'MISS';
    buttons.forEach((b,i)=>{b.disabled=true;if(i===item.answer)b.classList.add('correct');if(i===selected&&!correct)b.classList.add('incorrect')});
    state.combo=correct?state.combo+1:0;const entry={documentId:state.doc.id,questionId:item.id,correct,selected,correctIndex:item.answer,seconds:Number(seconds.toFixed(2)),rank,difficulty:state.doc.difficulty,level:state.doc.level,type:item.type,mode:state.mode,timedOut:state.timedOut,answeredAt:new Date().toISOString()};state.answers[state.q]=entry;state.history.push(entry);
    try{await addHistory(entry)}catch(e){toast('履歴を保存できませんでした')}
    $('#documentBody').innerHTML=renderBody();$('#feedback').hidden=false;$('#feedbackTitle').textContent=correct?`${rank} — 正解！`:'MISS — 正解を確認';$('#feedbackTitle').style.color=correct?'var(--lime)':'#ff7995';$('#feedbackText').textContent=item.explanation;$('#otherChoicesText').textContent=item.others;$('#nextBtn').textContent=state.q===3?'DOCUMENT CLEAR':'NEXT QUESTION';
    if(correct)playEffect(rank);else if(navigator.vibrate)navigator.vibrate(45);
  }
  function rankFor(seconds,type){const factor=type.includes('一文')?1.35:1;if(!state.timedOut&&seconds<=3.3*factor)return'PERFECT';if(!state.timedOut&&seconds<=6.5*factor)return'EXCELLENT';if(!state.timedOut&&seconds<=11*factor)return'GREAT';return'GOOD'}
  function nextQuestion(){if(!state.answers[state.q])return;if(state.q<3){state.q++;renderQuestion()}else finishDocument()}
  function finishDocument(){clearInterval(state.timer);const correct=state.answers.filter(a=>a.correct).length,totalSec=(Date.now()-state.startedAt)/1000,fast=!state.timedOut&&totalSec<=state.limit*.65;showScreen('resultScreen');$('#resultCorrect').textContent=`${correct}/4`;$('#resultTime').textContent=`${Math.round(totalSec)}s`;$('#resultBonus').textContent=fast&&correct===4?'SPEED':!state.timedOut?'TIME':'—';$('#completeTitle').textContent=state.doc.title;$('#completeBody').innerHTML=renderBody(true);const perfect=correct===4;$('#resultEyebrow').textContent=perfect?'PERFECT DOCUMENT':'DOCUMENT CLEAR';$('#resultGrade').textContent=perfect&&fast?'SPEED CLEAR!':perfect?'PERFECT!':'CLEAR!';$('#resultSub').textContent=perfect?'4つの判断で文書を完全に修復しました。':`${4-correct}問をレビューして、次の文書へ。`;
    $('#reviewList').innerHTML='';state.doc.questions.forEach((item,i)=>{const a=state.answers[i],el=document.createElement('details');el.className='review-item';el.innerHTML=`<summary><span>Q${i+1} ${escapeHtml(item.type)}</span><b class="${a.correct?'ok':'no'}">${a.correct?a.rank:'MISS'}</b></summary><p><b>正答：</b>${escapeHtml(item.options[item.answer])}</p><p>${escapeHtml(item.explanation)}</p>`;$('#reviewList').appendChild(el)});playEffect(perfect?(fast?'SPEED BONUS':'PERFECT DOCUMENT'):'DOCUMENT CLEAR',perfect?'PERFECT':'GREAT')}
  function playEffect(label,rank=label){
    const layer=$('#effectLayer'),burst=$('#rankBurst'),parts=$('#particles'),strength=settings.effectStrength;const base={GOOD:55,GREAT:85,EXCELLENT:125,PERFECT:175}[rank]||140;const mult=strength==='MAX'?1.35:strength==='STANDARD'?.72:1;const colors={GOOD:'#abff4f',GREAT:'#4ce6ff',EXCELLENT:'#ff4fd8',PERFECT:'#ffd75a'};const color=colors[rank]||'#ffd75a';burst.textContent=label;burst.style.color=color;parts.innerHTML='';
    const ring=document.createElement('i');ring.className='ring';ring.style.color=color;parts.appendChild(ring);
    for(let i=0;i<base*mult;i++){const p=document.createElement('i'),angle=Math.random()*Math.PI*2,dist=80+Math.random()*Math.max(innerWidth,innerHeight)*.75;p.className='particle';p.style.cssText=`--x:${Math.cos(angle)*dist}px;--y:${Math.sin(angle)*dist}px;--s:${3+Math.random()*9}px;--d:${.55+Math.random()*.7}s;--r:${Math.random()*180}deg;--c:${[color,'#fff','#6575ff','#ff7ad9'][i%4]}`;parts.appendChild(p)}
    layer.classList.remove('show');void layer.offsetWidth;layer.classList.add('show');document.body.classList.add('screen-shake');if(navigator.vibrate)navigator.vibrate(rank==='PERFECT'?[35,35,70]:[25,25,35]);setTimeout(()=>{layer.classList.remove('show');document.body.classList.remove('screen-shake')},1150)
  }
  function speak(text){if(!settings.ttsEnabled){toast('設定で読み上げがOFFです');return}if(!('speechSynthesis'in window)){toast('この端末では読み上げを利用できません');return}stopSpeech();const u=new SpeechSynthesisUtterance(text.replace(/\{\{\d\}\}/g,' blank '));u.lang='en-US';u.rate=Number(settings.ttsRate);const voices=speechSynthesis.getVoices();const selected=voices.find(v=>v.name===settings.voice);if(selected)u.voice=selected;u.onerror=()=>toast('読み上げを開始できませんでした');speechSynthesis.speak(u)}
  function currentSentence(){const answer=state.doc.questions[state.q].options[state.doc.questions[state.q].answer];const filled=state.doc.body.replace(`{{${state.q}}}`,answer).split(/(?<=[.!?])\s+/);return filled.find(s=>s.includes(answer))||answer}

  function renderStats(){
    const h=state.history,total=h.length,correct=h.filter(x=>x.correct).length,avg=total?h.reduce((s,x)=>s+x.seconds,0)/total:0,recent=h.slice(-40),recentOk=recent.filter(x=>x.correct).length;
    $('#statsOverview').innerHTML=[['総回答数',total],['総正答率',total?`${Math.round(correct/total*100)}%`:'—'],['直近40問',recent.length?`${Math.round(recentOk/recent.length*100)}%`:'—'],['平均回答時間',total?`${avg.toFixed(1)}秒`:'—']].map(([a,b])=>`<div class="stat-tile"><strong>${b}</strong><span>${a}</span></div>`).join('');
    renderBars('#rankStats',['GOOD','GREAT','EXCELLENT','PERFECT'].map(k=>({label:k,value:h.filter(x=>x.rank===k).length,total:Math.max(1,correct),text:`${h.filter(x=>x.rank===k).length}`})));
    const types=[...new Set(DATA.documents.flatMap(d=>d.questions.map(q=>q.type)))];renderBars('#typeStats',types.map(t=>metric(t,h.filter(x=>x.type===t))));
    renderBars('#levelStats',['600–699','700–799','800–900'].map(t=>metric(t,h.filter(x=>x.difficulty===t))));
  }
  function metric(label,rows){const ok=rows.filter(x=>x.correct).length;return{label,value:ok,total:rows.length||1,text:rows.length?`${Math.round(ok/rows.length*100)}%`:'—'}}
  function renderBars(sel,rows){$(sel).innerHTML=rows.map(r=>`<div class="bar-row"><span>${escapeHtml(r.label)}</span><div class="bar"><i style="width:${Math.round(r.value/r.total*100)}%"></i></div><b>${r.text}</b></div>`).join('')}
  function renderHome(){const h=state.history,correct=h.filter(x=>x.correct).length;$('#homeAnswered').textContent=h.length;$('#homeAccuracy').textContent=h.length?`${Math.round(correct/h.length*100)}%`:'—';let streak=0;for(let i=h.length-1;i>=0&&h[i].correct;i--)streak++;$('#homeStreak').textContent=streak;$('#timeAttackLabel').textContent=settings.timeLimit}
  function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}

  function bind(){
    $$('.mode-card[data-mode]').forEach(b=>b.addEventListener('click',()=>startMode(b.dataset.mode)));$('#statsBtn').addEventListener('click',()=>showScreen('statsScreen'));$('#settingsBtn').addEventListener('click',()=>showScreen('settingsScreen'));$('#backBtn').addEventListener('click',()=>{renderHome();showScreen('homeScreen')});$('#nextBtn').addEventListener('click',nextQuestion);$('#nextDocumentBtn').addEventListener('click',()=>startDocument(pickDocument()));$('#homeBtn').addEventListener('click',()=>{renderHome();showScreen('homeScreen')});
    $('#speakDocBtn').addEventListener('click',()=>speak(state.doc.body.replace(/\{\{(\d)\}\}/g,(_,i)=>completedAnswer(+i)||'blank')));$('#speakSentenceBtn').addEventListener('click',()=>speak(currentSentence()));$('#speakCompleteBtn').addEventListener('click',()=>speak(state.doc.body.replace(/\{\{(\d)\}\}/g,(_,i)=>state.doc.questions[i].options[state.doc.questions[i].answer])));
    const controls={ttsEnabled:'ttsEnabled',ttsRate:'ttsRate',timeLimit:'timeLimit',timeEffects:'timeEffects',effectStrength:'effectStrength'};Object.entries(controls).forEach(([id,key])=>{const el=$('#'+id);if(el.type==='checkbox')el.checked=!!settings[key];else el.value=settings[key];el.addEventListener('change',()=>{settings[key]=el.type==='checkbox'?el.checked:el.value;saveSettings()})});
    $('#voiceSelect').addEventListener('change',e=>{settings.voice=e.target.value;saveSettings()});$('#copyUrlBtn').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href);toast('コピーしました')}catch{toast('コピーできませんでした')}});$('#persistBtn').addEventListener('click',requestPersistence);$('#clearHistoryBtn').addEventListener('click',async()=>{if(!confirm('学習履歴をすべて削除しますか？'))return;try{await clearHistory();state.history=[];renderStats();toast('学習履歴を削除しました')}catch{toast('削除できませんでした')}});$('#publicUrl').textContent=location.href;
  }
  function loadVoices(){if(!('speechSynthesis'in window))return;const select=$('#voiceSelect'),voices=speechSynthesis.getVoices().filter(v=>/^en[-_]/i.test(v.lang));select.innerHTML='<option value="">端末の標準音声</option>'+voices.map(v=>`<option value="${escapeHtml(v.name)}">${escapeHtml(v.name)} (${v.lang})</option>`).join('');select.value=settings.voice}
  async function requestPersistence(){if(!navigator.storage?.persist){$('#persistStatus').textContent='非対応';return}try{const already=await navigator.storage.persisted();const ok=already||await navigator.storage.persist();$('#persistStatus').textContent=ok?'有効':'未許可';toast(ok?'永続ストレージ：有効':'端末から許可されませんでした')}catch{$('#persistStatus').textContent='確認失敗'}}
  async function init(){bind();saveSettings();loadVoices();if('speechSynthesis'in window)speechSynthesis.onvoiceschanged=loadVoices;try{db=await openDB();state.history=await readHistory()}catch(e){toast('端末保存を初期化できませんでした')}renderHome();if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});if(navigator.storage?.persisted)navigator.storage.persisted().then(ok=>$('#persistStatus').textContent=ok?'有効':'未許可')}
  init();
})();
