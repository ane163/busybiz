import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiBarChart2, FiBox, FiShield, FiUsers } from "react-icons/fi";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <main className="public-home">
      <style>{`
        .public-home{min-height:100vh;background:radial-gradient(circle at 80% 0%,#211b0d 0,#0a0a09 32%,#060606 70%);color:#f7f4ea;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
        .public-nav{height:76px;display:flex;align-items:center;justify-content:space-between;padding:0 7%;border-bottom:1px solid rgba(212,175,55,.14)}.public-logo{display:flex;align-items:center;gap:10px;font-weight:900;font-size:20px}.public-mark{width:38px;height:38px;border-radius:11px;display:grid;place-items:center;background:linear-gradient(135deg,#efd06b,#a57916);color:#111}.public-links{display:flex;gap:10px}.public-btn{border:1px solid #3a3324;background:#10100e;color:#ddd;border-radius:10px;padding:10px 15px;cursor:pointer}.public-btn.primary{background:#d8b84f;color:#111;border-color:#d8b84f;font-weight:800}.public-hero{max-width:1120px;margin:auto;padding:90px 7% 70px;display:grid;grid-template-columns:1.2fr .8fr;gap:55px;align-items:center}.public-kicker{display:inline-flex;padding:7px 10px;border:1px solid #3a301c;background:#151208;color:#d8bb5c;border-radius:99px;font-size:11px;font-weight:700}.public-hero h1{font-size:clamp(42px,6vw,72px);line-height:.98;letter-spacing:-3px;margin:18px 0}.public-hero h1 span{color:#d9b84f}.public-hero p{max-width:610px;color:#9e9e9e;font-size:17px;line-height:1.7}.public-actions{display:flex;gap:11px;margin-top:27px}.public-actions button{display:flex;align-items:center;gap:8px}.public-panel{border:1px solid #30291c;border-radius:22px;background:linear-gradient(145deg,#15130f,#0b0b0a);padding:20px;box-shadow:0 30px 90px rgba(0,0,0,.35)}.panel-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}.panel-title{font-weight:800}.panel-live{font-size:10px;color:#75d69a}.mini-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.mini-card{padding:16px;border:1px solid #29251d;background:#10100f;border-radius:14px}.mini-card small{color:#707070;display:block;font-size:10px}.mini-card strong{font-size:22px;margin-top:5px;display:block}.chart{height:130px;margin-top:10px;border-radius:12px;background:linear-gradient(180deg,rgba(216,184,79,.09),transparent);position:relative;overflow:hidden}.chart:after{content:"";position:absolute;left:0;right:0;bottom:28px;height:2px;background:linear-gradient(90deg,transparent,#d8b84f 20%,#d8b84f 40%,#fff0a8 60%,#d8b84f 80%,transparent);transform:skewY(-8deg);box-shadow:0 30px 0 rgba(216,184,79,.12)}.public-features{max-width:1120px;margin:auto;padding:20px 7% 80px;display:grid;grid-template-columns:repeat(4,1fr);gap:13px}.feature{border:1px solid #24231f;background:#0c0c0b;border-radius:16px;padding:20px}.feature svg{color:#d8b84f;font-size:20px}.feature h3{font-size:14px;margin:14px 0 6px}.feature p{font-size:12px;line-height:1.6;color:#777;margin:0}.public-footer{padding:25px 7%;border-top:1px solid #191919;color:#666;font-size:11px;display:flex;justify-content:space-between}@media(max-width:850px){.public-hero{grid-template-columns:1fr;padding-top:55px}.public-features{grid-template-columns:1fr 1fr}}@media(max-width:550px){.public-links .public-btn:first-child{display:none}.public-hero h1{letter-spacing:-2px}.public-features{grid-template-columns:1fr}.public-footer{display:block}}
      `}</style>
      <nav className="public-nav">
        <div className="public-logo"><div className="public-mark">B</div>BusyBiz</div>
        <div className="public-links">
          <button className="public-btn" onClick={() => navigate("/login")}>Login</button>
          <button className="public-btn primary" onClick={() => navigate("/register")}>Get started</button>
        </div>
      </nav>
      <section className="public-hero">
        <div>
          <span className="public-kicker">BUSINESS MANAGEMENT • SIMPLE • CONNECTED</span>
          <h1>Run your business with <span>clarity.</span></h1>
          <p>BusyBiz brings sales, inventory, customers, finance, reporting and business insights together in one professional workspace.</p>
          <div className="public-actions">
            <button className="public-btn primary" onClick={() => navigate("/register")}>Create an account <FiArrowRight/></button>
            <button className="public-btn" onClick={() => navigate("/login")}>Sign in</button>
          </div>
        </div>
        <div className="public-panel">
          <div className="panel-top"><div className="panel-title">Business overview</div><div className="panel-live">● LIVE WORKSPACE</div></div>
          <div className="mini-grid"><div className="mini-card"><small>Revenue</small><strong>$24,860</strong></div><div className="mini-card"><small>Orders</small><strong>348</strong></div><div className="mini-card"><small>Products</small><strong>126</strong></div><div className="mini-card"><small>Customers</small><strong>812</strong></div></div>
          <div className="chart"/>
        </div>
      </section>
      <section className="public-features">
        <div className="feature"><FiBarChart2/><h3>Analytics</h3><p>Understand performance with reports and business insights.</p></div>
        <div className="feature"><FiBox/><h3>Inventory</h3><p>Keep products, stock and orders organised in one place.</p></div>
        <div className="feature"><FiUsers/><h3>Customers</h3><p>Manage customer information and business relationships.</p></div>
        <div className="feature"><FiShield/><h3>Controlled access</h3><p>Sign in for your workspace and dedicated administrator controls.</p></div>
      </section>
      <footer className="public-footer"><span>© {new Date().getFullYear()} BusyBiz</span><span>Your public preview is available without signing in.</span></footer>
    </main>
  );
}
