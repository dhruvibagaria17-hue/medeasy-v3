import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import LandingPage from './components/LandingPage.jsx'
import Layout from './components/Layout.jsx'
import SearchPage from './components/SearchPage.jsx'
import DrugDetails from './components/DrugDetails.jsx'
import ContactUs from './components/ContactUs.jsx'
import RecentSearches from './components/RecentSearches.jsx'
import SavedMedicines from './components/SavedMedicines.jsx'
import AboutUs from './components/AboutUs.jsx'
import DataSources from './components/DataSources.jsx'
import DataSecurity from './components/DataSecurity.jsx'
import Profile from './components/Profile.jsx'

const ScrollToTop = () => {
  const location = useLocation();
  useEffect(() => {
    if (location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname, location.hash]);
  return null;
};

function App() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F6E6E8', color: '#1A1A1A' }}>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<Layout />}>
          <Route path="/search" element={<SearchPage />} />
          <Route path="/recent" element={<RecentSearches />} />
          <Route path="/saved" element={<SavedMedicines />} />
          <Route path="/drug/:name" element={<DrugDetails />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:tab" element={<Profile />} />
          <Route path="/sources" element={<DataSources />} />
          <Route path="/security" element={<DataSecurity />} />
          <Route path="/contact" element={<ContactUs />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
