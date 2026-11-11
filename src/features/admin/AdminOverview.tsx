import { Icon, type IconName } from '../../components/Icon'
import { useAdminData } from '../../data/adminDataStore'

export function AdminOverview() {
  const { data } = useAdminData()
  const pendingOrderCount = data.pendingOrders.filter((order) => order.status === 'Pending Mint').length
  const recentOrders = data.pendingOrders.slice(0, 3).map((order) => ({
    id: order.orderId,
    customer: order.customerEmail,
    item: order.productName,
    date: order.orderDate,
    status: order.status === 'Pending Mint' ? 'Perlu diproses' : 'Garansi diterbitkan',
    tone: order.status === 'Pending Mint' ? 'waiting' : 'complete',
  }))

  return (
    <>
      <section className="stats-grid stats-grid--admin" aria-label="Statistik bisnis">
        <MetricCard label="Total penjualan" value="Rp 128,4 jt" change="+12,8% dari bulan lalu" icon="chart" tint="green" trend />
        <MetricCard label="Pesanan baru" value={String(pendingOrderCount)} change="Menunggu konfirmasi admin" icon="orders" tint="amber" />
        <MetricCard label="Pengguna aktif" value="1.284" change="+8,2% dari bulan lalu" icon="users" tint="purple" trend />
        <MetricCard label="Stok produk" value="86" change="7 produk stok menipis" icon="box" tint="blue" trend />
      </section>

      <section className="content-grid admin-content-grid">
        <div className="panel sales-panel">
          <PanelHeading title="Ringkasan penjualan" subtitle="Performa penjualan dalam 7 hari terakhir" action="Minggu ini" />
          <div className="sales-total"><strong>Rp 32.840.000</strong><span className="positive-change">↗ 12,8%</span></div>
          <div className="chart" role="img" aria-label="Grafik penjualan 7 hari terakhir">
            {[42, 58, 48, 73, 62, 88, 68].map((height, index) => (
              <div className="chart-column" key={index}>
                <div className={`chart-bar${index === 5 ? ' chart-bar--highlight' : ''}`} style={{ height: `${height}%` }} />
                <span>{['Jum', 'Sab', 'Min', 'Sen', 'Sel', 'Rab', 'Kam'][index]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="panel inventory-panel">
          <PanelHeading title="Ringkasan stok" subtitle="Kondisi inventaris produk" action="Kelola stok" />
          <div className="inventory-total"><strong>86</strong><span>produk aktif</span></div>
          <div className="inventory-item"><span className="inventory-indicator inventory-indicator--healthy" /><span>Stok tersedia</span><strong>64</strong><div className="inventory-track"><i style={{ width: '74%' }} /></div></div>
          <div className="inventory-item"><span className="inventory-indicator inventory-indicator--low" /><span>Stok menipis</span><strong>15</strong><div className="inventory-track"><i style={{ width: '18%' }} /></div></div>
          <div className="inventory-item"><span className="inventory-indicator inventory-indicator--empty" /><span>Stok habis</span><strong>7</strong><div className="inventory-track"><i style={{ width: '8%' }} /></div></div>
          <button className="inventory-link">Lihat inventaris <Icon name="arrow" size={15} /></button>
        </div>
      </section>

      <section className="panel orders-panel admin-orders-panel">
        <PanelHeading title="Pesanan terbaru" subtitle="Pesanan yang membutuhkan perhatian" action="Lihat semua pesanan" />
        <OrderTable rows={recentOrders} admin />
      </section>
      <section className="admin-notice"><span>!</span><p><strong>Perhatian:</strong> 7 produk memiliki stok menipis atau habis.</p><button>Periksa inventaris <Icon name="arrow" size={14} /></button></section>
    </>
  )
}

function MetricCard({
  label,
  value,
  change,
  icon,
  tint,
  trend = false,
}: {
  label: string
  value: string
  change: string
  icon: IconName
  tint: 'green' | 'amber' | 'purple' | 'blue'
  trend?: boolean
}) {
  return (
    <article className="metric-card">
      <div className={`metric-icon metric-icon--${tint}`}><Icon name={icon} size={19} /></div>
      <span className="metric-label">{label}</span>
      <strong className="metric-value">{value}</strong>
      <span className={`metric-change${trend ? ' metric-change--positive' : ''}`}>{trend && <span>↗ </span>}{change}</span>
    </article>
  )
}

function PanelHeading({ title, subtitle, action }: { title: string; subtitle: string; action?: string }) {
  return (
    <div className="panel-heading">
      <div><h2>{title}</h2><p>{subtitle}</p></div>
      {action && <button className="panel-action">{action}{action.includes('Minggu') ? <span>⌄</span> : <Icon name="chevron" size={15} />}</button>}
    </div>
  )
}

function OrderTable({ rows, admin }: { rows: Array<{ id: string; customer?: string; item: string; date: string; status: string; tone: string }>; admin: boolean }) {
  return (
    <div className="table-scroll">
      <table className="orders-table">
        <thead><tr><th>NO. PESANAN</th>{admin && <th>PELANGGAN</th>}<th>PRODUK</th><th>TANGGAL</th><th>STATUS</th><th /></tr></thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td><strong className="order-id">{row.id}</strong></td>
              {admin && <td>{'customer' in row ? row.customer : ''}</td>}
              <td>{row.item}</td><td>{row.date}</td>
              <td><span className={`status-pill status-pill--${row.tone}`}><span className="status-dot" />{row.status}</span></td>
              <td><button className="row-action" aria-label={`Detail ${row.id}`}><Icon name="chevron" size={16} /></button></td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={admin ? 6 : 5} className="admin-table-empty">Belum ada pesanan masuk.</td></tr>}
        </tbody>
      </table>
    </div>
  )
}

export function SectionPlaceholder({ title, isAdmin }: { title: string; isAdmin: boolean }) {
  return (
    <section className="panel placeholder-panel">
      <div className="placeholder-icon"><Icon name={title === 'Bantuan' ? 'leaf' : isAdmin ? 'chart' : 'box'} size={25} /></div>
      <h2>{title}</h2>
      <p>Kerangka halaman {title.toLowerCase()} sudah disiapkan. Konten dan data akan dapat dihubungkan pada tahap pengembangan berikutnya.</p>
      <span className="coming-soon"><span /> Struktur dasar siap dikembangkan</span>
    </section>
  )
}
