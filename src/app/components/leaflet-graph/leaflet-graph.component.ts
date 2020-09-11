import { Component, OnInit } from '@angular/core';
import * as L from "leaflet";

@Component({
  selector: 'app-leaflet-graph',
  templateUrl: './leaflet-graph.component.html',
  styleUrls: ['./leaflet-graph.component.scss']
})
export class LeafletGraphComponent implements OnInit {

  //leaflet stuff in (y, x) so create wrapper for coordinate conversions
  coord(x: number, y: number): L.LatLng {
    return L.latLng(y, x);
  }

  options = {
    layers: [],
    zoom: 5,
    center: L.latLng(0, 0),
    crs: L.CRS.Simple
  };

  getMarker(x: number, y: number): L.CircleMarker {
    return L.circleMarker(this.coord(x, y))
  }

  constructor() { }

  ngOnInit(): void {
  }

  onMapReady(map: L.Map) {
    this.getMarker(0, 0).addTo(map);
    this.getMarker(-1, -999).addTo(map);
    L.polyline([this.coord(0, -999), this.coord(0, 0)]).addTo(map);
  }

}
