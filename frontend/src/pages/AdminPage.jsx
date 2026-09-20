import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiActivity, FiArrowLeft, FiBarChart2, FiBriefcase, FiCheckCircle,
  FiCreditCard, FiDollarSign, FiLock, FiLogOut, FiRefreshCw,
  FiSearch, FiSettings, FiShield, FiShoppingBag, FiSlash, FiUsers
} from "react-icons/fi";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const money = (value) => `$${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function StatCard({ icon, label, value, detail }) {
  return (
    <div className="admin-stat">
      <div className="admin-stat-icon">{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {detail && <small>{detail}</small>}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [credentialForm, setCredentialForm] = useState({ email: user?.email || "", currentPassword: "", newPassword: "" });

  const load = async () => {
    setLoading(true);
    setMessage("");
    try {
      const overview = await api.get("/admin/overview");
      setData(overview.data);
      if (tab === "users") setUsers((await api.get("/admin/users")).data.users || []);
      if (tab === "businesses") setBusinesses((await api.get("/admin/businesses")).data.businesses || []);
      if (tab === "subscriptions") setSubscriptions((await api.get("/admin/subscriptions")).data.subscriptions || []);
    } catch (error) {
      if (error.response?.status === 403) navigate("/dashboard", { replace: true });
      else setMessage(error.response?.data?.message || "Unable to load administrator data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [tab]);

  useEffect(() => {
    if (user?.role !== "admin") navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return users;
    return users.filter((u) => `${u.name} ${u.email} ${u.role} ${u.status}`.toLowerCase().includes(q));
  }, [users, search]);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/admin/users/${id}/status`, { status });
      setUsers((list) => list.map((u) => u.id === id ? { ...u, status } : u));
      setMessage(`User ${status === "suspended" ? "suspended" : "reactivated"} successfully.`);
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not update user.");
    }
  };

  const updateRole = async (id, role) => {
    try {
      await api.patch(`/admin/users/${id}/role`, { role });
      setUsers((list) => list.map((u) => u.id === id ? { ...u, role } : u));
      setMessage("User role updated.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not update role.");
    }
  };

  const updateSubscription = async (id, field, value) => {
    try {
      await api.patch(`/admin/subscriptions/${id}`, { [field]: value });
      setSubscriptions((list) => list.map((s) => s._id === id ? { ...s, [field]: value } : s));
      setMessage("Subscription updated.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not update subscription.");
    }
  };

  const saveCredentials = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const response = await api.put("/admin/credentials", credentialForm);
      setMessage(response.data.message || "Credentials updated.");
      setTimeout(() => { logout(); navigate("/login", { replace: true }); }, 900);
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not update credentials.");
    }
  };

  if (loading && !data) return <div className="admin-loading">Loading BusyBiz Control Centre…</div>;

  return (
    <div className="admin-shell">
      <style>{`
        .admin-shell{min-height:100vh;background:#070707;color:#f5f5f5;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
        .admin-top{height:72px;border-bottom:1px solid #25211a;background:rgba(10,10,10,.96);display:flex;align-items:center;justify-content:space-between;padding:0 28px;position:sticky;top:0;z-index:20;backdrop-filter:blur(16px)}
        .admin-brand{display:flex;align-items:center;gap:12px}.admin-brand-mark{width:38px;height:38px;border-radius:11px;display:grid;place-items:center;background:linear-gradient(135deg,#e8c45b,#a47b16);color:#111;font-weight:900}.admin-brand strong{font-size:17px}.admin-brand small{display:block;color:#858585;font-size:11px;margin-top:2px}
        .admin-user{display:flex;align-items:center;gap:14px}.admin-user span{color:#aaa;font-size:13px}.admin-logout{border:1px solid #332c1d;background:#111;border-radius:10px;padding:9px 12px;color:#ddd;cursor:pointer;display:flex;gap:7px;align-items:center}
        .admin-layout{display:grid;grid-template-columns:230px 1fr;min-height:calc(100vh - 73px)}.admin-sidebar{border-right:1px solid #211f1b;padding:22px 14px;background:#0b0b0b}.admin-nav{display:grid;gap:6px}.admin-nav button{display:flex;align-items:center;gap:11px;padding:11px 13px;border:0;border-radius:10px;background:transparent;color:#aaa;text-align:left;cursor:pointer;font-size:13px}.admin-nav button:hover,.admin-nav button.active{background:#17140e;color:#e5c25c}.admin-back{margin-top:24px;border-top:1px solid #24221e;padding-top:18px}.admin-main{padding:30px;max-width:1500px;width:100%;box-sizing:border-box}.admin-heading{display:flex;justify-content:space-between;gap:20px;align-items:flex-end;margin-bottom:25px}.admin-heading h1{font-size:30px;margin:0 0 5px}.admin-heading p{margin:0;color:#858585;font-size:14px}.admin-refresh{border:1px solid #393225;background:#12110e;color:#e5c25c;border-radius:10px;padding:10px 13px;cursor:pointer;display:flex;gap:8px;align-items:center}
        .admin-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.admin-stat{border:1px solid #29251d;background:linear-gradient(145deg,#11110f,#0c0c0c);border-radius:15px;padding:17px;display:flex;gap:13px;align-items:center}.admin-stat-icon{width:38px;height:38px;border-radius:10px;display:grid;place-items:center;background:#1a160c;color:#d9b84f}.admin-stat span{display:block;color:#8e8e8e;font-size:11px}.admin-stat strong{display:block;font-size:22px;margin:2px 0}.admin-stat small{color:#666;font-size:10px}
        .admin-grid{display:grid;grid-template-columns:1.4fr 1fr;gap:16px;margin-top:16px}.admin-card{border:1px solid #29251d;background:#0e0e0d;border-radius:15px;padding:18px}.admin-card h3{margin:0 0 14px;font-size:15px}.admin-table{width:100%;border-collapse:collapse}.admin-table th,.admin-table td{padding:11px 8px;border-bottom:1px solid #202020;text-align:left;font-size:12px}.admin-table th{color:#777;font-weight:600}.admin-table td{color:#d6d6d6}.admin-badge{display:inline-flex;padding:4px 7px;border-radius:99px;font-size:10px;background:#191919;color:#aaa}.admin-badge.active{background:#0d2418;color:#78d59b}.admin-badge.suspended,.admin-badge.cancelled{background:#2a1313;color:#f19a9a}
        .admin-toolbar{display:flex;gap:10px;margin-bottom:14px}.admin-search{flex:1;background:#111;border:1px solid #302d27;border-radius:10px;padding:11px 13px;color:#fff;outline:none}.admin-select,.admin-action{background:#111;border:1px solid #302d27;border-radius:8px;color:#ddd;padding:7px 9px;font-size:11px}.admin-action{cursor:pointer}.admin-action.warn{color:#f3a3a3}.admin-message{padding:11px 13px;border:1px solid #4b4026;background:#17130a;color:#e7c95f;border-radius:10px;margin-bottom:16px;font-size:12px}.admin-empty{padding:35px;text-align:center;color:#666}
        .admin-form{max-width:650px}.admin-form label{display:block;color:#999;font-size:12px;margin:15px 0 7px}.admin-form input{width:100%;box-sizing:border-box;background:#111;border:1px solid #302d27;border-radius:10px;padding:12px;color:#fff;outline:none}.admin-save{margin-top:18px;background:#d7b547;border:0;color:#0b0b0b;font-weight:800;border-radius:10px;padding:12px 16px;cursor:pointer}.admin-loading{min-height:100vh;display:grid;place-items:center;background:#070707;color:#d7b547}
        @media(max-width:1050px){.admin-stats{grid-template-columns:repeat(2,1fr)}.admin-grid{grid-template-columns:1fr}}@media(max-width:720px){.admin-layout{grid-template-columns:1fr}.admin-sidebar{border-right:0;border-bottom:1px solid #211f1b}.admin-nav{grid-template-columns:repeat(3,1fr)}.admin-nav button{justify-content:center}.admin-nav span{display:none}.admin-main{padding:18px}.admin-top{padding:0 16px}.admin-user span{display:none}.admin-stats{grid-template-columns:1fr}.admin-table{min-width:700px}.admin-card{overflow:auto}}
      `}</style>
      <header className="admin-top">
        <div className="admin-brand"><div className="admin-brand-mark">B</div><div><strong>BusyBiz</strong><small>Admin Control Centre</small></div></div>
        <div className="admin-user"><span>{user?.email}</span><button className="admin-logout" onClick={() => { logout(); navigate("/login"); }}><FiLogOut/> Sign out</button></div>
      </header>
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <nav className="admin-nav">
            {[["overview","Overview",FiBarChart2],["users","Users",FiUsers],["businesses","Businesses",FiBriefcase],["subscriptions","Subscriptions",FiCreditCard],["security","Security",FiShield]].map(([id,label,Icon]) => (
              <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}><Icon/><span>{label}</span></button>
            ))}
          </nav>
          <div className="admin-back"><button className="admin-nav" style={{width:"100%",border:0,background:"transparent",color:"#777",cursor:"pointer"}} onClick={() => navigate("/dashboard")}><FiArrowLeft/> Back to app</button></div>
        </aside>
        <main className="admin-main">
          {message && <div className="admin-message">{message}</div>}
          <div className="admin-heading">
            <div><h1>{tab === "overview" ? "Business overview" : tab.charAt(0).toUpperCase()+tab.slice(1)}</h1><p>Monitor and manage the BusyBiz platform from one place.</p></div>
            <button className="admin-refresh" onClick={load}><FiRefreshCw/> Refresh</button>
          </div>

          {tab === "overview" && data && <>
            <section className="admin-stats">
              <StatCard icon={<FiUsers/>} label="Users" value={data.stats.users}/>
              <StatCard icon={<FiBriefcase/>} label="Businesses" value={data.stats.businesses}/>
              <StatCard icon={<FiShoppingBag/>} label="Products" value={data.stats.products}/>
              <StatCard icon={<FiActivity/>} label="Orders" value={data.stats.orders}/>
              <StatCard icon={<FiDollarSign/>} label="Gross sales" value={money(data.stats.grossSales)}/>
              <StatCard icon={<FiSlash/>} label="Expenses" value={money(data.stats.totalExpenses)}/>
              <StatCard icon={<FiCreditCard/>} label="Subscriptions" value={data.stats.subscriptions}/>
              <StatCard icon={<FiBarChart2/>} label="Subscription value" value={money(data.stats.subscriptionValue)}/>
            </section>
            <section className="admin-grid">
              <div className="admin-card"><h3>Recent users</h3><table className="admin-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr></thead><tbody>{data.recentUsers?.map((u)=><tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td><td><span className={`admin-badge ${u.status}`}>{u.status}</span></td></tr>)}</tbody></table></div>
              <div className="admin-card"><h3>Recent businesses</h3><table className="admin-table"><thead><tr><th>Business</th><th>Owner</th></tr></thead><tbody>{data.recentBusinesses?.map((b)=><tr key={b._id}><td>{b.businessName}</td><td>{b.owner?.name || "—"}</td></tr>)}</tbody></table></div>
            </section>
          </>}

          {tab === "users" && <div className="admin-card">
            <div className="admin-toolbar"><div className="admin-search" style={{display:"flex",alignItems:"center",gap:8}}><FiSearch/><input style={{border:0,background:"transparent",outline:0,color:"#fff",width:"100%"}} value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search users..." /></div></div>
            <table className="admin-table"><thead><tr><th>User</th><th>Role</th><th>Status</th><th>Joined</th><th>Controls</th></tr></thead><tbody>{filteredUsers.map((u)=><tr key={u.id}><td><strong>{u.name}</strong><br/><span style={{color:"#666"}}>{u.email}</span></td><td><select className="admin-select" value={u.role} onChange={(e)=>updateRole(u.id,e.target.value)} disabled={u.id===user?.id}><option value="customer">Customer</option><option value="business">Business</option><option value="admin">Admin</option></select></td><td><span className={`admin-badge ${u.status}`}>{u.status}</span></td><td>{new Date(u.createdAt).toLocaleDateString()}</td><td>{u.id!==user?.id && <button className="admin-action" onClick={()=>updateStatus(u.id,u.status==="suspended"?"active":"suspended")}>{u.status==="suspended"?"Reactivate":"Suspend"}</button>}</td></tr>)}</tbody></table>
          </div>}

          {tab === "businesses" && <div className="admin-card"><table className="admin-table"><thead><tr><th>Business</th><th>Category</th><th>Owner</th><th>Location</th><th>Created</th></tr></thead><tbody>{businesses.map((b)=><tr key={b._id}><td><strong>{b.businessName}</strong><br/><span style={{color:"#666"}}>{b.phone}</span></td><td>{b.category}</td><td>{b.owner?.name || "—"}<br/><span style={{color:"#666"}}>{b.owner?.email || ""}</span></td><td>{b.location}</td><td>{new Date(b.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table>{!businesses.length&&<div className="admin-empty">No businesses found.</div>}</div>}

          {tab === "subscriptions" && <div className="admin-card"><table className="admin-table"><thead><tr><th>Account</th><th>Plan</th><th>Status</th><th>Price</th><th>Billing</th></tr></thead><tbody>{subscriptions.map((s)=><tr key={s._id}><td>{s.user?.name || "—"}<br/><span style={{color:"#666"}}>{s.user?.email || ""}</span></td><td><select className="admin-select" value={s.plan} onChange={(e)=>updateSubscription(s._id,"plan",e.target.value)}><option value="free">Free</option><option value="starter">Starter</option><option value="professional">Professional</option></select></td><td><select className="admin-select" value={s.status} onChange={(e)=>updateSubscription(s._id,"status",e.target.value)}>{["trial","active","past_due","expired","cancelled"].map(x=><option key={x} value={x}>{x}</option>)}</select></td><td>{money(s.price)}</td><td>{s.billingCycle}</td></tr>)}</tbody></table>{!subscriptions.length&&<div className="admin-empty">No subscriptions found.</div>}</div>}

          {tab === "security" && <div className="admin-card admin-form"><h3><FiLock style={{verticalAlign:"-2px"}}/> Change administrator credentials</h3><p style={{color:"#777",fontSize:12}}>You can change the administrator email (username) and password here. You will be signed out after saving.</p><form onSubmit={saveCredentials}><label>Admin email / username</label><input type="email" value={credentialForm.email} onChange={(e)=>setCredentialForm({...credentialForm,email:e.target.value})} required/><label>Current password</label><input type="password" value={credentialForm.currentPassword} onChange={(e)=>setCredentialForm({...credentialForm,currentPassword:e.target.value})} required/><label>New password</label><input type="password" minLength={8} value={credentialForm.newPassword} onChange={(e)=>setCredentialForm({...credentialForm,newPassword:e.target.value})} placeholder="Leave blank to keep current password"/><button className="admin-save" type="submit">Save security changes</button></form></div>}
        </main>
      </div>
    </div>
  );
}
