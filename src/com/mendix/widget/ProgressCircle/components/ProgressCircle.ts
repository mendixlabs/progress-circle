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
    onClickOption?: onClickOptions;
    page?: string;
    pageSettings?: PageSettings;
    textSize?: ProgressTextSize;
    value: number | null;
}

export type ProgressTextSize = "small" | "medium" | "large";
export type onClickOptions = "doNothing" | "showPage" | "callMicroflow";
export type PageSettings = "content" | "popup" | "modal";

export class ProgressCircle extends Component<ProgressCircleProps, { alertMessage: string }> {
    static defaultProps: ProgressCircleProps = {
        animate: true,
        maximumValue: 100,
        onClickOption: "doNothing",
        textSize: "medium",
        value: 0
    };
    private progressNode: HTMLElement;
    private progressCircle: Circle;
    private setProgressNode: (node: HTMLElement) => void;

    constructor(props: ProgressCircleProps) {
        super(props);

        this.state = { alertMessage: "" };
        this.handleOnClick = this.handleOnClick.bind(this);
        this.setProgressNode = (node) => this.progressNode = node;
    }

    componentDidMount() {
        this.checkConfig();
        this.createProgressCircle();
        this.setProgress(this.props.value, this.props.maximumValue);
    }

    componentWillReceiveProps(newProps: ProgressCircleProps) {
        this.setProgress(newProps.value, newProps.maximumValue);
    }

    render() {
        const alert = this.state.alertMessage ? createElement(Alert, { message: this.state.alertMessage }) : null;
        return DOM.div({ className: "widget-progress-circle" },
            DOM.div({
                className: classNames(`widget-progress-circle-${this.props.textSize}`,
                    {
                        "widget-progress-circle-negative": !!this.props.value && this.props.value < 0,
                        "widget-progress-circle-alert": !!this.props.maximumValue && this.props.maximumValue < 1
                    }
                ),
                onClick: this.handleOnClick,
                ref: this.setProgressNode
            }),
            alert
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

    private setProgress(value: number | null, maximum = 100) {
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
        if (animateValue > 1) {
            animateValue = 1;
        } else if (animateValue < -1) {
            animateValue = -1;
        }

        this.progressCircle.setText(progressText);
        this.progressCircle.animate(animateValue);
    }

    private checkConfig() {
        const errorMessage: string[] = [];
        if (this.props.onClickOption === "callMicroflow" && !this.props.microflow) {
            errorMessage.push("On click microflow is required");
        }
        if (this.props.onClickOption === "showPage" && !this.props.page) {
            errorMessage.push("On click page is required");
        }
        if (errorMessage.length > 0) {
            errorMessage.unshift("Error in configuration of the progress circle widget:");
            this.setState({ alertMessage: errorMessage.join("\n") });
        }
    }

    private handleOnClick() {
        const { contextObject, microflow, onClickOption, page } = this.props;
        if (contextObject && onClickOption === "callMicroflow" && microflow && contextObject.getGuid()) {
            window.mx.ui.action(microflow, {
                error: (error) =>
                    this.setState({ alertMessage: `Error while executing microflow: ${microflow}: ${error.message}` }),
                params: {
                    applyto: "selection",
                    guids: [ contextObject.getGuid() ]
                }
            });
        } else if (contextObject && onClickOption === "showPage" && page && contextObject.getGuid()) {
            const context = new window.mendix.lib.MxContext();
            context.setTrackId(contextObject.getGuid());
            context.setTrackEntity(contextObject.getEntity());

            window.mx.ui.openForm(page, {
                error: (error) =>
                    this.setState({ alertMessage: `Error while opening page: ${page}: ${error.message}` }),
                context,
                location: this.props.pageSettings
            });
        }
    }
}
