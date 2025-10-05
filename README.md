# 🌦️ NASA WeatherSense

> **Will It Rain On My Parade?** - An intelligent weather analysis application powered by NASA data and Google Gemini AI

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB.svg)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-5.1-000000.svg)](https://expressjs.com/)
[![Vite](https://img.shields.io/badge/Vite-7.1-646CFF.svg)](https://vitejs.dev/)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🌟 Overview

NASA WeatherSense is a comprehensive weather analysis platform that combines NASA's weather data with Google's Gemini AI to provide intelligent weather predictions and insights. The application helps users make informed decisions by analyzing weather conditions for specific locations and dates.

This project was developed for the **NASA Space Apps Challenge**, focusing on making weather data accessible and actionable for everyday users.

## ✨ Features

- 🗺️ **Interactive Location Selection** - Choose any location worldwide using Mapbox integration
- 📅 **Date-based Weather Analysis** - Get weather predictions for specific dates
- 🤖 **AI-Powered Insights** - Leverages Google Gemini AI for intelligent weather analysis
- 📊 **Historical Trends** - Visualize weather patterns with interactive charts
- 🌡️ **Comprehensive Weather Data** - Temperature, precipitation, humidity, wind speed, and more
- 📱 **Responsive Design** - Works seamlessly across desktop, tablet, and mobile devices
- ⚡ **Real-time Updates** - Fast and efficient data processing
- 🎨 **NASA-themed UI** - Beautiful space-inspired design elements

## 🛠️ Tech Stack

### Frontend

- **React 19.2** - Modern UI library with latest features
- **TypeScript 5.9** - Type-safe development
- **Vite 7.1** - Lightning-fast build tool
- **D3.js & Recharts** - Interactive data visualizations
- **Mapbox GL** - Interactive maps for location selection
- **Axios** - HTTP client for API requests
- **date-fns** - Modern date utility library

### Backend

- **Node.js & Express 5.1** - Server framework
- **TypeScript 5.6** - Type-safe backend development
- **Google Gemini AI** - Advanced AI capabilities
- **Visual Crossing Weather API** - Real weather data and statistical forecasts
- **Axios** - HTTP client for API requests
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management
- **Google Search Grounding** - Real-time web data integration for accurate weather insights

### Development Tools

- **ESLint** - Code quality and consistency
- **Jest** - Unit testing framework
- **Playwright** - End-to-end testing
- **Nodemon** - Auto-reload during development

## 📁 Project Structure

```
NASA-WeatherSense/
├── backend/                    # Express.js backend server
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── controllers/       # Request handlers
│   │   ├── routes/            # API route definitions
│   │   ├── services/          # Business logic (Gemini AI)
│   │   ├── types/             # TypeScript type definitions
│   │   └── server.ts          # Main server file
│   ├── .env.example           # Environment variables template
│   ├── package.json           # Backend dependencies
│   └── tsconfig.json          # TypeScript configuration
│
├── frontend/                   # React + Vite frontend
│   ├── public/                # Static assets
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── common/       # Reusable components
│   │   │   ├── date/         # Date picker component
│   │   │   ├── location/     # Location selector
│   │   │   ├── trends/       # Chart components
│   │   │   └── weather/      # Weather display components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API service layer
│   │   ├── styles/           # Global styles
│   │   ├── types/            # TypeScript types
│   │   ├── utils/            # Utility functions
│   │   ├── App.tsx           # Main App component
│   │   └── main.tsx          # Application entry point
│   ├── .env.example          # Environment variables template
│   ├── package.json          # Frontend dependencies
│   ├── vite.config.ts        # Vite configuration
│   └── tsconfig.json         # TypeScript configuration
│
└── README.md                  # This file
```

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Package manager
- **Git** - Version control

You'll also need API keys for:

- **Google Gemini API** - [Get API Key](https://makersuite.google.com/app/apikey)
- **Mapbox API** - [Get API Key](https://www.mapbox.com/)

## 🚀 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/thrkingunknown/NASA-WeatherSense.git
   cd NASA-WeatherSense
   ```

2. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

## ⚙️ Configuration

### Backend Configuration

1. Navigate to the `backend` directory
2. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and add your credentials:

   ```env
   PORT=3001
   GEMINI_API_KEY=your_gemini_api_key_here
   VISUAL_CROSSING_API_KEY=your_visual_crossing_api_key_here
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
   ```

   **Get API Keys:**

   - **Gemini AI**: [Get API Key](https://makersuite.google.com/app/apikey)
   - **Visual Crossing**: [Get API Key](https://www.visualcrossing.com/weather-api) (Free tier: 1000 records/day)

   📖 **Visual Crossing Integration**: See [VISUAL_CROSSING_INTEGRATION.md](./VISUAL_CROSSING_INTEGRATION.md) for detailed documentation.

### Frontend Configuration

1. Navigate to the `frontend` directory
2. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and add your credentials:
   ```env
   VITE_MAPBOX_API_KEY=your_mapbox_api_key_here
   VITE_API_BASE_URL=http://localhost:3001
   ```

## 🏃 Running the Application

### Development Mode

1. **Start the backend server** (in the `backend` directory):

   ```bash
   npm run dev
   ```

   The backend will run on `http://localhost:3001`

2. **Start the frontend development server** (in the `frontend` directory):

   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:5173`

3. Open your browser and navigate to `http://localhost:5173`

### Production Build

1. **Build the backend**:

   ```bash
   cd backend
   npm run build
   npm start
   ```

2. **Build the frontend**:
   ```bash
   cd frontend
   npm run build
   npm run preview
   ```

## 📚 API Documentation

### Base URL

```
http://localhost:3001/api
```

### Endpoints

#### Health Check

```http
GET /api/health
```

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2025-10-04T12:00:00.000Z"
}
```

#### Weather Analysis

```http
GET /api/weather?latitude={lat}&longitude={lon}&date={DD-MM-YYYY}
```

**Parameters:**

- `latitude` (required): Latitude coordinate (-90 to 90)
- `longitude` (required): Longitude coordinate (-180 to 180)
- `date` (required): Date in DD-MM-YYYY format

**Example Request:**

```http
GET /api/weather?latitude=40.7128&longitude=-74.0060&date=15-10-2025
```

**Response:**

```json
{
  "success": true,
  "data": {
    "location": {
      "latitude": 40.7128,
      "longitude": -74.006
    },
    "date": "15-10-2025",
    "analysis": "AI-generated weather analysis",
    "conditions": {
      "temperature": 20,
      "precipitation": 30,
      "humidity": 65,
      "windSpeed": 15
    }
  }
}
```

## 🌐 Deployment

### Backend Deployment (Example: Render/Railway)

1. Set environment variables in your hosting platform
2. Update `ALLOWED_ORIGINS` to include your frontend URL
3. Deploy the `backend` directory

### Frontend Deployment (Example: Vercel/Netlify)

1. Update `.env.production` with production API URL
2. Build the project: `npm run build`
3. Deploy the `dist` folder

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- **NASA** - For providing access to weather data and inspiring this project
- **Google Gemini AI** - For advanced AI capabilities
- **Mapbox** - For interactive mapping features
- **NASA Space Apps Challenge** - For the opportunity to build this application

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

<div align="center">
  <p>Made with ❤️ for the NASA Space Apps Challenge</p>
  <p>⭐ Star this repository if you find it helpful!</p>
</div>
