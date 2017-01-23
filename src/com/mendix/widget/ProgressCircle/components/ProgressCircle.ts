import { Component, DOM, createElement } from "react";

import * as classNames from "classnames";
import { Circle } from "progressbar.js";
import { Alert } from "./Alert";

import "../ui/ProgressCircle.css";

export interface ProgressCircleProps {
    animate?: boolean;
    contextObject?: mendix.lib.MxObject;
    maximumValue?: number;
    microflow?: string;
    onClickType?: ProgressOnclick;
    page?: string;
    pageSettings?: PageSettings;
    textSize?: ProgressTextSize;
    value: number | null;
}

export type ProgressTextSize = "small" | "medium" | "large";
export type ProgressOnclick = "doNothing" | "showPage" | "callMicroflow";
export type PageSettings = "content" | "popup" | "modal";

export class ProgressCircle extends Component<ProgressCircleProps, { alertMessage: string }> {
    static defaultProps: ProgressCircleProps = {
        animate: true,
        onClickType: "doNothing",
        maximumValue: 100,
        textSize: "medium",
        value: 0
    };
    private progressNode: HTMLElement;
    private progressCircle: Circle;

    constructor(props: ProgressCircleProps) {
        super(props);

        this.state = { alertMessage: "" };
    }

    componentDidMount() {
        this.checkConfig();
        this.setProgress(this.props.value, this.props.maximumValue);
    }

    componentDidUpdate() {
        this.setProgress(this.props.value, this.props.maximumValue);
    }

    render() {
        return DOM.div({ className: "widget-progress-circle" },
            DOM.div({
                className: classNames(`widget-progress-circle-${this.props.textSize}`,
                    {
                        negative: this.props.value < 0,
                        "red-progress-text": this.props.maximumValue < 1
                    }
                ),
                onClick: () => this.handleOnClick(),
                ref: node => this.progressNode = node
            }),
            this.state.alertMessage ? createElement(Alert, { message: this.state.alertMessage }) : null
        );
    }

    componentWillUnmount() {
        this.progressCircle.destroy();
    }

    private createProgressCircle() {
        this.progressCircle = new Circle(this.progressNode, {
            duration: this.props.animate ? 800 : -1,
            strokeWidth: 6,
            trailWidth: 6
        });
        this.progressCircle.trail.className.baseVal = "widget-progress-circle-trail-path";
        this.progressCircle.path.className.baseVal = "widget-progress-circle-path";
    }

    private setProgress(value: number | null, maximum: number = 100) {
        if (!this.progressCircle) {
            this.createProgressCircle();
        }

        let progress = 0;
        let progressText: string;
        if (value === null || typeof value === "undefined") {
            progressText = "--";
        } else if (maximum <= 0) {
            window.console.warn("The maximum value is 0. Progress is set to Invalid");
            progressText = "Invalid";
        } else {
            progress = Math.round((value / maximum) * 100);
            progressText = progress + "%";
        }

        let animateValue = progress / 100;
        animateValue = animateValue <= 1
            ? animateValue < -1 ? -1 : animateValue
            : 1;

        this.progressCircle.setText(progressText);
        this.progressCircle.animate(animateValue);
    }

    private checkConfig() {
        let errorMessage: string[] = [];
        if (this.props.onClickType === "callMicroflow" && !this.props.microflow) {
            errorMessage.push("On click microflow is required");
        }
        if (this.props.onClickType === "showPage" && !this.props.page) {
            errorMessage.push("On click page is required");
        }
        if (errorMessage.length > 0) {
            errorMessage.unshift("Error in configuration of the progress circle widget:");
            this.setState({ alertMessage: errorMessage.join("\n")});
        }
    }

    private handleOnClick() {
        const { contextObject, microflow, onClickType, page } = this.props;
        if (contextObject && onClickType === "callMicroflow" && microflow && contextObject.getGuid()) {
            window.mx.ui.action(microflow, {
                error: error =>
                    this.setState({ alertMessage: `Error while executing microflow: ${microflow}: ${error.message}`}),
                params: {
                    applyto: "selection",
                    guids: [ contextObject.getGuid() ]
                }
            });
        } else if (contextObject && onClickType === "showPage" && page && contextObject.getGuid()) {
            let context = new window.mendix.lib.MxContext();
            context.setTrackId(contextObject.getGuid());
            context.setTrackEntity(contextObject.getEntity());

            window.mx.ui.openForm(page, {
                context,
                location: this.props.pageSettings
            });
        }
    }
}
