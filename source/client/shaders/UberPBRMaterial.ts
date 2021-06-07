/**
 * 3D Foundation Project
 * Copyright 2019 Smithsonian Institution
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

import { MeshStandardMaterialParameters, MeshStandardMaterial, Vector3, Vector4, Color, 
    Side, UniformsUtils, ShaderLib, NoBlending, DoubleSide, AdditiveBlending, FrontSide } from "three";

const fragmentShader = require("./uberPBRShader.frag").default;
const vertexShader = require("./uberPBRShader.vert").default;

import { EShaderMode } from "client/schema/setup";

////////////////////////////////////////////////////////////////////////////////

export { EShaderMode };

export interface IUberPBRShaderProps extends MeshStandardMaterialParameters
{

}

export default class UberPBRMaterial extends MeshStandardMaterial
{
    isUberPBRMaterial: boolean;
    isMeshStandardMaterial: boolean;
    isMeshPhysicalMaterial: boolean;

    uniforms: {
        aoMapMix: { value: Vector3 },
        cutPlaneDirection: { value: Vector4 },
        cutPlaneColor: { value: Vector3 }
    };

    vertexShader: string;
    fragmentShader: string;

    private _clayColor = new Color("#a67a6c");
    private _wireColor = new Color("#004966");
    private _wireEmissiveColor = new Color("#004966");
    private _objectSpaceNormalMap = false;
    private _paramCopy: any = {};
    private _sideCopy: Side = FrontSide;

    private _aoMapMix: Vector3;
    private _cutPlaneDirection: Vector4;
    private _cutPlaneColor: Vector3;

    constructor(params?: IUberPBRShaderProps)
    {
        super();

        this.type = "UberPBRMaterial";

        this.isUberPBRMaterial = true;
        this.isMeshStandardMaterial = true;
        this.isMeshPhysicalMaterial = false;

        this.defines = {
            "STANDARD": true,
            "PHYSICAL": false,
            "OBJECTSPACE_NORMALMAP": false,
            "MODE_NORMALS": false,
            "MODE_XRAY": false,
            "CUT_PLANE": false,
        };

        this.uniforms = UniformsUtils.merge([
            ShaderLib.standard.uniforms,
            {
                aoMapMix: { value: new Vector3(0.25, 0.25, 0.25) },
                cutPlaneDirection: { value: new Vector4(0, 0, -1, 0) },
                cutPlaneColor: { value: new Vector3(1, 0, 0) },
            }
        ]);

        this._aoMapMix = this.uniforms.aoMapMix.value;
        this._cutPlaneDirection = this.uniforms.cutPlaneDirection.value;
        this._cutPlaneColor = this.uniforms.cutPlaneColor.value;

        //this.vertexShader = ShaderLib.standard.vertexShader;
        this.vertexShader = vertexShader;
        //this.fragmentShader = ShaderLib.standard.fragmentShader;
        this.fragmentShader = fragmentShader;

        this.color = new Color(0xffffff); // diffuse
        this.roughness = 0.7;
        this.metalness = 0.0;

        if (params) {
            this.setValues(params);
        }
    }

    set cutPlaneDirection(direction: Vector4) {
        this._cutPlaneDirection.copy(direction);
    }
    get cutPlaneDirection() {
        return this._cutPlaneDirection;
    }

    set cutPlaneColor(color: Vector3) {
        this._cutPlaneColor.copy(color);
    }
    get cutPlaneColor() {
        return this._cutPlaneColor;
    }

    set aoMapMix(mix: Vector3) {
        this._aoMapMix.copy(mix);
    }
    get aoMapMix() {
        return this._aoMapMix;
    }

    setShaderMode(mode: EShaderMode)
    {
        Object.assign(this, this._paramCopy);

        this.defines["MODE_NORMALS"] = false;
        this.defines["MODE_XRAY"] = false;
        this.defines["OBJECTSPACE_NORMALMAP"] = !!(this.normalMap && this._objectSpaceNormalMap);

        this.needsUpdate = true;

        switch(mode) {
            case EShaderMode.Clay:
                this._paramCopy = {
                    color: this.color,
                    map: this.map,
                    roughness: this.roughness,
                    metalness: this.metalness,
                    aoMapIntensity: this.aoMapIntensity,
                    blending: this.blending,
                    transparent: this.transparent,
                    depthWrite: this.depthWrite,
                };
                this.color = this._clayColor;
                this.map = null;
                this.roughness = 1;
                this.metalness = 0;
                this.aoMapIntensity *= 1;
                this.blending = NoBlending;
                this.transparent = false;
                this.depthWrite = true;
                break;

            case EShaderMode.Normals:
                this._paramCopy = {
                    blending: this.blending,
                    transparent: this.transparent,
                    depthWrite: this.depthWrite,
                };
                this.defines["MODE_NORMALS"] = true;
                this.blending = NoBlending;
                this.transparent = false;
                this.depthWrite = true;
                break;

            case EShaderMode.XRay:
                this._paramCopy = {
                    side: this.side,
                    blending: this.blending,
                    transparent: this.transparent,
                    depthWrite: this.depthWrite,
                };
                this.defines["MODE_XRAY"] = true;
                this.side = DoubleSide;
                this.blending = AdditiveBlending;
                this.transparent = true;
                this.depthWrite = false;
                break;

            case EShaderMode.Wireframe:
                this._paramCopy = {
                    color: this.color,
                    emissive: this.emissive,
                    roughness: this.roughness,
                    metalness: this.metalness,
                    wireframe: this.wireframe,
                    map: this.map,
                    aoMap: this.aoMap,
                    emissiveMap: this.emissiveMap,
                    normalMap: this.normalMap,
                };
                this.color = this._wireColor;
                this.emissive = this._wireEmissiveColor;
                this.roughness = 0.8;
                this.metalness = 0.1;
                this.wireframe = true;
                this.map = null;
                this.aoMap = null;
                this.emissiveMap = null;
                this.normalMap = null;
                this.defines["OBJECTSPACE_NORMALMAP"] = false;
                break;
        }
    }

    enableCutPlane(enabled: boolean)
    {
        this.defines["CUT_PLANE"] = enabled;

        if (enabled) {
            this._sideCopy = this.side;
            this.side = DoubleSide;
        }
        else {
            this.side = this._sideCopy;
        }
    }

    enableObjectSpaceNormalMap(useObjectSpace: boolean)
    {
        if (useObjectSpace !== this._objectSpaceNormalMap) {
            this._objectSpaceNormalMap = useObjectSpace;
        }

        if (this.normalMap) {
            this.defines["OBJECTSPACE_NORMALMAP"] = useObjectSpace;
            this.needsUpdate = true;
        }
    }

    copyStandardMaterial(material: MeshStandardMaterial): this
    {
        this.color = material.color;
        this.opacity = material.opacity;
        this.transparent = material.opacity < 1 || !!material.alphaMap || material.transparent;
        this.alphaTest = material.alphaTest;

        this.roughness = material.roughness;
        this.roughnessMap = material.roughnessMap;

        this.metalness = material.metalness;
        this.metalnessMap = material.metalnessMap;

        this.map = material.map;
        this.aoMap = material.aoMap;
        this.aoMapIntensity = material.aoMapIntensity;

        this.normalMap = material.normalMap;

        this.shadowSide = material.shadowSide;
        //this.side = material.side;

        return this;
    }
}