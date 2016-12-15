import { Component, DOM, ReactNode } from "react";
import { Circle } from "progressbar.js";

import "../ui/ProgressCircle.css";

export interface OnclickProps {
    entity: string;
    microflow: string;
    guid: string;
    onClickType: ProgressOnclick;
    origin?: mxui.lib.form._FormBase;
    page?: string;
    pageSetting?: PageSettings;
}

export interface ProgressCircleProps {
    value: number | null;
    maximumValue?: number;
    textSize?: ProgressTextSize;
    animate?: boolean;
    progressOnClick?: OnclickProps;
}

export type ProgressTextSize = "small" | "medium" | "large";
export type ProgressOnclick = "doNothing" | "showPage" | "callMicroflow";
export type PageSettings = "content" | "popup" | "modal";

export class ProgressCircle extends Component<ProgressCircleProps, {}> {
    static defaultProps: ProgressCircleProps = {
        animate: true,
        maximumValue: 100,
        textSize: "medium",
        value: 0
    };
    private progressNode: ReactNode;
    private progressCircle: Circle;

    componentDidMount() {
        this.setProgress(this.props.value, this.props.maximumValue);
        this.checkConfig();
    }

    componentDidUpdate() {
        this.setProgress(this.props.value, this.props.maximumValue);
    }

    render() {
        return DOM.div({
            className: "widget-progress-circle widget-progress-circle-" + this.props.textSize,
            onClick: () => this.handleOnClick(this.props.progressOnClick),
            ref: (node: ReactNode) => { this.progressNode = node; }
        });
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
        this.progressCircle.path.className.baseVal = "widget-progress-circle-path";
        this.progressCircle.trail.className.baseVal = "widget-progress-circle-trail-path";
    }

    private setProgress(value: number | null, maximum: number = 100) {
        if (!this.progressCircle) {
            this.createProgressCircle();
        }

        let progress = 0;
        let progressText: string;
        if (value === null || typeof value === "undefined") {
            progressText = "";
        } else if (maximum < 1) {
            window.console.warn("The maximum value is less than one. Progress is set to NA");
            progressText = "NA";
        } else {
            progress = Math.round((value / maximum) * 100);
            progressText = progress + "%";
            if (value < 0) {
                progress = 0;
            } else if (value > maximum) {
                progress = 100;
            }
        }

        this.progressCircle.setText(progressText);
        this.progressCircle.animate(progress / 100 || 0);
    }

    private checkConfig() {
        let errorMessage: string[] = [];
        if (this.props.progressOnClick.onClickType === "callMicroflow" && !this.props.progressOnClick.microflow) {
            errorMessage.push("'On Click' call a microFlow is set " +
                "and there is no 'Microflow' Selected in Tab Events");
        }
        if (this.props.progressOnClick.onClickType === "showPage" && !this.props.progressOnClick.page) {
            errorMessage.push("'On Click' Show a page is set and there is no 'Page' Selected in Tab 'Events'");
        }
        if (errorMessage.length > 0) {
            errorMessage.unshift("Error in Configuration of ProgressCircleWidget ");
            mx.ui.error(errorMessage.join("\n"));
        }
    }

    private handleOnClick(props: OnclickProps) {
        if (props.onClickType === "callMicroflow" && props.microflow && props.guid) {
            window.mx.data.action({
                error: (error: Error) => {
                    window.mx.ui.error(`Error while executing microflow: ${props.microflow}: ${error.message}`);
                },
                origin: props.origin || undefined,
                params: {
                    actionname: props.microflow,
                    applyto: "selection",
                    guids: [props.guid]
                }
            });
        } else if (props.onClickType === "showPage" && props.page && props.guid) {
            let context = new mendix.lib.MxContext();
            context.setTrackId(props.guid);
            context.setTrackEntity(props.entity);

            mx.ui.openForm(props.page, {
                context,
                location: props.pageSetting
            });
        } else {
            window.console.info("No click event specified");
        }
    }
}
