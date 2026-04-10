// Netlify Function for handling artwork ratings
// Uses Netlify Blobs for storage (free, built-in)

const { getStore } = require("@netlify/blobs");

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const store = getStore("ratings");

    // GET - Retrieve all ratings
    if (event.httpMethod === 'GET') {
      const { blobs } = await store.list();
      const ratings = {};

      for (const blob of blobs) {
        const data = await store.get(blob.key, { type: 'json' });
        if (data) ratings[blob.key] = data;
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(ratings)
      };
    }

    // POST - Submit a rating
    if (event.httpMethod === 'POST') {
      const { workId, rating, visitorId } = JSON.parse(event.body);

      if (!workId || !rating || rating < 1 || rating > 100) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid rating data' })
        };
      }

      // Get existing ratings for this work
      let workRatings = await store.get(workId, { type: 'json' }) || {
        ratings: [],
        totalScore: 0,
        count: 0,
        avgSize: 0
      };

      // Check if this visitor already rated (by visitorId)
      const existingIndex = workRatings.ratings.findIndex(r => r.visitorId === visitorId);

      if (existingIndex >= 0) {
        // Update existing rating
        const oldRating = workRatings.ratings[existingIndex].rating;
        workRatings.totalScore = workRatings.totalScore - oldRating + rating;
        workRatings.ratings[existingIndex] = { visitorId, rating, timestamp: Date.now() };
      } else {
        // Add new rating
        workRatings.ratings.push({ visitorId, rating, timestamp: Date.now() });
        workRatings.totalScore += rating;
        workRatings.count++;
      }

      // Calculate average
      workRatings.avgSize = Math.round(workRatings.totalScore / workRatings.count);

      // Save updated ratings
      await store.setJSON(workId, workRatings);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          avgSize: workRatings.avgSize,
          count: workRatings.count
        })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };

  } catch (error) {
    console.error('Ratings error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server error' })
    };
  }
};
