// PROGRESS SERVICE – daily goal, streak, mastered words
function logDaily(w){if(!learnedWords.includes(w)){learnedWords.push(w);save('bbLearned',learnedWords)}const today=new Date().toLocaleDateString('en-CA'),log=load('bbDaily',{});log[today]=[...new Set([...(log[today]||[]),w])];save('bbDaily',log);API.sync('/progress',{word:w,day:today});updateProgress()}

function markLearned(){const w=vocabulary[currentIndex].word;logDaily(w);wordNumber.textContent='✓ '+t('learnedMsg').replace('{w}',w)}

function updateProgress(){const today=new Date().toLocaleDateString('en-CA'),log=load('bbDaily',{}),count=(log[today]||[]).length;learnedCount.textContent=learnedWords.length;dailyCount.textContent=Math.min(count,5)+'/5';progressText.textContent=t('progressTxt').replace('{n}',Math.min(count,5));progressBar.style.width=Math.min(count/5*100,100)+'%';let streak=0,d=new Date();if(!(log[d.toLocaleDateString('en-CA')]||[]).length)d.setDate(d.getDate()-1);while(true){const key=d.toLocaleDateString('en-CA');if((log[key]||[]).length){streak++;d.setDate(d.getDate()-1)}else break;}document.getElementById('streak').textContent=streak;}

