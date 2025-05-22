const CLIENT_ID = "YOUR_SPOTIFY_CLIENT_ID";
const REDIRECT_URI = "https://vite-react-kappa-snowy-63.vercel.app/callback";
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";
const SCOPES = ["user-library-read", "user-read-private"];

export const getAuthUrl = () => {
  return `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&response_type=${RESPONSE_TYPE}&scope=${SCOPES.join("%20")}`;
};
