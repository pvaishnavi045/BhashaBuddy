// VOCABULARY VIEW – flashcards, search, unit filter
function translation(item){return item.translations[language]||''}

function tier(x){return t({'Basics':'easy','Professional Skills':'easy','Programming':'medium','Computer Systems':'medium'}[x.unit]||'hard')}
function displayWord(){const x=vocabulary[currentIndex],rg=REGIONAL[x.word],ix={te:0,hi:2,ta:4}[language];word.textContent=x.word;phonetic.textContent=x.phonetic+(rg&&ix!==undefined?' · '+rg[ix+1]:'');definition.textContent=x.definition;translationEl.textContent=translation(x);example.textContent=t('exampleLbl')+': '+x.example;unitInfo.textContent=(UNIT_INFO[x.unit]||{})[language]||'';regionalDef.textContent=rg&&ix!==undefined?rg[ix]:'';wordUnit.textContent=x.unit+' · '+tier(x);wordNumber.textContent=t('wordOf').replace('{n}',currentIndex+1).replace('{m}',vocabulary.length);}
const translationEl=document.getElementById('translation');
function nextWord(){currentIndex=(currentIndex+1)%vocabulary.length;displayWord()}

function searchVocabulary(){const q=searchWord.value.trim().slice(0,40).toLowerCase();const results=vocabulary.map((x,i)=>({...x,i})).filter(x=>x.word.toLowerCase().includes(q)||x.definition.toLowerCase().includes(q)||translation(x).toLowerCase().includes(q));searchResults.innerHTML=results.map(x=>`<p class="search-item" data-on="selectWord(${x.i})"><strong>${esc(x.word)}</strong> – ${esc(x.definition)}</p>`).join('')||'<p>'+t('noMatch')+'</p>'}

function selectWord(i){currentIndex=i;displayWord();searchResults.innerHTML=''}

function filterUnit(){const unit=unitFilter.value;const i=vocabulary.findIndex((x,n)=>n>=0&&(unit==='all'||x.unit===unit));if(i>=0){currentIndex=i;displayWord()}const words=vocabulary.map((x,n)=>({...x,i:n})).filter(x=>unit==='all'||x.unit===unit);searchResults.innerHTML=words.map(x=>`<p class="search-item" data-on="selectWord(${x.i})"><strong>${esc(x.word)}</strong> · ${esc(x.unit)}</p>`).join('')}
