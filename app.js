/**
 * Staal Trailfinder - Client-side core logic
 * Built by Antigravity for Jasper & Wim
 */

// 1. Haversine afstand berekenen in meters (rekening houdend met de bolling van de aarde)
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Straal van de aarde in meters
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180;
    const deltaLambda = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

// 2. Afstand van punt P(plat, plon) naar lijnsegment A(alat, alon) -> B(blat, blon) in meters.
// Projecteert coördinaten lokaal op een plat vlak voor extreem snelle en nauwkeurige resultaten.
function distToSegmentMeters(plat, plon, alat, alon, blat, blon) {
    const R = 6371000;
    const avgLat = (alat + blat + plat) / 3 * Math.PI / 180;
    const cosLat = Math.cos(avgLat);

    const ax = 0, ay = 0;
    const bx = (blon - alon) * Math.PI / 180 * R * cosLat;
    const by = (blat - alat) * Math.PI / 180 * R;
    const px = (plon - alon) * Math.PI / 180 * R * cosLat;
    const py = (plat - alat) * Math.PI / 180 * R;

    const l2 = bx * bx + by * by;
    if (l2 === 0) return haversineDistance(plat, plon, alat, alon);

    let t = ((px - ax) * bx + (py - ay) * by) / l2;
    t = Math.max(0, Math.min(1, t)); // Klem projectie vast op het segment [0, 1]

    const projx = ax + t * bx;
    const projy = ay + t * by;

    const dx = px - projx;
    const dy = py - projy;
    return Math.sqrt(dx * dx + dy * dy);
}

// 3. GPX XML tekst parsen naar een array van [lon, lat] coördinaten
function parseGPX(gpxText) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(gpxText, "text/xml");
    const points = [];

    // Zoek eerst naar trackpoints (<trkpt>)
    const trkpts = xmlDoc.getElementsByTagName("trkpt");
    for (let i = 0; i < trkpts.length; i++) {
        const lat = parseFloat(trkpts[i].getAttribute("lat"));
        const lon = parseFloat(trkpts[i].getAttribute("lon"));
        if (!isNaN(lat) && !isNaN(lon)) {
            points.push([lon, lat]);
        }
    }

    // Als er geen trackpoints zijn, zoek dan naar routepoints (<rtept>)
    if (points.length === 0) {
        const rtepts = xmlDoc.getElementsByTagName("rtept");
        for (let i = 0; i < rtepts.length; i++) {
            const lat = parseFloat(rtepts[i].getAttribute("lat"));
            const lon = parseFloat(rtepts[i].getAttribute("lon"));
            if (!isNaN(lat) && !isNaN(lon)) {
                points.push([lon, lat]);
            }
        }
    }

    // Eventueel waypoints als laatste fallback (<wpt>)
    if (points.length === 0) {
        const wpts = xmlDoc.getElementsByTagName("wpt");
        for (let i = 0; i < wpts.length; i++) {
            const lat = parseFloat(wpts[i].getAttribute("lat"));
            const lon = parseFloat(wpts[i].getAttribute("lon"));
            if (!isNaN(lat) && !isNaN(lon)) {
                points.push([lon, lat]);
            }
        }
    }

    return points;
}

// 4. Berekent de cumulatieve kilometers vanaf de start langs de route
function getCumulativeDistances(points) {
    const distances = [0.0];
    let totalDistM = 0.0;
    for (let i = 1; i < points.length; i++) {
        const [lon1, lat1] = points[i - 1];
        const [lon2, lat2] = points[i];
        const step = haversineDistance(lat1, lon1, lat2, lon2);
        totalDistM += step;
        distances.push(totalDistM / 1000.0);
    }
    return { distances, totalDistM };
}

// 5. Verdeelt de route in deelsegmenten van ~15km en maakt bounding boxes aan (inclusief 600m marge)
function getBoundingBoxes(points, cumulativeDistancesKm) {
    const boxes = [];
    const segmentLengthKm = 15;
    let startIdx = 0;

    for (let i = 1; i <= points.length; i++) {
        const distSinceStart = cumulativeDistancesKm[i - 1] - cumulativeDistancesKm[startIdx];
        if (i === points.length || distSinceStart >= segmentLengthKm) {
            let minLon = Infinity, minLat = Infinity;
            let maxLon = -Infinity, maxLat = -Infinity;

            for (let j = startIdx; j < i; j++) {
                const [lon, lat] = points[j];
                if (lon < minLon) minLon = lon;
                if (lat < minLat) minLat = lat;
                if (lon > maxLon) maxLon = lon;
                if (lat > maxLat) maxLat = lat;
            }

            // Marge van ~600m omheen de box leggen
            const latMargin = 0.0054; // 1 graad lat is ~111km -> 600m = 0.0054 graden
            const avgLat = (minLat + maxLat) / 2;
            const lonMargin = 0.0054 / Math.cos(avgLat * Math.PI / 180);

            boxes.push([
                minLat - latMargin,
                minLon - lonMargin,
                maxLat + latMargin,
                maxLon + lonMargin
            ]);

            startIdx = i - 1;
        }
    }
    return boxes;
}

