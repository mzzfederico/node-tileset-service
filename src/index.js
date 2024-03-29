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
        const position = path.resolve("data", "tmp", directory, filename);

        /* Creates the directory for the tiles at that latitude if it does not exist */
        mkdirp.sync(path.resolve("data", "tmp", directory));

        /* Check cache */
        if (fs.existsSync(position)) return res.sendFile(position);

        /* Creates instance with coordinates, apply data layers from xml */
        const mapInstance = await getMapInstance(zoom, x, y);
        /* Renders the instance at the position */
        await renderMapToPNG(mapInstance, position);

        return res.sendFile(position);
    } catch (error) {
        console.error(error);
        return res.status(500).send(`${error.toString()}`);
    }
});

app.use("/test", (req, res) => {
    res.sendFile(path.resolve("src", "test.html"));
});

app.listen(3000, () => {
    console.log("listening");
});
