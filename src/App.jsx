import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Overview from './pages/Overview';
import TeamAnalysis from './pages/TeamAnalysis';
import PlayerAnalysis from './pages/PlayerAnalysis';
import Reports from './pages/Reports';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Overview />} />
        <Route path="team" element={<TeamAnalysis />} />
        <Route path="players" element={<PlayerAnalysis />} />
        <Route path="reports" element={<Reports />} />
      </Route>
    </Routes>
  );
}

export default App;
