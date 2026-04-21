const express = require('express');
const router = express.Router();
// Assume a configured pg Pool connects to the DB
const pool = require('./db'); 

// ----------------------------------------------------
// GET: Search Layers via Name/Specialization Text Match
// ----------------------------------------------------
router.get('/lawyers/search', async (req, res) => {
    try {
        const query = req.query.q || "";
        
        const sql = `
            SELECT id, name, photo_url, address, latitude, longitude, is_verified, rating, open_hours, specialization
            FROM lawyers
            WHERE name ILIKE $1 
               OR array_to_string(specialization, ',') ILIKE $1
            ORDER BY rating DESC
        `;
        const values = [`%${query}%`];
        
        const { rows } = await pool.query(sql, values);
        res.json({ status: 'success', data: rows });
    } catch (err) {
        console.error('Search Lawers Error:', err);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});

// ----------------------------------------------------
// GET: Geospacial PostGIS Query for Nearby Lawyers
// ----------------------------------------------------
router.get('/lawyers/nearby', async (req, res) => {
    try {
        const lat = parseFloat(req.query.lat);
        const lng = parseFloat(req.query.lng);
        const radius = parseFloat(req.query.radius) || 5000; // Default 5km
        
        if (!lat || !lng) {
            return res.status(400).json({ status: 'error', message: 'Latitude and Longitude required' });
        }

        // PostGIS core: ST_DWithin calculates if geometries are within 'radius' meters mapped by SRID 4326.
        const sql = `
            SELECT id, name, photo_url, address, latitude, longitude, is_verified, rating, open_hours, specialization
            FROM lawyers
            WHERE ST_DWithin(
                location, 
                ST_Point($1, $2)::geography, 
                $3
            )
            ORDER BY rating DESC
        `;
        const values = [lng, lat, radius]; // Note: PostGIS uses ST_Point(lon, lat)

        const { rows } = await pool.query(sql, values);
        res.json({ status: 'success', data: rows });
    } catch (err) {
        console.error('Nearby Lawyers API Error:', err);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});

// ----------------------------------------------------
// GET: Single Profile Info
// ----------------------------------------------------
router.get('/lawyers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const sql = `SELECT * FROM lawyers WHERE id = $1`;
        const { rows } = await pool.query(sql, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Lawyer not found' });
        }
        res.json({ status: 'success', data: rows[0] });
    } catch (err) {
        console.error('Get Lawyer Details Error:', err);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});

// ----------------------------------------------------
// POST: Initiate or Retrieve Chat Session
// ----------------------------------------------------
router.post('/chat/start', async (req, res) => {
    try {
        const { lawyerId } = req.body;
        // In reality, userId comes from the verified JWT payload: req.user.id
        const userId = req.user?.id || '00000000-0000-0000-0000-000000000000'; // mock fallback
        
        if (!lawyerId) {
            return res.status(400).json({ status: 'error', message: 'lawyerId is required' });
        }

        // Check if session exists using an UPSERT or a SELECT then INSERT methodology
        const checkSql = `SELECT id FROM chat_sessions WHERE user_id = $1 AND lawyer_id = $2`;
        const checkRows = await pool.query(checkSql, [userId, lawyerId]);
        
        if (checkRows.rows.length > 0) {
            return res.json({ status: 'success', sessionId: checkRows.rows[0].id });
        }
        
        // If not, forge a new relationship
        const insertSql = `
            INSERT INTO chat_sessions (user_id, lawyer_id) 
            VALUES ($1, $2)
            RETURNING id
        `;
        const insertRows = await pool.query(insertSql, [userId, lawyerId]);
        
        res.status(201).json({ status: 'success', sessionId: insertRows.rows[0].id });
    } catch (err) {
        console.error('Start Chat Error:', err);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});

module.exports = router;
