import { Component, createElement } from "react";
import { ProgressCircle, ProgressTextSize } from "./ProgressCircle";
import { Alert } from "./Alert";

interface ProgressCircleContainerProps {
    animate: boolean;
    mxObject: mendix.lib.MxObject;
    maximumValueAttribute: string;
    microflow?: string;
    onClickEvent: OnClickOptions;
    page?: string;
    progressAttribute: string;
    textSize: ProgressTextSize;
    positiveValueColor?: string;
    negativeValueColor?: string;
}

interface ProgressCircleContainerState {
    alertMessage?: string;
    maximumValue?: number;
    showAlert?: boolean;
    progressValue?: number | null;
}

type OnClickOptions = "doNothing" | "showPage" | "callMicroflow";

class ProgressCircleContainer extends Component<ProgressCircleContainerProps, ProgressCircleContainerState> {
    private subscriptionHandles: number[];
    private defaultMaximumValue = 100;

    constructor(props: ProgressCircleContainerProps) {
        super(props);

        this.state = {
            alertMessage: this.validateProps(),
            maximumValue: this.getValue(props.mxObject, props.maximumValueAttribute),
            progressValue: this.getValue(props.mxObject, props.progressAttribute) || null,
            showAlert: !!this.validateProps()
        };
        this.subscriptionHandles = [];
        this.handleOnClick = this.handleOnClick.bind(this);
    }

    render() {
        if (this.state.showAlert) {
            return createElement(Alert, { message: this.state.alertMessage });
        }

        return createElement(ProgressCircle, {
            alertMessage: this.state.alertMessage,
            animate: this.props.animate,
            clickable: !!this.props.microflow || !!this.props.page,
            maximumValue: this.state.maximumValue,
            negativeValueColor: this.props.negativeValueColor,
            onClickAction: this.handleOnClick,
            positiveValueColor: this.props.positiveValueColor,
            textSize: this.props.textSize,
            value: this.state.progressValue || null
        });
    }

    componentWillReceiveProps(newProps: ProgressCircleContainerProps) {
        this.resetSubscription(newProps.mxObject);
        this.updateValues(newProps.mxObject);
    }

    private validateProps(): string {
        let errorMessage = "";
        if (this.props.onClickEvent === "callMicroflow" && !this.props.microflow) {
            errorMessage = "on click microflow is required";
        } else if (this.props.onClickEvent === "showPage" && !this.props.page) {
            errorMessage = "on click page is required";
        }

        return errorMessage && `Error in progress circle configuration: ${errorMessage}`;
    }

    private getValue(contextObject: mendix.lib.MxObject, attribute: string): number | undefined {
        return contextObject ? parseFloat(contextObject.get(attribute) as string) : undefined;
    }

    private updateValues(contextObject: mendix.lib.MxObject) {
        this.setState({
            maximumValue: this.getValue(contextObject, this.props.maximumValueAttribute) || this.defaultMaximumValue,
            progressValue: this.getValue(contextObject, this.props.progressAttribute) || null
        });
    }

    private resetSubscription(contextObject: mendix.lib.MxObject) {
        this.unSubscribe();

        if (contextObject) {
            this.subscriptionHandles.push(window.mx.data.subscribe({
                callback: () => this.updateValues(contextObject),
                guid: contextObject.getGuid()
            }));

            [ this.props.progressAttribute, this.props.maximumValueAttribute ].forEach(attr => {
                this.subscriptionHandles.push(window.mx.data.subscribe({
                    attr,
                    callback: () => this.updateValues(contextObject),
                    guid: contextObject.getGuid()
                }));
            });
        }

    }

    private unSubscribe() {
        this.subscriptionHandles.forEach(handle => window.mx.data.unsubscribe(handle));
    }

    private handleOnClick() {
        const { mxObject, microflow, onClickEvent, page } = this.props;
        if (mxObject && onClickEvent === "callMicroflow" && microflow && mxObject.getGuid()) {
            window.mx.ui.action(microflow, {
                error: error => window.mx.ui.error(
                    `Error while executing microflow ${microflow}: ${error.message}`
                ),
                params: {
                    applyto: "selection",
                    guids: [ mxObject.getGuid() ]
                }
            });
        } else if (mxObject && onClickEvent === "showPage" && page && mxObject.getGuid()) {
            const context = new window.mendix.lib.MxContext();
            context.setContext(mxObject);

            window.mx.ui.openForm(page, {
                error: error => window.mx.ui.error(
                    `Error while opening page ${page}: ${error.message}`
                ),
                context
            });
        }
    }
}

export { ProgressCircleContainer as default };
