function authorized(request,env){
 const h=request.headers.get('Authorization')||'';
 return env.ADMIN_TOKEN && h===`Bearer ${env.ADMIN_TOKEN}`;
}
export async function onRequestGet({request,env}){
 if(!authorized(request,env)) return Response.json({error:'관리자 인증에 실패했습니다.'},{status:401});
 const u=new URL(request.url), status=(u.searchParams.get('status')||'').trim();
 const q=status?env.DB.prepare(`SELECT * FROM orders WHERE status=? ORDER BY created_at DESC`).bind(status):env.DB.prepare(`SELECT * FROM orders ORDER BY created_at DESC`);
 const {results}=await q.all();
 return Response.json({orders:results});
}
export async function onRequestPatch({request,env}){
 if(!authorized(request,env)) return Response.json({error:'관리자 인증에 실패했습니다.'},{status:401});
 const b=await request.json(), allowed=['접수','작업중','수정중','완료','취소'];
 if(!b.id||!allowed.includes(b.status)) return Response.json({error:'잘못된 요청입니다.'},{status:400});
 const updated_at=new Date().toISOString();
 const r=await env.DB.prepare(`UPDATE orders SET status=?,admin_memo=?,updated_at=? WHERE id=?`)
   .bind(b.status,String(b.admin_memo||''),updated_at,b.id).run();
 if(!r.meta.changes) return Response.json({error:'주문을 찾을 수 없습니다.'},{status:404});
 return Response.json({ok:true});
}