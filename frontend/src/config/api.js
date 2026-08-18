// Central API base URL configuration with auto-sanitization
export const getApiBase = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl || envUrl.trim() === '') {
    return 'http://localhost:5001';
  }
  let clean = envUrl.trim().replace(/\/+$/, ''); // Remove trailing slashes
  clean = clean.replace(/\/api$/, '');           // Remove redundant /api suffix
  return clean;
};

export const API_BASE = getApiBase();
export default API_BASE;
