const { test, expect } = require('@playwright/test');

test.describe('일반로그인 → AI 채팅 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 1. 직접 로그인 페이지 접속
    await page.goto('http://43.200.240.99:50000/login');
    await page.waitForLoadState('networkidle');

    // 2. "일반로그인" 탭 클릭 (이미지 기준: 버튼/탭)
    await page.click('text="일반로그인", button:has-text("일반로그인"), .tab-general, #general-login');
    
    // 3. 로그인 입력 (테스트 계정)
    await page.fill('input[placeholder="아이디"]', 'portal_agent_user');
    await page.fill('input[placeholder="비밀번호"]', 'portal_agent_user');
    
    // 4. 로그인 버튼 클릭 (이미지: 검은 "로그인" 버튼)
    await page.click('button:has-text("로그인"), #login-btn, .login-button');
    
    // 5. 로그인 성공 확인 (대시보드 로드)
    await page.waitForURL(/dashboard|home|main/, { timeout: 10000 });
    await expect(page.locator('body')).not.toContainText('로그인');  // 로그인 페이지 벗어남
  });

  test('로그인 성공 → AI 입력창 공지사항 쿼리 → 응답 확인', async ({ page }) => {
    // 1. 대시보드 입력창 찾기 (이미지 기준: 가운데 입력창)
    const inputSelector = 'textarea[placeholder*="무엇이든"], input[placeholder*="입력"], #message-input, .chat-input';
    await page.waitForSelector(inputSelector, { timeout: 15000 });

    // 2. 공지사항 쿼리 입력 → 전송
    await page.fill(inputSelector, '최근 공지사항 알려줘');
    await page.press(inputSelector, 'Enter');

    // 3. AI 응답 대기 (아래 영역)
    const responseSelector = '.response, .chat-message:last-child, .ai-response, #chat-output';
    await page.waitForSelector(responseSelector, { timeout: 45000 });

    // 4. 응답 검증
    const response = page.locator(responseSelector);
    await expect(response).toBeVisible();
    await expect(response).toContainText(/공지|최근|정보/);  // 공지 관련 키워드
    console.log('AI 응답:', await response.textContent());  // 로그 출력
  });
});
