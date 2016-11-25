import * as dojoDeclare from "dojo/_base/declare";
import * as WidgetBase from "mxui/widget/_WidgetBase";

import { ProgressCircle as Circle, ProgressTextSize } from "./components/ProgressCircle";
import { createElement } from "react";
import { render, unmountComponentAtNode } from "react-dom";

class ProgressCircle extends WidgetBase {
    // Properties from Mendix modeler
    progressAttribute: string;
    textSize: ProgressTextSize;
    animate: boolean;
    maximumValueAttribute: string;

    private contextObject: mendix.lib.MxObject;

    update(contextObject: mendix.lib.MxObject, callback: Function) {
        this.contextObject = contextObject;
        this.resetSubscriptions();
        this.updateRendering();

        callback();
    }

    updateRendering() {
        if (this.contextObject) {
            render(createElement(Circle, {
                animate: this.animate,
                maximumValue: Number(this.contextObject.get(this.maximumValueAttribute)),
                textSize: this.textSize,
                value: Number(this.contextObject.get(this.progressAttribute))
            }), this.domNode);
        } else {
            unmountComponentAtNode(this.domNode);
        }
    }

    uninitialize() {
        unmountComponentAtNode(this.domNode);

        return true;
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

// Declare widget prototype the Dojo way
// Thanks to https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/dojo/README.md
// tslint:disable : only-arrow-functions
dojoDeclare("com.mendix.widget.ProgressCircle.ProgressCircle", [ WidgetBase ], function (Source: any) {
    let result: any = {};
    for (let property in Source.prototype) {
        if (property !== "constructor" && Source.prototype.hasOwnProperty(property)) {
            result[property] = Source.prototype[property];
        }
    }
    return result;
} (ProgressCircle));
