const API_BASE_URL = "https://jiosaavn-api-sigma-rouge.vercel.app/api";
const TRENDING_API_URL = "https://music-api-alpha-woad.vercel.app/modules?songs";

// Helper to decode HTML entities that might be in song names
const decodeHtml = (html) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
};

// Helper function to format song data consistently
const formatSongData = (song) => {
    if (!song || !song.downloadUrl || song.downloadUrl.length === 0) return null;
    return {
        id: song.id,
        name: decodeHtml(song.name),
        author: decodeHtml(song.album.name),
        img: song.image[2].url, // Use high quality image
        audio: song.downloadUrl[song.downloadUrl.length - 1].url, // Get highest quality audio
        duration: formatDuration(song.duration),
    };
};

// Helper to format duration from seconds to MM:SS
const formatDuration = (iSeconds) => {
    const min = Math.floor(iSeconds / 60);
    const sec = String(iSeconds % 60).padStart(2, '0');
    return `${min}:${sec}`;
};

export const searchSong = async (query) => {
    const response = await fetch(`${API_BASE_URL}/search/songs?query=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();
    return data.data.results;
};

export const getSongSuggestions = async (songId) => {
    const response = await fetch(`${API_BASE_URL}/songs/${songId}/suggestions`);
    if (!response.ok) throw new Error("Failed to fetch suggestions");
    const data = await response.json();
    return data.data;
};

export const getPlaylist = async (playlistId) => {
    const response = await fetch(`${API_BASE_URL}/playlists?id=${playlistId}`);
    if (!response.ok) throw new Error("Failed to fetch playlist");
    const data = await response.json();
    return data.data.songs;
};

export const getTrendingData = async (language) => {
    const response = await fetch(`${TRENDING_API_URL}&language=${language}`);
    if (!response.ok) throw new Error("Failed to fetch trending data");
    const data = await response.json();
    return data.data.playlists;
};

// This function orchestrates the search and suggestion fetching
export const getSongAndSuggestionsList = async (query) => {
    const searchResults = await searchSong(query);
    if (!searchResults || searchResults.length === 0) {
        return [];
    }

    const mainSong = searchResults[0];
    const suggestions = await getSongSuggestions(mainSong.id);

    const fullList = [mainSong, ...suggestions.filter(s => s.id !== mainSong.id)];

    return fullList.map(formatSongData).filter(Boolean); // Format and remove any null entries
};

// This function fetches and formats a playlist
export const getPlaylistSongs = async (playlistId) => {
    const songs = await getPlaylist(playlistId);
    return songs.map(formatSongData).filter(Boolean);
};