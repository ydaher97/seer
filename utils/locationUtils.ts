// export const isPointInPolygon = (
//   point: { lat: number; lng: number },
//   polygon: { lat: number; lng: number }[]
// ): boolean => {
//   const userLocationPoint = new google.maps.LatLng(point.lat, point.lng);
//   const polygonPath = new google.maps.Polygon({
//     paths: polygon.map(coord => new google.maps.LatLng(coord.lat, coord.lng))
//   });
//   return google.maps.geometry.poly.containsLocation(userLocationPoint, polygonPath);
// };

// export const findContainingLocation = (
//   point: { lat: number; lng: number } | null,
//   locations: Location[]
// ): Location | undefined => {
//   if (!point || !locations?.length) return undefined;
  
//   return locations.find(location => 
//     isPointInPolygon(point, location.border)
//   );
// };