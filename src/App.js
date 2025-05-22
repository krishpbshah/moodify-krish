import React, { useEffect, useState } from "react";
import { getAuthUrl } from "./auth";
import axios from "axios";

function App() {
  const [token, setToken] = useState(null);
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);

  // Step 1: Extract access token from URL hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const tokenMatch = hash.match(/access_token=([^&]*)/);
      if (tokenMatch) {
        const accessToken = tokenMatch[1];
        setToken(accessToken);
        window.localStorage.setItem("spotify_token", accessToken);
        window.location.hash = "";
      }
    } else {
      const savedToken = window.localStorage.getItem("spotify_token");
      if (savedToken) setToken(savedToken);
    }
  }, []);

  const handleLogin = () => {
    window.location.href = getAuthUrl();
  };

  const handleAnalyze = async () => {
    const res = await axios.post("http://127.0.0.1:5000/recommend", {
      text,
      access_token: token,
    });
    setResult(res.data);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🎧 Moodify</h1>
      {!token ? (
        <button onClick={handleLogin}>Login with Spotify</button>
      ) : (
        <>
          <textarea
            rows="3"
            cols="60"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="How are you feeling?"
          />
          <br />
          <button onClick={handleAnalyze}>Get Song Recommendation</button>
        </>
      )}

      {result && (
        <div style={{ marginTop: 20 }}>
          <h3>Recommended Song:</h3>
          <p>
            <strong>{result.name}</strong> by {result.artist}
          </p>
          <a href={result.spotify_url} target="_blank" rel="noreferrer">
            Open in Spotify
          </a>
          {result.preview_url && (
            <audio controls src={result.preview_url} style={{ display: "block", marginTop: 10 }} />
          )}
        </div>
      )}
    </div>
  );
}

export default App;

