import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
                "--single-process"
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        # Wider default timeout to match the agent's DOM-stability budget;
        # auto-waiting Playwright APIs (expect, locator.wait_for) inherit this.
        context.set_default_timeout(15000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> navigate
        await page.goto("http://localhost:5173/")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Open Head-to-Head Duel using the visible “INITIATE DUEL” button.
        # INITIATE DUEL arrow_forward button
        elem = page.get_by_role("button", name="INITIATE DUEL arrow_forward")
        await elem.click(timeout=10000)
        
        # -> Continue from the duel setup to the screen where both players can enter their secret targets.
        # PROCEED TO TARGET ENTRY lock button
        elem = page.get_by_role("button", name="PROCEED TO TARGET ENTRY lock")
        await elem.click(timeout=10000)
        
        # -> Enter a valid secret number for Archer Red and inspect the target-entry screen’s next state.
        # Enter secret (1–100)... password field
        elem = page.get_by_role("textbox", name="Enter secret (1–100)")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("42")
        
        # -> Lock Archer Red’s target and pass the device to Archer Blue.
        # LOCK TARGET & PASS DEVICE button
        elem = page.get_by_role("button", name="LOCK TARGET & PASS DEVICE")
        await elem.click(timeout=10000)
        
        # -> Open Archer Blue’s secret target entry using the visible “I AM READY — SET MY TARGET” button.
        # I AM READY — SET MY TARGET button
        elem = page.get_by_role("button", name="I AM READY — SET MY TARGET")
        await elem.click(timeout=10000)
        
        # -> Enter Archer Blue’s secret number in the confidential target field.
        # Enter secret (1–100)... password field
        elem = page.get_by_role("textbox", name="Enter secret (1–100)")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("73")
        
        # -> Lock Archer Blue’s secret and start the duel using “LOCK TARGET & START DUEL.”
        # LOCK TARGET & START DUEL button
        elem = page.get_by_role("button", name="LOCK TARGET & START DUEL")
        await elem.click(timeout=10000)
        
        # -> Click “I AM READY — TAKE SHOT” for Archer Red and inspect the guess-entry screen.
        # I AM READY — TAKE SHOT button
        elem = page.get_by_role("button", name="I AM READY — TAKE SHOT")
        await elem.click(timeout=10000)
        
        # -> Enter 73 as Archer Red’s guess against Archer Blue’s target.
        # Enter guess against opponent's target (1–100)... number field
        elem = page.get_by_placeholder("Enter guess against opponent'")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("73")
        
        # -> Submit Archer Red’s guess with “RELEASE ARROW” and verify the duel result screen reveals both secret numbers and the winner.
        # RELEASE ARROW play_arrow button
        elem = page.get_by_role("button", name="RELEASE ARROW play_arrow")
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> The duel result screen is displayed.
        # Assert-outcome: not verified — the export-time check could not be evaluated
        # Assert: The duel result screen is displayed.
        await expect(page.locator("#root").nth(0)).to_contain_text("VICTORY IN DUEL", timeout=15000), "The duel result screen is displayed."
        
        # --> The result screen identifies Archer Red as victor and reveals both secret targets, 42 and 73.
        # Assert-outcome: not verified — the export-time check could not be evaluated
        # Assert: The result screen reveals the victor and both secret targets.
        await expect(page.locator("#root").nth(0)).to_contain_text("VICTOR Archer Red ( Red ) SOLVED TARGET IN 1 TURNS Archer Red 's SECRET TARGET: 42 Archer Blue 's SECRET TARGET: 73", timeout=15000), "The result screen reveals the victor and both secret targets."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    