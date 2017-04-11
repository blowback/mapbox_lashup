var express = require('express');
var app = express();
var compression = require('compression');
var cors = require('cors');
var path = require('path');
var fs = require('fs');
var dust = require('express-dustjs');
var eyes = require('eyes');

var geojsonvt = require('geojson-vt');
var vtpbf = require('vt-pbf');

const PORT = 3000;

// Mapbox vector tiles have their own MIME type (a vendor extension)
// however mapbox.com seems not to use it
//const MIME_TYPE = 'application/vnd.mapbox-vector-tile';
const MIME_TYPE = 'application/x-protobuf';

var TILE_SETS = [
    {
        id: 'dateline',
        file: 'dateline.json',
        enabled: true,
        config: {
            maxZoom: 20,
            tolerance: 1,
            indexMaxZoom: 4,
            indexMaxPoints: 100000,
            solidChildren: true,
            debug:0
        }
    },
    {
        id: 'foo',
        file: 'foo.geo.json',
        enabled: true,
        config: {
            maxZoom: 20,
            tolerance: 1,
            indexMaxZoom: 4,
            indexMaxPoints: 100000,
            solidChildren: true,
            debug:0
        }
    },
    {
        id: 'lad',
        file: 'lad.json',
        enabled: true,
        config: {
            maxZoom: 20,
            tolerance: 1,
            indexMaxZoom: 4,
            indexMaxPoints: 100000,
            solidChildren: true,
            debug:0
        }
    },
    {
        id: 'wards',
        file: 'wards.json',
        enabled: true,
        config: {
            maxZoom: 20,
            tolerance: 1,
            indexMaxZoom: 4,
            indexMaxPoints: 100000,
            solidChildren: true,
            debug:0
        }
    },
    {
        id: 'county',
        file: 'county.geo.json',
        enabled: true,
        config: {
            maxZoom: 20,
            tolerance: 1,
            indexMaxZoom: 4,
            indexMaxPoints: 100000,
            solidChildren: true,
            debug:0
        }
    }
];

TILE_SETS.map((set) => {
    if(set.enabled) {
        console.log(`building tileset index for ${set.id}`);
        var fpath = path.resolve(__dirname, 'geojson', set.file);
        console.log(`fpath ${fpath}`);
        var json = JSON.parse(fs.readFileSync(fpath));
        set.index = geojsonvt(json, set.config);
    } else {
        console.log(`skipping disabled tileset ${set}`);
    }
});

// set up templating engine
app.engine('dust', dust.engine({
    useHelpers: true
}));

app.set('view engine', 'dust');
app.set('views', path.resolve(__dirname, './views'));

// enable CORS for all endpoints
app.use(cors());

// apply compression to everything.
// compress even tiny files (like vector tiles!)
// apply a filter that permits compression of vector tiles
app.use(compression({
    threshold: 0,
    filter: shouldCompress
}));

// specifically enable vector tile compression
function shouldCompress(req, res) {
    if(res.getHeader('Content-Type') === MIME_TYPE) {
        //console.log("** compressing vector tile");
        return true;
    }

    // fallback to default compression filter
    //console.log("** doesn't look like a vector tile: %s", res.getHeader('Content-Type'));
    return compression.filter(req, res);
}

app.get('/tilejson/:set/tiles.json', function(req, res) {
    var setName = req.params.set;

    console.log(`${setName} tileJSON requested`);

    res.set('Content-Type', 'application/json; charset=utf-8');

    return res.render('tilejson', {
	host: req.hostname,
	port: PORT,
        title: setName,
        minZoom: 0,
        maxZoom: 20,
        centre: [ 0, 0, 0], // lat, long, z
        bounds: [ -180, -85.0511, 180, 85.0511]
    });
});

app.get('/tiles/:set/:z/:x/:y.vector.pbf', function(req, res) {
    var setName = req.params.set;
    var z = parseInt(req.params.z);
    var x = parseInt(req.params.x);
    var y = parseInt(req.params.y);

    console.log(`${setName} tile: z:${z}, x:${x}, y:${y}`);
    var tileset = TILE_SETS.find((a) => a.id === setName);

    if(tileset) {
        if(tileset.enabled) {
            if(tileset.index) {
                var tile = tileset.index.getTile(z, x, y);
                var features = tile ? tile.features : {};

                if(tile) {
                    //eyes.inspect(tile);
                    //eyes.inspect(features);
                } else {
                    console.log("NO TILE");
                }

                //var buf = vtpbf.fromGeojsonVt({ 'geojsonLayer': tile });
                var layer = new vtpbf.GeoJSONWrapper(features);
                layer.name = tileset.id;
                layer.version = 2;

                var layers = {};
                layers[tileset.name] = layer;

                var buf = vtpbf.fromVectorTileJs({ layers: layers });

                res.set('Content-Type', MIME_TYPE);
                return res.send(buf);
            } else {
                console.log(`tileset ${setName} has no index`);
            }
        } else {
            console.log(`tileset ${setName} is disabled`);
        }
    } else {
        console.log(`tileset ${setName} unknown`);
    }

    return res.status(404).end();
});


app.use(express.static('public'));

app.listen(PORT, function() {
    console.log(`map_lashup listening on port ${PORT}`);
});

