import { createBrowserRouter, redirect } from 'react-router-dom'

// Layouts
import PublicLayout from './layouts/PublicLayout'
import DashboardLayout from './layouts/DashboardLayout'

// Auth
import { ProtectedRoute } from './auth/ProtectedRoute'
import SignInPage from './pages/auth/SignInPage'

// Public pages
import HomePage from './pages/public/HomePage'
import ServicesPage from './pages/public/ServicesPage'
import IndustriesPage from './pages/public/IndustriesPage'
import CaseStudiesPage from './pages/public/CaseStudiesPage'
import PricingPage from './pages/public/PricingPage'
import AboutPage from './pages/public/AboutPage'
import ContactPage from './pages/public/ContactPage'

// Dashboard pages
import MissionControlPage from './pages/dashboard/MissionControlPage'
import DeptPerformancePage from './pages/dashboard/DeptPerformancePage'
import FinancePage from './pages/dashboard/FinancePage'
import ActivityFeedPage from './pages/dashboard/ActivityFeedPage'
import ApprovalsPage from './pages/dashboard/ApprovalsPage'
import SafetyAlertsPage from './pages/dashboard/SafetyAlertsPage'
import ReportsPage from './pages/dashboard/ReportsPage'
import ChatPage from './pages/dashboard/ChatPage'
import ReflectionPage from './pages/dashboard/ReflectionPage'

export const router = createBrowserRouter([
  // Auth
  {
    path: '/sign-in',
    element: <SignInPage />,
  },
  // Public site
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true,          element: <HomePage /> },
      { path: 'services',     element: <ServicesPage /> },
      { path: 'industries',   element: <IndustriesPage /> },
      { path: 'case-studies', element: <CaseStudiesPage /> },
      { path: 'pricing',      element: <PricingPage /> },
      { path: 'about',        element: <AboutPage /> },
      { path: 'contact',      element: <ContactPage /> },
    ],
  },
  // Protected dashboard
  {
    path: '/dashboard',
    element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
    children: [
      { index: true,                element: <MissionControlPage /> },
      { path: 'performance',        element: <DeptPerformancePage /> },
      { path: 'finance',            element: <FinancePage /> },
      { path: 'activity',           element: <ActivityFeedPage /> },
      { path: 'approvals',          element: <ApprovalsPage /> },
      { path: 'safety',             element: <SafetyAlertsPage /> },
      { path: 'reports',            element: <ReportsPage /> },
      { path: 'chat',               element: <ChatPage /> },
      { path: 'reflection',         element: <ReflectionPage /> },
    ],
  },
  {
    path: '*',
    loader: () => redirect('/'),
  },
])
