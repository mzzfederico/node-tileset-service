const MAX_ZOOM_LEVEL = 19;

function isZoomSupported(zoom) {
    if (zoom > MAX_ZOOM_LEVEL || zoom < 0) {
        return false;
    }
    return true;
}

module.exports = {
    isZoomSupported
};
