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

import { NoopAlgorithm, NoopViewportAlgorithm } from "./noop";
import { initialize, MapCanvasProjection } from "@googlemaps/jest-mocks";

let map: google.maps.Map;

beforeEach(() => {
  initialize();

  map = new google.maps.Map(document.createElement("div"));
});

test("noop should not filter and return changed: false", () => {
  const mapCanvasProjection = new MapCanvasProjection();
  const markers: google.maps.Marker[] = [new google.maps.Marker()];

  const noop = new NoopAlgorithm({ maxZoom: 16 });
  noop["noop"] = jest.fn();

  map.getZoom = jest.fn().mockReturnValue(10);
  const getBounds = jest.spyOn(map, "getBounds");

  const result = noop.calculate({
    markers,
    map,
    mapCanvasProjection,
  });

  expect(getBounds).toHaveBeenCalledTimes(0);
  expect(result.changed).toBe(false);
});

test("noop should not filter and return changed: false", () => {
  const mapCanvasProjection = new MapCanvasProjection();
  const markers: google.maps.Marker[] = [new google.maps.Marker()];

  const noop = new NoopViewportAlgorithm({ maxZoom: 16 });
  noop["noop"] = jest.fn();

  map.getZoom = jest.fn().mockReturnValue(10);
  const getBounds = jest.spyOn(map, "getBounds");

  const result = noop.calculate({
    markers,
    map,
    mapCanvasProjection,
  });

  expect(getBounds).toHaveBeenCalledTimes(1);
  expect(result.changed).toBe(false);
});
