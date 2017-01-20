import { shallow } from "enzyme";
import { DOM, createElement } from "react";

import * as progressbar from "progressbar.js";

import { ProgressCircle, ProgressCircleProps } from "../ProgressCircle";

describe("ProgressCircle", () => {
    let progressCircle: progressbar.Circle;
    const render = (props: ProgressCircleProps) => shallow(createElement(ProgressCircle, props));
    const newCircleInstance = (props: ProgressCircleProps) => {
        const progress = render(props);
        return progress.instance() as ProgressCircle;
    };
    const Circle = progressbar.Circle;
    const spyOnCircle = () =>
        spyOn(progressbar, "Circle").and.callFake(() => {
            return progressCircle = new Circle(document.createElement("div"), {
                strokeWidth: 6,
                trailWidth: 6
            });
        });

    it("renders the structure correctly", () => {
        const progress = render({ value: 60 });

        expect(progress).toBeElement(DOM.div({ className: "widget-progress-circle widget-progress-circle-medium" }));
    });

    it("creates a circle progress bar", () => {
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

        const progress = newCircleInstance({ value: 80 });
        progress.componentDidMount();
        progress.componentDidUpdate();

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

    describe("with no value specified", () => {
        it("renders a circle no text", () => {
            spyOnCircle();

            const progress = newCircleInstance({ value: null });
            progress.componentDidMount();

            expect(progressCircle.text.textContent).toBe("");
        });
    });

    describe("with a maximum value less than 1", () => {
        it("renders a circle with the text set to NA", () => {
            spyOnCircle();

            const progress = newCircleInstance({ animate: false, value: 80, maximumValue: -1 });
            progress.componentDidMount();

            expect(progressCircle.text.textContent).toBe("NA");
        });
    });

    describe("with the value less than 0", () => {
        it("renders a circle with the correct text", () => {
            spyOnCircle();

            const progress = newCircleInstance({ animate: false, value: -1 });
            progress.componentDidMount();

            expect(progressCircle.text.textContent).toBe("-1%");
        });
    });

    describe("with the value greater than the maximum", () => {
        it("renders a circle with the correct text", () => {
            spyOnCircle();

            const progress = newCircleInstance({ value: 180 });
            progress.componentDidMount();

            expect(progressCircle.text.textContent).toBe("180%");
        });
    });

    describe("with the text size small", () => {
        it("has the class widget-progress-circle-small", () => {
            const progress = render({ textSize: "small", value: 20 });

            expect(progress.find(".widget-progress-circle-small").length).toBe(1);
        });
    });

    describe("with the text size medium", () => {
        it("has the class widget-progress-circle-medium", () => {
            const progress = render({ textSize: "medium", value: 20 });

            expect(progress.find(".widget-progress-circle-medium").length).toBe(1);
        });
    });

    describe("with the text size large", () => {
        it("has the class widget-progress-circle-large", () => {
            const progress = render({ textSize: "large", value: 20 });

            expect(progress.find(".widget-progress-circle-large").length).toBe(1);
        });
    });
});
