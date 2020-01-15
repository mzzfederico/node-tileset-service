const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
const express = require("express");

const app = express();

const {
    getTilePosition,
    getMapInstance,
    renderMapToPNG
} = require("./map");

const {
    isZoomSupported
} = require("./utils");

app.get("/api/tile/:zoom/:x/:y.png", async (req, res) => {
    const { zoom, x, y } = req.params;

    if (!isZoomSupported(zoom)) throw "isZoomSupported: OSM works only with zoom levels 0-19";

    try {
        const { filename, directory } = getTilePosition(zoom, x, y);
        const position = path.resolve(`./tmp/`, directory, filename);

        /* Creates the directory for the tiles at that latitude if it does not exist */
        mkdirp.sync(`./tmp/${directory}`);

        /* Check cache */
        if (fs.existsSync(position)) return res.sendFile(position);

        /* Creates instance with coordinates, apply data layers from xml */
        const mapInstance = await getMapInstance(zoom, x, y);
        /* Renders the instance at the position */
        await renderMapToPNG(mapInstance, position);

        return res.sendFile(filename);
    } catch (error) {
        return res.status(500).send(`Error: ${error.toString()}`);
    }
});

app.use("/test", (req, res) => {
    res.sendFile(path.resolve("test.html"));
});

app.listen(3000, () => {
    console.log("listening");
});
