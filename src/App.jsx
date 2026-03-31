import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import Hero from './components/Hero/Hero'
import Features from './components/Features/Features'
import HowItWorks from './components/HowItWorks/HowItWorks'
import Architecture from './components/Architecture/Architecture'
import Dashboard from './components/Dashboard/Dashboard'
import Testimonials from './components/Testimonials/Testimonials'
import Deployment from './components/Deployment/Deployment'
import Pricing from './components/Pricing/Pricing'
import FAQ from './components/FAQ/FAQ'
import CTA from './components/CTA/CTA'
import Footer from './components/Footer/Footer'
import Signup from './pages/signup/signup'
import UserDashboard from './pages/UserDashboard/UserDashboard'
import QueryLog from './pages/QueryLog/QueryLog'
import Blocklists from './pages/Blocklists/Blocklists'
import Allowlist from './pages/Allowlist/Allowlist'
import Domains from './pages/Domains/Domains'
import Onboarding from './pages/OnBoarding/OnBoarding'
import Settings from './pages/Settings/Settings'

function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Architecture />
        <Dashboard />
        <Testimonials />
        <Deployment />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/dashboard/queries" element={<QueryLog />} />
        <Route path="/dashboard/blocklists" element={<Blocklists />} />
        <Route path="/dashboard/allowlist" element={<Allowlist />} />
        <Route path="/dashboard/domains" element={<Domains />} />
        <Route path="/dashboard/settings" element={<Settings />} />
        <Route path="/onboarding" element={<Onboarding />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App