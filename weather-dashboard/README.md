# Weather Dashboard 🌤️

A modern, responsive weather dashboard that fetches real-time weather data from OpenWeatherMap API.

## 🌟 Features

- **Real-time Weather Data** - Current conditions, forecasts, and alerts
- **Multiple Locations** - Search and save favorite locations
- **Detailed Information** - Temperature, humidity, wind speed, UV index, air quality
- **Weather Charts** - Hourly and daily forecast visualization
- **Dark/Light Mode** - Beautiful theme toggle
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Caching** - Smart API caching to reduce requests
- **Geolocation** - Auto-detect user location
- **Search History** - Remember recent searches
- **Weather Alerts** - Display weather warnings

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Add your OpenWeatherMap API key to .env

# Start development server
npm run dev

# Start production server
npm start
```

## 📁 Project Structure

```
weather-dashboard/
├── public/              # Frontend files
├── src/                 # Backend files
├── server.js           # Express server
├── package.json        # Dependencies
└── .env.example        # Environment template
```

## 🔌 API Endpoints

- `GET /api/weather/current?city=London` - Current weather
- `GET /api/weather/hourly?city=London` - Hourly forecast
- `GET /api/weather/daily?city=London` - Daily forecast
- `GET /api/weather/air-quality?city=London` - Air quality data
- `GET /api/weather/search?q=lond` - Search cities
- `GET /api/weather/favorites` - Get favorite locations
- `POST /api/weather/favorites` - Add favorite
- `DELETE /api/weather/favorites/:id` - Remove favorite

## 🎨 Features

- Real-time weather updates
- Hourly and daily forecasts
- Air quality index
- Geolocation support
- Favorite locations
- Search history
- Dark/Light mode
- Responsive design

## 🔒 Security

- API key protected
- Rate limiting enabled
- CORS protection
- Input validation
- Error handling

## 📱 Responsive Design

- Mobile first approach
- Works on all devices
- Touch-friendly interface
- Optimized performance

## 📊 Tech Stack

**Backend:**
- Node.js
- Express.js
- Axios (HTTP client)
- Node-Cache

**Frontend:**
- HTML5
- CSS3
- Vanilla JavaScript
- Responsive Design

## 📄 License

MIT License

---

**Version:** 1.0.0 | **Status:** ✅ Ready
