
import './public/css/style.css';
import 'ol-layerswitcher/dist/ol-layerswitcher.css';
import { extend as olExtent, createEmpty, getCenter } from 'ol/extent'
// import * as olExtent from 'ol/extent';
// import {createEmpty} from 'ol/extent';

import { Map, View } from 'ol';
import OSM from 'ol/source/OSM';
// import {FullScreen, defaults as defaultControls} from 'ol/control.js';
import Control from 'ol/control/Control';
import { Projection, fromLonLat } from 'ol/proj';
import Draw from 'ol/interaction/Draw.js';
import Overlay from 'ol/Overlay.js';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style.js';
import Circle from 'ol/geom/Circle.js';
import { LineString, Polygon, MultiPolygon } from 'ol/geom.js';
import { Vector as VectorSource } from 'ol/source.js';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';
import TileWMS from 'ol/source/TileWMS.js';
import Cluster from 'ol/source/Cluster.js';
import MVT from 'ol/format/MVT.js';
import KML from 'ol/format/KML';

import { getArea, getLength } from 'ol/sphere.js';
import { unByKey } from 'ol/Observable.js';
import MousePosition from 'ol/control/MousePosition.js';
import { format } from 'ol/coordinate.js';
import LayerGroup from 'ol/layer/Group';
import LayerSwitcher from 'ol-layerswitcher';
import { BaseLayerOptions, GroupLayerOptions } from 'ol-layerswitcher';
import GeoJSON from 'ol/format/GeoJSON';
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import Icon from 'ol/style/Icon.js';
import XYZ from 'ol/source/XYZ.js';
import axios from 'axios';
import Papa from 'papaparse';
import { fromExtent } from 'ol/geom/Polygon';
import * as turf from '@turf/turf';
import jsPDF from 'jspdf';
import Snap from 'ol/interaction/Snap';
import { fromCircle } from 'ol/geom/Polygon';
import WKT from 'ol/format/WKT.js';
import html2canvas from 'html2canvas';
import ScaleLine from 'ol/control/ScaleLine.js';
import { transform } from 'ol/proj';


const osm = new TileLayer({
  source: new OSM({
    crossOrigin: 'anonymous' // Set crossOrigin attribute
  }),
  title: 'osm',
  name: 'osm'
});


// const source = new VectorSource();

const drsource = new VectorSource({ wrapX: false });
const mrsource = new VectorSource({ wrapX: false });






// Define base layers

const labelLayer = new TileLayer({
  source: new XYZ({
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
    crossOrigin: 'anonymous' // Set crossOrigin attribute

  }),
  title: 'labelLayer',
  visible: false,
  name: 'labelLayer'
});


var standardLayer = new TileLayer({
  source: new XYZ({
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attributions: ['&copy; <a href="https://justpaste.it/redirect/ecx3y/https%3A%2F%2Fwww.esri.com%2Fen-us%2Fhome">Esri</a>'],
    crossOrigin: 'anonymous' // Set crossOrigin attribute

  }),
  title: 'Standard',
  visible: false,
  name: 'standardLayer'
});

var sateliteLayer = new TileLayer({
  source: new XYZ({
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attributions: ['&copy; <a href="https://justpaste.it/redirect/ecx3y/https%3A%2F%2Fwww.esri.com%2Fen-us%2Fhome">Esri</a>'],
    crossOrigin: 'anonymous' // Set crossOrigin attribute

  }),
  title: 'satelite',
  visible: false,
  name: 'sateliteLayer',
  maxZoom: 23  // Example maximum zoom level



});

var transportLayer = new TileLayer({
  source: new XYZ({
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}',
    attributions: ['&copy; <a href="https://justpaste.it/redirect/ecx3y/https%3A%2F%2Fwww.esri.com%2Fen-us%2Fhome">Esri</a>'],
    crossOrigin: 'anonymous' // Set crossOrigin attribute

  }),
  title: 'Transport',
  visible: false,
  name: 'transportLayer'

});




const map = new Map({
  layers: [sateliteLayer, osm, standardLayer, transportLayer, labelLayer],
  target: 'map',
  view: new View({
    center: new fromLonLat([92.07298769282396, 26.213469404852535]),
    zoom: 7,
    maxZoom: 18

  }),
  controls: [],
  keyboardEventTarget: document,
});

const worldview = new View({
  center: [0, 0],
  zoom: -2
})


//Custom Home Click functionality Starts....

function customHome(event) {

  // const homeButton = document.getElementById(event);
  const homeCoords = [10300257, 3061038];
  map.getView().setCenter(homeCoords);
  map.getView().setZoom(7); // Optional: Set zoom level for home view
}

window.handleHome = function (event) {
  customHome(event);
};

// Home Click  functionality Ends.....



//Custom Zoom- in  and Zoom-out functionality Starts....

function customZoom(event) {
  console.log(event)
  if (event == "zIn") {
    const view = map.getView();
    const currentZoom = view.getZoom();
    // Adjust zoom step based on your preference (e.g., 0.5)
    const newZoom = currentZoom + 0.5;
    view.setZoom(Math.min(newZoom, view.getMaxZoom())); // Prevent exceeding max zoom
  }
  else if (event == "zOut") {
    const view = map.getView();
    const currentZoom = view.getZoom();
    const newZoom = currentZoom - 0.5;
    view.setZoom(Math.max(newZoom, view.getMinZoom())); // Prevent zooming below min zoom

  }
}

window.handleZoom = function (event) {
  customZoom(event);
};
//Zoom- in  and Zoom-out functionality Ends.....





//Custom Full Screen functionality Starts....

function customFullscreen(event) {
  if (document.fullscreenEnabled) {
    // Fullscreen API is supported
    console.log("full screen supported");

    if (event == "easeIn") {
      function enterFullscreen(element) {
        if (element.requestFullscreen) {
          element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) { // Webkit prefix
          element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) { // Mozilla prefix
          element.mozRequestFullScreen();
        } else {
          // Handle fallback scenarios (optional)
        }
      }

      // Usage:
      const mapElement = document.getElementById('body');
      enterFullscreen(mapElement);
    } else {
      function exitFullscreen() {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { // Webkit prefix
          document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) { // Mozilla prefix
          document.mozCancelFullScreen();
        } else {
          // Handle fallback scenarios (optional)
        }
      }
      // Usage:
      exitFullscreen();
    }

  } else {
    // Handle fallback scenarios (optional)
    console.log("full screen not supported");
  }
}

window.handleFullscreen = function (event) {
  customFullscreen(event);
};

// Custom Full Screen functionality Ends.....



// Measure Tool starts here.................

/**
 * Currently drawn feature.
 * @type {import("ol/Feature.js").default}
 */
let sketch;

/**
 * The help tooltip element.
 * @type {HTMLElement}
 */
let helpTooltipElement;

/**
 * Overlay to show the help messages.
 * @type {Overlay}
 */
let helpTooltip;

/**
 * The measure tooltip element.
 * @type {HTMLElement}
 */
let measureTooltipElement;

/**
 * Overlay to show the measurement.
 * @type {Overlay}
 */
let measureTooltip;

/**
 * Message to show when the user is drawing a polygon.
 * @type {string}
 */
const continuePolygonMsg = 'Click to continue drawing the polygon';

/**
 * Message to show when the user is drawing a line.
 * @type {string}
 */
const continueLineMsg = 'Click to continue drawing the line';

/**
 * Handle pointer move.
 * @param {import("ol/MapBrowserEvent").default} evt The event.
 */
const pointerMoveHandler = function (evt) {
  if (evt.dragging) {
    return;
  }
  /** @type {string} */
  let helpMsg = 'Click to start drawing';

  if (sketch) {
    const geom = sketch.getGeometry();
    if (geom instanceof Polygon) {
      helpMsg = continuePolygonMsg;
    } else if (geom instanceof LineString) {
      helpMsg = continueLineMsg;
    }
  }

  helpTooltipElement.innerHTML = helpMsg;
  helpTooltip.setPosition(evt.coordinate);

  helpTooltipElement.classList.remove('hidden');
};



map.on('pointermove', pointerMoveHandler);

map.getViewport().addEventListener('mouseout', function () {
  helpTooltipElement.classList.add('hidden');
});


let Measureraw; // global so we can remove it later

/**
 * Format length output.
 * @param {LineString} line The line.
 * @return {string} The formatted length.
 */

const formatLength = function (line) {
  const length = getLength(line);
  let output;
  if (length > 100) {
    output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
  } else {
    output = Math.round(length * 100) / 100 + ' ' + 'm';
  }
  return output;
};

/**
 * Format area output.
 * @param {Polygon} polygon The polygon.
 * @return {string} Formatted area.
 */
const formatArea = function (polygon) {
  const area = getArea(polygon);
  let output;
  if (area > 10000) {
    output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>';
  } else {
    output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>';
  }
  return output;
};

const style = new Style({
  fill: new Fill({
    color: 'rgba(255, 255, 255, 0.2)',
  }),
  stroke: new Stroke({
    color: 'rgba(0, 0, 0, 0.5)',
    lineDash: [10, 10],
    width: 5,
  }),
  image: new CircleStyle({
    radius: 5,
    stroke: new Stroke({
      color: 'rgba(0, 0, 0, 0.7)',
    }),
    fill: new Fill({
      color: 'rgba(255, 255, 255, 0.2)',
    }),

  }),
});


function customMeasure(event) {

  if (event === 'clear') {

    if (measureTooltipElement) {
      var elem = document.getElementsByClassName("ol-tooltip ol-tooltip-static");
      for (var i = elem.length - 1; i >= 0; i--) {
        elem[i].remove();
      }
    }

    // map.getLayers().forEach(function (measureVector) {

    //   if (measureVector instanceof VectorLayer) {
    //     console.log("measure layer remove");
    //     map.removeLayer(measureVector);
    //   }
    // });
    // Clear the source of the measurement layers
    mrsource.clear();
    measureTooltip.getSource().clear();
    console.log(measureTooltip.getSource())
    return
  }


  map.removeInteraction(shapeDraw);
  sketch = null;
  measureTooltipElement = null;
  createMeasureTooltip();


  const measureVector = new VectorLayer({
    source: mrsource,
    style: {
      'fill-color': 'rgba(255, 255, 255, 0.2)',
      'stroke-color': '#075225',
      'stroke-width': 2,
      'circle-radius': 7,
      'circle-fill-color': '#075225',
    },
  });
  map.addLayer(measureVector)
  // console.log(event)

  // const type = event == 'area' ? 'Polygon' : 'LineString';

  // console.log(type)

  Measureraw = new Draw({
    source: mrsource,
    type: event,
    style: function (feature) {
      const geometryType = feature.getGeometry().getType();
      if (geometryType === event || geometryType === 'Point') {
        return style;
      }
    },
  });
  map.addInteraction(Measureraw);

  createMeasureTooltip();
  createHelpTooltip();


  let listener;
  Measureraw.on('drawstart', function (evt) {
    // set sketch
    sketch = evt.feature;

    /** @type {import("ol/coordinate.js").Coordinate|undefined} */
    let tooltipCoord = evt.coordinate;

    listener = sketch.getGeometry().on('change', function (evt) {
      const geom = evt.target;
      let output;
      if (geom instanceof Polygon) {
        output = formatArea(geom);
        tooltipCoord = geom.getInteriorPoint().getCoordinates();
      } else if (geom instanceof LineString) {
        output = formatLength(geom);
        tooltipCoord = geom.getLastCoordinate();
      }
      measureTooltipElement.innerHTML = output;
      measureTooltip.setPosition(tooltipCoord);
    });
  });

  Measureraw.on('drawend', function () {
    // return
    measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
    measureTooltip.setOffset([0, -7]);
    // unset sketch
    sketch = null;
    // unset tooltip so that a new one can be created
    measureTooltipElement = null;
    createMeasureTooltip();
    unByKey(listener);
    map.removeInteraction(Measureraw);
    map.removeOverlay(helpTooltip);


  });



}



/**
 * Creates a new help tooltip
 */
function createHelpTooltip() {
  if (helpTooltipElement) {
    helpTooltipElement.parentNode.removeChild(helpTooltipElement);
  }
  helpTooltipElement = document.createElement('div');
  helpTooltipElement.className = 'ol-tooltip hidden';
  helpTooltip = new Overlay({
    element: helpTooltipElement,
    offset: [15, 0],
    positioning: 'center-left',
  });
  map.addOverlay(helpTooltip);
}

/**
 * Creates a new measure tooltip
 */
function createMeasureTooltip() {
  if (measureTooltipElement) {
    measureTooltipElement.parentNode.removeChild(measureTooltipElement);
  }
  measureTooltipElement = document.createElement('div');
  measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
  measureTooltip = new Overlay({
    element: measureTooltipElement,
    offset: [0, -15],
    positioning: 'bottom-center',
    stopEvent: false,
    insertFirst: false,
  });
  map.addOverlay(measureTooltip);
}

/**
 * Let user change the geometry type.
 */
// typeSelect.onchange = function () {
//   map.removeInteraction(draw);
//   addInteraction();
// };


window.handleMeasure = function (event) {
  map.removeInteraction(Measureraw);
  customMeasure(event);
};
// measure tool ends...........





// Draw feature starts.........


let shapeDraw;

let drawVector; // Declare a single VectorLayer outside the function


