
// App.js — Full PKCE Flow in One File
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
  const [accessToken, setAccessToken] = useState(null);
  const [codeVerifier, setCodeVerifier] = useState(null);

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
        })
        .then((res) => {
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

    const response = await axios.get("http://localhost:5000/start-auth"); // if testing locally
;
    const { auth_url, state } = response.data;
    localStorage.setItem("auth_state", state);

    const authWithChallenge = auth_url + "&code_challenge=" + challenge + "&code_challenge_method=S256";
    window.location.href = authWithChallenge;
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>🎧 Moodify</h1>
      {!accessToken ? (
        <button onClick={handleLogin}>Login with Spotify</button>
      ) : (
        <p>✅ Logged in with Spotify! Token is active.</p>
      )}
    </div>
  );
}

export default App;
