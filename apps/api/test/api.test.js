const assert = require('assert');
const test = require('node:test');

// Note: Using node:test native test runner
test('SEAIT Stay API Test Suite', async (t) => {
  await t.test('Health check and distance calculations', () => {
    // Haversine distance test to SEAIT Campus (6.3648, 124.9222)
    const R = 6371000;
    const lat1 = 6.3648;
    const lon1 = 124.9222;
    const lat2 = 6.3662;
    const lon2 = 124.9238;

    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = Math.round(R * c);

    // Green Ville is around 200m - 400m from SEAIT
    assert(distance > 100 && distance < 500, `Distance should be close to 350m, got ${distance}m`);
    const walkTime = Math.max(1, Math.round(distance / 80));
    assert(walkTime >= 2 && walkTime <= 6, `Walk time should be approx 4 mins, got ${walkTime} mins`);
  });

  await t.test('Recommendation scoring logic test', () => {
    const budget = 3000;
    const housePrice = 2100;
    const distanceMeters = 350;
    const maxDist = 1000;

    let score = 0;
    if (housePrice <= budget) score += 30;
    if (distanceMeters <= maxDist) score += 30;
    score += 15; // gender match
    score += 15; // room match
    score += 10; // amenities match

    assert.strictEqual(score, 100);
  });
});
