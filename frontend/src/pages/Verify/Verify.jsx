import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function Verify() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('Verifying your email...');
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('Invalid link. No token found.');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch(`http://localhost:8000/verify/${token}`);
        const data = await response.json();
        
        if (!response.ok) {
          setStatus(data.detail || 'Verification failed.');
          return;
        }

        // Successfully verified! Log them in
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userName', data.email);
        localStorage.setItem('token', data.access_token);
        
        // This tiny update to localStorage acts as a ping to our original tab
        localStorage.setItem('verified_ping', Date.now().toString());

        setStatus('✅ Verification Successful!');
        setVerified(true);
        
        // Try to close the tab automatically (Browsers usually only allow this if the script opened the tab, 
        // but it works sometimes depending on the browser settings and how the email client opened it).
        setTimeout(() => {
            window.close();
        }, 3000);

      } catch (error) {
        setStatus('Network error. Please try again later.');
      }
    };

    verifyToken();
  }, [searchParams]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#080c0a', color: '#fff', textAlign: 'center', padding: '20px' }}>
      <h1 style={{ color: 'var(--green)' }}>{status}</h1>
      {verified && (
        <p style={{ marginTop: '20px', color: '#a0a0a0', fontSize: '1.2rem', lineHeight: '1.5' }}>
          Your account is ready. You can safely close this tab<br/>and return to your original window.
        </p>
      )}
    </div>
  );
}
