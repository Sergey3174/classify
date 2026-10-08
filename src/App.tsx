import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Toast } from './components/Chrome'
import { TabBar } from './components/TabBar'
import { TAB_ROOTS, useNavTracking } from './navigation'
import { AlertDetail, Alerts } from './pages/Alerts'
import Create from './pages/Create'
import { Favorites, Me, MyListings, UserProfile } from './pages/Collections'
import Home from './pages/Home'
import Kyc from './pages/Kyc'
import Rules from './pages/Rules'
import Listing from './pages/Listing'
import Search from './pages/Search'
import { AppProvider } from './store/app'
import { useTelegramBackButton } from './telegram/hooks'


function Shell() {
  useNavTracking()
  useTelegramBackButton()
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/listing/:id" element={<Listing />} />
        <Route path="/create" element={<Create />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/my" element={<MyListings />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/alerts/:id" element={<AlertDetail />} />
        <Route path="/user/:id" element={<UserProfile />} />
        <Route path="/me" element={<Me />} />
        <Route path="/kyc" element={<Kyc />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {TAB_ROOTS.includes(pathname) && <TabBar />}
      <Toast />
    </>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </AppProvider>
  )
}
