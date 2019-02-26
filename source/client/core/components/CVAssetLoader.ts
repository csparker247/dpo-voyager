/**
 * 3D Foundation Project
 * Copyright 2018 Smithsonian Institution
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import resolvePathname from "resolve-pathname";
import * as THREE from "three";

import Component, { ITypedEvent } from "@ff/graph/Component";

import { IPresentation } from "common/types/presentation";
import { IItem } from "common/types/item";

import JSONLoader from "../loaders/JSONLoader";
import JSONValidator from "../loaders/JSONValidator";
import ModelLoader from "../loaders/ModelLoader";
import GeometryLoader from "../loaders/GeometryLoader";
import TextureLoader from "../loaders/TextureLoader";

import Asset from "../models/Asset";

////////////////////////////////////////////////////////////////////////////////

const _VERBOSE = true;

export interface ILoaderUpdateEvent extends ITypedEvent<"update">
{
    isLoading: boolean;
}

export default class CVAssetLoader extends Component
{
    static readonly typeName: string = "CVAssetLoader";

    readonly jsonLoader: JSONLoader;
    readonly validator: JSONValidator;
    readonly modelLoader: ModelLoader;
    readonly geometryLoader: GeometryLoader;
    readonly textureLoader: TextureLoader;

    private _loadingManager: PrivateLoadingManager;


    constructor(id: string)
    {
        super(id);
        this.addEvent("update");

        const loadingManager = this._loadingManager = new PrivateLoadingManager(this);

        this.jsonLoader = new JSONLoader(loadingManager);
        this.validator = new JSONValidator();
        this.modelLoader = new ModelLoader(loadingManager);
        this.geometryLoader = new GeometryLoader(loadingManager);
        this.textureLoader = new TextureLoader(loadingManager);
    }

    loadJSON(url: string, path?: string): Promise<any>
    {
        url = resolvePathname(url, path);
        return this.jsonLoader.load(url);
    }

    loadModelAsset(asset: Asset, path?: string): Promise<THREE.Object3D>
    {
        const url = resolvePathname(asset.uri, path);
        return this.modelLoader.load(url);
    }

    loadGeometryAsset(asset: Asset, path?: string): Promise<THREE.Geometry>
    {
        const url = resolvePathname(asset.uri, path);
        return this.geometryLoader.load(url);
    }

    loadTextureAsset(asset: Asset, path?: string): Promise<THREE.Texture>
    {
        const url = resolvePathname(asset.uri, path);
        return this.textureLoader.load(url);
    }

    loadPresentationData(url: string): Promise<IPresentation>
    {
        return this.loadJSON(url).then(json => this.validatePresentation(json));
    }

    validatePresentation(json: any): Promise<IPresentation>
    {
        return new Promise((resolve, reject) => {
            if (!this.validator.validatePresentation(json)) {
                return reject(new Error("invalid presentation data, validation failed"));
            }

            return resolve(json as IPresentation);
        });
    }

    loadItemData(url: string): Promise<IItem>
    {
        return this.loadJSON(url).then(json => this.validateItem(json));
    }

    validateItem(json: any): Promise<IItem>
    {
        return new Promise((resolve, reject) => {
            if (!this.validator.validateItem(json)) {
                return reject(new Error("invalid item data, validation failed"));
            }

            return resolve(json as IItem);
        });
    }

    emitUpdateEvent(isLoading: boolean)
    {
        this.emit<ILoaderUpdateEvent>({ type: "update", isLoading });
    }
}

////////////////////////////////////////////////////////////////////////////////

class PrivateLoadingManager extends THREE.LoadingManager
{
    protected assetLoader: CVAssetLoader;

    constructor(assetLoader: CVAssetLoader)
    {
        super();
        this.assetLoader = assetLoader;

        this.onStart = this.onLoadingStart.bind(this);
        this.onProgress = this.onLoadingProgress.bind(this);
        this.onLoad = this.onLoadingCompleted.bind(this);
        this.onError = this.onLoadingError.bind(this);
    }

    protected onLoadingStart()
    {
        if (_VERBOSE) {
            console.log("Loading files...");
        }

        this.assetLoader.emitUpdateEvent(true);
    }

    protected onLoadingProgress(url, itemsLoaded, itemsTotal)
    {
        if (_VERBOSE) {
            console.log(`Loaded ${itemsLoaded} of ${itemsTotal} files: ${url}`);
        }
    }

    protected onLoadingCompleted()
    {
        if (_VERBOSE) {
            console.log("Loading completed");
        }

        this.assetLoader.emitUpdateEvent(false);
    }

    protected onLoadingError()
    {
        if (_VERBOSE) {
            console.error(`Loading error`);
        }

        this.assetLoader.emitUpdateEvent(false);
    }
}