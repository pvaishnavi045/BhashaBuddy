// STORAGE LAYER – safe localStorage access, validation, profile (UserProfiles / ProgressLogs / PronunciationScores)
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}}
function load(k,d){try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}}
let language=load('bbLanguage','en'),currentIndex=0,practiceIndex=0,questionIndex=0,quizPoints=0,answered=false,quizSet=[],recording=null,mediaRecorder=null,recordedChunks=[],votes=0;
let learnedWords=load('bbLearned',[]);if(!Array.isArray(learnedWords))learnedWords=[];
// UserProfile is created automatically (anonymous id) the first time the app runs
function ensureProfile(){let p=load('bbProfile',null);if(!p||!p.name){p={name:'Student-'+[...crypto.getRandomValues(new Uint8Array(4))].map(b=>b.toString(16).padStart(2,'0')).join(''),created:new Date().toISOString()};save('bbProfile',p)}return p}
