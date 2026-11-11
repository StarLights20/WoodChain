import { Icon } from '../../components/Icon'

export function ConsumerAccount() {
  return (
    <div className="account-layout">
      <section className="panel account-identity-panel">
        <div className="account-avatar">AP</div>
        <span className="account-section-label">AKUN KONSUMEN</span>
        <h2>Andi Pratama</h2>
        <span className="account-login-status"><span /> Login aktif via Email</span>
        <div className="account-info-row"><span>Email login</span><strong>user@example.com</strong></div>
        <div className="account-info-row"><span>Smart Account · ERC-4337</span><strong>0x71C...93F2</strong></div>
        <div className="account-info-row"><span>Frasa pemulihan</span><strong>Tidak diperlukan</strong></div>
        <div className="account-wallet-note"><Icon name="shield" size={17} /><span>Wallet dikelola sebagai smart account. Jangan pernah membagikan OTP atau tautan login Anda.</span></div>
      </section>
      <section className="panel care-guide-panel">
        <div className="panel-heading"><div><h2>Panduan perawatan furnitur jati</h2><p>Rawat furnitur agar tetap awet dan nyaman digunakan</p></div></div>
        <div className="care-guide-list">
          <article><span>01</span><div><strong>Bersihkan dengan kain lembut</strong><p>Gunakan kain microfiber kering atau sedikit lembap. Hindari cairan pembersih yang keras.</p></div></article>
          <article><span>02</span><div><strong>Jauhkan dari panas dan lembap berlebih</strong><p>Hindari paparan matahari langsung, sumber panas, dan genangan air pada permukaan.</p></div></article>
          <article><span>03</span><div><strong>Gunakan alas pelindung</strong><p>Tambahkan alas pada benda panas atau tajam agar finishing kayu tidak tergores.</p></div></article>
          <article><span>04</span><div><strong>Rawat finishing secara berkala</strong><p>Ikuti petunjuk perajin untuk perawatan ulang dan simpan bukti perawatan bersama passport produk.</p></div></article>
        </div>
      </section>
    </div>
  )
}
