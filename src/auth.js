const CLIENT_ID = "fb7ea60b500d41b8b3edb920f750e08f";
const REDIRECT_URI = "https://moodify-krish.vercel.app/callback";
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";
const SCOPES = ["user-library-read", "user-read-private"];

export const getAuthUrl = () => {
  return `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&response_type=${RESPONSE_TYPE}&scope=${SCOPES.join("%20")}`;
};
