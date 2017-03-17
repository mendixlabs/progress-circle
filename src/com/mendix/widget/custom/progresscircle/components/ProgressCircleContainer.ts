import { Component, createElement } from "react";
import { ProgressCircle, ProgressTextSize } from "./ProgressCircle";
import { Alert } from "./Alert";

interface ProgressCircleContainerProps {
    animate: boolean;
    contextObject: mendix.lib.MxObject;
    maximumValueAttribute: string;
    microflow?: string;
    onClickOption: OnClickOptions;
    page?: string;
    progressAttribute: string;
    textSize: ProgressTextSize;
}

interface ProgressCircleContainerState {
    alertMessage?: string;
    maximumValue?: number;
    showAlert?: boolean;
    progressValue: number | null;
}

type OnClickOptions = "doNothing" | "showPage" | "callMicroflow";

class ProgressCircleContainer extends Component<ProgressCircleContainerProps, ProgressCircleContainerState> {
    private subscriptionHandles: number[];

    constructor(props: ProgressCircleContainerProps) {
        super(props);

        this.state = {
            alertMessage: this.validateProps(),
            maximumValue: this.getValue(props.contextObject, props.maximumValueAttribute),
            progressValue: this.getValue(props.contextObject, props.progressAttribute) || null,
            showAlert: !!this.validateProps()
        };
        this.subscriptionHandles = [];
        this.resetSubscription(props.contextObject);
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
            onClickAction: this.handleOnClick,
            textSize: this.props.textSize,
            value: this.state.progressValue
        });
    }

    componentWillReceiveProps(newProps: ProgressCircleContainerProps) {
        this.resetSubscription(newProps.contextObject);
        this.updateValues(newProps.contextObject);
    }

    private validateProps(): string {
        let errorMessage: string = "";
        if (this.props.onClickOption === "callMicroflow" && !this.props.microflow) {
            errorMessage = "on click microflow is required";
        } else if (this.props.onClickOption === "showPage" && !this.props.page) {
            errorMessage = "on click page is required";
        }
        if (errorMessage) {
            errorMessage = `Error in progress circle configuration: ${errorMessage}`;
        }

        return errorMessage;
    }

    private getValue(contextObject: mendix.lib.MxObject, attribute: string): number | undefined {
        return contextObject ? parseFloat(contextObject.get(attribute) as string) : undefined;
    }

    private updateValues(contextObject: mendix.lib.MxObject) {
        this.setState({
            maximumValue: this.getValue(contextObject, this.props.maximumValueAttribute),
            progressValue: this.getValue(contextObject, this.props.progressAttribute) || null
        })
    }

    private resetSubscription(contextObject: mendix.lib.MxObject) {
        this.unSubscribe();

        if (contextObject) {
            this.subscriptionHandles.push(window.mx.data.subscribe({
                callback: () => this.updateValues(contextObject),
                guid: contextObject.getGuid()
            }));
            [ this.props.progressAttribute, this.props.maximumValueAttribute ].forEach((attr) => {
                this.subscriptionHandles.push(window.mx.data.subscribe({
                    attr,
                    callback: () => this.updateValues(contextObject),
                    guid: contextObject.getGuid()
                }));
            });
        }

    }

    private unSubscribe() {
        this.subscriptionHandles.forEach((handle) => window.mx.data.unsubscribe(handle));
    }

    private handleOnClick() {
        const { contextObject, microflow, onClickOption, page } = this.props;
        if (contextObject && onClickOption === "callMicroflow" && microflow && contextObject.getGuid()) {
            window.mx.ui.action(microflow, {
                error: (error) =>
                    this.setState({
                        alertMessage: `Error while executing microflow ${microflow}: ${error.message}`,
                        showAlert: false,
                        progressValue: this.getValue(contextObject, this.props.progressAttribute) || null
                    }),
                params: {
                    applyto: "selection",
                    guids: [ contextObject.getGuid() ]
                }
            });
        } else if (contextObject && onClickOption === "showPage" && page && contextObject.getGuid()) {
            const context = new window.mendix.lib.MxContext();
            context.setContext(contextObject);

            window.mx.ui.openForm(page, {
                error: (error) =>
                    this.setState({
                        alertMessage: `Error while opening page ${page}: ${error.message}`,
                        showAlert: false,
                        progressValue: this.getValue(contextObject, this.props.progressAttribute) || null
                    }),
                context
            });
        }
    }
}

export { OnClickOptions, ProgressCircleContainer as default };
