mapboxgl.accessToken = 'pk.eyJ1IjoiYW50c2tlbHRvbiIsImEiOiJjaXplcXpvOHAwMDAwMndvM3YzMXVlMDd3In0.DrVDhqBdNB4KIhYD33ZB_w';

function munge(path) {
    var url = window.location;
    return `${url.protocol}//${url.hostname}:${url.port}/${path}`;
}

document.addEventListener("DOMContentLoaded", function(event) {
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v9'
    });

    map.on("load", function() {
        map.addLayer({
            id: 'dateline-data',
            type: 'fill',
            source: {
                type: 'vector',
                url: munge('tilejson/dateline/tiles.json')
            },
            "source-layer": "dateline",
            layout: {
            },
            paint: {
                "fill-color": "rgba(249, 82, 230, 0)",
                "fill-outline-color": "rgba(249, 82, 239, 1)"
            }
        });

        map.addLayer({
            id: 'foo-data',
            type: 'fill',
            source: {
                type: 'vector',
                url: munge('tilejson/foo/tiles.json')
            },
            "source-layer": "foo",
            layout: {
            },
            paint: {
                "fill-color": "rgba(248, 162, 51, 0.8)",
                "fill-outline-color": "rgba(248, 162, 61, 1)"
            }
        });

        map.addLayer({
            id: 'lad-data',
            type: 'fill',
            source: {
                type: 'vector',
                url: munge('tilejson/lad/tiles.json')
            },
            "source-layer": "lad",
            layout: {
            },
            paint: {
                "fill-color": "rgba(144, 105, 88, 0.3)",
                "fill-outline-color": "rgba(144, 105, 88, 1)"
            }
        });

        map.addLayer({
            id: 'wards-data',
            type: 'fill',
            source: {
                type: 'vector',
                url: munge('tilejson/wards/tiles.json')
            },
            "source-layer": "wards",
            layout: {
            },
            paint: {
                "fill-color": "rgba(132, 48, 242, 0)",
                "fill-outline-color": "rgba(138, 42, 242, 1)"
            }
        });

        map.addLayer({
            id: 'county-data',
            type: 'fill',
            source: {
                type: 'vector',
                url: munge('tilejson/county/tiles.json')
            },
            "source-layer": "county",
            layout: {
            },
            paint: {
                "fill-color": "rgba(254, 93, 38, 0)",
                "fill-outline-color": "rgba(254, 93, 38, 1)"
            }
        });

        // add a mapbox.com derived vector data source so we can compare its mechanism to our own
        if(0) {
            map.addLayer({
                "id": "terrain-data",
                "type": "line",
                "source": {
                    type: 'vector',
                    url: 'mapbox://mapbox.mapbox-terrain-v2'
                },
                "source-layer": "contour",
                "layout": {
                    "line-join": "round",
                    "line-cap": "round"
                },
                "paint": {
                    "line-color": "#ff69b4",
                    "line-width": 1
                }
            });
        }
    });
});
