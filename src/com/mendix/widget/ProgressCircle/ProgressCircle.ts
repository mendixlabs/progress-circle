import * as dojoDeclare from "dojo/_base/declare";
import * as WidgetBase from "mxui/widget/_WidgetBase";

import { createElement } from "react";
import { render, unmountComponentAtNode } from "react-dom";

import {
    OnclickProps, PageSettings, ProgressCircle as Circle, ProgressOnclick, ProgressTextSize
} from "./components/ProgressCircle";

class ProgressCircle extends WidgetBase {
    // Properties from Mendix modeler
    progressAttribute: string;
    textSize: ProgressTextSize;
    animate: boolean;
    maximumValueAttribute: string;
    onClickEvent: ProgressOnclick;
    microflow: string;
    page: string;
    pageSettings: PageSettings;

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
            maximumValue: this.contextObject && this.maximumValueAttribute
                ? Number(this.contextObject.get(this.maximumValueAttribute))
                : undefined,
            progressOnClick: this.createOnClickProps(),
            textSize: this.textSize,
            value: this.contextObject ? Number(this.contextObject.get(this.progressAttribute)) : null
        }), this.domNode);
    }

    private createOnClickProps(): OnclickProps {
        return ({
            entity: this.contextObject ? this.contextObject.getEntity() : undefined,
            guid: this.contextObject ? this.contextObject.getGuid() : undefined,
            microflow: this.microflow,
            onClickType: this.onClickEvent,
            page: this.page,
            pageSetting: this.pageSettings
        });
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
