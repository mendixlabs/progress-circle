import { Component, createElement } from "react";
import { ProgressCircle, ProgressCircleProps } from "./components/ProgressCircle";
import ProgressCircleContainer, { ContainerProps } from "./components/ProgressCircleContainer";

// tslint:disable-next-line:class-name
export class preview extends Component<ContainerProps, {}> {
    render() {
        return createElement(ProgressCircle, this.transformProps(this.props));
    }

    private transformProps(props: ContainerProps): ProgressCircleProps {
        return {
            bootstrapStyle: props.bootstrapStyle,
            className: props.class,
            clickable: false,
            style: ProgressCircleContainer.parseStyle(props.style),
            value: 67
        };
    }
}
