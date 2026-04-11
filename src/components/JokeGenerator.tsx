import React, { useEffect, useState } from 'react';

const JokeGenerator: React.FC = () => {
    const [joke, setJoke] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchJoke = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('https://official-joke-api.appspot.com/random_joke');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setJoke(`${data.setup} - ${data.punchline}`);
        } catch (err) {
            setError('Failed to fetch a joke. Try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJoke();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <h1 className="text-xl font-bold mb-4">Random Joke Generator</h1>
            {loading ? (
                <p className="text-lg text-gray-500">Loading...</p>
            ) : error ? (
                <p className="text-lg text-red-500">{error}</p>
            ) : (
                <p className="text-lg text-center">{joke}</p>
            )}
            <button
                onClick={fetchJoke}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Get a New Joke
            </button>
        </div>
    );
};

export default JokeGenerator;
