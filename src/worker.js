function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}})}
function normalizePhone(v){return String(v||"").replace(/\D/g,"")}
function makeOrderId(){const date=new Date().toISOString().slice(0,10).replaceAll("-","");const chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";const bytes=new Uint8Array(6);crypto.getRandomValues(bytes);let s="";for(const n of bytes)s+=chars[n%chars.length];return `HC${date}-${s}`}
function isAdmin(request,env){return Boolean(env.ADMIN_TOKEN)&&(request.headers.get("Authorization")||"")===`Bearer ${env.ADMIN_TOKEN}`}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}

async function sendOrderNotification(env,order){
  if(!env.RESEND_API_KEY||!env.ORDER_NOTIFY_EMAIL)return;
  const from=env.ORDER_FROM_EMAIL||"HASON COMPANY <onboarding@resend.dev>";
  const adminUrl="https://shop.hasoncompany.kr/admin.html";
  const html=`
  <div style="font-family:Arial,'Noto Sans KR',sans-serif;max-width:680px;margin:0 auto;color:#17201c">
    <div style="background:#075b47;color:white;padding:22px 24px;border-radius:16px 16px 0 0">
      <div style="font-size:12px;opacity:.8">HASON COMPANY 서비스몰</div>
      <h2 style="margin:6px 0 0;font-size:24px">새 주문이 접수되었습니다.</h2>
    </div>
    <div style="border:1px solid #ded7cb;border-top:0;padding:24px;border-radius:0 0 16px 16px;background:#fffdf8">
      <table style="width:100%;border-collapse:collapse;font-size:14px;line-height:1.65">
        <tr><td style="padding:7px 0;color:#69716c;width:120px">주문번호</td><td style="padding:7px 0;font-weight:700">${esc(order.id)}</td></tr>
        <tr><td style="padding:7px 0;color:#69716c">서비스</td><td style="padding:7px 0">${esc(order.service)}</td></tr>
        <tr><td style="padding:7px 0;color:#69716c">업체명</td><td style="padding:7px 0">${esc(order.company)}</td></tr>
        <tr><td style="padding:7px 0;color:#69716c">담당자</td><td style="padding:7px 0">${esc(order.name)}</td></tr>
        <tr><td style="padding:7px 0;color:#69716c">연락처</td><td style="padding:7px 0">${esc(order.phone)}</td></tr>
        <tr><td style="padding:7px 0;color:#69716c">이메일</td><td style="padding:7px 0">${esc(order.email||'-')}</td></tr>
        <tr><td style="padding:7px 0;color:#69716c;vertical-align:top">요청사항</td><td style="padding:7px 0;white-space:pre-wrap">${esc(order.request||'-')}</td></tr>
        <tr><td style="padding:7px 0;color:#69716c">접수시간</td><td style="padding:7px 0">${esc(order.created_at)}</td></tr>
      </table>
      <a href="${adminUrl}" style="display:inline-block;margin-top:20px;background:#075b47;color:white;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700">관리자 페이지에서 주문 확인</a>
      <p style="margin:18px 0 0;color:#7b827e;font-size:12px">이 메일은 서비스몰 주문 접수 시 자동 발송되었습니다.</p>
    </div>
  </div>`;
  const text=`[HASON COMPANY] 새 주문 접수\n\n주문번호: ${order.id}\n서비스: ${order.service}\n업체명: ${order.company}\n담당자: ${order.name}\n연락처: ${order.phone}\n이메일: ${order.email||'-'}\n요청사항: ${order.request||'-'}\n접수시간: ${order.created_at}\n\n관리자: ${adminUrl}`;
  const r=await fetch("https://api.resend.com/emails",{
    method:"POST",
    headers:{"Authorization":`Bearer ${env.RESEND_API_KEY}`,"Content-Type":"application/json"},
    body:JSON.stringify({from,to:[env.ORDER_NOTIFY_EMAIL],subject:`[하손컴퍼니] 새 주문 접수 - ${order.service} / ${order.company}`,html,text})
  });
  if(!r.ok)throw new Error(`Resend notification failed: ${r.status} ${await r.text()}`);
}

async function createOrder(request,env,ctx){
  if(!env.DB)return json({error:"D1 DB 바인딩이 연결되지 않았습니다."},500);
  let b;try{b=await request.json()}catch{return json({error:"요청 형식이 올바르지 않습니다."},400)}
  for(const k of ["service","company","name","phone"])if(!String(b[k]||"").trim())return json({error:`${k} 값이 필요합니다.`},400);
  const id=makeOrderId(),now=new Date().toISOString();
  const order={id,service:String(b.service).trim(),company:String(b.company).trim(),name:String(b.name).trim(),phone:normalizePhone(b.phone),email:String(b.email||"").trim(),request:String(b.request||"").trim(),created_at:now};
  await env.DB.prepare(`INSERT INTO orders (id,service,company,name,phone,email,request,status,admin_memo,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`).bind(order.id,order.service,order.company,order.name,order.phone,order.email,order.request,"접수","",now,now).run();
  if(env.RESEND_API_KEY&&env.ORDER_NOTIFY_EMAIL){
    const task=sendOrderNotification(env,order).catch(err=>console.error("ORDER EMAIL ERROR",err));
    if(ctx?.waitUntil)ctx.waitUntil(task);else await task;
  }
  return json({ok:true,id,status:"접수"});
}
async function lookup(request,env){const u=new URL(request.url),id=(u.searchParams.get("id")||"").trim(),phone=normalizePhone(u.searchParams.get("phone"));if(!id||!phone)return json({error:"주문번호와 연락처를 입력해 주세요."},400);const row=await env.DB.prepare(`SELECT id,service,company,status,admin_memo,created_at FROM orders WHERE id=? AND phone=?`).bind(id,phone).first();return row?json(row):json({error:"일치하는 주문을 찾을 수 없습니다."},404)}
async function adminList(request,env){if(!isAdmin(request,env))return json({error:"관리자 인증에 실패했습니다."},401);const u=new URL(request.url),st=(u.searchParams.get("status")||"").trim();const q=st?env.DB.prepare("SELECT * FROM orders WHERE status=? ORDER BY created_at DESC").bind(st):env.DB.prepare("SELECT * FROM orders ORDER BY created_at DESC");const {results}=await q.all();return json({orders:results||[]})}
async function adminUpdate(request,env){if(!isAdmin(request,env))return json({error:"관리자 인증에 실패했습니다."},401);const b=await request.json(),allowed=["접수","작업중","수정중","완료","취소"];if(!b.id||!allowed.includes(b.status))return json({error:"잘못된 요청입니다."},400);const r=await env.DB.prepare("UPDATE orders SET status=?,admin_memo=?,updated_at=? WHERE id=?").bind(b.status,String(b.admin_memo||""),new Date().toISOString(),b.id).run();return r.meta?.changes?json({ok:true}):json({error:"주문을 찾을 수 없습니다."},404)}
export default{async fetch(request,env,ctx){const u=new URL(request.url);if(u.pathname==="/api/orders"&&request.method==="POST")return createOrder(request,env,ctx);if(u.pathname==="/api/order"&&request.method==="GET")return lookup(request,env);if(u.pathname==="/api/admin/orders"&&request.method==="GET")return adminList(request,env);if(u.pathname==="/api/admin/orders"&&request.method==="PATCH")return adminUpdate(request,env);return env.ASSETS.fetch(request)}};
