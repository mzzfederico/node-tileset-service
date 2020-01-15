import "babel-polyfill";

const {
    getTilePosition,
    getMapInstance,
    renderMapToPNG
} = require("../src/map");

const mapnik = require("mapnik");

test("throwOnInvalidCoordinates throws with invalid coordinates", () => {
    expect(() => throwOnInvalidCoordinates(1)).toThrow();
    expect(() => throwOnInvalidCoordinates(1, 2)).toThrow();
    expect(() => throwOnInvalidCoordinates(1, 2, 3)).toBeTruthy();
    return;
});

test("getTilePosition correctly gets the directory and filename", () => {
    const { filename, directory } = getTilePosition(1, 2, 3, "jpg");
    expect(filename).toBe("3.jpg");
    expect(directory).toBe("1/2");
    return;
});

test("getTilePosition only works with jpg and png for now", () => {
    expect(() => getTilePosition(1, 2, 3, "tiff")).toThrow();
    expect(() => getTilePosition(1, 2, 3, "jpg")).toBeTruthy();
    return;
});

test("getMapInstance returns an instance of a map", () => {
    const mapInstance = getMapInstance(1, 2, 3);
    expect(Promise.resolve(mapInstance)).resolves.toBeInstanceOf(mapnik.Map);
});