function customDraw(event) {
  if (event === 'clear') {
    drsource.clear();
    map.removeInteraction(Measureraw);
    sketch = null;
    measureTooltipElement = null;
    createMeasureTooltip();
    drsource.clear();
    return


  }
  // Ensure the drawVector layer exists, if not, create it
  if (!drawVector) {
    drawVector = new VectorLayer({
      source: drsource,
      style: {
        'fill-color': 'rgba(255, 255, 255, 0.2)',
        'stroke-color': '#164ff7',
        'stroke-width': 2,
        'circle-radius': 7,
        'circle-fill-color': '#164ff7',

      },
    });
    map.addLayer(drawVector);
  }

  if (event === 'freehand') {
    shapeDraw = new Draw({
      source: drsource,
      type: 'LineString',
      freehand: true,
      style: new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.5)',
        }),
        stroke: new Stroke({
          color: 'rgba(0, 0, 0, 0.8)',
          lineDash: [10, 10],
          width: 2,
        }),
      })
    });

  }
  else {

    shapeDraw = new Draw({
      source: drsource,
      type: event,
      style: new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.5)',
        }),
        stroke: new Stroke({
          color: 'rgba(0, 0, 0, 0.8)',
          lineDash: [10, 10],
          width: 5,
        }),
      })
    });
  }

  map.addInteraction(shapeDraw);

  createMeasureTooltip();
  createHelpTooltip();


  let listener;

  // Handle end of drawing
  shapeDraw.on('drawend', function (event) {
    // Close the measure tooltip if open
    measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
    measureTooltip.setOffset([0, -7]);

    // Get the drawn feature
    const feature = event.feature;

    // Prompt user for label and set it
    const label = prompt('Enter a label for this shape:');
    if (label) {
      feature.set('label', label);
    } else {
      feature.set('label', ''); // Default to empty string if no label is provided
    }

    // Clean up and reset
    sketch = null;
    measureTooltipElement = null;
    createMeasureTooltip();
    unByKey(listener);
    map.removeInteraction(shapeDraw);
    map.removeOverlay(helpTooltip);
  });
}


window.handleDraw = function (event) {
  map.removeInteraction(shapeDraw);
  customDraw(event);
};


document.getElementById('draw_undo').addEventListener('click', function () {
  shapeDraw.removeLastPoint();
});

//  Draw ends here............................










// -------------------------------------------------------------------------------------------------------------------------

// Add an empty vector source to hold pins
const pinSource = new VectorSource();
const pinLayer = new VectorLayer({
  source: pinSource
});
map.addLayer(pinLayer);

document.getElementById('locate_Pindrop').addEventListener('click', function () {
  // Get longitude and latitude values from input fields
  let lat = parseFloat(document.getElementById("lat").value);
  let lon = parseFloat(document.getElementById("lon").value);
  console.log("lat")
  console.log(lat)

  console.log("lon")
  console.log(lon)



  // Ensure that lon and lat are valid numbers
  if (isNaN(lon) || isNaN(lat) || lon < -180 || lon > 180 || lat < -90 || lat > 90) {
    alert("Please enter valid longitude (-180 to 180) and latitude (-90 to 90) values.");
    return;
  }

  // Center the map view to the specified coordinates

  map.getView().setCenter(new fromLonLat([lon, lat]));
  map.getView().setZoom(15); // Set desired zoom level

  // Drop a pin at the specified coordinates
  let pinFeature = new Feature({
    geometry: new Point(fromLonLat([lon, lat]))
  });

  // Add the pin feature to the pin source
  pinSource.addFeature(pinFeature);

  let pinStyle = new Style({
    image: new Icon({
      anchor: [0.5, 1],
      src: './modules/pin.png', // URL to the pin icon
      scale: 0.1
    })
  });

  pinFeature.setStyle(pinStyle);


})

document.getElementById('locate_Pinremove').addEventListener('click', function () {
  console.log("remove")

  pinSource.clear(); // Clear all features from the pin source

})





// Pindrop / Locate featue Ends.....





// coordinate tool starts ................



const coordPos = document.getElementById('lonlat_display');

let projection = new Projection("EPSG:4326"); // Example: WGS 84 geographic projection





const scaleLineControl = new ScaleLine({
  bar: true,
  target: document.getElementById('scale-line-control'),
  steps: false,
  text: true,
  minWidth: 270,
  maxWidth: 280
});
map.addControl(scaleLineControl);

const mousePos = new MousePosition({
  projection: 'EPSG:4326',
  coordinateFormat: function (coordinate) {
    let point = new fromLonLat([coordinate[1], coordinate[0]], projection);
    let ltdegrees = Math.floor(point[0]);
    let ltminutes = (point[0] - ltdegrees) * 60;
    let ltcoor = ltdegrees + "° " + ltminutes.toFixed(2) + "'";
    let lndegrees = Math.floor(point[1]);
    let lnminutes = (point[1] - lndegrees) * 60;
    let lncoor = lndegrees + "° " + lnminutes.toFixed(2) + "'";
    let DDcoord = ltcoor + "  N " + lncoor + "E";
    coordPos.innerHTML = DDcoord;
  },
  // target: document.getElementById('lonlat_display')
});
map.addControl(mousePos);


//  Co-Ordinate Feature Ends .............





// Scale Line Feature Added.........................


// Scale Line Feature End.........................



// Layer swither tool starts ...........

// Layer swither tool ends...........


// state dist Layer select tool starts

// ---------------------------------------------------------------------------------------------------------------------------------
// Create a vector source for the state layer


// ----------------------------------------
// Reference to the highlight layer
let highlightLayer = null;
// window.handleVillOvarlay =  function (villagenm) {
window.handleVillOvarlay = async function (sl) {
  console.log(sl);
  // Load GeoJSON data
  const response = await fetch('./geojsons/assam_village_layer.geojson');
  const geojsonData = await response.json();

  // Create vector source and layer
  const vectorSource = new VectorSource({
    features: new GeoJSON().readFeatures(geojsonData, {
      featureProjection: 'EPSG:3857' // Adjust based on your map projection
    })
  });

  // Find the feature for the given village name
  console.log(vectorSource.getFeatures());
  const featufre = vectorSource.getFeatures().find(feat => console.log(feat.get('Village_Code')));

  const feature = vectorSource.getFeatures().find(feat => feat.get('slno') === sl);

  if (feature) {
    // Create a new vector layer for the selected village
    const newHighlightLayer = new VectorLayer({
      source: new VectorSource({
        features: [feature]
      }),
      style: new Style({
        stroke: new Stroke({
          color: '#ff0000', // Red color for the boundary
          width: 4
        }),
        fill: new Fill({
          color: 'rgba(255, 0, 0, 0.2)'
        })
      })
    });

    // Remove the existing highlight layer if it exists
    if (highlightLayer) {
      map.removeLayer(highlightLayer);
    }

    // Set the new highlight layer
    highlightLayer = newHighlightLayer;

    // Add the new highlight layer to the map
    map.addLayer(highlightLayer);

    // // Zoom to the feature
    // const extent = feature.getGeometry().getExtent();
    // map.getView().fit(extent, {padding: [200, 200, 200, 200]});

    // Modify the extent to reduce the zoom level
    const extent = feature.getGeometry().getExtent();


    // Get the center of the extended extent
    const center = getCenter(extent);

    // Animate the view to fly to the new center and zoom
    map.getView().animate({
      center: center,
      zoom: map.getView(), // Adjust zoom level based on extent
      duration: 1000 // Animation duration in milliseconds
    });

  } else {
    console.log('Village not found: ' + sl);
  }


};

// --------------------------------------



