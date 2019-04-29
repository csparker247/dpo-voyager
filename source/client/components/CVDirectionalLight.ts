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

import CDirectionalLight from "@ff/scene/components/CDirectionalLight";

import { IDocument, INode, ILight, ColorRGB } from "common/types/document";

import { ICVLight } from "./CVLight";

////////////////////////////////////////////////////////////////////////////////

export default class CVDirectionalLight extends CDirectionalLight implements ICVLight
{
    static readonly typeName: string = "CVDirectionalLight";

    static readonly text: string = "Directional Light";
    static readonly icon: string = "bulb";

    get settingProperties() {
        return [
            this.ins.color,
            this.ins.intensity,
        ];
    }

    get snapshotProperties() {
        return [
            this.ins.color,
            this.ins.intensity,
        ];
    }

    fromDocument(document: IDocument, node: INode): number
    {
        if (!isFinite(node.light)) {
            throw new Error("light property missing in node");
        }

        const data = document.lights[node.light];

        if (data.type !== "directional") {
            throw new Error("light type mismatch: not a directional light");
        }

        this.ins.copyValues({
            color: data.color !== undefined ? data.color : [ 1, 1, 1 ],
            intensity: data.intensity !== undefined ? data.intensity : 1,
            position: [ 0, 0, 0 ],
            target: [ 0, 0, 0 ],
        });

        return node.light;
    }

    toDocument(document: IDocument, node: INode): number
    {
        const ins = this.ins;

        const data = {
            color: ins.color.cloneValue() as ColorRGB,
            intensity: ins.intensity.value,
        } as ILight;

        data.type = "directional";

        document.lights = document.lights || [];
        const lightIndex = document.lights.length;
        document.lights.push(data);
        return lightIndex;
    }
}