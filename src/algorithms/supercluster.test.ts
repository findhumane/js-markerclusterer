/**
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { SuperClusterAlgorithm } from "./supercluster";
import { initialize, MapCanvasProjection } from "@googlemaps/jest-mocks";

let map: google.maps.Map;

beforeEach(() => {
  initialize();

  map = new google.maps.Map(document.createElement("div"));
});

test("should only call load if markers change", () => {
  const mapCanvasProjection = new MapCanvasProjection();
  const markers: google.maps.Marker[] = [new google.maps.Marker()];
  const forceRecalculate: boolean = false;

  const superCluster = new SuperClusterAlgorithm({});
  superCluster["superCluster"].load = jest.fn();
  superCluster.cluster = jest.fn();

  superCluster.calculate({ markers, map, mapCanvasProjection, forceRecalculate });
  superCluster.calculate({ markers, map, mapCanvasProjection, forceRecalculate });
  expect(superCluster["superCluster"].load).toHaveBeenCalledTimes(1);
  expect(superCluster["superCluster"].load).toHaveBeenCalledWith([
    {
      type: "Feature",
      geometry: { coordinates: [0, 0], type: "Point" },
      properties: { marker: markers[0] },
    },
  ]);
});

test("should cluster markers", () => {
  const mapCanvasProjection = new MapCanvasProjection();
  const markers: google.maps.Marker[] = [
    new google.maps.Marker(),
    new google.maps.Marker(),
  ];
  const forceRecalculate: boolean = false;

  const superCluster = new SuperClusterAlgorithm({});
  map.getZoom = jest.fn().mockReturnValue(0);
  map.getBounds = jest.fn().mockReturnValue({
    toJSON: () => ({
      west: -180,
      south: -90,
      east: 180,
      north: 90,
    }),
    getNorthEast: jest
      .fn()
      .mockReturnValue({ getLat: () => -3, getLng: () => 34 }),
    getSouthWest: jest
      .fn()
      .mockReturnValue({ getLat: () => 29, getLng: () => 103 }),
  });
  const { clusters } = superCluster.calculate({
    markers,
    map,
    mapCanvasProjection,
    forceRecalculate,
  });

  expect(clusters).toHaveLength(1);
});

test("should transform to Cluster with single marker if not cluster", () => {
  const superCluster = new SuperClusterAlgorithm({});
  const marker = new google.maps.Marker();

  const cluster = superCluster["transformCluster"]({
    type: "Feature",
    geometry: { coordinates: [0, 0], type: "Point" },
    properties: {
      marker,
      cluster: null,
      cluster_id: null,
      point_count: 1,
      point_count_abbreviated: 1,
    },
  });
  expect(cluster.markers.length).toEqual(1);
  expect(cluster.markers[0]).toBe(marker);
});

test("should not cluster if zoom didn't change", () => {
  const mapCanvasProjection = new MapCanvasProjection();
  const markers: google.maps.Marker[] = [
    new google.maps.Marker(),
    new google.maps.Marker(),
  ];
  const forceRecalculate: boolean = false;

  const superCluster = new SuperClusterAlgorithm({});
  superCluster["markers"] = markers;
  superCluster["state"] = { zoom: 12 };
  superCluster.cluster = jest.fn().mockReturnValue([]);
  superCluster["clusters"] = [];

  map.getZoom = jest.fn().mockReturnValue(superCluster["state"].zoom);

  const { clusters, changed } = superCluster.calculate({
    markers,
    map,
    mapCanvasProjection,
    forceRecalculate,
  });

  expect(changed).toBeFalsy();
  expect(clusters).toBe(superCluster["clusters"]);
});

test("should not cluster if zoom beyond maxZoom", () => {
  const mapCanvasProjection = new MapCanvasProjection();
  const markers: google.maps.Marker[] = [
    new google.maps.Marker(),
    new google.maps.Marker(),
  ];
  const forceRecalculate: boolean = false;

  const superCluster = new SuperClusterAlgorithm({});
  superCluster["markers"] = markers;
  superCluster["state"] = { zoom: 20 };
  superCluster.cluster = jest.fn().mockReturnValue([]);
  superCluster["clusters"] = [];

  map.getZoom = jest.fn().mockReturnValue(superCluster["state"].zoom + 1);

  const { clusters, changed } = superCluster.calculate({
    markers,
    map,
    mapCanvasProjection,
    forceRecalculate,
  });

  expect(changed).toBeFalsy();
  expect(clusters).toBe(superCluster["clusters"]);
});

test("should round fractional zoom", () => {
  const mapCanvasProjection = new MapCanvasProjection();
  const forceRecalculate: boolean = false;
  mapCanvasProjection.fromLatLngToDivPixel = jest
    .fn()
    .mockImplementation((b: google.maps.LatLng) => ({
      x: b.lat() * 100,
      y: b.lng() * 100,
    }));
  mapCanvasProjection.fromDivPixelToLatLng = jest
    .fn()
    .mockImplementation(
      (p: google.maps.Point) =>
        new google.maps.LatLng({ lat: p.x / 100, lng: p.y / 100 })
    );

  const markers: google.maps.Marker[] = [];
  map.getBounds = jest.fn().mockReturnValue({
    getNorthEast: jest.fn().mockReturnValue({ lat: () => -3, lng: () => 34 }),
    getSouthWest: jest.fn().mockReturnValue({ lat: () => 29, lng: () => 103 }),
  });

  const superCluster = new SuperClusterAlgorithm({});
  superCluster["superCluster"].getClusters = jest.fn().mockReturnValue([]);

  map.getZoom = jest.fn().mockReturnValue(1.534);
  superCluster.cluster({ map, mapCanvasProjection, markers, forceRecalculate });
  expect(mapCanvasProjection.fromDivPixelToLatLng).toHaveBeenCalledTimes(2);
  expect(mapCanvasProjection.fromDivPixelToLatLng).toHaveBeenNthCalledWith(1, {
    x: -240,
    y: 3340,
  });
  expect(mapCanvasProjection.fromDivPixelToLatLng).toHaveBeenNthCalledWith(2, {
    x: 2840,
    y: 10360,
  });
  expect(superCluster["superCluster"].getClusters).toHaveBeenCalledWith(
    [0, 0, 0, 0],
    2
  );

  map.getZoom = jest.fn().mockReturnValue(3.234);
  superCluster.cluster({ map, mapCanvasProjection, markers, forceRecalculate });
  expect(superCluster["superCluster"].getClusters).toHaveBeenCalledWith(
    [0, 0, 0, 0],
    3
  );
});
