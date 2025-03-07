const puppeteer = require('puppeteer');
const { fork } = require('child_process');

jest.setTimeout(1000000);

describe('Popover Component', () => {
    let browser = null;
    let page = null;
    let server = null;
    const baseUrl = 'http://localhost:9000';

    beforeAll(async () => {
        server = fork(`${__dirname}/e2e.server.js`);
        await new Promise((resolve, reject) => {
            server.on('error', reject);
            server.on('message', (message) => {
                if (message === 'ok') {
                    resolve();
                }
            });
        });

        browser = await puppeteer.launch({
            // headless: false, // Используйте, если хотите видеть GUI
            // slowMo: 250,
            // devtools: true, // Показывать инструменты разработчика
        });
        page = await browser.newPage();
        await page.goto(baseUrl); // Переход на базовый URL
    });

    afterAll(async () => {
        if (browser) {
            await browser.close();
        }
        server.kill();
    });

    test('should not be visible initially', async () => {
        const popoverVisible = await page.evaluate(() => {
            const popover = document.getElementById('popover');
            return popover && (popover.style.display !== 'none' || popover.classList.contains('visible'));
        });
        expect(popoverVisible).toBe(false); // Проверяем, что поповер невидим
    });

    test('should toggle visibility when button is clicked', async () => {
        // Нажимаем на кнопку, чтобы открыть поповер
        await page.click('#popover-btn');
        let popoverVisible = await page.evaluate(() => {
            const popover = document.getElementById('popover');
            return popover && (popover.style.display !== 'none' || popover.classList.contains('visible'));
        });
        expect(popoverVisible).toBe(true); // Поповер должен быть видимым

        // Нажимаем на кнопку снова, чтобы закрыть поповер
        await page.click('#popover-btn');
        popoverVisible = await page.evaluate(() => {
            const popover = document.getElementById('popover');
            return popover && (popover.style.display !== 'none' || popover.classList.contains('visible'));
        });
        expect(popoverVisible).toBe(false); // Поповер должен быть невидим
    });

    test('should close the popover when clicking outside', async () => {
        // Открываем поповер
        await page.click('#popover-btn');
        let popoverVisible = await page.evaluate(() => {
            const popover = document.getElementById('popover');
            return popover && (popover.style.display !== 'none' || popover.classList.contains('visible'));
        });
        expect(popoverVisible).toBe(true); // Поповер должен быть видимым

        // Кликаем вне поповера
        await page.click('body');
        popoverVisible = await page.evaluate(() => {
            const popover = document.getElementById('popover');
            return popover && (popover.style.display !== 'none' || popover.classList.contains('visible'));
        });
        expect(popoverVisible).toBe(false); // Поповер должен закрыться
    });

    test('should reposition the popover on window resize', async () => {
        // Открываем поповер
        await page.click('#popover-btn');
        await new Promise(resolve => setTimeout(resolve, 100)); // Ждем, чтобы поповер успел отобразиться

        const initialPosition = await page.evaluate(() => {
            const popover = document.getElementById('popover');
            return popover ? popover.getBoundingClientRect().top : null; // Сохраняем первоначальную позицию
        });

        // Меняем размер окна
        await page.setViewport({ width: 500, height: 700 });
        await new Promise(resolve => setTimeout(resolve, 100)); // Ждем, чтобы позиционирование обновилось


        const newPosition = await page.evaluate(() => {
            const popover = document.getElementById('popover');
            return popover ? popover.getBoundingClientRect().top : null; // Получаем новую позицию
        });

        expect(newPosition).not.toEqual(initialPosition); // Позиция должна измениться
    });
});