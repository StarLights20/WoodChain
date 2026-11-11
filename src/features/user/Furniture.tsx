import { lazy, Suspense, useState } from 'react'
import { Icon } from '../../components/Icon'
import { furnitureCatalog, type Furniture } from '../../data/dashboardData'
import { useAdminData } from '../../data/adminDataStore'

const Furniture3D = lazy(() => import('../../Furniture3D'))

export function UserOverview() {
  const [selectedFurniture, setSelectedFurniture] = useState<Furniture | null>(null)
  const [publishedOrderNotice, setPublishedOrderNotice] = useState('')
  const { data, setData } = useAdminData()

  return (
    <>
      <section className="furniture-intro">
        <div>
          <span className="furniture-intro-label"><Icon name="leaf" size={14} /> PILIHAN UNTUK RUANG ANDA</span>
          <h2>Furnitur dengan cerita dari alam.</h2>
          <p>Lihat detail bahan dan putar model 3D untuk mengenal setiap sudut furnitur pilihan.</p>
        </div>
        <div className="intro-stamp"><Icon name="shield" size={19} /><span>Material<br />tertelusur</span></div>
      </section>

      <section className="furniture-section" aria-labelledby="furniture-heading">
        <div className="furniture-section-heading">
          <div><h2 id="furniture-heading">Jelajahi furnitur</h2><p>Pilih produk untuk melihat model 3D dan spesifikasi bahan.</p></div>
          <span>{furnitureCatalog.length} produk</span>
        </div>
        <div className="furniture-grid">
          {furnitureCatalog.map((furniture) => (
            <button className="furniture-card" key={furniture.id} onClick={() => setSelectedFurniture(furniture)}>
              <FurnitureIllustration type={furniture.id} />
              <span className="furniture-category">{furniture.category}</span>
              <strong>{furniture.name}</strong>
              <span className="furniture-card-copy">{furniture.description}</span>
              <span className="furniture-card-footer">Lihat model 3D <Icon name="arrow" size={15} /></span>
            </button>
          ))}
        </div>
      </section>

      <section className="published-products-section" aria-labelledby="published-products-heading">
        <div className="furniture-section-heading">
          <div><h2 id="published-products-heading">Katalog WoodChain terbaru</h2><p>Produk yang dipublikasikan admin, beserta metadata passport digitalnya.</p></div>
          <span>{data.products.length} produk terdaftar</span>
        </div>
        <div className="published-products-list">
          {data.products.map((product) => (
            <article className="published-product-card" key={product.id}>
              <span className="published-product-icon"><Icon name="box" size={20} /></span>
              <div><span>{product.category} · {product.warrantyMonths} bulan garansi</span><strong>{product.name}</strong><small>SVLK {product.svlkCertificate} · Perajin {product.craftsman}</small></div>
              <strong className="published-product-price">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(product.price)}</strong>
              <a
                className="published-product-order"
                href={`https://wa.me/6288216300451?text=${encodeURIComponent(`Halo WoodChain, saya ingin memesan ${product.name}.`)}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => {
                  const now = new Date()
                  const year = now.getFullYear()
                  const suffix = String(now.getTime()).slice(-6)
                  const orderId = `ORD-${year}-${suffix}`
                  setData((current) => ({
                    ...current,
                    pendingOrders: [{
                      orderId,
                      customerEmail: 'user@example.com',
                      customerWallet: '0x71C...93F2',
                      productName: product.name,
                      serialNumber: `WC-JTI-${year}-${suffix}`,
                      warrantyMonths: product.warrantyMonths,
                      orderDate: now.toISOString().slice(0, 10),
                      status: 'Pending Mint',
                    }, ...current.pendingOrders],
                  }))
                  setPublishedOrderNotice(`Pesanan demo ${orderId} masuk ke dashboard admin untuk dikonfirmasi.`)
                }}
              >Pesan via WhatsApp</a>
            </article>
          ))}
        </div>
        {publishedOrderNotice && <p className="order-demo-notice" role="status">{publishedOrderNotice}</p>}
      </section>

      <section className="furniture-note">
        <span className="furniture-note-icon"><Icon name="shield" size={19} /></span>
        <div><strong>Asal bahan yang lebih transparan</strong><p>Informasi sertifikat dan legalitas kayu dapat ditanyakan kepada penyedia sebelum pemesanan.</p></div>
        <span className="furniture-note-tag">Transparansi bahan</span>
      </section>

      {selectedFurniture && (
        <FurnitureDetail furniture={selectedFurniture} onClose={() => setSelectedFurniture(null)} />
      )}
    </>
  )
}
export function FurnitureIllustration({ type }: { type: Furniture['id'] }) {
  return (
    <span className={`furniture-illustration furniture-illustration--${type}`} aria-hidden="true">
      <svg viewBox="0 0 240 180" role="presentation">
        <ellipse cx="120" cy="151" rx="76" ry="11" fill="#534535" opacity=".12" />
        {type === 'cabinet' && (
          <g>
            <path d="m67 47 15-12h92l-15 12H67Z" fill="#c69d70" />
            <path d="M159 47h15v93h-15z" fill="#a87d54" />
            <path d="M67 47h92v93H67z" fill="#d2ad80" />
            <path d="M72 52h40v82H72zM114 52h40v82h-40z" fill="#dfc19b" stroke="#b48b60" strokeWidth="1.5" />
            <path d="M108 52v82M118 52v82" stroke="#bd956b" strokeWidth="1.5" />
            <circle cx="104" cy="94" r="2" fill="#765737" /><circle cx="122" cy="94" r="2" fill="#765737" />
            <path d="M73 140h8v8h-8zm72 0h8v8h-8z" fill="#886542" />
          </g>
        )}
        {type === 'table' && (
          <g>
            <path d="m49 69 21-14h125l-22 14H49Z" fill="#c8a47a" />
            <path d="M49 69h124v14H49z" fill="#aa825a" />
            <path d="m61 83 11 2v53l-11-3zm91 0 11-2v54l-11 3z" fill="#98734f" />
            <path d="m77 84 9 2v49l-9-2zm58 0 9-2v51l-9 2z" fill="#b68e64" />
            <path d="M70 58h119v10H70z" fill="#dfc19b" opacity=".8" />
          </g>
        )}
        {type === 'shelf' && (
          <g>
            <path d="m66 39 13-9h96l-13 9H66Z" fill="#c69d70" />
            <path d="M66 39h13v105H66zM162 39h13v105h-13z" fill="#a87d54" />
            <path d="M79 39h83v8H79zM79 70h83v8H79zM79 101h83v8H79zM79 132h83v8H79z" fill="#d8b58c" />
            <path d="M86 48h68v21H86zM86 79h68v21H86zM86 110h68v21H86z" fill="#eedbc0" />
            <path d="M92 52h15v14H92zm35-1h18v15h-18zm-29 31h30v14H98zm38 0h13v14h-13zm-37 31h17v13H99zm28 0h23v13h-23z" fill="#bf966b" opacity=".78" />
          </g>
        )}
      </svg>
      <span className="illustration-rotate"><Icon name="rotate" size={14} /> 360°</span>
    </span>
  )
}

export function FurnitureDetail({ furniture, onClose }: { furniture: Furniture; onClose: () => void }) {
  const [selectedVariant, setSelectedVariant] = useState(furniture.woodVariants[0])
  const [orderNotice, setOrderNotice] = useState('')
  const { setData } = useAdminData()
  const message = encodeURIComponent([
    'Halo WoodChain, saya ingin memesan furnitur berikut:',
    `Produk: ${furniture.name}`,
    `Varian kayu: ${selectedVariant.name}`,
    `Dimensi: ${furniture.dimensions}`,
    `Material: ${furniture.wood}`,
    `Garansi: ${furniture.warrantyMonths} bulan`,
    `Perajin: ${furniture.craftsman}`,
  ].join('\n'))

  const createAdminOrder = () => {
    const now = new Date()
    const year = now.getFullYear()
    const suffix = String(now.getTime()).slice(-6)
    const orderId = `ORD-${year}-${suffix}`
    const serialNumber = `WC-JTI-${year}-${suffix}`
    setData((current) => ({
      ...current,
      pendingOrders: [{
        orderId,
        customerEmail: 'user@example.com',
        customerWallet: '0x71C...93F2',
        productName: furniture.name,
        serialNumber,
        warrantyMonths: furniture.warrantyMonths,
        orderDate: now.toISOString().slice(0, 10),
        status: 'Pending Mint',
      }, ...current.pendingOrders],
    }))
    setOrderNotice(`Pesanan demo ${orderId} masuk ke dashboard admin untuk dikonfirmasi.`)
  }

  return (
    <div className="furniture-modal-backdrop" onClick={onClose}>
      <section
        className="furniture-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="furniture-detail-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="furniture-modal-header">
          <span>DETAIL PRODUK</span>
          <button className="furniture-modal-close" onClick={onClose} aria-label="Tutup detail"><Icon name="close" size={19} /></button>
        </div>
        <div className="furniture-detail-grid">
          <div className={`furniture-view furniture-view--${furniture.id}`}>
            <div className="model-hint"><Icon name="rotate" size={15} /> Seret untuk memutar 360°</div>
            <Suspense fallback={<div className="model-loading">Memuat model 3D...</div>}>
            <Furniture3D type={furniture.id} woodColor={selectedVariant.color} />
            </Suspense>
          </div>
          <div className="furniture-detail-copy">
            <span className="furniture-category">{furniture.category}</span>
            <h2 id="furniture-detail-title">{furniture.name}</h2>
            <p className="furniture-detail-description">{furniture.description}</p>
            <div className="wood-variant-picker">
              <span>Warna kayu · <strong>{selectedVariant.name}</strong></span>
              <div role="group" aria-label="Pilih warna kayu">
                {furniture.woodVariants.map((variant) => (
                  <button
                    className={`wood-variant-swatch${selectedVariant.name === variant.name ? ' wood-variant-swatch--selected' : ''}`}
                    key={variant.name}
                    style={{ backgroundColor: variant.color }}
                    onClick={() => setSelectedVariant(variant)}
                    aria-label={`Pilih varian ${variant.name}`}
                    aria-pressed={selectedVariant.name === variant.name}
                  />
                ))}
              </div>
            </div>
            <div className="detail-spec">
              <span>Material</span>
              <div className="material-tags">{furniture.materials.map((material) => <span key={material}>{material}</span>)}</div>
            </div>
            <div className="detail-spec detail-spec--rows">
              <div><span>Bahan kayu</span><strong>{furniture.wood}</strong></div>
              <div><span>Finishing</span><strong>{furniture.finish}</strong></div>
              <div><span>Dimensi</span><strong>{furniture.dimensions}</strong></div>
              <div><span>Profil perajin</span><strong>{furniture.craftsman}</strong></div>
              <div><span>Garansi</span><strong>{furniture.warrantyMonths} bulan</strong></div>
            </div>
            <div className="certificate-info">
              <span className="certificate-icon"><Icon name="shield" size={18} /></span>
              <div><strong>Sertifikat kayu SVLK</strong><p>Material kayu memiliki informasi legalitas dan asal yang dapat ditelusuri.</p></div>
            </div>
          </div>
        </div>
        <a className="whatsapp-button" href={`https://wa.me/6288216300451?text=${message}`} target="_blank" rel="noreferrer" onClick={createAdminOrder}>
          <span className="whatsapp-mark">WA</span> Pesan via WhatsApp <Icon name="arrow" size={16} />
        </a>
        {orderNotice && <p className="order-demo-notice" role="status">{orderNotice}</p>}
      </section>
    </div>
  )
}
