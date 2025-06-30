import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css';
import HomePage from './components/HomePage';

const AppContent = () => {
    const [randomColor, setRandomColor] = useState('blue');

    // Effect for setting random color on initial load
    useEffect(() => {
        const colors = ['blue', 'green', 'violet', 'cyan', '#11998E', '#EA8D8D', '#D8B5FF', '#FF61D2', '#4E65FF', '#868F96', '#09203F', '#764BA2', '#2E3192'];
        setRandomColor(colors[Math.floor(Math.random() * colors.length)]);
    }, []);

    

    const renderContent = () => {
        return <HomePage randomColor={randomColor} />;
    };

    return (
        <div className="main">
            <h2 className="title">Song Finder</h2>
            {renderContent()}
        </div>
    );
};

const App = () => (
    <Router>
        <AppContent />
    </Router>
);

export default App;