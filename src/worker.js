function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}
function normalizePhone(v) {
  return String(v || "").replace(/\D/g, "");
}
function makeOrderId() {
  const date = new Date().toISOString().slice(0,10).replaceAll("-","");
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  let suffix = "";
  for (const n of bytes) suffix += chars[n % chars.length];
  return `HC${date}-${suffix}`;
}
function isAdmin(request, env) {
  const auth = request.headers.get("Authorization") || "";
  return Boolean(env.ADMIN_TOKEN) && auth === `Bearer ${env.ADMIN_TOKEN}`;
}
async function createOrder(request, env) {
  if (!env.DB) return json({error:"D1 DB 바인딩이 아직 연결되지 않았습니다."},500);
  let body;
  try { body = await request.json(); }
  catch { return json({error:"요청 형식이 올바르지 않습니다."},400); }

  for (const key of ["service","company","name","phone"]) {
    if (!String(body[key] || "").trim()) return json({error:`${key} 값이 필요합니다.`},400);
  }

  const id = makeOrderId();
  const now = new Date().toISOString();
  const status = "접수";

  await env.DB.prepare(`
    INSERT INTO orders
    (id,service,company,name,phone,email,request,status,admin_memo,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)
  `).bind(
    id,
    String(body.service).trim(),
    String(body.company).trim(),
    String(body.name).trim(),
    normalizePhone(body.phone),
    String(body.email || "").trim(),
    String(body.request || "").trim(),
    status,
    "",
    now,
    now
  ).run();

  return json({ok:true,id,status});
}
async function lookupOrder(request, env) {
  if (!env.DB) return json({error:"D1 DB 바인딩이 아직 연결되지 않았습니다."},500);
  const url = new URL(request.url);
  const id = (url.searchParams.get("id") || "").trim();
  const phone = normalizePhone(url.searchParams.get("phone"));
  if (!id || !phone) return json({error:"주문번호와 연락처를 입력해 주세요."},400);

  const row = await env.DB.prepare(`
    SELECT id,service,company,status,admin_memo,created_at
    FROM orders WHERE id=? AND phone=?
  `).bind(id,phone).first();

  if (!row) return json({error:"일치하는 주문을 찾을 수 없습니다."},404);
  return json(row);
}
async function adminList(request, env) {
  if (!isAdmin(request, env)) return json({error:"관리자 인증에 실패했습니다."},401);
  if (!env.DB) return json({error:"D1 DB 바인딩이 아직 연결되지 않았습니다."},500);

  const url = new URL(request.url);
  const status = (url.searchParams.get("status") || "").trim();
  const stmt = status
    ? env.DB.prepare("SELECT * FROM orders WHERE status=? ORDER BY created_at DESC").bind(status)
    : env.DB.prepare("SELECT * FROM orders ORDER BY created_at DESC");

  const { results } = await stmt.all();
  return json({orders:results || []});
}
async function adminUpdate(request, env) {
  if (!isAdmin(request, env)) return json({error:"관리자 인증에 실패했습니다."},401);
  if (!env.DB) return json({error:"D1 DB 바인딩이 아직 연결되지 않았습니다."},500);

  let body;
  try { body = await request.json(); }
  catch { return json({error:"요청 형식이 올바르지 않습니다."},400); }

  const allowed = ["접수","작업중","수정중","완료","취소"];
  if (!body.id || !allowed.includes(body.status)) return json({error:"잘못된 요청입니다."},400);

  const result = await env.DB.prepare(`
    UPDATE orders SET status=?, admin_memo=?, updated_at=? WHERE id=?
  `).bind(
    body.status,
    String(body.admin_memo || ""),
    new Date().toISOString(),
    body.id
  ).run();

  if (!result.meta?.changes) return json({error:"주문을 찾을 수 없습니다."},404);
  return json({ok:true});
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/orders" && request.method === "POST") {
      return createOrder(request, env);
    }
    if (url.pathname === "/api/order" && request.method === "GET") {
      return lookupOrder(request, env);
    }
    if (url.pathname === "/api/admin/orders" && request.method === "GET") {
      return adminList(request, env);
    }
    if (url.pathname === "/api/admin/orders" && request.method === "PATCH") {
      return adminUpdate(request, env);
    }

    return env.ASSETS.fetch(request);
  }
};