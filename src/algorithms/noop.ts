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

import {
  AbstractAlgorithm,
  AbstractViewportAlgorithm,
  AlgorithmInput,
  AlgorithmOptions,
  AlgorithmOutput,
  ViewportAlgorithmOptions,
} from "./core";

import { Cluster } from "../cluster";
import { filterMarkersToPaddedViewport } from "./utils";

/**
 * Noop algorithm does not generate any clusters or filter markers by the an extended viewport.
 */
export class NoopAlgorithm extends AbstractAlgorithm {
  constructor({ ...options }: AlgorithmOptions) {
    super(options);
  }
  public calculate({
    markers,
    map,
    mapCanvasProjection,
    forceRecalculate,
  }: AlgorithmInput): AlgorithmOutput {
    return {
      clusters: this.cluster({ markers, map, mapCanvasProjection, forceRecalculate }),
      changed: false,
    };
  }

  protected cluster(input: AlgorithmInput): Cluster[] {
    return this.noop(input);
  }
}

/**
 * NoopViewport algorithm does not generate any clusters but it does filter markers by the an extended viewport.
 */
export class NoopViewportAlgorithm extends AbstractViewportAlgorithm {
  constructor({ ...options }: ViewportAlgorithmOptions) {
    super(options);
  }
  public calculate({
    markers,
    map,
    mapCanvasProjection,
    forceRecalculate,
  }: AlgorithmInput): AlgorithmOutput {
    return {
      clusters: this.cluster({
        markers: filterMarkersToPaddedViewport(
          map,
          mapCanvasProjection,
          markers,
          this.viewportPadding
        ),
        map,
        mapCanvasProjection,
        forceRecalculate,
      }),
      changed: false,
    };
  }

  protected cluster(input: AlgorithmInput): Cluster[] {
    return this.noop(input);
  }
}
