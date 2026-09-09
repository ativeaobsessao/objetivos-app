/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CreateObjective from './pages/CreateObjective';
import ObjectiveDetail from './pages/ObjectiveDetail';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateObjective />} />
        <Route path="/objective/:id" element={<ObjectiveDetail />} />
      </Routes>
    </Router>
  );
}
