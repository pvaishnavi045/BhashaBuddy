// QUIZ SERVICE – daily seeded quiz, meaning + fill-in-the-blank, weak-word revision
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let z=Math.imul(seed^seed>>>15,1|seed);z=z+Math.imul(z^z>>>7,61|z)^z;return((z^z>>>14)>>>0)/4294967296}}

function makeQuiz(daily){const today=new Date().toLocaleDateString('en-CA'),r=daily?rng([...today].reduce((a,c)=>a*31+c.charCodeAt(0)|0,7)):Math.random,shuf=a=>[...a].sort(()=>r()-.5);quizSet=shuf(vocabulary).slice(0,10).map((x,n)=>{const opts=shuf([x,...shuf(vocabulary.filter(y=>y!==x)).slice(0,3)]);return{x,blank:n%2===1&&new RegExp(x.word,'i').test(x.example),options:opts,answer:opts.indexOf(x)}});questionIndex=0;quizPoints=0;answered=false;displayQuestion()}


function displayQuestion(){if(!quizSet.length){makeQuiz(true);return}if(questionIndex>=quizSet.length)return;const q=quizSet[questionIndex],x=q.x;question.textContent=q.blank?t('fillBlank')+' “'+x.example.replace(new RegExp(x.word,'i'),'_____')+'”':t('whichWord')+' “'+x.definition+'”';quizProgress.textContent=t('qOf').replace('{n}',questionIndex+1).replace('{m}',quizSet.length);options.innerHTML=q.options.map((o,i)=>`<button data-on="checkAnswer(${i})">${String.fromCharCode(65+i)}. ${esc(o.word)}${translation(o)?' – '+esc(translation(o)):''}</button>`).join('');quizFeedback.textContent='';quizScore.textContent=t('score')+' '+quizPoints;answered=false}

function checkAnswer(i){if(answered)return;answered=true;const q=quizSet[questionIndex];if(i===q.answer){quizPoints++;quizFeedback.textContent='✅ '+t('correct')+' '+q.x.definition}else quizFeedback.textContent='❌ '+t('correctAns')+' '+q.x.word+'. '+q.x.definition;quizScore.textContent=t('score')+' '+quizPoints;[...options.querySelectorAll('button')][i].style.outline='2px solid #ffe66d'}

function nextQuestion(){if(!answered){quizFeedback.textContent=t('pickFirst');return}questionIndex++;if(questionIndex>=quizSet.length){question.textContent=t('quizDone');options.innerHTML='';quizProgress.textContent='';quizFeedback.textContent=t('finalScore')+' '+quizPoints+' / '+quizSet.length;quizScore.textContent=t('finalScore')+' '+quizPoints;return}displayQuestion()}

function restartQuiz(){makeQuiz(false)}
