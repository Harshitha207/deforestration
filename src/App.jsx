import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardModule from './modules/dashboard/DashboardModule';
import AuthenticationModule from './modules/authentication/AuthenticationModule';
import DatabaseModule from './modules/database/DatabaseModule';
import SatelliteFetchModule from './modules/satellite-fetch/SatelliteFetchModule';
import PredictionModule from './modules/prediction/PredictionModule';
import VisualizationModule from './modules/visualization/VisualizationModule';
import AlertsModule from './modules/alerts/AlertsModule';
import SearchHistoryModule from './modules/search-history/SearchHistoryModule';
import AboutModule from './modules/about/AboutModule';
import ChartModule from './modules/charts/ChartModule';
import SplashPage from './components/SplashPage';
import './App.css';

const AppLayout = () => {
  const location = useLocation();
  const isMapPage = location.pathname === '/visualization';

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Header />
        <div className={`page-container ${isMapPage ? 'no-padding' : ''}`}>
          <Routes>
            <Route path="/" element={<DashboardModule />} />
            <Route path="/auth" element={<AuthenticationModule />} />
            <Route path="/reports" element={<DatabaseModule />} />
            <Route path="/satellite-fetch" element={<SatelliteFetchModule />} />
            <Route path="/prediction" element={<PredictionModule />} />
            <Route path="/visualization" element={<VisualizationModule />} />
            <Route path="/charts" element={<ChartModule />} />
            <Route path="/alerts" element={<AlertsModule />} />
            <Route path="/search-history" element={<SearchHistoryModule />} />
            <Route path="/about" element={<AboutModule />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

function App() {
  const [hasEntered, setHasEntered] = useState(false);

  const handleEnter = () => {
    // Always reset to dashboard route so we don't resume on a stale page
    window.history.replaceState(null, '', '/');
    setHasEntered(true);
  };

  if (!hasEntered) {
    return <SplashPage onEnter={handleEnter} />;
  }

  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
