export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiZmFpc2FsLTEyIiwiYSI6ImNrN3ExY3FsMzAxdDEzZm15OGZ1ZTFhb3IifQ.h4kG5UO98Sx1eJN_m0ls9w';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/faisal-12/ckawy4m7803xr1iofs1nj5ux2',
    scrollZoom: false,
    // center: [46.722243, 24.752977],
    // zoom: 5,
    // interactive: false,
  });
  console.log(locations);
  const bounds = new mapboxgl.LngLatBounds();
  locations.forEach((loc) => {
    // Add markers
    const el = document.createElement('div');
    el.className = 'marker';
    // Add the marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    new mapboxgl.Popup({ offset: 30 })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}`)
      .addTo(map);
    // exteds map bounds to include the current location
    bounds.extend(loc.coordinates);
  });

  // to make the map too fit
  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
