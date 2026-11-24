// API CLIENT – talks to the Express/SQLite server when it is running.
// On static hosting or offline every call quietly returns null and the app keeps working from localStorage.
const API={user:load('bbUserId',null),
async call(path,method='GET',body){try{const r=await fetch('/api'+path,{method,headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});return r.ok?await r.json():null}catch(e){return null}},
sync(path,body){if(this.user)this.call(path,'POST',{...body,user:this.user})},
async login(name){const u=await this.call('/users','POST',{name,language});if(!u)return;this.user=u.id;save('bbUserId',u.id);await this.init()},
async init(){if(!this.user)return;const p=await this.call('/progress/'+this.user);if(!p)return;p.learned.forEach(w=>{if(!learnedWords.includes(w))learnedWords.push(w)});save('bbLearned',learnedWords);const d=load('bbDaily',{});for(const k in p.daily)d[k]=[...new Set([...(d[k]||[]),...p.daily[k]])];save('bbDaily',d);const sc=load('bbScores',{});for(const w in p.scores)sc[w]=Math.max(sc[w]||0,p.scores[w]);save('bbScores',sc);updateProgress()}};
