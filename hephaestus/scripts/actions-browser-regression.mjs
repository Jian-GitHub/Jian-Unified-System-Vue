import { execFileSync } from 'node:child_process'
import assert from 'node:assert/strict'

const cli = (...args) => execFileSync('chrome-devtools', args, { encoding: 'utf8' })
const opened = cli('new_page', 'http://localhost:15173/invoice', '--isolatedContext', `heph-actions-${Date.now()}`)
const id = opened.match(/^(\d+):.*\[selected\]/m)?.[1]
if (!id) throw new Error(opened)
const evaluate = source => {
  const text = cli('evaluate_script', source, '--pageId', id)
  const json = text.match(/```json\n([\s\S]*?)\n```/)
  if (!json) throw new Error(text)
  return JSON.parse(json[1])
}
const settle = () => evaluate('async () => { await new Promise(r => setTimeout(r, 350)); return true }')
const click = label => {
  const snapshot = cli('take_snapshot', id)
  const line = snapshot.split('\n').find(line => line.includes(`button ${JSON.stringify(label)}`) && !line.includes('disabled'))
  assert.ok(line, `Missing enabled button ${label}\n${snapshot}`)
  cli('click', id, line.match(/uid=(\S+)/)[1])
  settle()
}
const route = path => { evaluate(`async () => { await window.__actions.router.push(${JSON.stringify(path)}); return true }`); settle() }
const dialog = answer => {
  const visible = evaluate(`() => { const box=document.querySelector('.el-message-box'); if(!box) return false; const b=box.getBoundingClientRect(); const buttons=[...box.querySelectorAll('button')]; const button=buttons.find(b=>b.textContent.trim()===${JSON.stringify(answer)}); if(!button) return false; const r=button.getBoundingClientRect(); return b.width>200 && b.top>=0 && b.bottom<=innerHeight && button.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)); }`)
  assert.ok(visible, 'Confirmation must be visible in viewport and reachable by pointer')
  click(answer)
}
try {
  evaluate(String(async () => {
    const app = document.querySelector('#app').__vue_app__
    const router = app.config.globalProperties.$router
    const { useSettingsStore } = await import('/src/store/settings.ts')
    useSettingsStore().setLanguage('en')
    const url = performance.getEntriesByType('resource').map(x=>x.name).find(x=>x.includes('/src/api/axiosInstance.ts'))
    const { default: api } = await import(url || '/src/api/axiosInstance.ts')
    const mapping={sheet:'CSV',header_row:1,date_format:'iso',duration_format:'minutes',default_team_size:1,empty_expense_zero:true,columns:[{field:'service_date',column:0},{field:'gross',column:1}],decisions:[]}
    const batch={id:'b1',source_id:'7',version:'1',status:'awaiting_review',selection_hash:'one',error_count:0,row_count:1,sheets:['CSV'],created_at:'2026-09-17',mapping,spreadsheet:'https://docs.google.com/spreadsheets/d/synthetic',range:'Sheet1!A1:J100'}
    const record={id:'r1',version:'1',source_id:'7',overrides:[],archived:false,data:{service_date:'2026-09-17',customer:'Test customer',job_type:'Support',duration_minutes:60,team_size:1,gross_cents:'10000',expense_cents:null}}
    const state=window.__actions={router,requests:[],fail:'',batch,record,created:0}
    api.defaults.adapter=async config=>{
      const {method,url}=config
      const body=typeof config.data==='string'?JSON.parse(config.data):config.data
      state.requests.push({method,url,body})
      if(state.fail && url.endsWith(state.fail)) throw {message:'Request failed',response:{status:409,data:{message:'Fixture conflict: retry required'}}}
      let data
      if(url==='/v1/session') data={owner_id:'actions-fixture',display_name:'Actions',csrf_token:'fixture',expires_at:'2099-01-01T00:00:00Z'}
      else if(url==='/v1/google/status') data={connected:true,bound:true}
      else if(url==='/v1/google/imports') { state.created++; data={...batch,id:'b-new'} }
      else if(url==='/v1/sources' && method==='post') data={id:'8',label:body.label}
      else if(url==='/v1/sources') data={items:[{id:'7',label:'Saved source',kind:'manual_file'}]}
      else if(url==='/v1/sources/7' && method==='delete') data={}
      else if(url==='/v1/imports') data={items:[{...batch}]}
      else if(url.endsWith('/cancel')) {batch.status='cancelled';batch.version='2';data={...batch}}
      else if(url.endsWith('/trash')) {batch.deleted=body.deleted;batch.version=String(Number(batch.version)+1);data={...batch}}
      else if(url.endsWith('/sheet')) data={sheet:'CSV',items:[{row:1,cells:['Date','Wage']},{row:2,cells:['2026-09-17','100.00']}],total:2,next_cursor:''}
      else if(url.endsWith('/rows')) data={items:[{row:2,action:'update',record_id:'r1',expected_version:'1',data:record.data,errors:[]}],next_cursor:''}
      else if(url.endsWith('/mapping')) {batch.mapping=body;batch.version=String(Number(batch.version)+1);batch.selection_hash='new';data={...batch}}
      else if(url.endsWith('/commit')) {batch.status='committed';data={...batch}}
      else if(url.startsWith('/v1/imports/')) data={...batch,id:url.split('/')[3]}
      else if(url==='/v1/work-records') data={items:config.params?.archived==='archived'?!record.archived?[]:[{...record}]:record.archived?[]:[{...record}],next_cursor:''}
      else if(url.endsWith('/revisions')) data={items:[]}
      else if(url.endsWith('/archive')) {record.archived=true;data={...record}}
      else if(url.endsWith('/restore')) {record.archived=false;data={...record}}
      else if(url.includes('/overrides/')) data={...record}
      else if(url.startsWith('/v1/work-records/')) data={...record}
      else throw new Error(`Unhandled ${method} ${url}`)
      return {data,status:200,statusText:'OK',headers:{},config}
    }
    await router.push('/imports')
    return true
  }))
  settle()
  click('Cancel batch'); dialog('Cancel')
  assert.equal(evaluate('() => window.__actions.requests.filter(r=>r.url.endsWith("/cancel")).length'),0)
  evaluate('() => { window.__actions.fail="/cancel"; return true }')
  click('Cancel batch'); dialog('OK')
  assert.match(evaluate('() => document.querySelector("[role=alert]")?.textContent || ""'),/Fixture conflict/)
  evaluate('() => { window.__actions.fail=""; return true }')
  click('Cancel batch'); dialog('OK')
  assert.equal(evaluate('() => window.__actions.batch.status'),'cancelled')
  evaluate('() => { window.__actions.batch.status="committed"; return true }')
  route('/invoice'); route('/imports')
  click('Delete'); dialog('OK')
  assert.equal(evaluate('() => window.__actions.batch.deleted'),true)
  assert.equal(evaluate('() => window.__actions.record.archived'),false)
  evaluate('() => { document.querySelector(".el-switch").click(); return true }'); settle()
  click('Restore'); dialog('OK')
  assert.equal(evaluate('() => window.__actions.batch.deleted'),false)

  evaluate('() => { window.__actions.batch.status="awaiting_review"; return true }')
  route('/imports/b1')
  assert.match(evaluate('() => document.querySelector(".sheet-preview")?.textContent || ""'),/100.00/)
  click('Cancel batch'); dialog('OK')
  assert.equal(evaluate('() => window.__actions.batch.status'),'cancelled')

  route('/records')
  click('Delete'); dialog('Cancel')
  assert.equal(evaluate('() => window.__actions.record.archived'),false)
  click('Delete'); dialog('OK')
  assert.equal(evaluate('() => window.__actions.record.archived'),true)
  route('/records?archived=archived')
  click('Restore'); dialog('OK')
  assert.equal(evaluate('() => window.__actions.record.archived'),false)
  route('/records/r1')
  click('Delete'); dialog('OK')
  route('/records/r1')
  click('Restore'); dialog('OK')

  route('/imports/new?source_id=7&template_id=b1')
  assert.equal(evaluate('() => document.querySelectorAll(".saved-table").length'),1)
  assert.match(evaluate('() => document.querySelector(".sheet-preview")?.textContent || ""'),/100.00/)
  assert.equal(evaluate('() => [...document.querySelectorAll("input")].some(i=>i.placeholder.startsWith("https://docs"))'),false)
  for (const viewport of ['390x844x1', '1024x768x1', '1440x900x1']) {
    cli('emulate', id, '--viewport', viewport); settle()
    assert.equal(evaluate('() => document.documentElement.scrollWidth <= innerWidth + 1'), true, `Page overflows ${viewport}`)
  }
  cli('take_screenshot', id, '--filePath', '/tmp/hephaestus-saved-import.png')
  click('Read and preview mapping')
  assert.equal(evaluate('() => window.__actions.created'),1)
  assert.equal(evaluate('() => window.__actions.requests.find(r=>r.url==="/v1/google/imports").body.spreadsheet'),'https://docs.google.com/spreadsheets/d/synthetic')
  console.log('PASS: real pointer clicks; visible cancel/confirm; batch cancellation failure/retry; committed batch trash/restore; record delete/restore; saved sheet preview and reuse')
} finally { cli('close_page', id) }
