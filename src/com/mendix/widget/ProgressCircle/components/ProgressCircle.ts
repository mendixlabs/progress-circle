import * as classNames from "classnames";
import { Circle } from "progressbar.js";
import { Component, DOM, ReactNode } from "react";

import "../ui/ProgressCircle.css";

export interface ProgressCircleProps {
    value: number;
    maximumValue?: number;
    textSize?: ProgressTextSize;
    animate?: boolean;
}

export type ProgressTextSize = "small" | "medium" | "large";

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
    }

    componentDidUpdate() {
        this.setProgress(this.props.value, this.props.maximumValue);
    }

    render() {
        return DOM.div({
            className: classNames("widget-progress-circle", "progress-circle-" + this.props.textSize),
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
        this.progressCircle.path.className.baseVal = "widget-progress-path";
        this.progressCircle.trail.className.baseVal = "widget-trail-path";
    }

    private setProgress(value: number, maximum: number) {
        if (!this.progressCircle) {
            this.createProgressCircle();
        }
        let progress: number;
        if (maximum < 1) {
            window.console.warn("The maximum value is less than one. Progress is set to NA");
        } else if (value < 0) {
            window.console.warn("The progress value is less than the zero. Progress is set to 0%");
            progress = 0;
        } else if (value > maximum) {
            window.console.warn("The progress value is greater than the maximum value. Progress is set to 100%");
            progress = 100;
        } else {
            progress = Math.round((value / maximum) * 100);
        }

        this.progressCircle.setText(progress > -1 ? progress + "%" : "NA");
        this.progressCircle.animate(progress/100 || 0);
    }
}
