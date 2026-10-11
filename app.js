'use strict';
const $ = s => document.querySelector(s);
const fmt = n => Number.isFinite(n) ? Number(n.toFixed(2)).toLocaleString('en-US',{maximumFractionDigits:2}) : '—';
const balls = overs => {const [whole,part='0']=String(overs||'0.0').split('.');const o=Number(whole),p=Number(part); if(!Number.isInteger(o)||!Number.isInteger(p)||p<0||p>5)throw Error('Overs must be in cricket notation such as 3.4');return o*6+p};
const safe = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let players=[],matches=[],records=[],fixtures=[],stats=[];
function aggregate(){return players.map(p=>{const entries=records.filter(r=>r.playerId===p.id);const sum=k=>entries.reduce((s,r)=>s+Number(r[k]||0),0);const b=entries.reduce((s,r)=>s+balls(r.overs),0);const runs=sum('runs'),ballsFaced=sum('balls'),outs=entries.filter(r=>r.dismissed===true).length;return {...p,matches:new Set(entries.map(r=>r.matchId)).size,innings:entries.length,runs,ballsFaced,outs,fours:sum('fours'),sixes:sum('sixes'),wickets:sum('wickets'),catches:sum('catches'),runOuts:sum('runOuts'),stumpings:sum('stumpings'),conceded:sum('runsConceded'),bowlBalls:b,strikeRate:ballsFaced?runs/ballsFaced*100:null,average:outs?runs/outs:null,economy:b?sum('runsConceded')*6/b:null};});}
function leaders(key){return [...stats].filter(p=>key!=='strikeRate'||p.ballsFaced>=10).filter(p=>key!=='economy'||p.bowlBalls>=6).sort((a,b)=>{const aa=a[key]??(key==='economy'?Infinity:-Infinity),bb=b[key]??(key==='economy'?Infinity:-Infinity);return (key==='economy'?aa-bb:bb-aa)||b.runs-a.runs||a.name.localeCompare(b.name)});}
function render(){let total=key=>stats.reduce((s,p)=>s+p[key],0);const played=matches.length,won=matches.filter(m=>/^won\b/i.test(m.result)).length;$('#metrics').innerHTML=[['Matches played',played,'Completed fixtures'],['Total runs',total('runs'),'Recorded player runs'],['Wickets taken',total('wickets'),'Bowling wickets'],['Wins',won,played?fmt(won/played*100)+'% win rate':'No matches yet']].map(([k,v,h])=>`<div class="metric"><div class="lbl">${k}</div><div class="num">${fmt(v)}</div><div class="hint">${h}</div></div>`).join('');renderLeaders();const now=new Date(),today=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;$('#fixtures').innerHTML=fixtures.filter(f=>f.date>=today).sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time)).map(f=>{const date=new Date(`${f.date}T12:00:00`),[hour,minute]=f.time.split(':').map(Number),time=new Date(2000,0,1,hour,minute).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});return `<div class="match"><div class="match-top"><span>Madison Panthers</span><small>${safe(date.toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'}))}</small></div><div class="match-score">${safe(time)}</div><small>${safe(f.opponent||'Opponent to be confirmed')} · ${safe(f.venue||'Venue to be confirmed')}</small></div>`;}).join('')||'<p style="padding:20px">No upcoming games scheduled.</p>';$('#matches').innerHTML=matches.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(m=>`<div class="match"><div class="match-top"><span>Panthers vs ${safe(m.opponent)}</span><small>${safe(m.date)}</small></div><div class="match-score">Panthers ${safe(m.runsFor)}/${safe(m.wicketsFor)} (${safe(m.oversFor)}) · ${safe(m.opponent)} ${safe(m.runsAgainst)}/${safe(m.wicketsAgainst)} (${safe(m.oversAgainst)})</div><div class="${/^won\b/i.test(m.result)?'win':'loss'}">${safe(m.result)}</div><small>${safe(m.venue||'')}</small></div>`).join('')||'<p style="padding:20px">No matches yet.</p>';$('#updated').textContent='Includes '+matches.length+' recorded matches';}
function renderLeaders(){const key=$('#metric').value;const label=$('#metric').selectedOptions[0].textContent;$('#metric-name').textContent=label;$('#leaderboard').innerHTML=leaders(key).map((p,i)=>`<tr><td class="rank">${i+1}</td><td>${safe(p.name)}</td><td>${p[key]===null?'—':fmt(p[key])}</td><td>${p.matches}</td></tr>`).join('');}
const output=(key,n=3,lowest=false)=>{const arr=leaders(key).filter(p=>p[key]!==null && p[key]!==undefined && (lowest?p.bowlBalls>0:p[key]>0));if(!arr.length)return 'No qualifying statistics have been recorded yet.';return arr.slice(0,n).map((p,i)=>`${i+1}. ${p.name}: ${fmt(p[key])}${key==='strikeRate'?' SR':key==='economy'?' economy':''}`).join('\n');};
const normalizeQuestion=value=>String(value).toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const chatMetric=q=>{
if(/strike rate|scoring rate|fastest scoring/.test(q))return {key:'strikeRate',label:'batting strike rate',suffix:' SR'};
if(/average/.test(q))return {key:'average',label:'batting average',suffix:''};
if(/economy|economical/.test(q))return {key:'economy',label:'bowling economy',suffix:' economy',lowest:true};
if(/run outs?/.test(q))return {key:'runOuts',label:'run outs',suffix:''};
if(/stumpings?/.test(q))return {key:'stumpings',label:'stumpings',suffix:''};
if(/catches|catchers?|fielding/.test(q))return {key:'catches',label:'catches',suffix:''};
if(/sixes|six/.test(q))return {key:'sixes',label:'sixes',suffix:''};
if(/fours|four/.test(q))return {key:'fours',label:'fours',suffix:''};
if(/runs conceded/.test(q))return {key:'conceded',label:'runs conceded',suffix:''};
if(/wickets?|bowling|bowler/.test(q))return {key:'wickets',label:'wickets',suffix:''};
if(/runs?|batting|batter|scor/.test(q))return {key:'runs',label:'runs',suffix:''};
return null;
};
function answer(raw){
const q=normalizeQuestion(raw),paddedQ=` ${q} `,metric=chatMetric(q);
const namedPlayers=stats.filter(p=>paddedQ.includes(` ${normalizeQuestion(p.name)} `)).sort((a,b)=>b.name.length-a.name.length);
const compare=/\b(compare|versus|vs)\b/.test(q)||(namedPlayers.length>1&&/\b(who|more|higher|better)\b/.test(q));
if(compare&&namedPlayers.length>1){
const keys=metric?[metric.key]:['runs','wickets','strikeRate','average'];
return `Player comparison${metric?` · ${metric.label}`:''}:\n`+namedPlayers.slice(0,2).map(p=>`${p.name}: ${keys.map(key=>`${key==='strikeRate'?'strike rate':key==='average'?'average':key} ${fmt(p[key])}${key==='strikeRate'?' SR':''}`).join(' · ')}`).join('\n');
}
const player=namedPlayers[0];
if(player){
if(/highest score|best score|top score|highest innings/.test(q)){
const best=records.filter(r=>r.playerId===player.id).sort((a,b)=>b.runs-a.runs)[0];
const match=best&&matches.find(m=>m.id===best.matchId);
return best?`${player.name}'s highest recorded innings was ${best.runs} runs${match?` against ${match.opponent} on ${match.date}`:''}.`:`No innings have been recorded for ${player.name} yet.`;
}
if(metric)return player.matches?`${player.name}: ${fmt(player[metric.key])}${metric.suffix} ${metric.label}.`:`No recorded ${metric.label} for ${player.name} yet.`;
return `${player.name} — ${player.matches} recorded matches\n🏏 ${player.runs} runs from ${player.ballsFaced} balls; batting average ${fmt(player.average)}, strike rate ${fmt(player.strikeRate)}\n🎯 ${player.wickets} wickets; bowling economy ${fmt(player.economy)}\n🙌 ${player.catches} catches, ${player.runOuts} run outs, ${player.stumpings} stumpings.`;
}
const sortedMatches=matches.slice().sort((a,b)=>b.date.localeCompare(a.date));
const namedMatch=sortedMatches.find(m=>paddedQ.includes(` ${normalizeQuestion(m.opponent)} `));
const latestMatch=/\b(latest|last|recent) match\b/.test(q)?sortedMatches[0]:null;
const selectedMatch=namedMatch||latestMatch;
if(selectedMatch){
return `${selectedMatch.date}: Panthers ${selectedMatch.runsFor}/${selectedMatch.wicketsFor} (${selectedMatch.oversFor}) vs ${selectedMatch.opponent} ${selectedMatch.runsAgainst}/${selectedMatch.wicketsAgainst} (${selectedMatch.oversAgainst}).\n${selectedMatch.result}${selectedMatch.venue?` · ${selectedMatch.venue}`:''}.`;
}
if(/summary|overview|team stats?/.test(q)){
const wins=matches.filter(m=>/^won\b/i.test(m.result)).length;
const losses=matches.filter(m=>/^lost\b/i.test(m.result)).length;
return `Team summary: ${matches.length} matches (${wins} won, ${losses} lost); ${stats.reduce((a,p)=>a+p.runs,0)} recorded player runs, ${stats.reduce((a,p)=>a+p.wickets,0)} wickets and ${stats.reduce((a,p)=>a+p.catches,0)} catches.\nLeading run scorer: ${output('runs',1)}\nLeading wicket taker: ${output('wickets',1)}`;
}
if(metric){
const list=leaders(metric.key).filter(p=>p[metric.key]!==null&&p[metric.key]!==undefined&&(metric.key==='economy'?p.bowlBalls>=6:metric.key==='strikeRate'?p.ballsFaced>=10:p[metric.key]>0));
if(!list.length)return `No qualifying ${metric.label} have been recorded yet.`;
const heading=metric.lowest?'Best':metric.key==='average'||metric.key==='strikeRate'?'Highest':'Most';
return `${heading} ${metric.label}${metric.key==='strikeRate'?' (minimum 10 balls faced)':metric.key==='average'?' (dismissed at least once)':metric.lowest?' (minimum 1 over)':''}:\n`+list.slice(0,3).map((p,i)=>`${i+1}. ${p.name}: ${fmt(p[metric.key])}${metric.suffix}`).join('\n');
}
if(/match|result|win|loss|won|lost|fixture/.test(q)){
const wins=matches.filter(m=>/^won\b/i.test(m.result)).length;
const losses=matches.filter(m=>/^lost\b/i.test(m.result)).length;
return `The Panthers have ${matches.length} recorded matches: ${wins} won and ${losses} lost.${sortedMatches[0]?`\nLatest result (${sortedMatches[0].date}): ${sortedMatches[0].result}.`:''}`;
}
return 'I can answer questions about player stats, top performers, head-to-head comparisons, team summaries and match scorecards. Try “Compare PK and Dhananjaya on runs” or “What was the latest match score?”';
}
function say(msg,who){const el=document.createElement('div');el.className='bubble '+who;el.textContent=msg;$('#messages').appendChild(el);$('#messages').scrollTop=$('#messages').scrollHeight;}
function ask(q){if(!q.trim())return;say(q,'user');say(answer(q),'bot');}
async function init(){try{const paths=['data/players.json','data/matches.json','data/performances.json','data/fixtures.json'];[players,matches,records,fixtures]=await Promise.all(paths.map(p=>fetch(p).then(r=>{if(!r.ok)throw Error(p);return r.json()})));const ids=new Set(players.map(p=>p.id)),mids=new Set(matches.map(m=>m.id));for(const r of records){if(!ids.has(r.playerId)||!mids.has(r.matchId))throw Error('Unknown playerId or matchId in performances');balls(r.overs);}stats=aggregate();render();}catch(e){$('#metrics').innerHTML='<div class="metric">Unable to load data. Use a local web server (see README), not file://. '+safe(e.message)+'</div>';console.error(e);}}
$('#metric').addEventListener('change',()=>stats.length&&renderLeaders());$('#chat-form').addEventListener('submit',e=>{e.preventDefault();ask($('#question').value);$('#question').value='';});document.querySelectorAll('[data-q]').forEach(b=>b.addEventListener('click',()=>ask(b.dataset.q)));init();