function village_filter(option) {
  const selectedDistrict = document.getElementById('village-dist').value;
  const selectedCircle = document.getElementById('village-circle').value;
  const selectedVillage = document.getElementById('village-village').value;
  const infopopup = document.getElementById("villageInfo");

  if (option === "clear") {
    removeExistingLayer('villageFiltered');
    removeExistingLayer('villageBoundary');
    map.removeLayer(highlightLayer);
    infopopup.style.display = "none";
    setTimeout(() => {
      generateLegend();
      console.log("Delayed for 1 second.");
    }, 2000);
    return;
  }

  if (!selectedDistrict && option!='dsearch') {
    window.alert("Select the District");
    return;
  }

  // function getCoordinatesFromFeature(feature) {
  //   return feature.getGeometry().getExtent();
  // }

  function getFilterByProperty(propertyName, value, propertyName1, value1) {
    return function (feature) {
      const propertyValue = feature.get(propertyName);
      const propertyValue1 = feature.get(propertyName1);
      // if (selectedVillage) {
      //   return propertyValue && propertyValue.toLowerCase() === value.toLowerCase() && propertyValue1 && propertyValue1.toLowerCase() === value1.toLowerCase();

      // } else {
        return propertyValue && propertyValue.toString().toLowerCase() === value.toString().toLowerCase();

      // }


    };
  }

  function removeExistingLayer(layerName) {
    const existingLayer = map.getLayers().getArray().find(layer => layer.get('name') === layerName);
    if (existingLayer) {
      map.removeLayer(existingLayer);
    }
  }

  function createVectorLayer(source, style, layerName) {
    const vectorLayer = new VectorLayer({
      source: source,
      style: style
    });
    vectorLayer.set('name', layerName);
    return vectorLayer;
  }

  function addLayerWithGeoJSON(url, filterFunction, style, layerName) {
    if (!selectedVillage && option === 'mask') {
      window.alert("masking applicable for single boundary");
      return;
    }

    const vectorSource = new VectorSource({
      url: url,
      format: new GeoJSON()
    });

    vectorSource.on('featuresloadend', function () {
      console.log("GeoJSON loaded.");
    });

    vectorSource.on('featuresloaderror', function () {
      console.error("Error loading GeoJSON.");
    });

    vectorSource.once('change', function () {
      if (vectorSource.getState() === 'ready') {
        const features = vectorSource.getFeatures();
        // console.log(features)
        // console.log("Loaded features: ", features); // Debugging

        const filteredFeatures = features.filter(filterFunction);
        console.log("Filtered features: ", filteredFeatures); // Debugging

        // filteredFeatures.forEach((feature)=>{
        //   // console.log("features is")
        //   // console.log(feature.getProperties())


        // })
        displayVillageInfo(filteredFeatures)

        vectorSource.clear();

        if (option === 'highlight' || option === 'dsearch') {
          vectorSource.addFeatures(filteredFeatures);
        } else if (option === 'mask') {
          const mapExtent = worldview.calculateExtent(map.getSize());
          const boundingBoxPolygon = fromExtent(mapExtent);
          const format = new GeoJSON();

          // Combine all filtered feature geometries into a single geometry using Turf.js
          let combinedGeometry = null;
          filteredFeatures.forEach((feature) => {
            if (combinedGeometry === null) {
              combinedGeometry = feature.getGeometry().clone();
            } else {
              combinedGeometry = turf.union(combinedGeometry, feature.getGeometry());
            }
          });

          if (combinedGeometry) {
            const boundingBoxGeoJSON = format.writeGeometryObject(boundingBoxPolygon);
            const clipGeometryGeoJSON = format.writeGeometryObject(combinedGeometry);
            const outsidePolygonGeoJSON = turf.difference(boundingBoxGeoJSON, clipGeometryGeoJSON);

            if (outsidePolygonGeoJSON) {
              const outsideFeature = format.readFeature(outsidePolygonGeoJSON);
              vectorSource.addFeature(outsideFeature);
            } else {
              console.log("Masking operation resulted in no outside features.");
            }
          } else {
            console.log("No valid geometry for masking.");
          }
        }

        if (filteredFeatures.length > 0) {
          const extent = filteredFeatures.reduce((acc, feature) => {
            return olExtent(acc, feature.getGeometry().getExtent());
          }, createEmpty());
          map.getView().fit(extent, { duration: 1000 });
        } else {
          console.log("No features found matching the criteria.");
        }

      }
    });



    const vectorLayer = createVectorLayer(vectorSource, style, layerName);
    map.addLayer(vectorLayer);
    return vectorLayer;
  }

  function displayVillageInfo(features) {
    const villageDetails = document.getElementById('villageDetails');
    let infoHTML = '<h4 style="text-align: center; margin:10px">Village Information</h4>';
    infoHTML += '<hr>';
    if(option === 'dsearch'){
      
      infoHTML += `<table style="border-collapse: collapse; width: 100%;">
      <thead>
        <tr>
          <th style="border: 1px solid black; padding: 8px; text-align: left;">Property</th>
          <th style="border: 1px solid black; padding: 8px; text-align: left;">Value</th>
        </tr>
      </thead>
      <tbody>`;

      // Iterate over each feature to populate the table rows
      features.forEach(function (feature) {
        const properties = feature.getProperties();
        let popdens = ((properties.Population/properties.Area)*10*10*10*10*10*10).toFixed(2);
        if(popdens<1){
          popdens = "Not Available"
        }
        for (const key in properties) {
          if (key !== 'geometry') {
            infoHTML += `<tr>
                          <td style="border: 1px solid black; padding: 8px;">${key}</td>
                          <td style="border: 1px solid black; padding: 8px;">${properties[key]}</td>
                        </tr>`;
          }
        }

        infoHTML += `<tr>
                          <td style="border: 1px solid black; padding: 8px;">Population Density</td>
                          <td style="border: 1px solid black; padding: 8px;">${popdens}</td>
                        </tr>`;

      });

      // Close the table
      infoHTML += `</tbody></table>`;

      // Now infoHTML contains the complete HTML table structure with data

    }
    
    else if (selectedVillage) {

      infoHTML += `<table style="border-collapse: collapse; width: 100%;">
      <thead>
        <tr>
          <th style="border: 1px solid black; padding: 8px; text-align: left;">Property</th>
          <th style="border: 1px solid black; padding: 8px; text-align: left;">Value</th>
        </tr>
      </thead>
      <tbody>`;

      // Iterate over each feature to populate the table rows
      features.forEach(function (feature) {
        const properties = feature.getProperties();
        let popdens = ((properties.Population/properties.Area)*10*10*10*10*10*10).toFixed(2);
        if(popdens<1){
          popdens = "Not Available"
        }
        for (const key in properties) {
          if (key !== 'geometry') {
            infoHTML += `<tr>
                          <td style="border: 1px solid black; padding: 8px;">${key}</td>
                          <td style="border: 1px solid black; padding: 8px;">${properties[key]}</td>
                        </tr>`;
          }
        }

        infoHTML += `<tr>
                          <td style="border: 1px solid black; padding: 8px;">Population Density</td>
                          <td style="border: 1px solid black; padding: 8px;">${popdens}</td>
                        </tr>`;

      });

      // Close the table
      infoHTML += `</tbody></table>`;

      // Now infoHTML contains the complete HTML table structure with data


    } else if (selectedCircle) {

      infoHTML += `<h4 style=" margin:10px">Villages in Circle ${selectedCircle}  : ${features.length}</h4>`;

      // Initialize the HTML for the table
      infoHTML += `<table style="border-collapse: collapse; width: 100%;">
                    <thead>
                      <tr>
                        <th style="border: 1px solid black; padding: 8px; text-align: left;">District Name</th>
                        <th style="border: 1px solid black; padding: 8px; text-align: left;">Circle Name</th>
                        <th style="border: 1px solid black; padding: 8px; text-align: left;">Population Density Per KMS</th>
                        <th style="border: 1px solid black; padding: 8px; text-align: left;">Village Name</th>

                      </tr>
                    </thead>
                    <tbody>`;

      // Iterate over each feature to populate the table rows
      features.forEach(function (feature) {
        const properties = feature.getProperties();
    
        let popdens = ((properties.Population/properties.Area)*10*10*10*10*10*10).toFixed(2);
        if(popdens<1){
          popdens = "Not Available"
        }

        infoHTML += `<tr>
        <td style="border: 1px solid black; padding: 8px;">${properties.District}</td>
        <td style="border: 1px solid black; padding: 8px;">${properties.Circle}</td>
        <td style="border: 1px solid black; padding: 8px;">${popdens}</td>

        <td style="border: 1px solid black; padding: 8px;" onclick=handleVillOvarlay(${properties.slno})>${properties.Village}</td>
        </tr>`;
      });

      // Close the table
      infoHTML += `</tbody></table>`;

      // Now infoHTML contains the complete HTML table structure with data

    } else if (selectedDistrict){
      infoHTML += `<h4 style=" margin:10px">Villages in District ${selectedDistrict}  : ${features.length}</h4>`;

      // Initialize the HTML for the table
      infoHTML += `<table style="border-collapse: collapse; width: 100%;">
                    <thead>
                      <tr>
                        <th style="border: 1px solid black; padding: 8px; text-align: left;">District Name</th>
                        <th style="border: 1px solid black; padding: 8px; text-align: left;">Circle Name</th>
                        <th style="border: 1px solid black; padding: 8px; text-align: left;">Populationn Density Per KMS</th>
                        <th style="border: 1px solid black; padding: 8px; text-align: left;">Village Name</th>

                      </tr>
                    </thead>
                    <tbody>`;

      // Iterate over each feature to populate the table rows
      features.forEach(function (feature) {
        const properties = feature.getProperties();
        let popdens = ((properties.Population/properties.Area)*10*10*10*10*10*10).toFixed(2);
        if(popdens<1){
          popdens = "Not Available"
        }
        infoHTML += `<tr>
        <td style="border: 1px solid black; padding: 8px;">${properties.District}</td>
        <td style="border: 1px solid black; padding: 8px;">${properties.Circle}</td>
        <td style="border: 1px solid black; padding: 8px;">${popdens}</td>
        <td style="border: 1px solid black; padding: 8px;" onclick=handleVillOvarlay(${properties.slno})>${properties.Village}</td>
        </tr>`;
      });

      // Close the table
      infoHTML += `</tbody></table>`;

      // Now infoHTML contains the complete HTML table structure with data


    }

    // const properties = feature.getProperties();
    // let infoHTML = '<h4 style="text-align: center; margin:10px">Village Information</h4>';

    // console.log('Displaying info for feature:', properties);

    // for (const key in properties) {
    //   if (key !== 'geometry') {
    //     infoHTML += `<p style="margin-bottom:5px"><strong>${key}:</strong> ${properties[key]}</p>`;
    //   }
    // }

    villageDetails.innerHTML = infoHTML;
    console.log("hey")
    const infopopup = document.getElementById("villageInfo");
    infopopup.style.display = "block"
  }

  removeExistingLayer('villageFiltered');
  removeExistingLayer('villageBoundary');

  let villageFiltered;

  if(option === 'dsearch'){
    const inputElement = document.getElementById('dsearch-input').value;

    console.log("fdone");
    console.log(inputElement);

    // Show the specific village with details
    villageFiltered = addLayerWithGeoJSON(
      './geojsons/assam_village.geojson',

      getFilterByProperty('Village', inputElement),
      new Style({
        stroke: new Stroke({
          color: '#fa5d02',
          lineCap: 'butt',
          width: 4
        }),
        fill: new Fill({
          color: 'rgba(9, 0, 255, .1)'
        })
      }),
      'villageFiltered'
    );
  }

  else if (selectedDistrict && !selectedCircle && !selectedVillage) {
    // Show all villages and info within the district
    villageFiltered = addLayerWithGeoJSON(
      './geojsons/assam_village.geojson',
      getFilterByProperty('District', selectedDistrict),
      new Style({
        stroke: new Stroke({
          color: '#fa5d02',
          lineCap: 'butt',
          width: 4
        }),
        fill: new Fill({
          color: 'rgba(9, 0, 255, .1)'
        })
      }),
      'villageFiltered'
    );

  } else if (selectedDistrict && selectedCircle && !selectedVillage) {
    // Show all villages and info within the district and circle
    villageFiltered = addLayerWithGeoJSON(
      './geojsons/assam_village.geojson',
      feature => getFilterByProperty('District', selectedDistrict)(feature) && getFilterByProperty('Circle', selectedCircle)(feature),
      new Style({
        stroke: new Stroke({
          color: '#fa5d02',
          lineCap: 'butt',
          width: 4
        }),
        fill: new Fill({
          color: 'rgba(9, 0, 255, .1)'
        })
      }),
      'villageFiltered'
    );

  } else if (selectedDistrict && selectedCircle && selectedVillage) {
    // Show the specific village with details
    let filterStyle;
    console.log(option)
    if (option === 'mask') {
      filterStyle = new Style({
        stroke: new Stroke({
          color: '#fa5d02',
          lineCap: 'butt',
          width: 2
        }),
        fill: new Fill({
          color: 'rgba(70, 83, 107, 1)'
        })
      })

    } else {
      filterStyle = new Style({
        stroke: new Stroke({
          color: '#fa5d02',
          lineCap: 'butt',
          width: 2
        }),
        fill: new Fill({
          color: 'rgba(70, 83, 107, .1)'
        })
      })
    }
    villageFiltered = addLayerWithGeoJSON(
      './geojsons/assam_village.geojson',
      feature => getFilterByProperty('District', selectedDistrict)(feature) && getFilterByProperty('Circle', selectedCircle)(feature) && getFilterByProperty('Village', selectedVillage)(feature),

      // getFilterByProperty('Village', selectedVillage, 'Circle', selectedCircle),
      filterStyle,
      'villageFiltered'
    );


  }

  let highlight;
  const featureOverlay = new VectorLayer({
    source: new VectorSource(),
    map: map,
    style: new Style({
      stroke: new Stroke({
        color: '#f7d2b5',
        width: 2,
      }),

    }),
  });

  const displayFeatureInfo = function (pixel) {
    // const info = document.getElementById('info-content');
    map.forEachFeatureAtPixel(pixel, function (feature, layer) {
      if (layer && layer.get('name') === 'villageFiltered') {
        document.getElementById('info').style.display = "block";
        const info = document.getElementById('info-content');
        if (feature) {
          console.log(feature.getProperties())

          const properties = feature.getProperties();
          let contInfoHTML = `
            <table style="border-collapse: collapse; width: 100%;">
              <thead>
                <tr>
                  <th style="border: 1px solid black; padding: 8px; text-align: left;">Property</th>
                  <th style="border: 1px solid black; padding: 8px; text-align: left;">Value</th>
                </tr>
              </thead>
              <tbody>`;

          for (const key in properties) {
            if (key !== 'geometry') {
              contInfoHTML += `
                <tr>
                  <td style="border: 1px solid black; padding: 8px;">${key}</td>
                  <td style="border: 1px solid black; padding: 8px;">${properties[key]}</td>
                </tr>`;
            }
          }

          contInfoHTML += `</tbody></table>`;

          let infoHTML = `<h3>Village Information</h3><br>`;
          // Assuming `count` is a variable that holds the number of schools in the village
          infoHTML += contInfoHTML;

          document.getElementById('info-content').innerHTML = infoHTML;
          infopopup.style.display = "block";




        }
        else {
          info.innerHTML = '&nbsp;';
        }

        if (feature !== highlight) {
          if (highlight) {
            featureOverlay.getSource().removeFeature(highlight);
          }
          if (feature) {
            featureOverlay.getSource().addFeature(feature);
          }
          highlight = feature;
        }
        return true; // Stop iteration over features
      }
    });
  };

  map.on('pointermove', function (evt) {
    if (evt.dragging) {
      return;
    }
    const pixel = map.getEventPixel(evt.originalEvent);
    displayFeatureInfo(pixel);
  });

  map.on('click', function (evt) {
    displayFeatureInfo(evt.pixel);
  });

  setTimeout(() => {
    generateLegend();
    console.log("Delayed for 1 second.");
  }, 2000);
}

document.getElementById("village_selectButton_mask").addEventListener('click', function () {
  village_filter("mask");
});

document.getElementById("village_selectButton_highlight").addEventListener('click', function () {
  village_filter("highlight");
});

document.getElementById("village_selectButton_clear").addEventListener('click', function () {
  village_filter("clear");
});







// 


// function selectedschoolfromtable(sl){
// }

window.selectedschoolfromtable = function (value) {
  // URL to your GeoJSON file
  const geojsonUrl = './geojsons/SSA_DATA_2022.geojson';

  // Fetch GeoJSON data
  fetch(geojsonUrl)
    .then(response => response.json())
    .then(geojsonData => {
      // Convert the GeoJSON data to OpenLayers features
      const format = new GeoJSON();
      const features = format.readFeatures(geojsonData, {
        featureProjection: 'EPSG:3857' // Ensure this matches your map's projection
      });

      // Find the feature that matches the fieldvalue
      const feature = features.find(f =>
        f.get('sl') === value
      );

      // console.log(`${f.get('category')}`),
      if (feature) {
        // Get the geometry and coordinates of the point
        const geometry = feature.getGeometry();
        const coords = geometry.getCoordinates();

        // Define the view for the map to zoom and center
        map.getView().animate({
          center: coords,
          zoom: 18,
          duration: 1000 // Duration of the animation in milliseconds
        });
      } else {
        console.log('Feature not found');
      }
    })
    .catch(error => {
      console.error('Error fetching or processing GeoJSON data:', error);
    });


};


// 
// 
// 

