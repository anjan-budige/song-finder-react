import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getTrendingData } from '../api';
import MusicPlayer from './MusicPlayer';
import { getSongAndSuggestionsList, getPlaylistSongs } from '../api';

const QuoteBox = () => {
    const quotes = [
        'I want someone who will look at me the same way I look at chocolate cake.',
        'You want to know who I’m in love with? Read the first word again.',
        'Life is the first gift, love is the second, and understanding the third.',
        'Love is an emotion experienced by the many and enjoyed by the few.',
        'Do what you love, and you will find the way to get it out to the world.',
    ];
    const [quote, setQuote] = useState('');

    useEffect(() => {
        setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }, []);

    return (
        <div className="box">
            <br />
            <h2><u>Quote of the day</u></h2>
            <br />
            <b style={{ fontFamily: 'solway' }}>{quote}</b>
            <br /> <br />
        </div>
    );
};

const HomePage = ({ randomColor }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [trending, setTrending] = useState([]);
    const [loading, setLoading] = useState(true);

    const lang = searchParams.get('lang') || 'telugu';
    const languages = ["Telugu", "Hindi", "Marathi", "English", "Tamil"];
    const languageValues = ["telugu", "hindi", "marathi", "english", "tamil"];

    useEffect(() => {
        const fetchTrending = async () => {
            setLoading(true);
            try {
                const data = await getTrendingData(lang);
                setTrending(data);
            } catch (error) {
                console.error("Error fetching trending data:", error);
            }
            setLoading(false);
        };
        fetchTrending();
    }, [lang]);

    const songQuery = searchParams.get('song');
    const playlistId = searchParams.get('playlist');

    const [musicList, setMusicList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            setMusicList([]);

            try {
                let data = [];
                if (songQuery) {
                    data = await getSongAndSuggestionsList(songQuery);
                } else if (playlistId) {
                    data = await getPlaylistSongs(playlistId);
                }

                if (data.length > 0) {
                    setMusicList(data);
                } else if (songQuery) {
                    setError('No song found for your search.');
                }

            } catch (err) {
                console.error("Error fetching data:", err);
                setError('Failed to load music. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        if (songQuery || playlistId) {
            fetchData();
        }
    }, [songQuery, playlistId]);

    const handleSearch = (e) => {
        e.preventDefault();
        const songQuery = e.target.elements.song.value;
        if (songQuery) {
            setSearchParams({ song: songQuery, lang });
        }
    };

    const handleLangChange = (e) => {
        // If a song or playlist is currently selected, preserve it in the params
        const newLang = e.target.value;
        const params = {};
        if (searchParams.get('song')) params.song = searchParams.get('song');
        if (searchParams.get('playlist')) params.playlist = searchParams.get('playlist');
        params.lang = newLang;
        setSearchParams(params);
    };

    // Handler for clicking a trending playlist without reloading the page
    const handlePlaylistClick = (e, playlistId) => {
        e.preventDefault();
        setSearchParams({ playlist: playlistId, lang });
    };

    return (
        <>
            <form className="form" onSubmit={handleSearch}>
                <label style={{ fontFamily: 'poppins', fontSize: '1.1rem', fontWeight: 'bold' }}>
                    Search Your Song:
                </label>
                <br /><br />
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <input type="text" name="song" placeholder="Enter Song Name" required />
                </div>
                <br />
                <input type="submit" value="Search" style={{ fontSize: '15px', padding: '10px', backgroundColor: 'blue', color: 'white', borderRadius: '5px', fontFamily: 'poppins' }} />
            </form>

            <form>
                <select name="lang" className="sel" value={lang} onChange={handleLangChange}>
                    {languages.map((name, index) => (
                        <option key={languageValues[index]} value={languageValues[index]}>
                            {name}
                        </option>
                    ))}
                </select>
            </form>
            <br />

            {isLoading ? (
                <div style={{ color: 'white', textAlign: 'center', margin: '30px 0' }}>
                    Loading...
                </div>
            ) : error ? (
                <div style={{ color: 'red', textAlign: 'center', margin: '30px 0' }}>
                    {error}
                </div>
            ) : (
                musicList.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '50px' }}>
                        <MusicPlayer musicList={musicList} />
                    </div>
                )
            )}

            <div className="dbox">
                <h2 style={{ color: randomColor }} id="dev">Developed By Anjan with &hearts;</h2>
            </div>
            <br />

            <div className="box2">
                <br />
                <h2 style={{ color: 'blue', width: '100%', fontSize: '1.5rem', marginTop: '10px' }}>
                    <u>Trending</u>
                </h2>
                {loading ? <p style={{ color: 'white' }}>Loading trending playlists...</p> : (
                    trending.map(p => (
                        <div className="new" key={p.id}>
                            <a
                                href={`?playlist=${p.id}&lang=${lang}`}
                                style={{ textDecoration: 'none', cursor: 'pointer' }}
                                onClick={e => handlePlaylistClick(e, p.id)}
                            >
                                <img style={{ width: '150px', height: '150px' }} src={p.image[2].link} alt={p.title} />
                                <br />
                                <h3 style={{ fontFamily: 'solway', fontSize: '1.1rem', color: 'purple' }}>
                                    {p.title}
                                </h3>
                            </a>
                            <br />
                        </div>
                    ))
                )}
            </div>
            <br />
            <QuoteBox />
            <br />
        </>
    );
};

export default HomePage;
