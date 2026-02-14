const { test, expect } = require('@playwright/test');

test('AI에이전트 - 일반로그인', async ({ page }) => {
  await page.goto('http://43.200.240.99:50000/login');
  await page.waitForLoadState('networkidle');

  // 탭 클릭 ~ 로그인 클릭 (기존 성공 코드 그대로)
  const tabs = await page.$$('button:has-text("로그인"), .tab, [role="tab"]');
  console.log(`탭 개수: ${tabs.length}`);

  if (tabs.length >= 2) {
    await tabs[1].click();
    console.log('두 번째 탭(일반로그인) 클릭');
  }

  await page.waitForTimeout(2000);

  const testId = 'portal_agent_user';
  const inputs = await page.$$('input:not([type="password"])');
  await inputs[0].fill(testId);
  console.log('ID 입력');

  const pwInputs = await page.$$('input[type="password"]');
  await pwInputs[0].fill('portal_agent_user');
  console.log('PW 입력');

  // ===== 수정된 로그인 버튼 찾기 =====
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await btn.textContent();
    // "로그인"만 있고 탭 아닌 버튼 (type=submit 또는 submit 텍스트)
    if (text && text.trim() === '로그인') {  // 정확히 "로그인"만
      await btn.click();
      console.log('정확한 로그인 버튼 클릭');
      break;
    }
  }

  // ===== 수정된 검증 부분 =====
  await page.waitForTimeout(8000);
  const finalUrl = page.url();
  console.log('최종 URL:', finalUrl);

  expect(finalUrl).toContain('43.200.240.99:50000/');
  await expect(page.locator('body')).toContainText(testId + '님 안녕하세요!');
  
  console.log('✅ 우측상단 환영메시지 확인 → 로그인 완전 성공!');
});