async function ssa_select(option) {

  const infopopup = document.getElementById("villageInfo");

  if (option === 'clear') {
    const existingLayer = map.getLayers().getArray().find(layer => layer.get('name') === 'ssaLayer');
    if (existingLayer) {
      map.removeLayer(existingLayer);
    }
    infopopup.style.display = "none";
    return
  }

  const selectedDistrict = document.getElementById('ssa-dist').value;
  const selectedBlock = document.getElementById('ssa-circle').value;
  const selectedVillage = document.getElementById('ssa-village').value;
  const selectedSchool = document.getElementById('ssa-school').value;
  const selectedCatagory = document.getElementById('ssa-cat').value;


  console.log("Selected Catagory:", selectedDistrict);
  console.log("Selected District:", selectedDistrict);
  console.log("Selected Block:", selectedBlock);
  console.log("Selected Village:", selectedVillage);
  console.log("Selected School:", selectedSchool);

  if (!selectedDistrict) {
    window.alert("select atlest District First")
    return
  }

  function getFilterByProperties(properties) {
    return function (feature) {
      for (const property in properties) {

        // console.log("property");
        // console.log(property);
        if (property === 'Category' && properties[property].toString() === '0') {
          // console.log("in properties");
          // console.log(properties);
          return true
        }

        if (properties[property] && feature.get(property).toString().toLowerCase() !== properties[property].toString().toLowerCase()) {
          return false;
        }
        // console.log("property");
        // console.log(property);
        // console.log("in properties");
        // console.log(properties);
      }
      return true;
    };
  }

  function removeExistingLayer(layerName) {
    const existingLayer = map.getLayers().getArray().find(layer => layer.get('name') === layerName);
    if (existingLayer) {
      map.removeLayer(existingLayer);
    }
  }

  function createVectorLayer(source, style, layerName) {
    const vectorLayer = new VectorLayer({
      source: source,
      style: style
    });
    vectorLayer.set('name', layerName);
    return vectorLayer;
  }

  function addLayerWithGeoJSON(url, properties, style, layerName) {
    const vectorSource = new VectorSource({
      url: url,
      format: new GeoJSON()
    });
    console.log("-----------------------");
    console.log(url);
    console.log(properties);
    console.log(layerName);

    console.log("-----------------------");
    vectorSource.once('change', function () {
      vectorSource.forEachFeature(function (feature) {
        if (!getFilterByProperties(properties)(feature)) {
          vectorSource.removeFeature(feature);
        } else {
          const coordinates = feature.getGeometry().getCoordinates();
          map.getView().animate({ center: coordinates, zoom: 12, duration: 1000 });
        }
      });
    });

    const vectorLayer = createVectorLayer(vectorSource, style, layerName);
    map.addLayer(vectorLayer);
    return vectorLayer;
  }

  removeExistingLayer('ssaLayer');

  const properties = {
    District: selectedDistrict,
    Block: selectedBlock,
    Village: selectedVillage,
    School: selectedSchool,
    Category: selectedCatagory
  };

  function getFilterByProperty(propertyName, value) {
    return function (feature) {
      value = value.toString();
      const propertyValue = feature.get(propertyName).toString();
      return propertyValue && propertyValue.toLowerCase() === value.toLowerCase();
    };
  }

  function displaySchoolInfo(feature) {
    const properties = feature.getProperties();
    let contInfoHTML = `
    <table style="border-collapse: collapse; width: 100%;">
      <thead>
        <tr>
          <th style="border: 1px solid black; padding: 8px; text-align: left;">Property</th>
          <th style="border: 1px solid black; padding: 8px; text-align: left;">Value</th>
        </tr>
      </thead>
      <tbody>`;

    for (const key in properties) {
      if (key !== 'geometry') {
        contInfoHTML += `
        <tr>
          <td style="border: 1px solid black; padding: 8px;">${key}</td>
          <td style="border: 1px solid black; padding: 8px;">${properties[key]}</td>
        </tr>`;
      }
    }

    contInfoHTML += `</tbody></table>`;

    let infoHTML = `<h3>SSA Data Information</h3><br>`;
    // Assuming `count` is a variable that holds the number of schools in the village
    infoHTML += contInfoHTML;

    document.getElementById('villageDetails').innerHTML = infoHTML;
    infopopup.style.display = "block";
  }


  const ssaLayer = addLayerWithGeoJSON(
    './geojsons/SSA_DATA_2022.geojson',
    properties,
    new Style({
      image: new Icon({
        src: './modules/school.png', // URL to the pin icon
        scale: .05,
        zIndex: 10
      }),
      // image: new Circle({
      //   fill: Fill,
      //   stroke: Stroke,
      //   radius: 5,
      // }),
      // stroke: new Stroke({
      //   color: '#000',
      //   width: 6,
      // }),
    }),
    'ssaLayer'
  );

  ssaLayer.getSource().once('change', function () {
    const features = ssaLayer.getSource().getFeatures();
    let count = 0;
    let count1 = 0;
    let count2 = 0;
    let count3 = 0;
    let count4 = 0;
    let count5 = 0;
    let count6 = 0;
    let count7 = 0;
    let count8 = 0;
    let count10 = 0;
    let count11 = 0;




    if (selectedSchool) {

      let catagoryFilter = 1;
      if (selectedCatagory != 0) {
        window.alert('Wrong Combination Catagory School name, Select  Catagory \'all\' when select school')
      }

      const selectedFeature = features.find(getFilterByProperty('School', selectedSchool)) && features.find(getFilterByProperty('Village', selectedVillage)) && features.find(getFilterByProperty('Block', selectedBlock)) && features.find(getFilterByProperty('District', selectedDistrict));
      if (selectedFeature) {
        displaySchoolInfo(selectedFeature);
        infopopup.style.display = "block";
      }
    } else if (selectedVillage) {
      let contInfoHTML = ``;
      contInfoHTML += `<table style="border-collapse: collapse; width: 100%;">
                    <thead>
                      <tr>
                        <th style="border: 1px solid black; padding: 8px; text-align: left;">District </th>
                        <th style="border: 1px solid black; padding: 8px; text-align: left;">Block</th>
                        <th style="border: 1px solid black; padding: 8px; text-align: left;">Village</th>
                        <th style="border: 1px solid black; padding: 8px; text-align: left;">School</th>

                      </tr>
                    </thead>
                    <tbody>`;

      features.forEach(feature => {

        let catagoryFilter = 1;
        if (selectedCatagory != 0) {
          catagoryFilter = getFilterByProperty('Category', selectedCatagory)(feature);
        }

        if (catagoryFilter && getFilterByProperty('District', selectedDistrict)(feature) && getFilterByProperty('Block', selectedBlock) && getFilterByProperty('Village', selectedVillage)(feature)) {
          count++;
          if (selectedCatagory === '0') {

            if (feature.getProperties().Category === 1) {
              count1++;
            }
            if (feature.getProperties().Category === 2) {
              count2++;
            }
            if (feature.getProperties().Category === 3) {
              count3++;
            }
            if (feature.getProperties().Category === 5) {
              count5++;
            }
            if (feature.getProperties().Category === 6) {
              count6++;
            }
            if (feature.getProperties().Category === 7) {
              count7++;
            }
            if (feature.getProperties().Category === 8) {
              count8++;
            }
            if (feature.getProperties().Category === 10) {
              count10++;
            } 
            if (feature.getProperties().Category === 11) {
              count11++;
            }


          }
          const coordinates = feature.getGeometry().getCoordinates();
          map.getView().animate({ center: coordinates, zoom: 12, duration: 1000 });
          const properties = feature.getProperties();
          contInfoHTML += `<tr>
        <td style="border: 1px solid black; padding: 8px;">${properties.District}</td>
        <td style="border: 1px solid black; padding: 8px;">${properties.Block}</td>
        <td style="border: 1px solid black; padding: 8px;">${properties.Village}</td>
        <td style="border: 1px solid black; padding: 8px;" onclick=selectedschoolfromtable(${properties.sl})>${properties.School}</td>
        </tr>`;;


        }

      });
      contInfoHTML += `</tbody></table>`;
      let infoHTML = `<h3>SSA Data Informatiom</h3> <br>`;

      infoHTML += `<h4>Total Schools In The  Village: ${count}</h4> <br>`;
      infoHTML += `<div id="piechartssa"></div> <br>`;

      infoHTML += contInfoHTML
      document.getElementById('villageDetails').innerHTML = infoHTML;
      // Load google charts
      google.charts.load('current', { 'packages': ['corechart'] });
      if (selectedCatagory === '0') {

        google.charts.setOnLoadCallback(drawChart);
      }
      // Draw the chart and set the chart values
      function drawChart() {
        var data = google.visualization.arrayToDataTable([
          ['School', 'Numbers'],
          [`Primary only: ${count1}`, count1],
          [`Primary with UP: ${count2}`, count2],
          [`Pr with UP, Sec and HS: ${count3}`, count3],
          [`Upper Primary only: ${count4}`, count4],
          [`UP, PR, Sec and HS: ${count5}`, count5],
          [`PR, UP. and Sec Only: ${count6}`, count6],
          [`UP and Sec: ${count7}`, count7],
          [`Secondary Only: ${count8}`, count8],
          [`Sec with Hr. Sec: ${count10}`, count10],
          [`HS only/Jr. College: ${count11}`, count11]


        ]);

        // Optional; add a title and set the width and height of the chart
        var options = { 'title': 'My Average Day', 'width': 550, 'height': 400 };

        // Display the chart inside the <div> element with id="piechart"
        var chart = new google.visualization.PieChart(document.getElementById('piechartssa'));
        chart.draw(data);
      }
      infopopup.style.display = "block";


    } else if (selectedBlock) {
      let contInfoHTML = ``;
      contInfoHTML += `<table style="border-collapse: collapse; width: 100%;">
                    <thead>
                      <tr>
                        <th style="border: 1px solid black; padding: 8px; text-align: left;">District </th>
                        <th style="border: 1px solid black; padding: 8px; text-align: left;">Block</th>
                        <th style="border: 1px solid black; padding: 8px; text-align: left;">Village</th>
                        <th style="border: 1px solid black; padding: 8px; text-align: left;">School</th>

                      </tr>
                    </thead>
                    <tbody>`;

      features.forEach(feature => {
        let catagoryFilter = 1;
        if (selectedCatagory != 0) {
          catagoryFilter = getFilterByProperty('Category', selectedCatagory)(feature);
        }
        if (catagoryFilter && getFilterByProperty('District', selectedDistrict)(feature) && getFilterByProperty('Block', selectedBlock)(feature)) {
          count++;
          if (selectedCatagory === '0') {

            if (feature.getProperties().Category === 1) {
              count1++;
            }
            if (feature.getProperties().Category === 2) {
              count2++;
            }
            if (feature.getProperties().Category === 3) {
              count3++;
            }
            if (feature.getProperties().Category === 4) {
              count4++;
            }
            if (feature.getProperties().Category === 5) {
              count5++;
            }
            if (feature.getProperties().Category === 6) {
              count6++;
            }
            if (feature.getProperties().Category === 7) {
              count7++;
            }
            if (feature.getProperties().Category === 8) {
              count8++;
            }
            if (feature.getProperties().Category === 10) {
              count10++;
            }
            if (feature.getProperties().Category === 11) {
              count11++;
            }


          }
          const coordinates = feature.getGeometry().getCoordinates();
          map.getView().animate({ center: coordinates, zoom: 15, duration: 1000 });
          const properties = feature.getProperties();
          contInfoHTML += `<tr>
        <td style="border: 1px solid black; padding: 8px;">${properties.District}</td>
        <td style="border: 1px solid black; padding: 8px;">${properties.Block}</td>
        <td style="border: 1px solid black; padding: 8px;">${properties.Village}</td>
        <td style="border: 1px solid black; padding: 8px;" onclick="selectedschoolfromtable(${properties.sl})">${properties.School}</td>

        </tr>`;;


        }

      });
      contInfoHTML += `</tbody></table>`;
      let infoHTML = `<h3>SSA Data Informatiom</h3> <br>`;

      infoHTML += `<h4>Total Schools In The  Block: ${count}</h4> <br>`;
      infoHTML += `<div id="piechartssa"></div> <br>`;
      infoHTML += contInfoHTML
      document.getElementById('villageDetails').innerHTML = infoHTML;
      // Load google charts
      google.charts.load('current', { 'packages': ['corechart'] });
      if (selectedCatagory === '0') {

        google.charts.setOnLoadCallback(drawChart);
      }
      // Draw the chart and set the chart values
      function drawChart() {
        var data = google.visualization.arrayToDataTable([
          ['School', 'Numbers'],
          [`Primary only: ${count1}`, count1],
          [`Primary with UP: ${count2}`, count2],
          [`Pr with UP, Sec and HS: ${count3}`, count3],
          [`Upper Primary only: ${count4}`, count4],
          [`UP, PR, Sec and HS: ${count5}`, count5],
          [`PR, UP. and Sec Only: ${count6}`, count6],
          [`UP and Sec: ${count7}`, count7],
          [`Secondary Only: ${count8}`, count8],
          [`Sec with Hr. Sec: ${count10}`, count10],
          [`HS only/Jr. College: ${count11}`, count11]



        ]);

        // Optional; add a title and set the width and height of the chart
        var options = { 'title': 'My Average Day', 'width': 550, 'height': 400 };

        // Display the chart inside the <div> element with id="piechart"
        var chart = new google.visualization.PieChart(document.getElementById('piechartssa'));
        chart.draw(data);
      }
      infopopup.style.display = "block";


    }
    else if (selectedDistrict) {
      let contInfoHTML = ``;
      contInfoHTML += `<table style="border-collapse: collapse; width: 100%;">
                    <thead>
                      <tr>
                        <th style="border: 1px solid black; padding: 8px; text-align: left;">District </th>
                        <th style="border: 1px solid black; padding: 8px; text-align: left;">Block</th>
                        <th style="border: 1px solid black; padding: 8px; text-align: left;">Village</th>
                        <th style="border: 1px solid black; padding: 8px; text-align: left;">School</th>

                      </tr>
                    </thead>
                    <tbody>`;

      features.forEach(feature => {
        let catagoryFilter = 1;
        if (selectedCatagory != 0) {
          catagoryFilter = getFilterByProperty('Category', selectedCatagory)(feature);
        }


        if (catagoryFilter && getFilterByProperty('District', selectedDistrict)(feature)) {
          count++;
          if (selectedCatagory === '0') {
            // if(getFilterByProperty('Category', selectedCatagory)(feature)) {
            // console.log("''''''''''''''''''''''''''''''''''");
            // console.log(feature.getProperties().Category===1);

            // console.log("''''''''''''''''''''''''''''''''''");

            if (feature.getProperties().Category === 1) {
              count1++;
            }
            if (feature.getProperties().Category === 2) {
              count2++;
            }
            if (feature.getProperties().Category === 3) {
              count3++;
            }
            if (feature.getProperties().Category === 4) {
              count4++;
            }
            if (feature.getProperties().Category === 5) {
              count5++;
            }
            if (feature.getProperties().Category === 6) {
              count6++;
            }
            if (feature.getProperties().Category === 7) {
              count7++;
            }
            if (feature.getProperties().Category === 8) {
              count8++;
            }
            if (feature.getProperties().Category === 10) {
              count10++;
            }  
            if (feature.getProperties().Category === 11) {
              count11++;
            }


          }
          const coordinates = feature.getGeometry().getCoordinates();
          map.getView().animate({ center: coordinates, zoom: 15, duration: 1000 });
          const properties = feature.getProperties();
          contInfoHTML += `<tr>
        <td style="border: 1px solid black; padding: 8px;">${properties.District}</td>
        <td style="border: 1px solid black; padding: 8px;">${properties.Block}</td>
        <td style="border: 1px solid black; padding: 8px;">${properties.Village}</td>
        <td style="border: 1px solid black; padding: 8px;" onclick="selectedschoolfromtable(${properties.sl})">${properties.School}</td>

        </tr>`;;


        }

      });
      contInfoHTML += `</tbody></table>`;
      let infoHTML = `<h3>SSA Data Informatiom</h3> <br>`;

      infoHTML += `<h4>Total Schools In The  District: ${count}</h4> <br>`;
      infoHTML += `<div id="piechartssa"></div> <br>`;




      infoHTML += contInfoHTML
      document.getElementById('villageDetails').innerHTML = infoHTML;

      // Load google charts
      google.charts.load('current', { 'packages': ['corechart'] });
      if (selectedCatagory === '0') {

        google.charts.setOnLoadCallback(drawChart);
      }
      // Draw the chart and set the chart values
      function drawChart() {
        var data = google.visualization.arrayToDataTable([
          ['School', 'Numbers'],
          [`Primary only: ${count1}`, count1],
          [`Primary with UP: ${count2}`, count2],
          [`Pr with UP, Sec and HS: ${count3}`, count3],
          [`Upper Primary only: ${count4}`, count4],
          [`UP, PR, Sec and HS: ${count5}`, count5],
          [`PR, UP. and Sec Only: ${count6}`, count6],
          [`UP and Sec: ${count7}`, count7],
          [`Secondary Only: ${count8}`, count8],
          [`Sec with Hr. Sec: ${count10}`, count10],
          [`HS only/Jr. College: ${count11}`, count11]



        ]);

        // Optional; add a title and set the width and height of the chart
        var options = { 'title': 'My Average Day', 'width': 550, 'height': 400 };

        // Display the chart inside the <div> element with id="piechart"
        var chart = new google.visualization.PieChart(document.getElementById('piechartssa'));
        chart.draw(data);
      }

      infopopup.style.display = "block";

    }

    // Hover functionality

  });

  let highlight;
  const featureOverlay = new VectorLayer({
    source: new VectorSource(),
    map: map,
    style: new Style({
      stroke: new Stroke({
        color: 'rgba(255, 255, 255, 0.7)',
        width: 2,
      }),
    }),
  });

  const displayFeatureInfo = function (pixel) {
    // const info = document.getElementById('info-content');
    map.forEachFeatureAtPixel(pixel, function (feature, layer) {
      if (layer && layer.get('name') === 'ssaLayer') {
        document.getElementById('info').style.display = "block";
        let popupinfo;
        const info = document.getElementById('info-content');
        if (feature) {
          console.log(feature.getProperties())

          const properties = feature.getProperties();
          let contInfoHTML = `
            <table style="border-collapse: collapse; width: 100%;">
              <thead>
                <tr>
                  <th style="border: 1px solid black; padding: 8px; text-align: left;">Property</th>
                  <th style="border: 1px solid black; padding: 8px; text-align: left;">Value</th>
                </tr>
              </thead>
              <tbody>`;

          for (const key in properties) {
            if (key !== 'geometry') {
              contInfoHTML += `
                <tr>
                  <td style="border: 1px solid black; padding: 8px;">${key}</td>
                  <td style="border: 1px solid black; padding: 8px;">${properties[key]}</td>
                </tr>`;
            }
          }

          contInfoHTML += `</tbody></table>`;

          let infoHTML = `<h3>SSA Data Information</h3><br>`;
          // Assuming `count` is a variable that holds the number of schools in the village
          infoHTML += contInfoHTML;

          document.getElementById('info-content').innerHTML = infoHTML;
          infopopup.style.display = "block";




        } else {
          info.innerHTML = '&nbsp;';
        }

        if (feature !== highlight) {
          if (highlight) {
            featureOverlay.getSource().removeFeature(highlight);
          }
          if (feature) {
            featureOverlay.getSource().addFeature(feature);
          }
          highlight = feature;
        }
        return true; // Stop iteration over features
      }
    });
  };

  map.on('click', function (evt) {
    if (evt.dragging) {
      return;
    }
    const pixel = map.getEventPixel(evt.originalEvent);
    displayFeatureInfo(pixel);
  });

  map.on('click', function (evt) {
    displayFeatureInfo(evt.pixel);
  });

  setTimeout(() => {
    generateLegend()
    console.log("Delayed for 1 second.");
  }, "2000");
};
document.getElementById('ssa_selectButton').addEventListener('click', function () {
  ssa_select('select')
})

