//------ *[ DEEPSEEK SCRAPPER ]* -----
import { chromium } from "playwright-extra";
import stealth from "puppeteer-extra-plugin-stealth";
chromium.use(stealth());

const config = {
	userAgent: "",
	userToken: process.env.userToken || "",
	cfClearance: process.env.cfClearance || "",
};

const payload = {
	baseUrl: "https://chat.deepseek.com",
	selectors: {
		submit: ".f6d670",
		textAreaSearchBox: "#chat-input",
		textMessage: ".ds-markdown",
		profile: ".d65532b2",
		deleteButton:
			'.ds-dropdown-menu-option__label:has-text("Delete all chats")',
		confirmDeleteButton: '.ds-button:has-text("Confirm deletion")',
	},
	totalLoopCount: 60,
	printIntervalTime: 1000,
};

const deepseek = async (prompt) => {
	const url = payload.baseUrl;
	const {
		submit,
		textAreaSearchBox,
		textMessage,
		profile,
		deleteButton,
		confirmDeleteButton,
	} = payload.selectors;
	const { totalLoopCount, printIntervalTime } = payload;

	try {
		const browser = await chromium.launch({ headless: true, timeout: 30000 });
		const context = await browser.newContext({ userAgent: config.userAgent });

		const cookies = [
			{
				name: "cf_clearance",
				value: config.cfClearance,
				domain: ".deepseek.com",
				path: "/",
				httpOnly: true,
				secure: true,
			},
		];
		await context.addCookies(cookies);

		const page = await context.newPage();
		await page.goto(url, { waitUntil: "domcontentloaded" });

		await page.evaluate((userToken) => {
			localStorage.setItem("searchEnabled", "true");
			localStorage.setItem(
				"userToken",
				'{"value":"' + userToken + '","__version":"0"}',
			);
		}, config.userToken);
		await page.goto(url, { waitUntil: "domcontentloaded" });

		await page.fill(textAreaSearchBox, prompt);
		await page.click(submit);

		let start = "";
		let end = "";
		for (let i = 0; i < totalLoopCount; i++) {
			await new Promise((resolve) => setTimeout(resolve, printIntervalTime));
			const result = await page.locator(textMessage).innerText();
			if (start === result) {
				end = result;
				break;
			}
			start = result;
		}

		console.log("Result:\n" + end.replace(/^\s*\n+/gm, "\n"));

		await page.click(profile);
		await page.click(deleteButton);
		await page.click(confirmDeleteButton);

		await browser.close();
	} catch (error) {
		console.error("Error:", error);
	}
};

export { deepseek };

const main = async () => {
	const prompt = "how to be a good person?";
	await deepseek(prompt);
};

main();
