import { ShallowWrapper, shallow } from "enzyme";
import { DOM, createElement } from "react";

import * as progressbar from "progressbar.js";

import { ProgressCircle, ProgressCircleProps } from "../ProgressCircle";
import { Alert } from "../Alert";

import { MockContext, mockMendix } from "tests/mocks/Mendix";
import { random } from "faker";

describe("ProgressCircle", () => {

    beforeAll(() => {
        window.mx = mockMendix;
        window.mendix = { lib: { MxContext: MockContext } };
    });

    let progressCircle: progressbar.Circle;
    const renderProgressCircle = (props: ProgressCircleProps) => shallow(createElement(ProgressCircle, props));
    const clickCircle = (progress: ShallowWrapper<any, any>) =>
        progress.find(".widget-progress-circle-medium").simulate("click");
    const newCircleInstance = (props: ProgressCircleProps) => renderProgressCircle(props).instance() as ProgressCircle;
    const Circle = progressbar.Circle;
    const spyOnCircle = () =>
        spyOn(progressbar, "Circle").and.callFake(() => {
            progressCircle = new Circle(document.createElement("div"), {
                strokeWidth: 6,
                trailWidth: 6
            });
            spyOn(progressCircle, "animate").and.callThrough();

            return progressCircle;
        });

    it("renders the structure correctly", () => {
        const progress = renderProgressCircle({ value: 60 });

        expect(progress).toBeElement(
            DOM.div({ className: "widget-progress-circle" },
                DOM.div({ className: "widget-progress-circle-medium", onClick: jasmine.any(Function) as any }),
                createElement(Alert)
            )
        );
    });

    it("creates a progress circle", () => {
        spyOnCircle();
        const progress = newCircleInstance({ value: 80 });

        progress.componentDidMount();

        expect(progressbar.Circle).toHaveBeenCalled();
    });

    it("sets the progress percentage", () => {
        spyOn(progressbar.Circle.prototype, "setText").and.callThrough();
        const setText = progressbar.Circle.prototype.setText as jasmine.Spy;
        spyOnCircle();

        const progress = newCircleInstance({ animate: false, value: 80 });
        progress.componentDidMount();

        expect(setText).toHaveBeenCalled();
    });

    it("updates the progress percentage when the values are changed", () => {
        spyOn(progressbar.Circle.prototype, "setText").and.callThrough();
        const setText = progressbar.Circle.prototype.setText as jasmine.Spy;
        spyOnCircle();

        const progress = renderProgressCircle({ value: 80 });
        const progressInstance = progress.instance() as ProgressCircle;
        progressInstance.componentDidMount();
        progress.setProps({ value: 60 });

        expect(setText).toHaveBeenCalledTimes(2);
    });

    it("destroys progress circle on unmount", () => {
        spyOn(progressbar.Circle.prototype, "destroy").and.callThrough();
        const destroy = progressbar.Circle.prototype.destroy as jasmine.Spy;
        spyOnCircle();

        const progress = newCircleInstance({ value: 80 });
        progress.componentDidMount();
        progress.componentWillUnmount();

        expect(destroy).toHaveBeenCalled();
    });

    it("renders a circle with the text -- when no value is specified", () => {
        spyOnCircle();

        const progress = newCircleInstance({ value: null });
        progress.componentDidMount();

        expect(progressCircle.text.textContent).toBe("--");
    });

    it("renders a circle with the text set to Invalid when the maximum value is less than 1", () => {
        spyOnCircle();

        const progress = newCircleInstance({
            animate: false,
            maximumValue: -1,
            onClickOption: "doNothing",
            value: 80
        });
        progress.componentDidMount();

        expect(progressCircle.text.textContent).toBe("Invalid");
    });

    it("renders a circle with negative values when the value is less than zero", () => {
        spyOnCircle();

        const progress = newCircleInstance({ animate: false, value: -200 });
        progress.componentDidMount();

        expect(progressCircle.text.textContent).toBe("-200%");
    });

    it("renders a circle with text greater than 100% when the value is greater than the maximum", () => {
        spyOnCircle();

        const progress = newCircleInstance({ value: 180 });
        progress.componentDidMount();

        expect(progressCircle.text.textContent).toBe("180%");
        expect(progressCircle.animate).toHaveBeenCalledWith(1);
    });

    it("has the class widget-progress-circle-negative when the value is less than zero", () => {
        const progress = renderProgressCircle({ value: -20 });

        expect(progress.find(".widget-progress-circle-negative").length).toBe(1);
    });

    it("has the class widget-progress-circle-alert when the maximum value is less than one", () => {
        const progress = renderProgressCircle({ value: 20, maximumValue: 0 });

        expect(progress.find(".widget-progress-circle-alert").length).toBe(1);
    });

    it("has the class widget-progress-circle-small when the text size is small", () => {
        const progress = renderProgressCircle({ textSize: "small", value: 20 });

        expect(progress.find(".widget-progress-circle-small").length).toBe(1);
    });

    it("has the class widget-progress-circle-medium when the text size is medium", () => {
        const progress = renderProgressCircle({ textSize: "medium", value: 20 });

        expect(progress.find(".widget-progress-circle-medium").length).toBe(1);
    });

    it("has the class widget-progress-circle-large when the text size is large", () => {
        const progress = renderProgressCircle({ textSize: "large", value: 20 });

        expect(progress.find(".widget-progress-circle-large").length).toBe(1);
    });

    describe("configured to call a microflow on click", () => {
        const contextObject: any = {
            getEntity: () => random.uuid(),
            getGuid: () => random.uuid()
        };
        const circleProps: ProgressCircleProps = {
            contextObject,
            microflow: "ACT_OnClick",
            onClickOption: "callMicroflow",
            value: 20
        };

        it("executes a microflow when the progress circle is clicked", () => {
            spyOn(window.mx.ui, "action").and.callThrough();

            clickCircle(renderProgressCircle(circleProps));

            expect(window.mx.ui.action).toHaveBeenCalledWith(circleProps.microflow, {
                error: jasmine.any(Function),
                params: {
                    applyto: "selection",
                    guids: [ jasmine.any(String) ]
                }
            });
        });

        it("shows an error when no microflow is specified", () => {
            spyOnCircle();
            circleProps.microflow = "";
            const errorMessage = "Error in progress circle configuration: on click microflow is required";
            const progress = renderProgressCircle(circleProps);
            const progressInstance = progress.instance() as ProgressCircle;
            progressInstance.componentDidMount();
            const alert = progress.find(Alert);

            expect(alert.props().message).toBe(errorMessage);
        });

        it("shows an error when an invalid microflow is specified ", () => {
            const errorMessage = "Error while executing microflow invalid_action: mx.ui.action error mock";
            circleProps.microflow = "invalid_action";

            spyOn(window.mx.ui, "action").and.callFake((actionname: string, action: { error: (e: Error) => void }) => {
                action.error(new Error("mx.ui.action error mock"));
            });
            spyOnCircle();
            const progress = renderProgressCircle(circleProps);
            clickCircle(progress);

            const alert = progress.find(Alert);
            expect(alert.props().message).toBe(errorMessage);
        });
    });

    describe("configured to show a page on click", () => {
        const contextObject: any = {
            getEntity: () => random.uuid(),
            getGuid: () => random.uuid()
        };
        const circleProps: ProgressCircleProps = {
            contextObject,
            onClickOption: "showPage",
            page: "showpage.xml",
            pageSettings: "popup",
            value: 20
        };

        it("opens a page when the progress circle is clicked", () => {
            spyOn(window.mx.ui, "openForm").and.callThrough();

            clickCircle(renderProgressCircle(circleProps));

            expect(window.mx.ui.openForm).toHaveBeenCalledWith(circleProps.page, {
                context: new mendix.lib.MxContext(),
                error: jasmine.any(Function),
                location: "popup"
            });
        });

        it("shows an error when no page is specified", () => {
            spyOnCircle();
            circleProps.page = "";
            const errorMessage = "Error in progress circle configuration: on click page is required";
            const progress = renderProgressCircle(circleProps);
            clickCircle(progress);
            const progressInstance = progress.instance() as ProgressCircle;
            progressInstance.componentDidMount();

            const alert = progress.find(Alert);
            expect(alert.props().message).toBe(errorMessage);
        });

        it("shows an error when an invalid page is specified ", () => {
            circleProps.page = "invalid_page";
            const errorMessage = `Error while opening page ${circleProps.page}: mx.ui.openForm error mock`;

            spyOn(window.mx.ui, "openForm").and.callFake((path: string, args: { error: Function }) => {
                args.error(new Error("mx.ui.openForm error mock"));
            });
            spyOnCircle();
            const progress = renderProgressCircle(circleProps);
            clickCircle(progress);

            const alert = progress.find(Alert);
            expect(alert.props().message).toBe(errorMessage);
        });
    });

    describe("with no action on click", () => {
        const contextObject = jasmine.createSpyObj("contextObject", [ "getGuid", "getEntity" ]);
        const circleProps: ProgressCircleProps = {
            contextObject,
            onClickOption: "doNothing",
            value: 20
        };

        it("should not respond to click events", () => {
            spyOnCircle();
            spyOn(window.mx.ui, "openForm");
            spyOn(window.mx.ui, "action");

            clickCircle(renderProgressCircle(circleProps));

            expect(window.mx.ui.openForm).not.toHaveBeenCalled();
            expect(window.mx.ui.action).not.toHaveBeenCalled();
        });
    });

    afterAll(() => {
        window.mx = undefined as any;
        window.mendix = undefined as any;
    });
});
