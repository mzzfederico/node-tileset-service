const mapnik = require("mapnik");
if (mapnik.register_default_input_plugins) mapnik.register_default_input_plugins();
if (mapnik.register_default_fonts) mapnik.register_default_fonts();

const path = require("path");
const mercator = require("./mercator");

const valueIsValidInteger = (value) => typeof value !== "undefined" && !isNaN(value) && value >= 0;

/**
 * Throws a default error message when it receives invalid coordinates
 * @param {number} z Zoom level
 * @param {number} x Position on the OSM grid for latitude
 * @param {number} y Position on the OSM grid for longitude
 * @param {number} extension File extension without .
 */
function throwOnInvalidCoordinates(z, x, y) {
    if (!valueIsValidInteger(z)) throw "z/zoom is not a valid integer";
    if (!valueIsValidInteger(x)) throw "x/latitude is not a valid integer";
    if (!valueIsValidInteger(y)) throw "y/longitude is not a valid integer";
}

/**
 * Gets the tile position on the disk as position and directory
 * @param {number} z Zoom level
 * @param {number} x Position on the OSM grid for latitude
 * @param {number} y Position on the OSM grid for longitude
 * @param {number} extension File extension without .
 */
function getTilePosition(z, x, y, extension = "png") {
    throwOnInvalidCoordinates(z, x, y);

    if (!["jpg", "png"].includes(extension)) throw "getTilePosition: extension is not a valid string";

    return {
        directory: `${z}/${x}`,
        filename: `${y}.${extension}`
    };
}

const MAP_STYLE_XML = path.resolve("data", "carto", "mapnik.xml");

/**
 * Gets a map instance bounded to the OSM coordinates 
 * @param {number} z Zoom level
 * @param {number} x Position on the OSM grid for latitude
 * @param {number} y Position on the OSM grid for longitude
 */
async function getMapInstance(z = 12, x = 2135, y = 1472) {
    throwOnInvalidCoordinates(z, x, y);

    /* New instance of the map */
    const map = new mapnik.Map(256, 256);
    /* Boundaries of the tile */
    const bbox = mercator.xyz_to_envelope(parseInt(x), parseInt(y), parseInt(z), false);
    /* Sets the boundaries and adds the default data layers */
    map.extent = bbox;

    return applyStyle(MAP_STYLE_XML, map);
}

/**
 * Applies a style to a map, synchronously 
 * @param {string} style Position on the disk of the compiled XML with data layers
 * @param {mapnik.Map} map Mapnik map instance without style
 */
function applyStyle(style, map) {
    map.loadSync(style, { log: false });
    return map;
}

/**
 * Saves a rendered PNG to the disk using a map instance
 * @param {mapnik.Map} tileMap Mapnik map instance with style and bounds
 * @param {string} position Position on the disk of end result
 */
async function renderMapToPNG(tileMap, position) {
    const objImage = new mapnik.Image(256, 256);
    return await new Promise((resolve, reject) => {
        tileMap.render(objImage, (err, image) => {
            if (err) {
                reject(err);
            }
            image.save(position);
            resolve(image);
        });
    });
}

/* function latitudeLongitudeToXY(latitude, longitude, zoom) {
    const deg2rad = (degrees) => degrees * (Math.PI / 180);
    const x = Math.floor(((longitude + 180) / 360) * Math.pow(2, zoom));
    const y = Math.floor((1 - Math.log(Math.tan(deg2rad(latitude)) + 1 / Math.cos(deg2rad(latitude))) / Math.PI) / 2 * Math.pow(2, zoom));
    return [x, y];
} */

module.exports = {
    getTilePosition,
    getMapInstance,
    renderMapToPNG
};
