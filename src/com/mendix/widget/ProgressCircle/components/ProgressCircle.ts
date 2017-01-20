import { Component, DOM, ReactNode } from "react";
import { Circle } from "progressbar.js";

import "../ui/ProgressCircle.css";

export interface ProgressCircleProps {
    value: number | null;
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
            className: "widget-progress-circle widget-progress-circle-" + this.props.textSize,
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
}