document.getElementById('ssa_clearButton').addEventListener('click', function () {
  ssa_select('clear')

})



// Populate the datalist with school names
document.addEventListener('DOMContentLoaded', () => {
  const inputElement = document.getElementById('dsearch-input');
  const dataListElement = document.getElementById('dsearch-datalist');
  const dsearchLayerElement = document.getElementById('dsearch-layer');

  function loadOptions(layer) {
    let dataFile = '';

    if (layer === 'ssa2022') {
      dataFile = './schoolname.json';
    } else {
      dataFile = './villagenames.json';
    }

    // Clear previous options
    dataListElement.innerHTML = '';

    // Fetch and load names from the JSON file
    fetch(dataFile)
      .then(response => response.json())
      .then(names => {
        names.forEach(name => {
          const optionElement = document.createElement('option');
          optionElement.value = name;
          dataListElement.appendChild(optionElement);
        });
      })
      .catch(error => console.error('Error loading names:', error));
  }

  // Load options based on initial selection
  loadOptions(dsearchLayerElement.value);

  // Update options when the layer selection changes
  dsearchLayerElement.addEventListener('change', (event) => {
    loadOptions(event.target.value);
  });
});


document.getElementById('DirSearch').addEventListener('click', function (){
  const inputElement = document.getElementById('dsearch-input');
  const dsearchLayerElement = document.getElementById('dsearch-layer');

  let dataFile = '';
  if (dsearchLayerElement.value === 'village') {
    // dataFile = './schoolname.json';
    // ssa_select('dsearch')
    village_filter('dsearch')

  } else {
    // dataFile = './villagenames.json';
  }

})


// --------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------
// overlay


// state dist Layer select tool starts

// side menu options

// admin states
// state boundary


// 


const villageCheckbox = document.getElementById('VillageBoundary');
const villageBoundary = new TileLayer({
  source: new TileWMS({
    url: 'http://localhost:8080/geoserver/wms',
    params: {
      'LAYERS': 'openlayer:assam_village',
      'TILED': true,
      'INFO_FORMAT': 'application/json', // Ensure the response is in JSON format
      // 'SLD_BODY': sldEncoded // Use custom SLD style
    },
    crossOrigin: "Anonymous",
    serverType: 'geoserver',
  }),
  visible: false,
  name: "villageBoundary"

});


const dstrictCheckbox = document.getElementById('DistrictBoundary');
const dstrictBoundary = new TileLayer({
  source: new TileWMS({
    url: 'http://localhost:8080/geoserver/wms',
    params: {
      'LAYERS': '	openlayer:assam_state_dist',
      'TILED': true,
      'INFO_FORMAT': 'application/json', // Ensure the response is in JSON format
      // 'SLD_BODY': sldEncoded // Use custom SLD style
    },
    crossOrigin: "Anonymous",
    serverType: 'geoserver',

  }),
  visible: false,
  name: "dstrictBoundary"

});

const stateCheckbox = document.getElementById('stateboundary');
const stateBoundary = new TileLayer({
  source: new TileWMS({
    url: 'http://localhost:8080/geoserver/wms',
    params: {
      'LAYERS': 'openlayer:assam_boundary',
      'TILED': true,
      'INFO_FORMAT': 'application/json', // Ensure the response is in JSON format
      // 'SLD_BODY': sldEncoded // Use custom SLD style
    },
    crossOrigin: "Anonymous",
    serverType: 'geoserver',
  }),
  visible: false,
  name: "stateBoundary"

});

const ssaCheckbox = document.getElementById('ssa');
const ssaLayer = new TileLayer({
  source: new TileWMS({
    url: 'http://localhost:8080/geoserver/wms',
    params: {
      'LAYERS': 'openlayer:ssa_data_2022_flt',
      'TILED': true,
      'INFO_FORMAT': 'application/json', // Ensure the response is in JSON format
      // 'SLD_BODY': sldEncoded // Use custom SLD style
    },
    crossOrigin: "Anonymous",
    serverType: 'geoserver',
  }),
  visible: false,
  name: "ssaLayer",
  style: new Style({
    stroke: new Stroke({
      color: 'rgba(0, 255, 0, 0.7)',
      width: 2,
    }),
    fill: new Fill({
      color: 'rgba(255, 255, 0, 0.1)'
    }),
  }),
});

let highlight;
const featureOverlay = new VectorLayer({
  source: new VectorSource(),
  map: map,
  style: new Style({
    stroke: new Stroke({
      color: 'rgba(0, 255, 0, 0.7)',
      width: 2,
    }),
    fill: new Fill({
      color: 'rgba(255, 255, 255, 0.1)'
    }),
  }),
});

const displayFeatureInfo = function (pixel, layer) {
  const viewResolution = map.getView().getResolution();
  const url = layer.getSource().getFeatureInfoUrl(
    map.getCoordinateFromPixel(pixel),
    viewResolution,
    'EPSG:3857',
    { 'INFO_FORMAT': 'application/json' }
  );

  if (url) {
    console.log(layer)
    fetch(url)
      .then(response => response.json())
      .then(data => {
        const info = document.getElementById('info-content');
        if (data.features && data.features.length > 0) {
          const feature = data.features[0];

          let layer_nm = "";
          console.log()



          let infoHTML = `<h4 style="text-align: center; margin:10px"> Information</h4>`;
          infoHTML += '<hr>';

          infoHTML += `<table style="border-collapse: collapse; width: 100%;">
      <thead>
        <tr>
          <th style="border: 1px solid black; padding: 8px; text-align: left;">Property</th>
          <th style="border: 1px solid black; padding: 8px; text-align: left;">Value</th>
        </tr>
      </thead>
      <tbody>`;

          // Iterate over each feature to populate the table rows
          console.log(data.features[0])
          data.features.forEach(function (feature) {
            const properties = feature.properties;;
            for (const key in properties) {
              if (key !== 'geometry') {
                infoHTML += `<tr>
                          <td style="border: 1px solid black; padding: 8px;">${key}</td>
                          <td style="border: 1px solid black; padding: 8px;">${properties[key]}</td>
                          </tr>`;
              }
            }

          });
          // Close the table
          infoHTML += `</tbody></table>`;


          document.getElementById("info-content").innerHTML = infoHTML;
          console.log("hey")
          const infopopup = document.getElementById("info");
          infopopup.style.display = "block"









          if (highlight) {
            featureOverlay.getSource().removeFeature(highlight);
          }

          let geometry;
          switch (feature.geometry.type) {
            case 'Polygon':
            case 'MultiPolygon':
              geometry = new GeoJSON().readGeometry(feature.geometry);
              break;
            case 'Point':
              geometry = new Point(new GeoJSON().readGeometry(feature.geometry).getCoordinates());
              break;
            default:
              geometry = new GeoJSON().readGeometry(feature.geometry);
          }

          highlight = new Feature(geometry);
          featureOverlay.getSource().addFeature(highlight);
        } else {
          document.getElementById('info').style.display = "none";
          if (highlight) {
            featureOverlay.getSource().removeFeature(highlight);
            highlight = null;
          }
        }
      })
      .catch(error => console.error('Error fetching feature info:', error));
  }
};

const onPointerMove = function (evt) {
  if (evt.dragging) {
    return;
  }
  const pixel = map.getEventPixel(evt.originalEvent);
  const layers = [villageBoundary, dstrictBoundary, ssaLayer];
  for (let layer of layers) {
    if (layer.getVisible() && layer.getSource().getFeatureInfoUrl) {
      displayFeatureInfo(pixel, layer);
      break; // Stop after finding the first visible layer with a FeatureInfo URL
    }
  }
};

const onClick = function (evt) {
  const pixel = evt.pixel;
  const layers = [villageBoundary, dstrictBoundary, ssaLayer];
  for (let layer of layers) {
    if (layer.getVisible() && layer.getSource().getFeatureInfoUrl) {
      displayFeatureInfo(pixel, layer);
      break; // Stop after finding the first visible layer with a FeatureInfo URL
    }
  }
};

const handleLayerChange = function (layer, checkbox) {
  layer.setVisible(checkbox.checked);
  if (checkbox.checked) {
    map.addLayer(layer);
    // map.on('click', onPointerMove);
    map.on('click', onClick);
    setTimeout(() => {
      generateLegend()
      console.log("Delayed for 1 second.");
    }, "2000");

  } else {
    map.removeLayer(layer);
    // map.un('click', onPointerMove);
    map.un('click', onClick);

  }
  setTimeout(() => {
    generateLegend();
    console.log("Delayed for 1 second.");
  }, 2000);
};
ssaCheckbox.addEventListener('change', function () {
  handleLayerChange(ssaLayer, this);
});
villageCheckbox.addEventListener('change', function () {
  handleLayerChange(villageBoundary, this);
});

dstrictCheckbox.addEventListener('change', function () {
  handleLayerChange(dstrictBoundary, this);
});

stateCheckbox.addEventListener('change', function () {
  handleLayerChange(stateBoundary, this);
});


villageBoundary.getSource().on('tileloaderror', function (event) {
  console.error('Tile load error:', event);
});
dstrictBoundary.getSource().on('tileloaderror', function (event) {
  console.error('Tile load error:', event);
});
stateBoundary.getSource().on('tileloaderror', function (event) {
  console.error('Tile load error:', event);
});
ssaLayer.getSource().on('tileloaderror', function (event) {
  console.error('Tile load error:', event);
});





// labels----------------------------------------------------------

// ASSAM BOUND
// village Layer
const VillageLayer = new TileLayer({
  source: new TileWMS({
    url: 'http://localhost:8080/geoserver/wms',
    params: {
      'LAYERS': 'openlayer:assam_village',
      'TILED': true,
      'INFO_FORMAT': 'application/json', // Ensure the response is in JSON format
      // 'SLD_BODY': sldEncoded // Use custom SLD style
    },
    crossOrigin: "Anonymous",
    serverType: 'geoserver',

  }),
  visible: false,
  name: 'VillageLayer'

});

map.addLayer(VillageLayer)
document.getElementById("labelVill").addEventListener("click", function () {
  var layers = map.getLayers().getArray();
  layers.forEach(function (layer) {
    // console.log(layer)
    console.log("layer.get('visible')st")

    console.log(layer.get('name'))
    console.log(layer.get('visible'))

    console.log("layer.get('visible')en")

    if (layer.get('name') === "VillageLayer") {
      if (layer.get('visible') === true) {
        layer.setVisible(false);
      } else {
        layer.setVisible(true);
      }
    }
  });
})
// dist layer 
const DistrictLayer = new TileLayer({
  source: new TileWMS({
    url: 'http://localhost:8080/geoserver/wms',
    params: {
      'LAYERS': '	openlayer:assam_state_dist',
      'TILED': true,
      'INFO_FORMAT': 'application/json', // Ensure the response is in JSON format
      // 'SLD_BODY': sldEncoded // Use custom SLD style
    },
    crossOrigin: "Anonymous",
    serverType: 'geoserver',

  }),
  visible: false,
  name: 'DistrictLayer'

});

