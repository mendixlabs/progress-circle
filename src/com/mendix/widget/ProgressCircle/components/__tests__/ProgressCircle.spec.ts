import { shallow } from "enzyme";
import { DOM, createElement } from "react";

import * as progressbar from "progressbar.js";

import { OnclickProps, ProgressCircle, ProgressCircleProps } from "../ProgressCircle";

import { MockContext, mockMendix } from "tests/mocks/Mendix";

describe("ProgressCircle", () => {

    beforeAll(() => {
        window.mx = mockMendix;
        window.mendix = { lib: { MxContext: MockContext } };
        window.mendix.lib.MxContext = MockContext;
    });

    let progressCircle: progressbar.Circle;
    const render = (props: ProgressCircleProps) => shallow(createElement(ProgressCircle, props));
    const newCircleInstance = (props: ProgressCircleProps) =>
        render(props).instance() as ProgressCircle;
    const Circle = progressbar.Circle;
    const spyOnCircle = () =>
        spyOn(progressbar, "Circle").and.callFake(() =>
            progressCircle = new Circle(document.createElement("div"), {
                strokeWidth: 6,
                trailWidth: 6
            })
        );
    const clickProps: OnclickProps = {
        onClickType: "doNothing"
    };

    it("renders the structure correctly", () => {
        const progress = render({ progressOnClick: clickProps, value: 60 });

        expect(progress).toBeElement(
            DOM.div({
                className: "widget-progress-circle widget-progress-circle-medium",
                onClick: jasmine.any(Function) as any
            })
        );
    });

    it("creates a circle progress bar", () => {
        spyOnCircle();
        const progress = newCircleInstance({ progressOnClick: clickProps, value: 80 });
        progress.componentDidMount();

        expect(progressbar.Circle).toHaveBeenCalled();
    });

    it("sets the progress percentage", () => {
        spyOn(progressbar.Circle.prototype, "setText").and.callThrough();
        const setText = progressbar.Circle.prototype.setText as jasmine.Spy;
        spyOnCircle();

        const progress = newCircleInstance({ animate: false, progressOnClick: clickProps, value: 80 });
        progress.componentDidMount();

        expect(setText).toHaveBeenCalled();
    });

    it("updates the progress percentage when the values are changed", () => {
        spyOn(progressbar.Circle.prototype, "setText").and.callThrough();
        const setText = progressbar.Circle.prototype.setText as jasmine.Spy;
        spyOnCircle();

        const progress = newCircleInstance({ progressOnClick: clickProps, value: 80 });
        progress.componentDidMount();
        progress.componentDidUpdate();

        expect(setText).toHaveBeenCalledTimes(2);
    });

    it("destroys progress circle on unmount", () => {
        spyOn(progressbar.Circle.prototype, "destroy").and.callThrough();
        const destroy = progressbar.Circle.prototype.destroy as jasmine.Spy;
        spyOnCircle();

        const progress = newCircleInstance({ progressOnClick: clickProps, value: 80 });
        progress.componentDidMount();
        progress.componentWillUnmount();

        expect(destroy).toHaveBeenCalled();
    });

    it("renders a circle no text when no value is specified", () => {
        spyOnCircle();

        const progress = newCircleInstance({ progressOnClick: clickProps, value: null });
        progress.componentDidMount();

        expect(progressCircle.text.textContent).toBe("--");
    });

    it("renders a circle with the text set to Invalid when the maximum value is less than 1", () => {
        spyOnCircle();

        const progress = newCircleInstance({
            animate: false,
            maximumValue: -1,
            progressOnClick: clickProps,
            value: 80
        });
        progress.componentDidMount();

        expect(progressCircle.text.textContent).toBe("Invalid");
    });

    it("renders a circle with the correct text when the value is less than 0", () => {
        spyOnCircle();

        const progress = newCircleInstance({ animate: false, progressOnClick: clickProps, value: -1 });
        progress.componentDidMount();

        expect(progressCircle.text.textContent).toBe("-1%");
    });

    it("renders a circle with the correct text when the value is greater than the maximum", () => {
        spyOnCircle();

        const progress = newCircleInstance({ progressOnClick: clickProps, value: 180 });
        progress.componentDidMount();

        expect(progressCircle.text.textContent).toBe("180%");
    });

    it("has the class widget-progress-circle-small when the text size is small", () => {
        const progress = render({ progressOnClick: clickProps, textSize: "small", value: 20 });

        expect(progress.find(".widget-progress-circle-small").length).toBe(1);
    });

    it("has the class widget-progress-circle-medium when the text size is medium", () => {
        const progress = render({ progressOnClick: clickProps, textSize: "medium", value: 20 });

        expect(progress.find(".widget-progress-circle-medium").length).toBe(1);
    });

    it("has the class widget-progress-circle-large when the text size is large", () => {
        const progress = render({ progressOnClick: clickProps, textSize: "large", value: 20 });

        expect(progress.find(".widget-progress-circle-large").length).toBe(1);
    });

    describe("with an onClick microflow set", () => {
        it("executes the microflow when a progress Circle is clicked", () => {
            const onclickProps: OnclickProps = {
                microflowProps: {
                    guid: "2",
                    microflow: "IVK_Onclick"
                },
                onClickType: "callMicroflow"
            };
            spyOn(window.mx.ui, "action").and.callThrough();
            const progress = render({ progressOnClick: onclickProps, value: 20 });
            progress.simulate("click");

            expect(window.mx.ui.action).toHaveBeenCalledWith(onclickProps.microflowProps.microflow, {
                error: jasmine.any(Function),
                params: {
                    applyto: "selection",
                    guids: [ onclickProps.microflowProps.guid ]
                }
            });
        });
    });

    describe("without a microflow selected but an onClick microflow action is set ", () => {
        it(" it shows an error in configuration", () => {
            spyOnCircle();
            const onclickProps: OnclickProps = {
                microflowProps: {
                    guid: "2",
                    microflow: ""
                },
                onClickType: "callMicroflow"
            };
            spyOn(window.mx.ui, "error").and.callThrough();
            const progress = newCircleInstance({ progressOnClick: onclickProps, value: 20 });
            progress.componentDidMount();

            expect(window.mx.ui.error).toHaveBeenCalledWith("Error in configuration of the Progress circle widget" +
                "\n" + "'On click' call a microFlow is set and there is no 'Microflow' Selected in tab Events"
            );
        });
    });

    describe("with an invalid onClick microflow", () => {
        it("shows an error when a progress circle is clicked", () => {
            const invalidAction = "invalid_action";
            const errorMessage = "Error while executing microflow: invalid_action: mx.ui.action error mock";
            const onclickProps: OnclickProps = {
                microflowProps: {
                    guid: "2",
                    microflow: "invalid_action"
                },
                onClickType: "callMicroflow"
            };

            spyOn(window.mx.ui, "action").and.callFake((actionname: string, action: { error: (e: Error) => void }) => {
                if (actionname === invalidAction) {
                    action.error(new Error("mx.ui.action error mock"));
                }
            });
            spyOn(window.mx.ui, "error").and.callThrough();

            const progress = render({ progressOnClick: onclickProps, value: 20 });
            progress.simulate("click");

            expect(window.mx.ui.error).toHaveBeenCalledWith(errorMessage);
        });
    });

    describe("with an onClick show page is set", () => {
        it("opens the page when a progress Circle is clicked", () => {
            const onclickProps: OnclickProps = {
                onClickType: "showPage",
                pageProps: {
                    entity: "TestSuite.Progress",
                    guid: "2",
                    page: "showpage.xml",
                    pageSetting: "popup"
                }
            };
            spyOn(window.mx.ui, "openForm").and.callThrough();
            const progress = render({ progressOnClick: onclickProps, value: 20 });
            progress.simulate("click");

            expect(window.mx.ui.openForm).toHaveBeenCalledWith(onclickProps.pageProps.page, {
                context: new mendix.lib.MxContext(),
                location: "popup"
            });
        });
    });

    describe("without a page selected but an onClick show page is set", () => {
        it("it shows an error in configuration", () => {
            spyOnCircle();
            const onclickProps: OnclickProps = {
                onClickType: "showPage",
                pageProps: {
                    entity: "",
                    guid: "2",
                    page: "",
                    pageSetting: "popup"
                }
            };
            spyOn(window.mx.ui, "error").and.callThrough();
            const progress = newCircleInstance({ progressOnClick: onclickProps, value: 20 });
            progress.componentDidMount();

            expect(window.mx.ui.error).toHaveBeenCalledWith("Error in configuration of the Progress circle widget" +
                "\n" + "'On click' Show a page is set and there is no 'Page' Selected in tab 'Events'"
            );
        });
    });

    afterAll(() => {
        window.mx = undefined;
    });
});
