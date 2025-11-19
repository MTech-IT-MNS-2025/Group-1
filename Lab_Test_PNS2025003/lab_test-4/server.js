const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('public'));

function modExp(base, exponent, modulus) {
    if (modulus === 1) return 0;
    let result = 1;
    base = base % modulus;
    while (exponent > 0) {
        if (exponent % 2 === 1) {
            result = (result * base) % modulus;
        }
        exponent = exponent >> 1;
        base = (base * base) % modulus;
    }
    return result;
}

app.post('/compute', (req, res) => {
    try {
        const { g, p, x } = req.body;

        if (typeof g !== 'number' || typeof p !== 'number' || typeof x !== 'number') {
            return res.status(400).json({ error: 'Invalid input types' });
        }

        if (p < 2 || g < 2) {
            return res.status(400).json({ error: 'p and g must be greater than 1' });
        }

        const b = Math.floor(Math.random() * (p - 1)) + 1;
        const y = modExp(g, b, p);
        const K = modExp(x, b, p);

        res.json({ K, y });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
});
