import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { adminNavigation, adminPagePaths, userNavigation } from '../data/dashboardData'
import { AdminOverview, SectionPlaceholder } from '../features/admin/AdminOverview'
import { AdminConsole } from '../features/admin/AdminConsole'
import { ConsumerAccount } from '../features/user/ConsumerAccount'
import { UserOverview } from '../features/user/Furniture'
import { WarrantyClaims } from '../features/user/WarrantyClaims'
import { AuthenticityScanner, MyWarranties } from '../features/user/Warranties'

export function Dashboard() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const isAdmin = pathname.startsWith('/admin')
  const [selectedPage, setSelectedPage] = useState(isAdmin ? 'Ringkasan' : 'Beranda')
  const [selectedRole, setSelectedRole] = useState(isAdmin)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [isMobileBrowser, setIsMobileBrowser] = useState(() => window.matchMedia('(max-width: 600px) and (pointer: coarse)').matches)
  const [isAndroidChrome] = useState(() => {
    const userAgent = navigator.userAgent
    return /Android/i.test(userAgent) && /Chrome\//i.test(userAgent) && !/(EdgA|OPR|SamsungBrowser)/i.test(userAgent)
  })
  const adminPath = pathname.replace(/\/+$/, '') || '/admin'
  const routeAdminPage = Object.entries(adminPagePaths).find(([, path]) => path === adminPath)?.[0]
  const activePage = isAdmin
    ? routeAdminPage ?? 'Ringkasan'
    : selectedRole === isAdmin ? selectedPage : 'Beranda'
  const navigation = isAdmin ? adminNavigation : userNavigation

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 600px) and (pointer: coarse)')
    const updateMobileState = () => setIsMobileBrowser(mobileQuery.matches)
    mobileQuery.addEventListener('change', updateMobileState)
    return () => mobileQuery.removeEventListener('change', updateMobileState)
  }, [])

  const title = activePage === 'Ringkasan' ? 'Ringkasan' : activePage
  const greeting = isAdmin ? 'Selamat pagi, Admin' : 'Selamat pagi, Andi'

  return (
    <div className={`app-shell${isAdmin ? ' app-shell--admin' : ''}`}>
      {menuOpen && <button className="sidebar-backdrop" aria-label="Tutup menu" onClick={() => setMenuOpen(false)} />}
      <aside className={`sidebar${menuOpen ? ' sidebar--open' : ''}`}>
        <Link className="brand" to={isAdmin ? '/admin' : '/'} aria-label="WoodChain, ke ringkasan">
          <span className="brand-mark"><Icon name="leaf" size={22} /></span>
          <span>wood<span>chain</span></span>
        </Link>

        <div className="workspace-label">{isAdmin ? 'WORKSPACE ADMIN' : 'WORKSPACE PENGGUNA'}</div>
        <nav className="sidebar-nav" aria-label="Navigasi utama">
          {navigation.map((item) => (
            <button
              className={`nav-link${activePage === item.label ? ' nav-link--active' : ''}`}
              key={item.label}
              onClick={() => {
                if (isAdmin) {
                  setSelectedPage(item.label)
                  navigate(adminPagePaths[item.label] ?? '/admin')
                } else {
                  setSelectedPage(item.label)
                  setSelectedRole(false)
                }
                setMenuOpen(false)
              }}
            >
              <Icon name={item.icon} size={19} />
              <span>{item.label}</span>
              {item.label === 'Pesanan & Minting' && isAdmin && <span className="nav-count">1</span>}
            </button>
          ))}
          {isAdmin && (
            <div className="sidebar-divider">
              <button
                className={`nav-link${activePage === 'Pengaturan' ? ' nav-link--active' : ''}`}
                onClick={() => {
                  setSelectedPage('Pengaturan')
                  navigate(adminPagePaths.Pengaturan)
                  setMenuOpen(false)
                }}
              >
                <Icon name="settings" size={19} />
                <span>Pengaturan</span>
              </button>
            </div>
          )}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <span className="help-icon"><Icon name="leaf" size={17} /></span>
            <strong>{isAdmin ? 'Pusat bantuan admin' : 'Butuh bantuan?'}</strong>
            <p>{isAdmin ? 'Panduan mengelola WoodChain' : 'Tim kami siap membantu Anda'}</p>
            <button onClick={() => {
              setSelectedPage('Bantuan')
              setSelectedRole(isAdmin)
            }}>Kunjungi pusat bantuan <Icon name="chevron" size={14} /></button>
          </div>
          <button
            className="profile profile-button"
            onClick={() => {
              setSelectedPage('Akun')
              setSelectedRole(isAdmin)
              setMenuOpen(false)
            }}
          >
            <div className="avatar">{isAdmin ? 'AD' : 'AP'}</div>
            <div className="profile-copy">
              <strong>{isAdmin ? 'Admin WoodChain' : 'Andi Pratama'}</strong>
              <span>{isAdmin ? 'Administrator' : 'Akun konsumen'}</span>
            </div>
            <Icon name="chevron" size={16} />
          </button>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <button className="mobile-menu" aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'} onClick={() => setMenuOpen(!menuOpen)}>
            <Icon name={menuOpen ? 'close' : 'menu'} />
          </button>
          <div className="breadcrumb"><span>WoodChain</span><Icon name="chevron" size={15} /><strong>{isAdmin ? 'Admin' : 'Pengguna'}</strong></div>
          <div className="topbar-actions">
            <label className="search-box">
              <Icon name="search" size={18} />
              <input aria-label="Cari" placeholder="Cari sesuatu..." />
              <kbd>⌘ K</kbd>
            </label>
            <button className="icon-button notification-button" aria-label="Notifikasi">
              <Icon name="bell" size={19} /><span className="notification-dot" />
            </button>
            {!isAdmin && !isMobileBrowser && (
              <button className="desktop-scan-button" onClick={() => setScannerOpen(true)}>
                <Icon name="scan" size={16} /> Pindai
              </button>
            )}
            <Link className="role-switch" to={isAdmin ? '/' : '/admin'} onClick={() => setMenuOpen(false)}>
              {isAdmin ? 'Mode pengguna' : 'Mode admin'}
              <Icon name="arrow" size={15} />
            </Link>
          </div>
        </header>

        <div className="page-content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">{isAdmin ? 'PANEL ADMINISTRATOR' : 'DASHBOARD PENGGUNA'}</div>
              <h1>{title}</h1>
              <p>{greeting} <span className="wave">✦</span> <span className="heading-subtitle">{isAdmin ? 'Berikut perkembangan bisnis Anda hari ini.' : activePage === 'Beranda' ? 'Temukan furnitur yang dibuat untuk ruang Anda.' : activePage === 'My Warranties' ? 'Lihat NFT garansi dan paspor digital furnitur Anda.' : activePage === 'Klaim garansi' ? 'Ajukan dan pantau klaim garansi furnitur Anda.' : activePage === 'Akun' ? 'Kelola akun konsumen dan panduan perawatan furnitur.' : 'Berikut aktivitas akun Anda hari ini.'}</span></p>
            </div>
            <div className="date-chip"><span className="date-dot" />{isAdmin ? 'Ringkasan harian' : activePage === 'Beranda' ? 'Koleksi furnitur' : activePage === 'My Warranties' ? 'Garansi produk' : activePage === 'Klaim garansi' ? 'Layanan purnajual' : activePage === 'Akun' ? 'Profil konsumen' : 'Akun pengguna'}</div>
          </div>

          {isAdmin && activePage !== 'Ringkasan' ? (
            <AdminConsole page={activePage} />
          ) : activePage === (isAdmin ? 'Ringkasan' : 'Beranda') ? (
            isAdmin ? <AdminOverview /> : <UserOverview />
          ) : !isAdmin && activePage === 'My Warranties' ? (
            <MyWarranties />
          ) : !isAdmin && activePage === 'Klaim garansi' ? (
            <WarrantyClaims />
          ) : !isAdmin && activePage === 'Akun' ? (
            <ConsumerAccount />
          ) : (
            <SectionPlaceholder title={activePage} isAdmin={isAdmin} />
          )}

          <footer className="footer">
            <span>© 2025 WoodChain</span>
            <span>{isAdmin ? 'Admin PWA · Web 2.5' : 'PWA Pengguna · Web 2'}</span>
            <span className="footer-status"><span /> Semua sistem berjalan normal</span>
          </footer>
        </div>
        {!isAdmin && isMobileBrowser && (
          <MobileNavigation
            activePage={activePage}
            onNavigate={(page) => {
              setSelectedPage(page)
              setSelectedRole(false)
              setMenuOpen(false)
            }}
            onScan={() => setScannerOpen(true)}
          />
        )}
      </main>
      {scannerOpen && !isAdmin && (
        <AuthenticityScanner
          platform={!isMobileBrowser ? 'desktop' : isAndroidChrome ? 'android-chrome' : 'mobile-other'}
          onClose={() => setScannerOpen(false)}
        />
      )}
    </div>
  )
}

