'use strict';
// DATABASE LAYER – SQLite (built-in node:sqlite, no native build needed). Tables: UserProfiles, VocabularyUnits, Vocabulary, ProgressLogs, PronunciationScores, Recordings
const {DatabaseSync}=require('node:sqlite'),path=require('path'),fs=require('fs');
const db=new DatabaseSync(process.env.DB_FILE||path.join(__dirname,'bhashabuddy.db'));
db.exec(`PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS UserProfiles(id INTEGER PRIMARY KEY,name TEXT UNIQUE NOT NULL,language TEXT DEFAULT 'en',created TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS VocabularyUnits(name TEXT PRIMARY KEY,info TEXT);
CREATE TABLE IF NOT EXISTS Vocabulary(word TEXT PRIMARY KEY,unit TEXT REFERENCES VocabularyUnits(name),phonetic TEXT,definition TEXT,te TEXT,hi TEXT,ta TEXT,example TEXT,emoji TEXT);
CREATE TABLE IF NOT EXISTS ProgressLogs(user_id INTEGER,word TEXT,day TEXT,PRIMARY KEY(user_id,word,day));
CREATE TABLE IF NOT EXISTS PronunciationScores(user_id INTEGER,word TEXT,best INTEGER,attempts INTEGER DEFAULT 1,PRIMARY KEY(user_id,word));
CREATE TABLE IF NOT EXISTS Recordings(id INTEGER PRIMARY KEY,word TEXT,mime TEXT,audio BLOB,votes INTEGER DEFAULT 0,created TEXT DEFAULT CURRENT_TIMESTAMP);`);


// Seed the bilingual word repository from the shared dataset (public/data.js) on first run
if(db.prepare('SELECT COUNT(*) c FROM Vocabulary').get().c===0){
  const src=fs.readFileSync(path.join(__dirname,'..','public','data.js'),'utf8');
  const {vocabulary,UNIT_INFO}=new Function(src+'\nreturn {vocabulary,UNIT_INFO}')();
  const unit=db.prepare('INSERT OR REPLACE INTO VocabularyUnits VALUES(?,?)'),word=db.prepare('INSERT OR REPLACE INTO Vocabulary VALUES(?,?,?,?,?,?,?,?,?)');
  db.exec('BEGIN');
  for(const [n,i] of Object.entries(UNIT_INFO))unit.run(n,JSON.stringify(i));
  for(const x of vocabulary)word.run(x.word,x.unit,x.phonetic,x.definition,x.translations.te,x.translations.hi,x.translations.ta,x.example,x.emoji);
  db.exec('COMMIT');
}

exports.vocabulary=()=>db.prepare('SELECT * FROM Vocabulary ORDER BY rowid').all().map(r=>({word:r.word,unit:r.unit,phonetic:r.phonetic,definition:r.definition,translations:{te:r.te,hi:r.hi,ta:r.ta},example:r.example,emoji:r.emoji}));
exports.hasWord=w=>!!db.prepare('SELECT 1 FROM Vocabulary WHERE word=?').get(w);
exports.user=id=>db.prepare('SELECT id,name,language FROM UserProfiles WHERE id=?').get(id);
exports.upsertUser=(name,lang)=>{db.prepare('INSERT INTO UserProfiles(name,language) VALUES(?,?) ON CONFLICT(name) DO UPDATE SET language=excluded.language').run(name,lang);return db.prepare('SELECT id,name,language FROM UserProfiles WHERE name=?').get(name)};
exports.logProgress=(uid,word,day)=>db.prepare('INSERT OR IGNORE INTO ProgressLogs VALUES(?,?,?)').run(uid,word,day);
exports.saveScore=(uid,word,score)=>db.prepare('INSERT INTO PronunciationScores(user_id,word,best) VALUES(?,?,?) ON CONFLICT(user_id,word) DO UPDATE SET best=MAX(best,excluded.best),attempts=attempts+1').run(uid,word,score);
exports.progress=uid=>{const daily={},learned=new Set(),scores={};for(const r of db.prepare('SELECT word,day FROM ProgressLogs WHERE user_id=?').all(uid)){(daily[r.day]=daily[r.day]||[]).push(r.word);learned.add(r.word)}for(const r of db.prepare('SELECT word,best FROM PronunciationScores WHERE user_id=?').all(uid))scores[r.word]=r.best;return{learned:[...learned],daily,scores}};
exports.addRecording=(word,mime,buf)=>Number(db.prepare('INSERT INTO Recordings(word,mime,audio) VALUES(?,?,?)').run(word,mime,buf).lastInsertRowid);
exports.recordings=word=>db.prepare('SELECT id,votes FROM Recordings WHERE word=? ORDER BY votes DESC,id DESC LIMIT 20').all(word);
exports.recording=id=>db.prepare('SELECT mime,audio FROM Recordings WHERE id=?').get(id);
exports.vote=id=>db.prepare('UPDATE Recordings SET votes=votes+1 WHERE id=?').run(id).changes>0;
