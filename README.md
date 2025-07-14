# 🎵 Song Finder React

A powerful, interactive music discovery web app built using **React.js**. This application scrapes data from **Saavn** and **Gaana** to let users search songs, explore music by genre, and even navigate using **Bluetooth devices** and mobile gestures.

---

## 🌟 Features

- 🔍 **Search Music**: Search songs from **Saavn** and **Gaana** using live APIs/scraping
- 🎧 **Genre-based Suggestions**: Personalized song recommendations by genre
- 📱 **Mobile Navigation Support**: Optimized UI and navigation for mobile users
- 🎮 **Bluetooth Navigation**: Control UI via Bluetooth hardware buttons (headsets/devices)
- ⚡ **Fast & Lightweight**: Built for speed using React and minimal dependencies
- 🎨 **Interactive UI**: Clean, animated interface with dark mode support

---

## 🔍 Data Source

This project uses **custom scraping** logic to fetch data from:

- **Saavn (JioSaavn)** – song names, albums, artists, streaming links
- **Gaana** – top tracks, artist info, playlists

> ⚠️ **Disclaimer**: This project scrapes public data for **educational purposes only** and is not affiliated with Saavn or Gaana.

---

## 🛠 Tech Stack

- **React.js** – UI framework
- **Axios** – API calls
- **Cheerio** – HTML scraping
- **Tailwind CSS** – Styling
- **Web Bluetooth API** – Device interaction
- **React Router** – Page navigation

---

## 🚀 Installation

```bash
git clone https://github.com/anjan-budige/song-finder-react.git
cd song-finder-react
npm install
npm start
