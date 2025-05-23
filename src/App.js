import React, { useEffect, useState } from "react";
import axios from "axios";

// PKCE helpers
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
  const [accessToken, setAccessToken] = useState(() => {
    return localStorage.getItem("access_token");
  });

useEffect(() => {
  const isCallback = window.location.pathname.includes("/callback");
  if (!isCallback) return;

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
        localStorage.setItem("access_token", res.data.access_token);
        window.location.href = "/"; // ✅ Go back to home after login
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

    const response = await axios.get("https://moodify-backend.onrender.com/start-auth");
    const { auth_url, state } = response.data;
    localStorage.setItem("auth_state", state);

    const authWithChallenge =
      auth_url + "&code_challenge=" + challenge + "&code_challenge_method=S256";
    window.location.href = authWithChallenge;
  };

  const getRecommendation = async () => {
    const token = accessToken || localStorage.getItem("access_token");
    const inputText = "I feel tired from school and work"; // You can replace with dynamic input

    try {
      const res = await axios.post("https://moodify-backend.onrender.com/recommend", {
        text: inputText,
        access_token: token,
      });

      console.log("🎵 Recommended trac:", res.data);
      alert(`🎵 Moodify suggests: ${res.data.track_name} by ${res.data.artist_name}`);
    } catch (err) {
      console.error("Error getting recommendation:", err);
      alert("⚠️ Error fetching song recommendation.");
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>🎧 Moodify</h1>
      {!accessToken ? (
        <button onClick={handleLogin}>Login with Spotify</button>
      ) : (
        <>
          <p>✅ Logged in with Spotify! Token is active.</p>
          <button onClick={getRecommendation}>Get Mood-Based Song</button>
        </>
      )}
    </div>
  );
}

export default App;
