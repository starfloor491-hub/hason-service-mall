function normalizePhone(v){return String(v||'').replace(/\D/g,'')}
export async function onRequestGet({request,env}){
  const u=new URL(request.url), id=(u.searchParams.get('id')||'').trim(), phone=normalizePhone(u.searchParams.get('phone'));
  if(!id||!phone) return Response.json({error:'주문번호와 연락처를 입력해 주세요.'},{status:400});
  const row=await env.DB.prepare(`SELECT id,service,company,status,admin_memo,created_at FROM orders WHERE id=? AND phone=?`).bind(id,phone).first();
  if(!row) return Response.json({error:'일치하는 주문을 찾을 수 없습니다.'},{status:404});
  return Response.json(row);
}