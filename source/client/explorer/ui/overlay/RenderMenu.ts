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

import "@ff/ui/Layout";
import "@ff/ui/Button";
import { IButtonClickEvent } from "@ff/ui/Button";

import { customElement, html, property } from "@ff/ui/CustomElement";
import Popup from "@ff/ui/Popup";

import Renderer, { EShaderMode } from "../../../core/components/Renderer";
import SystemController from "../../../core/components/SystemController";

////////////////////////////////////////////////////////////////////////////////

@customElement("sv-render-menu")
export default class RenderMenu extends Popup
{
    @property({ attribute: false })
    controller: SystemController;

    constructor()
    {
        super();

        this.position = "anchor";
        this.justify = "end";
        this.offsetX = 8;
        this.offsetY = 8;
        this.keepVisible = true;
    }

    protected connected()
    {
        super.connected();
        this.controller.addInputListener(Renderer, "Shader", this.onChange, this);
    }

    protected disconnected()
    {
        super.disconnected();
        this.controller.removeInputListener(Renderer, "Shader", this.onChange, this);
    }

    protected render()
    {
        const renderMode = this.controller.getInputValue(Renderer, "Shader");

        return html`
            <label>Shading</label>
            <ff-flex-column @click=${this.onClickRenderMode}>
                <ff-index-button .index=${EShaderMode.Default} .selectedIndex=${renderMode}
                  text="Standard" title="Display model in standard mode"></ff-index-button>
                <ff-index-button .index=${EShaderMode.Clay} .selectedIndex=${renderMode}
                  text="Clay" title="Display model without colors"></ff-index-button>
                <ff-index-button .index=${EShaderMode.XRay} .selectedIndex=${renderMode}
                  text="X-Ray" title="Display model in X-Ray mode"></ff-index-button>
                <ff-index-button .index=${EShaderMode.Normals} .selectedIndex=${renderMode}
                  text="Normals" title="Display normals"></ff-index-button>
                <ff-index-button .index=${EShaderMode.Wireframe} .selectedIndex=${renderMode}
                  text="Wireframe" title="Display model as wireframe"></ff-index-button>
            </ff-flex-column>
        `;
    }

    protected firstUpdated()
    {
        super.firstUpdated();

        this.setStyle({
            display: "flex",
            flexDirection: "column"
        });

        this.classList.add("sv-popup-menu");
    }

    protected onChange()
    {
        this.requestUpdate();
    }

    protected onClickRenderMode(event: IButtonClickEvent)
    {
        this.controller.actions.setInputValue(Renderer, "Shader", event.target.index);
        event.stopPropagation();
    }
}