import homePage from "./pages/home.page";
import playgroundPage from "./pages/playground.page";

describe("ProgressCircle", () => {
    it("renders with a value", () => {
        homePage.open();
        homePage.progressText.waitForVisible();

        expect(homePage.progressText.getText()).toBe("-60");
    });

    it("sets the progress percentage", () => {
        playgroundPage.open();
        playgroundPage.progressTextBox.waitForVisible();
        playgroundPage.progressTextBox.setValue(67);
        playgroundPage.maximumValueTextBox.waitForVisible();
        playgroundPage.maximumValueTextBox.click();

        expect(homePage.progressText.getText()).toBe("67");
    });
});
