import { useEffect, useState, useCallback } from 'react';
import style from './Player.module.css';

const REDIRECT_URI = 'http://localhost:3000';
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const RESPONSE_TYPE = 'token';
const SCOPE = 'user-read-playback-state';
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';

const Player = () => {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [token, setToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [data, setData] = useState({});

  useEffect(() => {
    const savedClientId = window.localStorage.getItem('client_id');
    const savedClientSecret = window.localStorage.getItem('client_secret');
    const hash = window.location.hash;
    let token = window.localStorage.getItem('token');
    let refreshToken = window.localStorage.getItem('refresh_token');
    let expiresIn = window.localStorage.getItem('expires_in');

    if (savedClientId) setClientId(savedClientId);
    if (savedClientSecret) setClientSecret(savedClientSecret);

    if (!token && hash) {
      const hashParams = new URLSearchParams(hash.substring(1));
      token = hashParams.get('access_token');
      refreshToken = hashParams.get('refresh_token');
      expiresIn = hashParams.get('expires_in');

      if (token) {
        window.localStorage.setItem('token', token);
        window.localStorage.setItem('expires_in', Date.now() + parseInt(expiresIn, 10) * 1000);
        window.location.hash = '';
      }

      if (refreshToken) {
        window.localStorage.setItem('refresh_token', refreshToken);
      }
    }

    setToken(token);
    setRefreshToken(refreshToken);
  }, []);

  const refreshAuthToken = useCallback(async () => {
    try {
      const response = await fetch(TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`)
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        })
      });

      if (!response.ok) {
        console.error('Failed to refresh token:', response.status, response.statusText);
        return;
      }

      const data = await response.json();

      if (data.access_token) {
        const newToken = data.access_token;
        const newExpiresIn = Date.now() + parseInt(data.expires_in, 10) * 1000;
        window.localStorage.setItem('token', newToken);
        window.localStorage.setItem('expires_in', newExpiresIn);
        setToken(newToken);
      } else {
        console.error('Error fetching new token:', data);
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
    }
  }, [refreshToken, clientId, clientSecret]);

  const fetchData = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        await refreshAuthToken();
        const newToken = window.localStorage.getItem('token');
        if (newToken) await fetchData();
        return;
      }

      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setData({});
    }
  }, [token, refreshAuthToken]);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentExpiresIn = parseInt(window.localStorage.getItem('expires_in'), 10);
      if (Date.now() >= currentExpiresIn) {
        refreshAuthToken();
      }
    }, 60000); // Проверка каждые 60 секунд

    return () => clearInterval(interval);
  }, [refreshAuthToken]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, [token, fetchData]);

  useEffect(() => {
    if (data.item) {
      setState(data.is_playing ? 'playing' : 'paused');
      const titleEl = document.querySelector(`.${style.title}`);
      const artistEl = document.querySelector(`.${style.artist}`);
      const albumEl = document.querySelector(`.${style.album}`);
      if (titleEl) titleEl.innerText = data.item.name || 'Unknown Track';
      if (artistEl) artistEl.innerText = data.item.artists.map(artist => artist.name).join(', ') || 'Unknown Artist';
      if (albumEl) albumEl.innerText = data.item.album.name || 'Unknown Album';
      handleCover(data.item.album.images[0]?.url || null);
    } else {
      const titleEl = document.querySelector(`.${style.title}`);
      const artistEl = document.querySelector(`.${style.artist}`);
      const albumEl = document.querySelector(`.${style.album}`);
      if (titleEl) titleEl.innerText = 'Nothing is playing';
      if (artistEl) artistEl.innerText = '';
      if (albumEl) albumEl.innerText = '';
      handleCover(null);
      setState('none');
    }
  }, [data]);

  const setState = (status) => {
    const widgets = document.getElementsByClassName(style.widget);
    const widget = widgets[0];
    const cover = document.querySelector(`.${style.cover}`);
    const coverPlaceholder = document.querySelector(`.${style.coverPlaceholder}`);
    if (widget) {
      if (status === 'playing') {
        widget.classList.add(style.active);
        document.documentElement.style.setProperty('--widget-background', 'rgba(0, 0, 0, 0.7)');
        if (cover) cover.classList.remove(style.paused);
        if (coverPlaceholder) coverPlaceholder.classList.remove(style.paused);
      } else if (status === 'paused') {
        widget.classList.remove(style.active);
        document.documentElement.style.setProperty('--widget-background', 'rgba(0, 0, 0, 0.3)');
        if (cover) cover.classList.add(style.paused);
        if (coverPlaceholder) coverPlaceholder.classList.add(style.paused);
      } else {
        widget.classList.remove(style.active);
        document.documentElement.style.setProperty('--widget-background', 'rgba(0, 0, 0, 0)');
        if (cover) cover.classList.add(style.paused);
        if (coverPlaceholder) coverPlaceholder.classList.add(style.paused);
      }
    }
  };

  const handleCover = (src) => {
    const cover = document.querySelector(`.${style.cover}`);
    if (cover) {
      if (src) {
        const timestamp = new Date().getTime();
        cover.onload = () => { cover.style.display = 'block'; };
        cover.onerror = () => { cover.style.display = 'none'; };
        cover.src = `${src}?t=${timestamp}`;
      } else {
        cover.style.display = 'none';
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    window.localStorage.setItem('client_id', clientId);
    window.localStorage.setItem('client_secret', clientSecret);

    const authEndpoint = 'https://accounts.spotify.com/api/token';
    const response = await fetch(authEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`)
      },
      body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    console.log(data); // Handle the response data as needed
  };

  return (
    <div>
      {!token ? (
        <div className={style.authorization}>
          <form onSubmit={handleSubmit}>
            <div>
              <label>ID:</label>
              <input 
                type="text" 
                value={clientId} 
                onChange={(e) => setClientId(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label>Secret:</label>
              <input 
                type="text" 
                value={clientSecret} 
                onChange={(e) => setClientSecret(e.target.value)} 
                required 
              />
            </div>
            <button
            onClick={() => window.location.href = `${AUTH_ENDPOINT}?client_id=${clientId}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`}
          >
            Login to Spotify
          </button>
          </form>
        </div>
      ) : (
        <div className={style.widget}>
          <div className={style.coverPlaceholder}>
            <img className={style.cover} alt="Album cover" />
          </div>
          <div className={style.info}>
            <p className={`${style.text} ${style.artist}`}>&nbsp;</p>
            <a className={`${style.text} ${style.title}`} href='/logout'>Nothing is playing</a>
            <p className={`${style.text} ${style.album}`}>&nbsp;</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Player;