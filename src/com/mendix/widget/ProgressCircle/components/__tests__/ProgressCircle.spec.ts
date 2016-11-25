import { shallow } from "enzyme";
import { DOM, createElement } from "react";

import * as progressbar from "progressbar.js";

import { ProgressCircle, ProgressCircleProps } from "../ProgressCircle";

describe("ProgressCircle", () => {
    let progressCircle: progressbar.Circle;
    const render = (props: ProgressCircleProps) => shallow(createElement(ProgressCircle, props));
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

        expect(progress).toBeElement(DOM.div({ className: "widget-progress-circle" }));
    });

    it("creates a circle progress bar", () => {
        spyOnCircle();
        const progress = render({ value: 80 });
        let instance = progress.instance() as ProgressCircle;
        instance.componentDidMount();

        expect(progressbar.Circle).toHaveBeenCalled();
    });

    it("sets the progress percentage", () => {
        spyOn(progressbar.Circle.prototype, "setText").and.callThrough();
        const setText = progressbar.Circle.prototype.setText as jasmine.Spy;
        spyOnCircle();

        const progress = render({ animate: false, value: 80 });
        let instance = progress.instance() as ProgressCircle;
        instance.componentDidMount();

        expect(setText).toHaveBeenCalled();
    });

    it("updates the progress percentage when updated", () => {
        spyOn(progressbar.Circle.prototype, "setText").and.callThrough();
        const setText = progressbar.Circle.prototype.setText as jasmine.Spy;
        spyOnCircle();

        const progress = render({ value: 80 });
        let instance = progress.instance() as ProgressCircle;
        instance.componentDidMount();
        instance.componentDidUpdate();

        expect(setText).toHaveBeenCalledTimes(2);
    });

    it("destroys progress circle on unmount", () => {
        spyOn(progressbar.Circle.prototype, "destroy").and.callThrough();
        const destroy = progressbar.Circle.prototype.destroy as jasmine.Spy;
        spyOnCircle();

        const progress = render({ value: 280 });
        let instance = progress.instance() as ProgressCircle;
        instance.componentDidMount();
        instance.componentWillUnmount();

        expect(destroy).toHaveBeenCalled();
    });

    describe("with the text size small", () => {
        it("has the class progress-circle-small", () => {
            const progress = render({ textSize: "small", value: 20 });

            expect(progress.find(".progress-circle-small").length).toBe(1);
        });
    });

    describe("with the text size medium", () => {
        it("has the class progress-circle-medium", () => {
            const progress = render({ textSize: "medium", value: 20 });

            expect(progress.find(".progress-circle-medium").length).toBe(1);
        });
    });

    describe("with the text size large", () => {
        it("has the class progress-circle-large", () => {
            const progress = render({ textSize: "large", value: 20 });

            expect(progress.find(".progress-circle-large").length).toBe(1);
        });
    });

    describe("with a maximum value less than 1", () => {
        it("renders a circle with text NA", () => {
            spyOnCircle();

            const progress = render({ animate: false, value: 80, maximumValue: -1 });
            let instance = progress.instance() as ProgressCircle;
            instance.componentDidMount();

            expect(progressCircle.text.textContent).toBe("NA");
        });
    });

    describe("with the value less than 0", () => {
        it("renders a circle with text 0%", () => {
            spyOnCircle();

            const progress = render({ animate: false, value: -1 });
            let instance = progress.instance() as ProgressCircle;
            instance.componentDidMount();

            expect(progressCircle.text.textContent).toBe("0%");
        });
    });

    describe("with the value greater than the maximum", () => {
        it("renders a circle with text 100%", () => {
            spyOnCircle();

            const progress = render({ animate: false, value: 180 });
            let instance = progress.instance() as ProgressCircle;
            instance.componentDidMount();

            expect(progressCircle.text.textContent).toBe("100%");
        });
    });
});
