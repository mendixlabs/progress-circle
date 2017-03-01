import * as dojoDeclare from "dojo/_base/declare";
import * as WidgetBase from "mxui/widget/_WidgetBase";

import { createElement } from "react";
import { render, unmountComponentAtNode } from "react-dom";

import ProgressCircleContainer, { OnClickOptions, PageSettings } from "./components/ProgressCircleContainer";
import { ProgressTextSize } from "./components/ProgressCircle";

class ProgressCircle extends WidgetBase {
    // Properties from Mendix modeler
    animate: boolean;
    maximumValueAttribute: string;
    microflow: string;
    onClickEvent: OnClickOptions;
    page: string;
    pageSettings: PageSettings;
    progressAttribute: string;
    textSize: ProgressTextSize;

    update(contextObject: mendix.lib.MxObject, callback?: () => void) {
        this.updateRendering(contextObject);

        if (callback) callback();
    }

    uninitialize(): boolean {
        unmountComponentAtNode(this.domNode);

        return true;
    }

    private updateRendering(contextObject: mendix.lib.MxObject) {
        render(createElement(ProgressCircleContainer, {
            animate: this.animate,
            contextObject,
            maximumValueAttribute: this.maximumValueAttribute,
            microflow: this.microflow,
            onClickOption: this.onClickEvent,
            page: this.page,
            pageSettings: this.pageSettings,
            textSize: this.textSize,
            progressAttribute: this.progressAttribute
        }), this.domNode);
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