map.addLayer(DistrictLayer)
document.getElementById("labelDist").addEventListener("click", function () {
  var layers = map.getLayers().getArray();
  layers.forEach(function (layer) {
    // console.log(layer)
    console.log("layer.get('visible')st")

    console.log(layer.get('name'))
    console.log(layer.get('visible'))

    console.log("layer.get('visible')en")

    if (layer.get('name') === "DistrictLayer") {
      if (layer.get('visible') === true) {
        layer.setVisible(false);
      } else {
        layer.setVisible(true);
      }
    }
  });
})

// state
const StateLayer = new TileLayer({
  source: new TileWMS({
    url: 'http://localhost:8080/geoserver/wms',
    params: {
      'LAYERS': 'openlayer:assam_boundary',
      'TILED': true,
      'INFO_FORMAT': 'application/json', // Ensure the response is in JSON format
      // 'SLD_BODY': sldEncoded // Use custom SLD style
    },
    crossOrigin: "Anonymous",
    serverType: 'geoserver',

  }),
  visible: true,
  name: 'StateLayer'

});

map.addLayer(StateLayer)
document.getElementById("labelState").addEventListener("click", function () {
  var layers = map.getLayers().getArray();
  layers.forEach(function (layer) {
    // console.log(layer)
    console.log("layer.get('visible')st")

    console.log(layer.get('name'))
    console.log(layer.get('visible'))

    console.log("layer.get('visible')en")

    if (layer.get('name') === "StateLayer") {
      if (layer.get('visible') === true) {
        layer.setVisible(false);
      } else {
        layer.setVisible(true);
      }
    }
  });
})




// label



// upload starts


document.getElementById("uploadButton").addEventListener('click', function () {
  var fileInput = document.getElementById('fileInput');
  var file = fileInput.files[0];

  if (!file) {
    alert("Please select a file to upload.");
    return;
  }

  var reader = new FileReader();
  reader.onload = function (event) {
    var data = event.target.result;
    var extension = file.name.split('.').pop().toLowerCase();
    processData(data, extension);
  };
  reader.onerror = function (event) {
    console.error("File could not be read! Code " + event.target.error.code);
  };
  reader.readAsText(file);
});

function processData(data, extension) {
  try {
    if (extension === 'geojson') {
      visualizeGeoJSON(data);
    } else if (extension === 'csv') {
      visualizeCSV(data);
    } else if (extension === 'kml') {
      visualizeKML(data);
    } else {
      console.error("Unsupported file format.");
    }
  } catch (error) {
    console.error("Error processing file:", error);
  }
}

function visualizeGeoJSON(data) {
  try {
    var geojson = JSON.parse(data);
    var features = geojson.features;

    if (!features || !Array.isArray(features)) {
      console.error("Invalid GeoJSON data format.");
      return;
    }

    features.forEach(function (feature) {
      var geometry = feature.geometry;
      if (geometry) {
        var type = geometry.type;
        var coordinates = geometry.coordinates;

        var geometryFeature;
        if (type === 'Point') {
          geometryFeature = new Feature({
            geometry: new Point(fromLonLat(coordinates))
          });
        } else if (type === 'LineString') {
          geometryFeature = new Feature({
            geometry: new LineString(coordinates.map(coord => fromLonLat(coord)))
          });
        } else if (type === 'Polygon') {
          geometryFeature = new Feature({
            geometry: new Polygon(coordinates.map(ring => ring.map(coord => fromLonLat(coord))))
          });
        } else if (type === 'MultiPolygon') {
          geometryFeature = new Feature({
            geometry: new MultiPolygon(coordinates.map(polygon => polygon.map(ring => ring.map(coord => fromLonLat(coord)))))
          });
        } else {
          console.error("Unsupported GeoJSON geometry type.");
          return;
        }

        var vectorSource = new VectorSource({
          features: [geometryFeature]
        });

        var vectorLayer = new VectorLayer({
          source: vectorSource
        });

        map.addLayer(vectorLayer);
      } else {
        console.error("Invalid GeoJSON feature format.");
      }
    });
  } catch (error) {
    console.error("Error processing GeoJSON:", error);
  }
}

function visualizeCSV(data) {
  console.log("csv");
  try {
    // Parse CSV data
    Papa.parse(data, {
      header: true,
      complete: function (results) {
        results.data.forEach(function (row) {
          var latitude = parseFloat(row.latitude);
          var longitude = parseFloat(row.longitude);

          if (!isNaN(latitude) && !isNaN(longitude)) {
            var marker = new Feature({
              geometry: new Point(fromLonLat([longitude, latitude]))
            });

            var vectorSource = new VectorSource({
              features: [marker]
            });

            var vectorLayer = new VectorLayer({
              source: vectorSource
            });

            map.addLayer(vectorLayer);
          } else {
            console.error("Invalid latitude or longitude in CSV.");
          }
        });
      }
    });
  } catch (error) {
    console.error("Error processing CSV:", error);
  }
}

function visualizeKML(data) {
  try {
    // Log the raw KML data for debugging
    console.log("Raw KML data:", data);

    // Initialize the KML parser
    const parser = new KML();

    // Parse the KML data into OpenLayers features
    const features = parser.readFeatures(data, {
      featureProjection: 'EPSG:3857'
    });

    // Log the parsed features for debugging
    console.log("Parsed KML features:", features);

    if (features.length === 0) {
      console.error("No features found in KML.");
      return;
    }

    // Create a VectorSource with the parsed features
    const vectorSource = new VectorSource({
      features: features
    });

    // Create a VectorLayer with the VectorSource
    const vectorLayer = new VectorLayer({
      source: vectorSource
    });

    // Add the VectorLayer to the map
    map.addLayer(vectorLayer);
  } catch (error) {
    console.error("Error processing KML:", error);
  }
}






// ------------

//  Print option-----------



// handletoggleLayer

// Define the toggleLayer function to switch between layers

function toggleLayer(layerName) {
  if (layerName === 'osm') {
    var layers = map.getLayers().getArray();
    layers.forEach(function (layer) {
      if (layer.get('name') === 'standardLayer' || layer.get('name') === 'sateliteLayer' || layer.get('name') === 'transportLayer' || layer.get('name') === 'labelLayer') {
        layer.setVisible(false);
      } else if (layer.get('name') === 'osm') {
        layer.setVisible(true);
      }
    });
  }

  if (layerName === 'sateliteLayer') {
    var layers = map.getLayers().getArray();
    layers.forEach(function (layer) {
      if (layer.get('name') === 'standardLayer' || layer.get('name') === 'osm' || layer.get('name') === 'transportLayer') {
        layer.setVisible(false);
      } else if (layer.get('name') === 'sateliteLayer' || layer.get('name') === 'labelLayer') {
        layer.setVisible(true);
      }
    });
  }

  if (layerName === 'standardLayer') {
    var layers = map.getLayers().getArray();
    layers.forEach(function (layer) {
      if (layer.get('name') === 'osm' || layer.get('name') === 'sateliteLayer' || layer.get('name') === 'transportLayer' || layer.get('name') === 'labelLayer') {
        layer.setVisible(false);
      } else if (layer.get('name') === 'standardLayer') {
        layer.setVisible(true);
      }
    });
  }

  if (layerName === 'transportLayer') {
    var layers = map.getLayers().getArray();
    layers.forEach(function (layer) {
      if (layer.get('name') === 'osm' || layer.get('name') === 'standardLayer' || layer.get('name') === 'sateliteLayer' || layer.get('name') === 'labelLayer') {
        layer.setVisible(false);
      } else if (layer.get('name') === 'transportLayer') {
        layer.setVisible(true);
      }
    });
  }


  // var layers = map.getLayers().getArray();
  // layers.forEach(function (layer) {
  //   if (layer.get('name') === layerName) {
  //     // console.log(name)
  //     //       console.log(name)

  //     layer.setVisible(true);
  //   } else {
  //     layer.setVisible(true);
  //   }
  // });
}

window.handletoggleLayer = function (layerName) {
  toggleLayer(layerName);
};

function toggleLabelLayer(layerName) {
  var layers = map.getLayers().getArray();
  layers.forEach(function (layer) {
    console.log(layer)

    console.log(layer.get('visible'))
    if (layer.get('name') === layerName) {
      if (layer.get('visible') === true) {
        layer.setVisible(false);
      } else {
        layer.setVisible(true);
      }
    }
  });
}

window.handletoggleLabelLayer = function (layerName) {
  toggleLabelLayer(layerName);
};


// --BAse layer  changes feature end


// geo coder
let geoLocateLat;
let geoLocateLon;