function MobileNavigation({
  activePage,
  onNavigate,
  onScan,
}: {
  activePage: string
  onNavigate: (page: string) => void
  onScan: () => void
}) {
  return (
    <nav className="mobile-navigation" aria-label="Navigasi bawah">
      <button className={`mobile-navigation-link${activePage === 'Beranda' ? ' mobile-navigation-link--active' : ''}`} onClick={() => onNavigate('Beranda')}>
        <Icon name="grid" size={20} /><span>Beranda</span>
      </button>
      <button className={`mobile-navigation-link${activePage === 'My Warranties' ? ' mobile-navigation-link--active' : ''}`} onClick={() => onNavigate('My Warranties')}>
        <Icon name="shield" size={20} /><span>Garansi</span>
      </button>
      <button className="mobile-scan-button" onClick={onScan} aria-label="Pindai keaslian produk">
        <Icon name="scan" size={22} /><span>Pindai</span>
      </button>
      <button className={`mobile-navigation-link${activePage === 'Klaim garansi' ? ' mobile-navigation-link--active' : ''}`} onClick={() => onNavigate('Klaim garansi')}>
        <Icon name="orders" size={20} /><span>Klaim</span>
      </button>
      <button className={`mobile-navigation-link${activePage === 'Pelacakan' ? ' mobile-navigation-link--active' : ''}`} onClick={() => onNavigate('Pelacakan')}>
        <Icon name="truck" size={20} /><span>Lacak</span>
      </button>
    </nav>
  )
}
