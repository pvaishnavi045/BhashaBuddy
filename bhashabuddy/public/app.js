// UI LAYER – navigation, language switching, event delegation (no inline handlers, CSP-safe)
function showSection(id){document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));document.getElementById(id).classList.add('active');if(id==='challenge')renderPeerList()}

function setLanguage(lang){language=lang;save('bbLanguage',lang);document.querySelectorAll('[data-i18n]').forEach(el=>{const k=el.dataset.i18n;if(t(k))el.textContent=t(k)});document.documentElement.lang=lang;searchWord.placeholder=t('searchPh');chatInput.placeholder=t('chatPh');typedWord.placeholder=t('typeHint');displayWord();displayQuestion();renderPictures();updateProgress();}
const ACTIONS={showSection,speakWord,markLearned,nextWord,startListening,speakPracticeWord,previousPracticeWord,nextPracticeWord,checkTyped,checkAnswer,nextQuestion,restartQuiz,sendChat,recordPeer,playPeer,upvotePeer,selectWord,speakText,setLanguage,filterUnit,searchVocabulary,sharePeer,playRemote,voteRemote};
const parseArgs=a=>a.trim()?a.split(',').map(x=>{x=x.trim().replace(/^'|'$/g,'');return/^\d+$/.test(x)?Number(x):x}):[];
document.addEventListener('click',e=>{const el=e.target.closest('[data-on]'),m=el&&/^(\w+)\((.*)\)$/.exec(el.dataset.on);if(m&&ACTIONS[m[1]])ACTIONS[m[1]](...parseArgs(m[2]))});
['change','input'].forEach(ev=>document.addEventListener(ev,e=>{const n=e.target.dataset&&e.target.dataset['on'+ev];if(n&&ACTIONS[n])ACTIONS[n](e.target.value)}));
if('serviceWorker'in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').then(()=>offlineStatus.textContent='Offline app shell is ready after the first visit.').catch(()=>offlineStatus.textContent='Offline mode is unavailable in this browser.'))}
document.addEventListener('DOMContentLoaded',()=>{const profile=ensureProfile();API.user?API.init():API.login(profile.name);languageSelect.value=language;setLanguage(language);displayWord();updateProgress();displayPracticeWord();renderPictures()});

// Load the bilingual word repository from the server (SQLite). data.js stays as the offline fallback.
document.addEventListener('DOMContentLoaded',async()=>{const v=await API.call('/vocabulary');if(Array.isArray(v)&&v.length){vocabulary.splice(0,vocabulary.length,...v);displayWord();displayPracticeWord();renderPictures();makeQuiz(true)}});
