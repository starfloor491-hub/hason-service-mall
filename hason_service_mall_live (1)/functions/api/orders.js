function normalizePhone(v){return String(v||'').replace(/\D/g,'')}
function orderId(){
  const d=new Date();
  const date=d.toISOString().slice(0,10).replaceAll('-','');
  const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let r=''; crypto.getRandomValues(new Uint8Array(6)).forEach(n=>r+=chars[n%chars.length]);
  return `HC${date}-${r}`;
}
export async function onRequestPost({request,env}){
  try{
    const b=await request.json();
    const required=['service','company','name','phone'];
    for(const k of required) if(!String(b[k]||'').trim()) return Response.json({error:`${k} 값이 필요합니다.`},{status:400});
    const id=orderId(), created_at=new Date().toISOString(), status='접수';
    await env.DB.prepare(`INSERT INTO orders (id,service,company,name,phone,email,request,status,admin_memo,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)`).bind(
      id,String(b.service).trim(),String(b.company).trim(),String(b.name).trim(),
      normalizePhone(b.phone),String(b.email||'').trim(),String(b.request||'').trim(),
      status,'',created_at,created_at
    ).run();
    return Response.json({ok:true,id,status});
  }catch(e){return Response.json({error:'주문 저장 중 오류가 발생했습니다.',detail:String(e.message||e)},{status:500})}
}