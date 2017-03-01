import * as dojoDeclare from "dojo/_base/declare";
import * as WidgetBase from "mxui/widget/_WidgetBase";

import { createElement } from "react";
import { render, unmountComponentAtNode } from "react-dom";

import {
    PageSettings,
    ProgressCircle as Circle,
    ProgressTextSize,
    onClickOptions
} from "./components/ProgressCircle";

class ProgressCircle extends WidgetBase {
    // Properties from Mendix modeler
    animate: boolean;
    maximumValueAttribute: string;
    microflow: string;
    onClickEvent: onClickOptions;
    page: string;
    pageSettings: PageSettings;
    progressAttribute: string;
    textSize: ProgressTextSize;

    private contextObject: mendix.lib.MxObject;

    update(contextObject: mendix.lib.MxObject, callback?: () => void) {
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
                ? parseFloat(this.contextObject.get(this.maximumValueAttribute) as string)
                : undefined,
            microflow: this.microflow,
            onClickOption: this.onClickEvent,
            page: this.page,
            pageSettings: this.pageSettings,
            textSize: this.textSize,
            value: this.contextObject ? parseFloat(this.contextObject.get(this.progressAttribute) as string) : null
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
dojoDeclare("com.mendix.widget.custom.progresscircle.ProgressCircle", [ WidgetBase ], function(Source: any) {
    const result: any = {};
    for (const property in Source.prototype) {
        if (property !== "constructor" && Source.prototype.hasOwnProperty(property)) {
            result[property] = Source.prototype[property];
        }
    }
    return result;
}(ProgressCircle));
