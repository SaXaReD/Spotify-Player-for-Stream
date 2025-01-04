import { useEffect } from 'react';

const Logout = () => {
  useEffect(() => {
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('refresh_token');
    window.localStorage.removeItem('expires_in');
    window.location.href = '/'; }, []);
    return <div>Logging out...</div>; };

export default Logout;