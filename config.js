/**
 * Backend root URL (no trailing slash).
 * Override per machine: localStorage.setItem('QM_API_BASE', 'https://your-host.com')
 */
(function () {
  var raw =
    (typeof window.QM_API_BASE === "string" && window.QM_API_BASE) ||
    localStorage.getItem("QM_API_BASE") ||
    "http://localhost:8080";
  raw = String(raw).trim().replace(/\/$/, "");
  if (!/^https?:\/\//i.test(raw)) {
    raw = "https://" + raw;
  }
  window.QM_API_BASE = raw;
})();
