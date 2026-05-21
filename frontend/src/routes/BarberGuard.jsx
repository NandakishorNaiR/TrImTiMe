import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import api from "../api/axios";

const BarberGuard = ({ children }) => {
  const [status, setStatus] = useState("checking"); // checking | ok | redirect
  const [redirectTo, setRedirectTo] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const userRaw = localStorage.getItem("user");
    if (!userRaw) {
      setRedirectTo('/login');
      setStatus('redirect');
      return;
    }
    let user;
    try { user = JSON.parse(userRaw); } catch (e) { user = null; }
    if (!user) {
      setRedirectTo('/login');
      setStatus('redirect');
      return;
    }
    if (user.role !== 'BARBER') {
      setRedirectTo('/');
      setStatus('redirect');
      return;
    }

    // Verify shop exists on server to avoid localStorage drift
    api.get('/barber/shop')
      .then(res => {
        if (!res.data) {
          setRedirectTo('/barber/shop-setup');
          setStatus('redirect');
        } else {
          setStatus('ok');
        }
      })
      .catch(err => {
        // on 404 -> setup, on 401 -> login, else assume setup
        const code = err?.response?.status;
        if (code === 404) setRedirectTo('/barber/shop-setup');
        else if (code === 401) setRedirectTo('/login');
        else setRedirectTo('/barber/shop-setup');
        setStatus('redirect');
      });
  }, [location.key]);

  if (status === 'checking') return <div className="p-4">Checking access...</div>;
  if (status === 'redirect') return <Navigate to={redirectTo} />;
  return children;
};

export default BarberGuard;
