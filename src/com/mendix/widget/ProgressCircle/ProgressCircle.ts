import * as dojoDeclare from "dojo/_base/declare";
import * as WidgetBase from "mxui/widget/_WidgetBase";

import { createElement } from "react";
import { render, unmountComponentAtNode } from "react-dom";

import {
    PageSettings,
    ProgressCircle as Circle,
    ProgressOnclick,
    ProgressTextSize
} from "./components/ProgressCircle";

class ProgressCircle extends WidgetBase {
    // Properties from Mendix modeler
    animate: boolean;
    maximumValueAttribute: string;
    microflow: string;
    onClickEvent: ProgressOnclick;
    page: string;
    pageSettings: PageSettings;
    progressAttribute: string;
    textSize: ProgressTextSize;

    private contextObject: mendix.lib.MxObject;

    update(contextObject: mendix.lib.MxObject, callback?: Function) {
        this.contextObject = contextObject;
        this.resetSubscriptions();
        this.updateRendering();

        if (callback) callback();
    }

    uninitialize(): boolean {
        unmountComponentAtNode(this.domNode);

        return true;
    }

    private updateRendering() {
        render(createElement(Circle, {
            animate: this.animate,
            contextObject: this.contextObject,
            maximumValue: this.contextObject && this.maximumValueAttribute
                ? Number(this.contextObject.get(this.maximumValueAttribute))
                : undefined,
            microflow: this.microflow,
            onClickType: this.onClickEvent,
            page: this.page,
            pageSettings: this.pageSettings,
            textSize: this.textSize,
            value: this.contextObject ? Number(this.contextObject.get(this.progressAttribute)) : null
        }), this.domNode);
    }

    private resetSubscriptions() {
        this.unsubscribeAll();

        if (this.contextObject) {
            this.subscribe({
                callback: () => this.updateRendering(),
                guid: this.contextObject.getGuid()
            });
            this.subscribe({
                attr: this.progressAttribute,
                callback: () => this.updateRendering(),
                guid: this.contextObject.getGuid()
            });
            this.subscribe({
                attr: this.maximumValueAttribute,
                callback: () => this.updateRendering(),
                guid: this.contextObject.getGuid()
            });
        }
    }
}

// tslint:disable : only-arrow-functions
dojoDeclare("com.mendix.widget.ProgressCircle.ProgressCircle", [ WidgetBase ], function(Source: any) {
    let result: any = {};
    for (let property in Source.prototype) {
        if (property !== "constructor" && Source.prototype.hasOwnProperty(property)) {
            result[property] = Source.prototype[property];
        }
    }
    return result;
}(ProgressCircle));
