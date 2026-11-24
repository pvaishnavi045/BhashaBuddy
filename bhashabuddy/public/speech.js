// SPEECH SERVICE – text-to-speech, speech recognition, Levenshtein scoring
function speakText(text){if(!('speechSynthesis'in window)){alert('Text-to-speech is not supported in this browser.');return}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=.85;speechSynthesis.speak(u)}

function speakWord(){const x=vocabulary[currentIndex];speakText(x.word+'. '+x.definition+'. '+x.example)}

function displayPracticeWord(){practiceWord.textContent=vocabulary[practiceIndex].word;peerWord.textContent=vocabulary[practiceIndex].word;speechResult.textContent=t('said')+' ---';score.textContent=t('score')+' --';feedback.textContent=t('pronHelp')}

function nextPracticeWord(){practiceIndex=(practiceIndex+1)%vocabulary.length;displayPracticeWord()}

function previousPracticeWord(){practiceIndex=(practiceIndex-1+vocabulary.length)%vocabulary.length;displayPracticeWord()}

function speakPracticeWord(){speakText(vocabulary[practiceIndex].word)}

function dist(a,b){a=a.toLowerCase().replace(/[^a-z0-9 ]/g,'').trim();b=b.toLowerCase().trim();let p=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){let c=[i];for(let j=1;j<=b.length;j++)c[j]=Math.min(c[j-1]+1,p[j]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));p=c}return p[b.length]}

function evaluate(cands){const expected=vocabulary[practiceIndex].word;let best=0,bestDist=99,shown=cands[0]||'';cands.forEach(c=>[c,...c.split(/\s+/)].forEach(w=>{const v=similarity(w,expected),d=dist(w,expected);if(v>best){best=v;shown=c}if(d<bestDist)bestDist=d}));const ok=best>=75||(bestDist<=2&&expected.length>4),value=ok?Math.max(best,75):best;speechResult.textContent=t('said')+' '+shown;score.textContent=t('match')+' '+value+'%';feedback.textContent=ok?'🎉 '+t('excellent'):t('tryAgain');if(ok)logDaily(expected);const sc=load('bbScores',{});sc[expected]=Math.max(sc[expected]||0,value);save('bbScores',sc);API.sync('/scores',{word:expected,score:value})}

function startListening(){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){feedback.textContent=t('noSR');fallbackBox.hidden=false;return}const rec=new SR();rec.lang='en-IN';rec.maxAlternatives=5;rec.continuous=false;feedback.textContent=t('listening');rec.onresult=e=>evaluate([...e.results[0]].map(r=>r.transcript.trim()));rec.onerror=e=>{const m={'no-speech':'noSpeech','not-allowed':'micDenied','service-not-allowed':'micDenied','audio-capture':'noMic','network':'netErr'};feedback.textContent=t(m[e.error]||'micError');fallbackBox.hidden=false};try{rec.start()}catch(err){feedback.textContent=t('micError')}}

function checkTyped(){const v=typedWord.value.trim();if(v)evaluate([v])}

function similarity(a,b){a=a.toLowerCase().replace(/[^a-z0-9 ]/g,'').trim();return Math.max(0,Math.round((1-dist(a,b)/Math.max(a.length,b.length,1))*100))}
