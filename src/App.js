// App.js — Full PKCE Flow + Moodify Request
import React, { useEffect, useState } from "react";
import axios from "axios";

function base64URLEncode(str) {
  return btoa(String.fromCharCode(...new Uint8Array(str)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return await window.crypto.subtle.digest("SHA-256", data);
}

const CLIENT_ID = "fb7ea60b500d41b8b3edb920f750e08f";
const REDIRECT_URI = "https://moodify-krish.vercel.app/callback";

function App() {
  const [accessToken, setAccessToken] = useState(localStorage.getItem("access_token"));
  const [text, setText] = useState("");
  const [song, setSong] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");

    if (code && state) {
      const storedVerifier = localStorage.getItem("code_verifier");
      if (!storedVerifier) return;

      axios
        .post("https://moodify-backend.onrender.com/callback", {
          code,
          state,
          code_verifier: storedVerifier,
          redirect_uri: REDIRECT_URI,
          client_id: CLIENT_ID,
        })
        .then((res) => {
          localStorage.setItem("access_token", res.data.access_token);
          setAccessToken(res.data.access_token);
          window.history.replaceState({}, document.title, "/");
        })
        .catch((err) => {
          console.error("Token exchange failed:", err.response?.data || err);
        });
    }
  }, []);

  const handleLogin = async () => {
    const verifier = [...Array(128)]
      .map(() => Math.random().toString(36)[2])
      .join("");
    const challenge = base64URLEncode(await sha256(verifier));
    localStorage.setItem("code_verifier", verifier);

    const state = crypto.randomUUID();
    localStorage.setItem("auth_state", state);

    const authUrl = `https://accounts.spotify.com/authorize?` +
      `response_type=code` +
      `&client_id=${CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&scope=user-library-read%20user-read-private` +
      `&state=${state}` +
      `&code_challenge=${challenge}` +
      `&code_challenge_method=S256`;

    window.location.href = authUrl;
  };

  const handleRecommend = async () => {
    try {
      const res = await axios.post("https://moodify-backend.onrender.com/recommend", {
        text,
        access_token: accessToken,
      });
      setSong(res.data.song || "No song found");
    } catch (err) {
      console.error("Recommendation error:", err.response?.data || err);
      setSong("Error getting recommendation.");
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>🎧 Moodify</h1>
      {!accessToken ? (
        <button onClick={handleLogin}>Login with Spotify</button>
      ) : (
        <>
          <p>✅ Logged in with Spotify!</p>
          <input
            type="text"
            placeholder="How do you feel?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ padding: 8, marginRight: 10 }}
          />
          <button onClick={handleRecommend}>Get Mood-Based Song</button>
          {song && <p>🎵 Recommended: {song}</p>}
        </>
      )}
    </div>
  );
}

export default App;
