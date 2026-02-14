const { test, expect } = require('@playwright/test');

test.describe('AI 채팅 사이트 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 사이트 접속 (로컬 서버라 느릴 수 있음)
    await page.goto('http://43.200.240.99:50000/');
    await expect(page).toHaveTitle(/AI/);  // 타이틀 확인 (실제 타이틀 맞춰 조정)
  });

  test('입력창에 공지사항 쿼리 → 정상 AI 응답 확인', async ({ page }) => {
    // 1. 가운데 입력창 찾기 (이미지 기준: 입력 가능한 textarea/input)
    const inputSelector = 'textarea[placeholder*="무엇이든"], input[placeholder*="입력"], #message-input, .chat-input';  // 여러 후보
    await page.waitForSelector(inputSelector, { timeout: 10000 });  // 10초 대기
    await page.fill(inputSelector, '최근 공지사항 알려줘');

    // 2. 입력 후 전송 (Enter 또는 버튼)
    await page.press(inputSelector, 'Enter');  // Enter 키
    // 또는 버튼 클릭: await page.click('button:has-text("전송"), .send-btn');

    // 3. 응답 영역 대기 및 확인 (이미지 기준: 아래쪽 채팅 영역)
    const responseSelector = '.response, .chat-message:last-child, #output, .ai-response';
    await page.waitForSelector(responseSelector, { timeout: 30000 });  // AI 응답 30초 대기

    // 4. 정상 응답 확인 (텍스트 길이/키워드)
    const response = page.locator(responseSelector);
    await expect(response).toBeVisible();
    await expect(response).toContainText('공지');  // "공지" 키워드 포함 (실제 응답 맞춰 변경)
    await expect(response).toHaveText(/^\s{10,}/);  // 10자 이상 응답 (빈 응답 아님)

    // 5. 네트워크 응답 확인 (백엔드 API 호출 성공)
    const responsePromise = page.waitForResponse(/api|chat|response/, { timeout: 30000 });
    await page.press(inputSelector, 'Enter');  // 재입력으로 확인
    const apiResponse = await responsePromise;
    expect(apiResponse.status()).toBeLessThan(400);  // 4xx 에러 아님
  });
});