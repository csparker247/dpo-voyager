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

import Component, { types } from "@ff/graph/Component";

import { IReference } from "common/types/presentation";

////////////////////////////////////////////////////////////////////////////////

const ins = {
    uri: types.String("URI"),
    mimeType: types.String("MIMEType")
};

export default class CReference extends Component
{
    static readonly type: string = "CReference";

    ins = this.addInputs(ins);

    update(context)
    {
        return false;
    }

    deflate()
    {
        const data = this.toData();
        return data ? { data } : null;
    }

    inflate(json: any)
    {
        if (json.data) {
            this.fromData(json);
        }
    }

    toData(): IReference
    {
        const ins = this.ins;

        return {
            uri: ins.uri.value,
            mimeType: ins.mimeType.value
        };
    }

    fromData(data: IReference)
    {
        this.ins.setValues({
            uri: data.uri,
            mimeType: data.mimeType
        });
    }
}