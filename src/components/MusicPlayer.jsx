import React, { useState, useEffect, useRef, useCallback } from 'react';

const MusicPlayer = ({ musicList }) => {
    const [index, setIndex] = useState(0);
    const [currentTime, setCurrentTime] = useState('0:00');
    // 1. State renamed for clarity: `true` means playing, `false` means paused.
    const [isPlaying, setIsPlaying] = useState(false);

    const playerRef = useRef(null);
    const timelineRef = useRef(null);
    const playheadRef = useRef(null);
    const hoverPlayheadRef = useRef(null);

    const currentSong = musicList[index];

    const formatTime = (time) => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        let seconds = Math.floor(time % 60);
        seconds = seconds >= 10 ? seconds : "0" + seconds;
        return `${minutes}:${seconds}`;
    };

    // 2. All event handlers are wrapped in `useCallback` for stability.
    const prevSong = useCallback(() => {
        const newIndex = (index + musicList.length - 1) % musicList.length;
        setIndex(newIndex);
    }, [index, musicList.length]);

    const nextSong = useCallback(() => {
        const newIndex = (index + 1) % musicList.length;
        setIndex(newIndex);
    }, [index, musicList.length]);

    const playOrPause = useCallback(() => {
        // Toggle the playing state. The `useEffect` below will handle the action.
        setIsPlaying((prevIsPlaying) => !prevIsPlaying);
    }, []);
    
    const clickAudio = (key) => {
        setIndex(key);
    };
    
    // 3. This effect now ONLY handles loading a new song when the index changes.
    useEffect(() => {
        if (playerRef.current) {
            playerRef.current.load();
            if (isPlaying) {
                // If a song was already playing, play the new one automatically.
                playerRef.current.play().catch(e => {
                    console.error("Autoplay was prevented:", e);
                    setIsPlaying(false); // Correct the state if autoplay fails.
                });
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [index]); // We intentionally leave `isPlaying` out to prevent the original bug.
                 // This effect should only run when the song itself changes.

    // 4. This new effect syncs the `isPlaying` state with the audio element.
    useEffect(() => {
        if (playerRef.current) {
            if (isPlaying) {
                playerRef.current.play().catch(e => {
                     console.error("Play command failed:", e);
                     setIsPlaying(false);
                });
            } else {
                playerRef.current.pause();
            }
        }
    }, [isPlaying]);

    // Event Listeners setup for the timeline
    useEffect(() => {
        const player = playerRef.current;
        const timeline = timelineRef.current;
        if (!player || !timeline) return;

        const timeUpdate = () => {
            const duration = player.duration;
            const playPercent = 100 * (player.currentTime / duration);
            if (playheadRef.current) {
               playheadRef.current.style.width = `${playPercent}%`;
            }
            setCurrentTime(formatTime(player.currentTime));
        };

        const changeCurrentTime = (e) => {
            const duration = player.duration;
            const timelineWidth = timeline.offsetWidth;
            const timelineStart = timeline.getBoundingClientRect().left;
            const userClickWidth = e.clientX - timelineStart;
            const userClickWidthInPercent = (userClickWidth * 100) / timelineWidth;
            
            if (playheadRef.current) {
                playheadRef.current.style.width = `${userClickWidthInPercent}%`;
            }
            player.currentTime = (duration * userClickWidthInPercent) / 100;
        };
        
        const hoverTimeLine = (e) => {
            const duration = player.duration;
            const timelineWidth = timeline.offsetWidth;
            const timelineStart = timeline.getBoundingClientRect().left;
            const userClickWidth = e.clientX - timelineStart;
            
            // Boundary check
            if (userClickWidth < 0 || userClickWidth > timelineWidth) return;
            
            const userClickWidthInPercent = (userClickWidth * 100) / timelineWidth;

            if (hoverPlayheadRef.current) {
                hoverPlayheadRef.current.style.width = `${userClickWidthInPercent}%`;
                const time = (duration * userClickWidthInPercent) / 100;
                if (!isNaN(time)) {
                    hoverPlayheadRef.current.dataset.content = formatTime(time);
                }
            }
        };

        const resetTimeLine = () => {
             if (hoverPlayheadRef.current) {
                hoverPlayheadRef.current.style.width = '0';
             }
        };

        player.addEventListener("timeupdate", timeUpdate);
        player.addEventListener("ended", nextSong);
        timeline.addEventListener("click", changeCurrentTime);
        timeline.addEventListener("mousemove", hoverTimeLine);
        timeline.addEventListener("mouseout", resetTimeLine);

        return () => {
            player.removeEventListener("timeupdate", timeUpdate);
            player.removeEventListener("ended", nextSong);
            timeline.removeEventListener("click", changeCurrentTime);
            timeline.removeEventListener("mousemove", hoverTimeLine);
            timeline.removeEventListener("mouseout", resetTimeLine);
        };
    }, [nextSong]);

    // Media Session API integration
    useEffect(() => {
      if (!currentSong || !('mediaSession' in navigator)) return;
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title:  currentSong.name,
        artist: currentSong.author,
        album:  'My playlist',
        artwork: [
          { src: currentSong.img, sizes: '96x96',  type: 'image/png' },
          { src: currentSong.img, sizes: '192x192', type: 'image/png' },
          { src: currentSong.img, sizes: '512x512', type: 'image/png' },
        ],
      });
    }, [currentSong]);

    // Set action handlers once.
    useEffect(() => {
      if (!('mediaSession' in navigator)) return;

      navigator.mediaSession.setActionHandler('play',        playOrPause);
      navigator.mediaSession.setActionHandler('pause',       playOrPause);
      navigator.mediaSession.setActionHandler('previoustrack', prevSong);
      navigator.mediaSession.setActionHandler('nexttrack',     nextSong);
      navigator.mediaSession.setActionHandler('seekto',       ({ seekTime }) => {
        if (playerRef.current && Number.isFinite(seekTime)) {
          playerRef.current.currentTime = seekTime;
        }
      });
      // The component will re-render, but these handlers reference the latest functions due to useCallback.
    }, [playOrPause, prevSong, nextSong]);

    // Sync Media Session playback state
    useEffect(() => {
        const audio = playerRef.current;
        if (!audio || !('mediaSession' in navigator)) return;
    
        const updatePositionState = () => {
            if ('setPositionState' in navigator.mediaSession) {
                navigator.mediaSession.setPositionState({
                    duration: audio.duration || 0,
                    position: audio.currentTime || 0,
                    playbackRate: audio.playbackRate,
                });
            }
        };
    
        const onPlay = () => {
            navigator.mediaSession.playbackState = 'playing';
            setIsPlaying(true); // Sync component state if OS play button is used
            updatePositionState();
        };
    
        const onPause = () => {
            navigator.mediaSession.playbackState = 'paused';
            setIsPlaying(false); // Sync component state if OS pause button is used
            updatePositionState();
        };
    
        // Set initial state for the current audio element
        navigator.mediaSession.playbackState = audio.paused ? 'paused' : 'playing';
        updatePositionState();
    
        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onPause);
        audio.addEventListener('seeked', updatePositionState);
    
        // This cleanup function will run when the component unmounts OR when the index changes
        return () => {
            audio.removeEventListener('play', onPlay);
            audio.removeEventListener('pause', onPause);
            audio.removeEventListener('seeked', updatePositionState);
        };
    }, [index]);


    if (!currentSong) {
        return <div style={{ color: 'white' }}>Loading player...</div>;
    }

    return (
        <div className="card">
            <div className="current-song">
                <audio ref={playerRef} key={currentSong.audio}>
                    <source src={currentSong.audio} type="audio/ogg" />
                    Your browser does not support the audio element.
                </audio>

                <div className="img-wrap">
                    <img src={currentSong.img} alt={currentSong.name} />
                </div>

                <span className="song-name">{currentSong.name}</span>
                <span className="song-autor">{currentSong.author}</span>

                <div className="time">
                    <div className="current-time">{currentTime}</div>
                    <div className="end-time">{currentSong.duration}</div>
                </div>

                <div ref={timelineRef} id="timeline">
                    <div ref={playheadRef} id="playhead" style={{margin: "0 auto"}}></div>
                    <div ref={hoverPlayheadRef} className="hover-playhead" data-content="0:00"></div>
                </div>

                <div className="controls">
                    <button onClick={prevSong} className="prev prev-next current-btn">
                        <i className="fas fa-backward"></i>
                    </button>
                    {/* 5. The button and playlist now use `isPlaying` state */}
                    <button onClick={playOrPause} className="play current-btn">
                        {isPlaying ? <i className="fas fa-pause"></i> : <i className="fas fa-play"></i>}
                    </button>
                    <button onClick={nextSong} className="next prev-next current-btn">
                        <i className="fas fa-forward"></i>
                    </button>
                </div>
            </div>

            <div className="play-list">
                {musicList.map((music, key) => (
                    <div
                        key={key}
                        onClick={() => clickAudio(key)}
                        className={`track ${index === key ? (isPlaying ? 'play-now' : 'current-audio') : ''}`}
                    >
                        <img className="track-img" src={music.img} alt={music.name} />
                        <div className="track-discr">
                            <span className="track-name">{music.name}</span>
                            <span className="track-author">{music.author}</span>
                        </div>
                        <span className="track-duration">
                            {(index === key && isPlaying) ? currentTime : music.duration}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    
    );
};

export default MusicPlayer;