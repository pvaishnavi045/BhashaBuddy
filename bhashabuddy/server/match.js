'use strict';
// Levenshtein-based transcript matching (shared by the API and the tests)
function dist(a,b){a=a.toLowerCase().replace(/[^a-z0-9 ]/g,'').trim();b=b.toLowerCase().trim();let p=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){const c=[i];for(let j=1;j<=b.length;j++)c[j]=Math.min(c[j-1]+1,p[j]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));p=c}return p[b.length]}
const score=(s,w)=>Math.max(0,Math.round((1-dist(s,w)/Math.max(s.length,w.length,1))*100));
const isMatch=(s,w)=>score(s,w)>=75||(dist(s,w)<=2&&w.length>4);
module.exports={dist,score,isMatch};
