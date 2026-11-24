'use strict';
// API LAYER – Express REST API + static hosting of /public
const express=require('express'),path=require('path'),db=require('./db'),match=require('./match');
const app=express(),PORT=process.env.PORT||3000;
app.disable('x-powered-by');
app.use(express.json({limit:'10kb'}));

// tiny in-memory rate limiter: 200 requests / minute / IP
const hits=new Map();
app.use('/api',(req,res,next)=>{const now=Date.now(),h=(hits.get(req.ip)||[]).filter(t=>now-t<60000);h.push(now);hits.set(req.ip,h);h.length>200?res.status(429).json({error:'Too many requests'}):next()});

const bad=(res,msg)=>res.status(400).json({error:msg});
const isWord=w=>typeof w==='string'&&w.length<=40&&db.hasWord(w);
const isDay=d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d);
const userOf=v=>db.user(Number(v));

// Levenshtein distance for transcript matching
const authed=(req,uid)=>!!userOf(uid);

app.get('/api/health',(req,res)=>res.json({ok:true}));
app.get('/api/vocabulary',(req,res)=>res.json(db.vocabulary()));

app.post('/api/users',(req,res)=>{const name=String(req.body.name||'').trim().replace(/[<>&"']/g,''),language=['en','te','hi','ta'].includes(req.body.language)?req.body.language:'en';if(!name||name.length>30)return bad(res,'Invalid name');res.json(db.upsertUser(name,language))});

app.post('/api/progress',(req,res)=>{const{user,word,day}=req.body;if(!authed(req,user))return res.status(401).json({error:'Login required'});if(!isWord(word)||!isDay(day))return bad(res,'Invalid progress entry');db.logProgress(Number(user),word,day);res.json({ok:true})});
app.get('/api/progress/:user',(req,res)=>{if(!authed(req,req.params.user))return res.status(401).json({error:'Login required'});res.json(db.progress(Number(req.params.user)))});

app.post('/api/scores',(req,res)=>{const{user,word,score}=req.body;if(!authed(req,user))return res.status(401).json({error:'Login required'});if(!isWord(word)||!Number.isInteger(score)||score<0||score>100)return bad(res,'Invalid score');db.saveScore(Number(user),word,score);res.json({ok:true})});

// audio transcript matching: compares what the speech API heard with the target word
app.post('/api/match',(req,res)=>{const{spoken,word}=req.body;if(typeof spoken!=='string'||spoken.length>100||!isWord(word))return bad(res,'Invalid input');res.json({distance:match.dist(spoken,word),score:match.score(spoken,word),match:match.isMatch(spoken,word)})});

// anonymous peer pronunciation recordings
app.post('/api/recordings',express.raw({type:'audio/*',limit:'1mb'}),(req,res)=>{const word=req.query.word;if(!isWord(word)||!Buffer.isBuffer(req.body)||!req.body.length)return bad(res,'Invalid recording');res.json({id:db.addRecording(word,req.headers['content-type'].split(';')[0],req.body)})});
app.get('/api/recordings',(req,res)=>isWord(req.query.word)?res.json(db.recordings(req.query.word)):bad(res,'Invalid word'));
app.get('/api/recordings/:id/audio',(req,res)=>{const r=db.recording(Number(req.params.id));if(!r)return res.status(404).end();res.type(r.mime).send(Buffer.from(r.audio))});
app.post('/api/recordings/:id/vote',(req,res)=>db.vote(Number(req.params.id))?res.json({ok:true}):res.status(404).json({error:'Not found'}));

app.use(express.static(path.join(__dirname,'..','public')));
app.use((err,req,res,next)=>res.status(500).json({error:'Server error'}));
if(require.main===module)app.listen(PORT,()=>console.log('BhashaBuddy running at http://localhost:'+PORT));
module.exports=app;