document.addEventListener('DOMContentLoaded', function () {
  const locationInput = document.getElementById('locationInput');
  const resultContainer = document.getElementById('resultContainer');

  // Event listener for input changes
  locationInput.addEventListener('input', function () {
    const location = locationInput.value.trim();
    if (location) {
      getSuggestions(location);
    } else {
      // Clear the result container if the input is empty
      resultContainer.innerHTML = '';
    }
  });


  // Function to get suggestions from Nominatim API
  async function getSuggestions(location) {
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${location}`);
      const suggestions = response.data;
      displaySuggestions(suggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error.message);
    }
  }

  // Function to display suggestions in the result container
  function displaySuggestions(suggestions) {
    if (suggestions && suggestions.length > 0) {
      const suggestionHTML = suggestions.map(suggestion => {
        return `<li class="suggestion-item" data-lat="${suggestion.lat}" data-lon="${suggestion.lon}" data-name="${suggestion.display_name}">${suggestion.display_name}</li>`;
      }).join('');
      resultContainer.innerHTML = `<ul>${suggestionHTML}</ul>`;
      // Add click event listener to each suggestion item
      const suggestionItems = document.querySelectorAll('.suggestion-item');
      suggestionItems.forEach(item => {
        item.addEventListener('click', function () {
          const name = item.getAttribute('data-name');
          locationInput.value = name; // Automatically add the selected suggestion to the input field
          console.log(item)
          geoLocateLat = item.getAttribute('data-lat');
          geoLocateLon = item.getAttribute('data-lon');
          locateLocation(geoLocateLat, geoLocateLon);
          clearSuggestions(); // Clear suggestions after selecting one
        });
      });
    } else {
      resultContainer.innerHTML = '<p>No suggestions found.</p>';
    }
  }

  // Function to clear suggestions
  function clearSuggestions() {
    resultContainer.innerHTML = '';
  }

  // Function to locate a specific location on the map
  function locateLocation(lat, lon) {
    // Here, you can write your code to locate the location on the map

    // const geoLocateSource = new VectorSource();
    // const geoLocateLayer = new VectorLayer({
    //   source: geoLocateSource
    // });

    // Center the map view to the specified coordinates

    map.getView().setCenter(new fromLonLat([lon, lat]));
    map.getView().setZoom(16); // Set desired zoom level

    // Drop a pin at the specified coordinates
    let pinFeature = new Feature({
      geometry: new Point(fromLonLat([lon, lat]))
    });

    // Add the pin feature to the pin source
    pinSource.addFeature(pinFeature);

    let pinStyle = new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: './modules/location-pin.png' // URL to the pin icon
      })
    });

    pinFeature.setStyle(pinStyle);
  }
});

// geo coder



// const format = new ol.format.GeoJSON({featureProjection: 'EPSG:3857'}); // Uncomment this line and replace 'ol' with your library name if different
const download = document.getElementById('download');
download.addEventListener('click', function () {
  console.log("hi I'm inside export");
  try {
    const geojsonFormat = new GeoJSON({ featureProjection: 'EPSG:3857' }); // Assuming 'ol' is the OpenLayers namespace
    const features = drsource.getFeatures(); // Assuming 'drsource' is the vector source
    // Update feature properties to include label
    features.forEach(feature => {
      if (!feature.get('label')) {
        feature.set('label', ''); // Default empty label if not set
      }
    });



    const json = geojsonFormat.writeFeatures(features);

    // Create data URI with correct MIME type and filename
    download.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(json);
    download.download = 'data.geojson'; // Specify the filename with .geojson extension
    console.log(features);
  } catch (error) {
    console.error("Error during download:", error);
    // Handle the error appropriately, e.g., display a user-friendly message.
  }
});





const clear_all = document.getElementById("clear_all");
clear_all.addEventListener('click', function () {
  const infopopup = document.getElementById("villageInfo");
  infopopup.style.display = "none";
  // Get all layers from the map
  const layers = map.getLayers().getArray();

  // Iterate through the layers and clear only vector layers
  layers.forEach(layer => {
    if (layer instanceof VectorLayer) {
      layer.getSource().clear();
    }
  });
  setTimeout(() => {
    generateLegend()
    console.log("Delayed for 1 second.");
  }, "2000");
})






window.handle_clear_alll = function () {
  cleaning();
};



// --------print
// --------print
// --------print


function generateLegend() {
  const existingLegend = document.getElementById('legend');
  if (existingLegend) {
    existingLegend.remove();
  }

  const legendElement = document.createElement('div');
  legendElement.id = 'legend';
  legendElement.style.display = 'flex';
  legendElement.style.flexDirection = 'column';
  legendElement.style.backgroundColor = 'white';
  legendElement.style.padding = '10px';
  legendElement.style.zIndex = '10';

  const layers = map.getLayers().getArray();
  layers.forEach(layer => {
    const layerName = layer.get('name');

    if (layerName &&
      // !layerName.includes('labe') &&
      // !layerName.includes('LabelL') &&
      !layerName.includes('ssa') &&
      !layerName.includes('sateliteLayer') &&
      !layerName.includes('sateliteLayer') &&
      !layerName.includes('labelLayer') &&
      !layerName.includes('Boundary') &&
      !layerName.includes('osm') &&
      !layerName.includes('standardLayer') &&
      !layerName.includes('transportLayer')

    ) {
      const source = layer.getSource();
      const legendItem = document.createElement('div');
      legendItem.style.display = 'flex';
      legendItem.style.alignItems = 'center';
      legendItem.style.marginBottom = '5px';
      legendItem.style.fontWeight = '900';

      const colorBox = document.createElement('div');
      colorBox.style.width = '20px';
      colorBox.style.height = '20px';
      colorBox.style.marginRight = '10px';

      if (source instanceof VectorSource) {
        const features = source.getFeatures();
        if (features.length > 0) {
          const feature = features[0];
          const style = layer.getStyle() instanceof Style ? layer.getStyle() : layer.getStyle()(feature);

          // Extract color from style
          if (style.getStroke()) {
            colorBox.style.backgroundColor = style.getStroke().getColor();
          } else if (style.getFill()) {
            colorBox.style.backgroundColor = style.getFill().getColor();
          }
        }
      } else if (source instanceof TileWMS) {
        colorBox.style.backgroundColor = getWMSLayerColor(layerName); // Use function to get color for TileWMS layers
      }

      legendItem.appendChild(colorBox);

      const label = document.createElement('span');
      label.innerText = layerName;
      legendItem.appendChild(label);
      legendElement.appendChild(legendItem);
    }
  });

  document.body.appendChild(legendElement);
}

// Function to define colors for TileWMS layers
function getWMSLayerColor(layerName) {
  const colors = {
    'StateLayer': '#000', // Example color for StateLayer
    'DistrictLayer': '#a0a', // Example color for StateLayer
    'VillageLayer': '#fca103', // Example color for StateLayer


    // Add more layers and their colors here
  };
  return colors[layerName] || '#f0f0f0'; // Default color
}




// Sample code to demonstrate the legend generation
generateLegend();




// 

const printFormat = new WKT();
const printFeature = printFormat.readFeature(
  'POLYGON((10.689697265625 -25.0927734375, 34.595947265625 ' +
  '-20.1708984375, 38.814697265625 -35.6396484375, 13.502197265625 ' +
  '-39.1552734375, 10.689697265625 -25.0927734375))'
);
printFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');

const vector = new VectorLayer({
  source: new VectorSource({
    features: [printFeature],
  }),
  opacity: 0.5,
});

const dims = {
  a0: [1189, 841],
  a1: [841, 594],
  a2: [594, 420],
  a3: [420, 297],
  a4: [297, 210],
  a5: [210, 148],
};

const exportButton = document.getElementById('printButton');

const processCanvas = (width, height, canvases, mapContext, callback) => {
  if (canvases.length === 0) {
    callback();
    return;
  }

  const canvas = canvases.shift();
  if (canvas.width > 0) {
    const opacity = canvas.parentNode.style.opacity;
    mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
    const transform = canvas.style.transform;
    const matrix = transform
      .match(/^matrix\(([^\(]*)\)$/)[1]
      .split(',')
      .map(Number);
    CanvasRenderingContext2D.prototype.setTransform.apply(mapContext, matrix);

    mapContext.drawImage(canvas, 20, height * .2, width * 0.9, height * 0.9);
  }

  requestAnimationFrame(() => processCanvas(width, height, canvases, mapContext, callback));
};

const exportMap = async () => {
  const format = document.getElementById('format').value;
  const resolution = document.getElementById('resolution').value;
  const dim = dims[format];
  const width = Math.round((dim[0] * resolution) / 25.4);
  const height = Math.round((dim[1] * resolution) / 25.4);
  const size = map.getSize();
  const viewResolution = map.getView().getResolution();

  // Generate the legend before render complete
  generateLegend();

  // Set map size and view resolution for the export
  map.setSize([width, height]);
  const scaling = Math.min(width / size[0], height / size[1]);
  map.getView().setResolution(viewResolution / scaling);

  // Capture the scale line first
  const scaleLineElement = document.getElementById('scale-line-control');
  let scaleLineCanvas;

  try {
    scaleLineCanvas = await html2canvas(scaleLineElement);
  } catch (error) {
    console.error('Error capturing scale line:', error);
    scaleLineCanvas = document.createElement('canvas');
    scaleLineCanvas.width = 0;
    scaleLineCanvas.height = 0;
  }

  map.once('rendercomplete', async function () {
    const mapCanvas = document.createElement('canvas');
    mapCanvas.width = width;
    mapCanvas.height = height;
    const mapContext = mapCanvas.getContext('2d', { willReadFrequently: true });
    mapContext.fillStyle = '#437572'; // Background color
    mapContext.fillRect(0, 0, width, height);

    const canvases = Array.prototype.slice.call(
      document.querySelectorAll('.ol-layer canvas')
    );

    await processCanvas(width, height, canvases, mapContext);

    // Draw the map area
    mapContext.globalAlpha = 1;
    mapContext.setTransform(1, 0, 0, 1, 0, 0);

    // About Section
    const aboutSection = document.createElement('div');
    aboutSection.id = 'aboutSection';
    aboutSection.innerHTML = `
      <div class="canvas-about">
        <img src="./fav.png" alt="Logo" style="width: 100px;" />
      </div>
      <div class="canvas-about">
        <h1 style="margin-bottom:10px">Assam State Space Application Centre</h1>
        <p>GS rd, Guwahati, 781005</p> 
      </div>
      <br>
    `;
    document.body.appendChild(aboutSection);

    try {
      const aboutCanvas = await html2canvas(aboutSection);
      document.body.removeChild(aboutSection);
      const aboutWidth = width * 0.8;
      const aboutHeight = aboutWidth * 0.13;
      mapContext.drawImage(aboutCanvas, 20, 20, aboutWidth, aboutHeight);

      // Legend
      const legendElement = document.getElementById('legend');
      if (legendElement) {
        try {
          const legendCanvas = await html2canvas(legendElement);
          const legendWidth = width * 0.17;
          const legendHeight = legendCanvas.height * legendWidth / legendCanvas.width;
          mapContext.drawImage(legendCanvas, width * 0.82, height * 0.18, legendWidth, legendHeight);
        } catch (error) {
          console.error('Error capturing legend:', error);
        }
      } else {
        console.error('Legend element not found');
      }

      // Draw Scale Line
      if (scaleLineCanvas) {
        const scaleLineWidth = scaleLineCanvas.width;
        const scaleLineHeight = scaleLineCanvas.height;
        mapContext.drawImage(scaleLineCanvas, width * 0.82 - scaleLineWidth, height * 0.98 - scaleLineHeight, scaleLineWidth * 0.8, scaleLineHeight * 0.8);
      }

      // Additional Text Section
      const additionalTextSection = document.createElement('div');
      additionalTextSection.id = 'additionalTextSection';
      additionalTextSection.innerHTML = `
        <div style="font-weight:900;">
          <br>
          <h3>Legend Section</h3>
          <br>
        </div>`;
      document.body.appendChild(additionalTextSection);

      try {
        const additionalTextCanvas = await html2canvas(additionalTextSection);
        document.body.removeChild(additionalTextSection);
        const additionalTextWidth = width * 0.17;
        const additionalTextHeight = additionalTextCanvas.height * additionalTextWidth / additionalTextCanvas.width;
        mapContext.drawImage(additionalTextCanvas, width * 0.82, 20, additionalTextWidth, additionalTextHeight);
      } catch (error) {
        console.error('Error capturing additional text section:', error);
      }

      // Export to PDF
      const pdf = new jsPDF('landscape', undefined, format);
      pdf.addImage(mapCanvas.toDataURL('image/jpeg'), 'JPEG', 0, 0, dim[0], dim[1]);
      pdf.save('map.pdf');

      // Reset map to original size and view resolution
      map.setSize(size);
      map.getView().setResolution(viewResolution);

      exportButton.disabled = false;
      document.body.style.cursor = 'auto';
    } catch (error) {
      console.error('Error capturing canvas elements:', error);
      const pdf = new jsPDF('landscape', undefined, format);
      pdf.addImage(mapCanvas.toDataURL('image/jpeg'), 'JPEG', 0, 0, dim[0], dim[1]);
      pdf.save('map.pdf');
      // Reset map to original size and view resolution
      map.setSize(size);
      map.getView().setResolution(viewResolution);
      exportButton.disabled = false;
      document.body.style.cursor = 'auto';
    }
  });

  // Trigger the map rendering process
  map.render();
};


exportButton.addEventListener('click', function () {
  generateLegend();
  exportButton.disabled = true;
  document.body.style.cursor = 'progress';
  exportMap();
}, false);


// -------print ends

// import styles from './mediaStyle.css';

import DragBox from 'ol/interaction/DragBox.js';


// Define the drag zoom interaction
const zoomininteraction = new DragBox();

zoomininteraction.on('boxend', function () {
  // Get the extent of the drawn box
  const zoominExtent = zoomininteraction.getGeometry().getExtent();
  map.getView().fit(zoominExtent);
});

const mapElement = document.getElementById("map");


function resetCursor() {
  mapElement.style.cursor = "auto"; // Reset cursor to normal
  map.removeInteraction(zoomininteraction);
}

// // Add event listener for "zoomend" event
map.on('moveend', resetCursor);

// // Append the button element to the document body
// document.body.appendChild(ziButton);
const ziButton = document.getElementById('dragSelect')
// Button click event listener for activating/deactivating drag zoom interaction
ziButton.addEventListener('click', () => {
  mapElement.style.cursor = "zoom-in";
  map.addInteraction(zoomininteraction);
})

// buffer starts

const bufferSource = new VectorSource();


const drawPointBuffer = new Draw({
  source: bufferSource,
  type: 'Point'
});

// Event listener for draw end

const bufferLayer = new VectorLayer({
  source: bufferSource,
});
map.addLayer(bufferLayer);

document.getElementById('createBuffer').addEventListener('click', () => {

  map.addInteraction(drawPointBuffer);
});

document.getElementById('clearBuffer').addEventListener('click', () => {
  console.log("clearBuffer")
  console.log("clearBuffer");

  // Remove all features from the buffer source
  bufferSource.clear();

  // Remove any existing buffer layers
  function removeExistingLayer(layerName) {
    const existingLayer = map.getLayers().getArray().find(layer => layer.get('name') === layerName);
    if (existingLayer) {
      map.removeLayer(existingLayer);
    }
  }

  removeExistingLayer('bufferLayer');
  // removeExistingLayer('stateLayer');
  // removeExistingLayer('outsideVectorLayer');

  const infopopup = document.getElementById("villageInfo");
  infopopup.style.display = "none";
  return
});

drawPointBuffer.on('drawend', async (event) => {

  const feature = event.feature;
  const coordinates = feature.getGeometry().getCoordinates();
  const lonLat = new transform(coordinates, map.getView().getProjection(), 'EPSG:4326');
  const radius = parseFloat(document.getElementById('buffer-radius').value);
  const [lon, lat] = lonLat;

  if (isNaN(lat) || isNaN(lon) || isNaN(radius)) {
    alert('Please enter valid latitude, longitude, and radius.');
    return;
  }

  // Create a point and buffer using Turf.js
  const point = turf.point([lon, lat]);
  const buffer = turf.buffer(point, radius, { units: 'meters' });

  // Transform buffer coordinates to map projection
  const bufferCoords = buffer.geometry.coordinates[0].map(coord => new transform(coord, 'EPSG:4326', map.getView().getProjection()));

  // Create a buffer feature and add it to the vector source
  const bufferFeature = new Feature({
    geometry: new Polygon([bufferCoords])
  });
  bufferSource.addFeature(bufferFeature);

  // const bufferSource = new ol.source.Vector();
  // const bufferLayer = new VectorLayer({
  //   source: bufferSource,
  // });
  // map.addLayer(bufferLayer);


  // Calculate the center of the buffer
  const bufferCenter = turf.center(buffer).geometry.coordinates;
  const centerCoords = transform(bufferCenter, 'EPSG:4326', map.getView().getProjection());

  // Create a feature for the center point
  const centerFeature = new Feature({
    geometry: new Point(centerCoords)
  });
  bufferSource.addFeature(centerFeature);

  // Style the center point with an icon
  centerFeature.setStyle(
    new Style({
      image: new Icon({
        src: './modules/pin.svg', // Path to your icon image
        scale: 1, // Adjust the scale as needed
      })
    })
  );

  // Highlight the buffer region
  console.log(bufferFeature)
  bufferFeature.setStyle(
    new Style({
      fill: new Fill({
        color: 'rgba(255, 0, 0, .1)'
      }),
      stroke: new Stroke({
        color: '#FF0000',
        width: 2
      }),
      zIndex: 9
    })
  );

  let lyr = document.getElementById("Buffer-layer").value
  let workspace, datastore;

  if (lyr === 'village') {
    workspace = "openlayer";
    datastore = "assam_village";

  }
  else if (lyr === 'ssa2022') {

    workspace = "openlayer";
    datastore = "ssa_data_2022_flt";

  }

  // Fetch features from the WMS layer within the buffer's bounding box
  const bbox = turf.bbox(buffer).join(',');
  const url = `http://localhost:8080/geoserver/${workspace}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${datastore}&outputFormat=application/json&bbox=${bbox}`;
  const response = await fetch(url);
  const geojson = await response.json();

  const format = new GeoJSON();
  const bufferFeatures = format.readFeatures(geojson, {
    featureProjection: map.getView().getProjection()
  });

  console.log('Fetched features:', bufferFeatures); // Add this line to check if features are being fetched
  let count = 0;
  let count1 = 0;
  let count2 = 0;
  let count3 = 0;
  let count4 = 0;
  let count5 = 0;
  let count6 = 0;
  let count7 = 0;
  let count8 = 0;
  let count10 = 0;
  let count11 = 0;


  // Create popup content


  // Create popup content as a table
  const content = document.getElementById('villageDetails');
  content.innerHTML = `<h3>Number of features: ${bufferFeatures.length}</h3> <br>`;

  content.innerHTML += `<div id="piechartssa"></div> <br>`;


  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  let uniqueKeys = new Set();
  bufferFeatures.forEach(feature => {
    const properties = feature.getProperties();
    Object.keys(properties).forEach(key => uniqueKeys.add(key));
  });

  let headers = ''

  if (lyr === 'ssa2022') {
    const includedHeaders = ['district', 'circle', 'block', 'category', 'village', 'school'];

    // Filter headers based on inclusion criteria
    headers = Array.from(uniqueKeys)
      .filter(key => key !== 'geometry' && includedHeaders.includes(key));

  } else {

    const includedHeaders = ['district', 'block', 'gaon_panch', 'village', 'population', 'area'];

    // Filter headers based on inclusion criteria
    headers = Array.from(uniqueKeys)
      .filter(key => key !== 'geometry' && includedHeaders.includes(key));  }


  // Define the headers to include

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headers.forEach(key => {
    const th = document.createElement('th');
    th.textContent = key;
    th.style.border = '1px solid #ccc';
    th.style.padding = '5px';
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  console.log(bufferFeatures);
  bufferFeatures.forEach(feature => {
    console.log(feature);

    const row = document.createElement('tr');

    const attributes = feature.getProperties();
    console.log(attributes);

    delete attributes.geometry; // Remove the geometry property
    headers.forEach(header => {

      const td = document.createElement('td');
      if (header === 'category') {
        if (attributes[header] === 1) {
          count1++;
        }
        if (attributes[header] === 2) {
          count2++;
        }
        if (attributes[header] === 4) {
          count4++;
        }
        if (attributes[header] === 3) {
          count3++;
        }
        if (attributes[header] === 5) {
          count5++;
        }
        if (attributes[header] === 6) {
          count6++;
        }
        if (attributes[header] === 7) {
          count7++;
        }
        if (attributes[header] === 8) {
          count8++;
        }
        if (attributes[header] === 10) {
          count10++;
        }  if (attributes[header] === 11) {
          count11++;
        }
      }
      console.log(header);

      console.log(attributes[header]);
      td.textContent = attributes[header];
      td.style.border = '1px solid #ccc';
      td.style.padding = '5px';
      row.appendChild(td);
    });
    tbody.appendChild(row);
  });
  table.appendChild(tbody);

  content.appendChild(table);


        // Load google charts
        google.charts.load('current', { 'packages': ['corechart'] });
        if (lyr === 'ssa2022') {
  
          google.charts.setOnLoadCallback(drawChart);
        }
        // Draw the chart and set the chart values
        function drawChart() {
          var data = google.visualization.arrayToDataTable([
            ['School', 'Numbers'],
            [`Primary only: ${count1}`, count1],
          [`Primary with UP: ${count2}`, count2],
          [`Pr with UP, Sec and HS: ${count3}`, count3],
          [`Upper Primary only: ${count4}`, count4],
          [`UP, PR, Sec and HS: ${count5}`, count5],
          [`PR, UP. and Sec Only: ${count6}`, count6],
          [`UP and Sec: ${count7}`, count7],
          [`Secondary Only: ${count8}`, count8],
          [`Sec with Hr. Sec: ${count10}`, count10],
          [`HS only/Jr. College: ${count11}`, count11]
  
          ]);
  
          // Optional; add a title and set the width and height of the chart
          var options = { 'title': 'My Average Day', 'width': 550, 'height': 400 };
  
          // Display the chart inside the <div> element with id="piechart"
          var chart = new google.visualization.PieChart(document.getElementById('piechartssa'));
          chart.draw(data);
        }

  // Show popup at the center of the buffer

  // displaySchoolInfo(selectedFeature);
  const infopopup = document.getElementById("villageInfo");
  infopopup.style.display = "block";

  map.removeInteraction(drawPointBuffer);

});





function assamStateDistFilter(option) {
  const selectedState = document.getElementById('assam-state').value;
  const selectedDistrict = document.getElementById('assam-district').value;
  const infopopup = document.getElementById("villageInfo");

  if (option === "clear") {
    removeExistingLayer('DistrictFiltered');
    removeExistingLayer('DistrictBoundary');
    infopopup.style.display = "none";
    setTimeout(() => {
      generateLegend();
      console.log("Delayed for 1 second.");
    }, 2000);
    return;
  }

  if (!selectedState) {
    window.alert("Select the State");
    return;
  }



  function getFilterByProperty(propertyName, value) {
    return function (feature) {
      const propertyValue = feature.get(propertyName);
      return propertyValue && propertyValue.toLowerCase() === value.toLowerCase();
    };
  }

  function removeExistingLayer(layerName) {
    const existingLayer = map.getLayers().getArray().find(layer => layer.get('name') === layerName);
    if (existingLayer) {
      map.removeLayer(existingLayer);
    }
  }

  function createVectorLayer(source, style, layerName) {
    const vectorLayer = new VectorLayer({
      source: source,
      style: style
    });
    vectorLayer.set('name', layerName);
    return vectorLayer;
  }

  function addLayerWithGeoJSON(url, filterFunction, style, layerName) {
    if (!selectedDistrict && option === 'mask') {
      window.alert("masking applicable for single boundary");
      return;
    }

    const vectorSource = new VectorSource({
      url: url,
      format: new GeoJSON()
    });

    vectorSource.on('featuresloadend', function () {
      console.log("GeoJSON loaded.");
    });

    vectorSource.on('featuresloaderror', function () {
      console.error("Error loading GeoJSON.");
    });

    vectorSource.once('change', function () {
      if (vectorSource.getState() === 'ready') {
        const features = vectorSource.getFeatures();
        // console.log(features)
        // console.log("Loaded features: ", features); // Debugging

        const filteredFeatures = features.filter(filterFunction);
        console.log("Filtered features: ", filteredFeatures); // Debugging

        // filteredFeatures.forEach((feature)=>{
        //   // console.log("features is")
        //   // console.log(feature.getProperties())


        // })
        displayDistrictInfo(filteredFeatures)

        vectorSource.clear();

        if (option === 'highlight') {
          vectorSource.addFeatures(filteredFeatures);
        } else if (option === 'mask') {
          const mapExtent = worldview.calculateExtent(map.getSize());
          const boundingBoxPolygon = fromExtent(mapExtent);
          const format = new GeoJSON();

          // Combine all filtered feature geometries into a single geometry using Turf.js
          let combinedGeometry = null;
          filteredFeatures.forEach((feature) => {
            if (combinedGeometry === null) {
              combinedGeometry = feature.getGeometry().clone();
            } else {
              combinedGeometry = turf.union(combinedGeometry, feature.getGeometry());
            }
          });

          if (combinedGeometry) {
            const boundingBoxGeoJSON = format.writeGeometryObject(boundingBoxPolygon);
            const clipGeometryGeoJSON = format.writeGeometryObject(combinedGeometry);
            const outsidePolygonGeoJSON = turf.difference(boundingBoxGeoJSON, clipGeometryGeoJSON);

            if (outsidePolygonGeoJSON) {
              const outsideFeature = format.readFeature(outsidePolygonGeoJSON);
              vectorSource.addFeature(outsideFeature);
            } else {
              console.log("Masking operation resulted in no outside features.");
            }
          } else {
            console.log("No valid geometry for masking.");
          }
        }

        if (filteredFeatures.length > 0) {
          const extent = filteredFeatures.reduce((acc, feature) => {
            return olExtent(acc, feature.getGeometry().getExtent());
          }, createEmpty());
          map.getView().fit(extent, { duration: 1000 });
        } else {
          console.log("No features found matching the criteria.");
        }

      }
    });



    const vectorLayer = createVectorLayer(vectorSource, style, layerName);
    map.addLayer(vectorLayer);
    return vectorLayer;
  }



  function displayDistrictInfo(features) {
    console.log("hey0")
    const villageDetails = document.getElementById('villageDetails');
    let infoHTML = '<h4 style="text-align: center; margin:10px">District Information</h4>';
    infoHTML += '<hr>';
    if (selectedDistrict) {

      infoHTML += `<table style="border-collapse: collapse; width: 100%;">
      <thead>
        <tr>
          <th style="border: 1px solid black; padding: 8px; text-align: left;">Property</th>
          <th style="border: 1px solid black; padding: 8px; text-align: left;">Value</th>
        </tr>
      </thead>
      <tbody>`;

      // Iterate over each feature to populate the table rows
      features.forEach(function (feature) {
        const properties = feature.getProperties();
        for (const key in properties) {
          if (key !== 'geometry') {
            infoHTML += `<tr>
                          <td style="border: 1px solid black; padding: 8px;">${key}</td>
                          <td style="border: 1px solid black; padding: 8px;">${properties[key]}</td>
                          </tr>`;
          }
        }

      });

      // Close the table
      infoHTML += `</tbody></table>`;

      // Now infoHTML contains the complete HTML table structure with data


    } else {
      infoHTML += `<h4 style=" margin:10px">Districts in ${selectedState}  : ${features.length}</h4>`;

      // Initialize the HTML for the table
      infoHTML += `<table style="border-collapse: collapse; width: 100%;">
                    <thead>
                      <tr>
                        <th style="border: 1px solid black; padding: 8px; text-align: left;">District Name</th>
                        <th style="border: 1px solid black; padding: 8px; text-align: left;">Area</th>
                      </tr>
                    </thead>
                    <tbody>`;

      // Iterate over each feature to populate the table rows
      features.forEach(function (feature) {
        const properties = feature.getProperties();
        infoHTML += `<tr>
        <td style="border: 1px solid black; padding: 8px;">${properties.District}</td>
        <td style="border: 1px solid black; padding: 8px;">${properties.Area}</td>
        </tr>`;
      });

      // Close the table
      infoHTML += `</tbody></table>`;

      // Now infoHTML contains the complete HTML table structure with data


    }

    villageDetails.innerHTML = infoHTML;
    console.log("hey")
    const infopopup = document.getElementById("villageInfo");
    infopopup.style.display = "block"
  }

  removeExistingLayer('DistrictFiltered');
  removeExistingLayer('DistrictBoundary');

  let DistrictFiltered;
  if (selectedState && !selectedDistrict) {
    // Show all villages and info within the district
    DistrictFiltered = addLayerWithGeoJSON(
      './geojsons/assam_state_dist.geojson',
      getFilterByProperty('State', selectedState),
      new Style({
        stroke: new Stroke({
          color: '#ff00fb',
          lineCap: 'butt',
          width: 4
        }),
        fill: new Fill({
          color: 'rgba(9, 0, 255, .1)'
        })
      }),
      'DistrictFiltered'
    );

  } else if (selectedState && selectedDistrict) {
    // Show the specific village with details
    let filterStyle;
    console.log(option)
    if (option === 'mask') {
      filterStyle = new Style({
        stroke: new Stroke({
          color: '#ff00fb',
          lineCap: 'butt',
          width: 2
        }),
        fill: new Fill({
          color: 'rgba(70, 83, 107, 1)'
        })
      })

    } else {
      filterStyle = new Style({
        stroke: new Stroke({
          color: '#e48ce6',
          lineCap: 'butt',
          width: 2
        }),
        fill: new Fill({
          color: 'rgba(70, 83, 107, .1)'
        })
      })
    }
    DistrictFiltered = addLayerWithGeoJSON(
      './geojsons/assam_state_dist.geojson',
      getFilterByProperty('District', selectedDistrict),
      filterStyle,
      'DistrictFiltered'
    );
  }

  let highlight;
  const featureOverlay = new VectorLayer({
    source: new VectorSource(),
    map: map,
    style: new Style({
      stroke: new Stroke({
        color: 'rgba(255, 255, 255, 0.7)',
        width: 2,
      }),
    }),
  });

  const displayFeatureInfo = function (pixel) {
    // const info = document.getElementById('info-content');
    map.forEachFeatureAtPixel(pixel, function (feature, layer) {
      if (layer && layer.get('name') === 'DistrictFiltered') {
        document.getElementById('info').style.display = "block";
        const info = document.getElementById('info-content');

        if (feature) {
          console.log(feature.getProperties())

          const properties = feature.getProperties();
          let contInfoHTML = `
            <table style="border-collapse: collapse; width: 100%;">
              <thead>
                <tr>
                  <th style="border: 1px solid black; padding: 8px; text-align: left;">Property</th>
                  <th style="border: 1px solid black; padding: 8px; text-align: left;">Value</th>
                </tr>
              </thead>
              <tbody>`;

          for (const key in properties) {
            if (key !== 'geometry') {
              contInfoHTML += `
                <tr>
                  <td style="border: 1px solid black; padding: 8px;">${key}</td>
                  <td style="border: 1px solid black; padding: 8px;">${properties[key]}</td>
                </tr>`;
            }
          }

          contInfoHTML += `</tbody></table>`;

          let infoHTML = `<h3>District Information</h3><br>`;
          // Assuming `count` is a variable that holds the number of schools in the village
          infoHTML += contInfoHTML;

          document.getElementById('info-content').innerHTML = infoHTML;
          infopopup.style.display = "block";




        }
  


        else {
          info.innerHTML = '&nbsp;';
        }

        if (feature !== highlight) {
          if (highlight) {
            featureOverlay.getSource().removeFeature(highlight);
          }
          if (feature) {
            featureOverlay.getSource().addFeature(feature);
          }
          highlight = feature;
        }
        return true; // Stop iteration over features
      }
    });
  };

  map.on('pointermove', function (evt) {
    if (evt.dragging) {
      return;
    }
    const pixel = map.getEventPixel(evt.originalEvent);
    displayFeatureInfo(pixel);
  });

  map.on('click', function (evt) {
    displayFeatureInfo(evt.pixel);
  });

  setTimeout(() => {
    generateLegend();
    console.log("Delayed for 1 second.");
  }, 2000);
}

document.getElementById('assam-state-dist-mask').addEventListener('click', function () {
  assamStateDistFilter("mask")
})
document.getElementById('assam-state-dist-highlight').addEventListener('click', function () {
  assamStateDistFilter("highlight")
})
document.getElementById('assam-state-dist-clear').addEventListener('click', function () {
  assamStateDistFilter("clear")
})