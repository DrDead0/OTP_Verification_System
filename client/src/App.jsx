// import React from 'react';

import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import SendOtp from './pages/sendOtp';
import VerifyOtp from './pages/verifyOtp';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<SendOtp />} />
        <Route path='/verifyotp' element={<VerifyOtp />} />
      </Routes>
    </Router>
  );
}
export default App;