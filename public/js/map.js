document.addEventListener("DOMContentLoaded", async () => {
  if (!document.getElementById("map")) return;

  const location = window.LISTING.location;
  if (!location) return;

  // Geocode using Nominatim
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(location)}`;
  const response = await fetch(url, {
    headers: { "User-Agent": "YourApp/1.0" }
  });
  const data = await response.json();

  if (data.length === 0) {
    console.log("No coordinates found for", location);
    return;
  }

  const lat = parseFloat(data[0].lat);
  const lon = parseFloat(data[0].lon);

  // Initialize map
  const map = L.map("map").setView([lat, lon], 12);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
  }).addTo(map);

  // Add marker
  L.marker([lat, lon]).addTo(map)
    .bindPopup(`<b>${window.LISTING.title}</b><br>${location}`)
    .openPopup();
});