// 6. Bouwt de Overpass API query op voor alle bounding boxes gecombineerd
function buildOverpassQuery(boxes) {
    let query = `[out:json][timeout:60];\n(\n`;
    boxes.forEach(box => {
        // Formaat: minLat, minLon, maxLat, maxLon
        const boxStr = `${box[0].toFixed(6)},${box[1].toFixed(6)},${box[2].toFixed(6)},${box[3].toFixed(6)}`;
        query += `  node["amenity"~"cafe|restaurant|pharmacy|fuel|fast_food"](${boxStr});\n`;
        query += `  node["shop"~"supermarket|convenience|bakery|bicycle"](${boxStr});\n`;
        query += `  way["amenity"~"cafe|restaurant|pharmacy|fuel|fast_food"](${boxStr});\n`;
        query += `  way["shop"~"supermarket|convenience|bakery|bicycle"](${boxStr});\n`;
    });
    query += `);\nout center;`;
    return query;
}

// 7. Haalt POI's op van de Overpass server
async function fetchPOIs(query) {
    // We gebruiken de officiële Overpass API
    const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: "data=" + encodeURIComponent(query)
    });
    if (!response.ok) {
        throw new Error("De OpenStreetMap server reageert niet. Probeer het later opnieuw.");
    }
    const data = await response.json();
    return data.elements || [];
}

// 8. Verwerkt de POI's: filtert op exact 500m van de route en koppelt kilometerstanden
function processPOIs(elements, points, cumulativeDistancesKm) {
    const filteredPois = [];
    const seenIds = new Set();

    elements.forEach(el => {
        // Voorkom dubbele resultaten
        const id = el.id;
        if (seenIds.has(id)) return;
        seenIds.add(id);

        let lat = el.lat;
        let lon = el.lon;
        // Als het een 'way' (polygoon) is, pak dan het middelpunt
        if (el.type === "way" && el.center) {
            lat = el.center.lat;
            lon = el.center.lon;
        }

        if (lat === undefined || lon === undefined) return;

        // Bereken de korste afstand tot de route (segment voor segment)
        let minDistanceM = Infinity;
        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];
            const d = distToSegmentMeters(lat, lon, p1[1], p1[0], p2[1], p2[0]);
            if (d < minDistanceM) {
                minDistanceM = d;
            }
        }

        // Alleen behouden als het binnen de 500 meter ligt
        if (minDistanceM <= 500) {
            // Zoek het dichtstbijzijnde GPX-routepunt om de kilometerstand te bepalen
            let minIdx = 0;
            let minD = Infinity;
            for (let idx = 0; idx < points.length; idx++) {
                const rLon = points[idx][0];
                const rLat = points[idx][1];
                // Simpele Euclidische afstand in graden (snel genoeg voor vergelijkingen)
                const d = (lat - rLat) ** 2 + (lon - rLon) ** 2;
                if (d < minD) {
                    minD = d;
                    minIdx = idx;
                }
            }

            // Haal de cumulatieve kilometerstand op van dit specifieke routepunt
            const distanceFromStartKm = Math.round(cumulativeDistancesKm[minIdx] * 10) / 10;
            
            const tags = el.tags || {};
            const poiType = tags.amenity || tags.shop || "unknown";

            filteredPois.push({
                id: id,
                lat: lat,
                lon: lon,
                distance: Math.round(minDistanceM),
                distance_from_start: distanceFromStartKm,
                name: tags.name || "Onbekend",
                type: poiType,
                street: tags["addr:street"] || "",
                housenumber: tags["addr:housenumber"] || "",
                city: tags["addr:city"] || ""
            });
        }
    });

    // Sorteer op kilometerstand vanaf de start
    filteredPois.sort((a, b) => a.distance_from_start - b.distance_from_start);

    // Beperk tot maximaal 1000 POI's om mobiele browsers soepel te houden (prestaties blijven uitstekend)
    return filteredPois.slice(0, 1000);
}
