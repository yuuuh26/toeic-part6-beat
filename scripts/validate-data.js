const fs=require('fs'),vm=require('vm');
const context={window:{}};vm.createContext(context);vm.runInContext(fs.readFileSync('data.js','utf8'),context);
const data=context.window.PART6_DATA,errors=[];
if(!data)errors.push('PART6_DATA is missing');
if(data.documents.length!==80)errors.push(`Expected 80 documents, got ${data.documents.length}`);
const ids=new Set(),qids=new Set();
data.documents.forEach((d,i)=>{
  if(ids.has(d.id))errors.push(`Duplicate document ID ${d.id}`);ids.add(d.id);
  if(d.questions.length!==4)errors.push(`${d.id}: expected 4 questions`);
  d.questions.forEach((q,n)=>{if(qids.has(q.id))errors.push(`Duplicate question ID ${q.id}`);qids.add(q.id);if(q.options.length!==4)errors.push(`${q.id}: expected 4 options`);if(q.answer<0||q.answer>3)errors.push(`${q.id}: invalid answer`);if(!d.body.includes(`{{${n}}}`))errors.push(`${q.id}: blank not found`);if(!q.explanation)errors.push(`${q.id}: explanation missing`)});
});
const dist=data.documents.reduce((m,d)=>(m[d.difficulty]=(m[d.difficulty]||0)+d.questions.length,m),{});
if(dist['600–699']!==60||dist['700–799']!==100||dist['800–900']!==160)errors.push(`Difficulty distribution invalid: ${JSON.stringify(dist)}`);
const letters=[0,0,0,0];data.documents.forEach(d=>d.questions.forEach(q=>letters[q.answer]++));
if(Math.max(...letters)-Math.min(...letters)>1)errors.push(`Correct-answer positions are unbalanced: ${letters}`);
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`PASS: ${data.documents.length} documents, ${qids.size} questions, distribution ${JSON.stringify(dist)}, answers ${letters.join('/')}`);
