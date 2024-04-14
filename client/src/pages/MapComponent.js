import React from 'react';
import GoogleMapReact from 'google-map-react';
const config = require('../config'); 

const AnyReactComponent = ({ text }) => <div style={{
  color: 'red',
  padding: '5px',
  height: '100px',
  width: '100px'
}}>{text}</div>;

const drawPolylines = (map, maps, routes) => {
  routes.forEach(route => {
    const routePath = route.stops.map(stop => ({ lat: stop.latitude, lng: stop.longitude }));
    const routePolyline = new maps.Polyline({
      path: routePath,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2,
    });
    routePolyline.setMap(map);
  });
};


const MapComponent = ({ whLocation, routes }) => {
    const defaultProps = {
        center: {
            lat: 38.9012,
            lng: -77.2652
        },
        zoom: 11
    };

    return (
    <div style={{ height: '400px', width: '100%', position: 'relative', overflow: 'hidden' }}>
            <GoogleMapReact
                bootstrapURLKeys={{ key: config.googleMapsApiKey }}
                defaultCenter={defaultProps.center}
                defaultZoom={defaultProps.zoom}
                onGoogleApiLoaded={({ map, maps }) => drawPolylines(map, maps, routes)}
                yesIWantToUseGoogleMapApiInternals
            >
              <AnyReactComponent
                  lat={whLocation.latitude}
                  lng={whLocation.longitude}
                  text= "📦"
                  key={`0`}
                />
                {routes.map((route, idx) =>
                    route.stops.map((stop, index) => (
                        <AnyReactComponent
                            lat={stop.latitude}
                            lng={stop.longitude}
                            text= "📍"
                            key={`${idx}-${index}`}
                        />
                    ))
                )}
            </GoogleMapReact>
        </div>
    );
};

export default MapComponent;
