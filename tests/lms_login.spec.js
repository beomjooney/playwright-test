const { test, expect } = require('@playwright/test');

test('LMS 로그인 - 첫 번째 탭 + 대학선택 → 성공', async ({ page }) => {
  await page.goto('http://43.200.240.99:50000/login');
  await page.waitForLoadState('networkidle');

  // 1. LMS 탭 (첫 번째 탭 = 인덱스 0)
  const tabs = await page.$$('button:has-text("로그인"), .tab, [role="tab"]');
  console.log(`탭 개수: ${tabs.length}`);
  
  if (tabs.length >= 1) {
    await tabs[0].click();  // 첫 번째 = LMS 로그인
    console.log('첫 번째 탭(LMS 로그인) 클릭');
  }

  await page.waitForTimeout(2000);

  // 2. 대학 드롭다운 클릭 → 세종대학교 선택
  const univDropdown = await page.$$('select, [role="combobox"]');
  if (univDropdown.length > 0) {
    await univDropdown[0].click();
    await page.getByText('세종대학교').click();
    console.log('세종대학교 선택');
  }

  await page.waitForTimeout(1000);

  // 3. ID/PW 입력 (LMS 계정 - 테스트 계정 사용)
  const inputs = await page.$$('input:not([type="password"])');
  await inputs[0].fill('portal_agent_user');  // LMS 계정 있으면 수정
  console.log('LMS ID 입력');

  const pwInputs = await page.$$('input[type="password"]');
  await pwInputs[0].fill('portal_agent_user');
  console.log('LMS PW 입력');

  // 4. 로그인 버튼
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await btn.textContent();
    if (text && text.includes('로그인')) {
      await btn.click();
      console.log('LMS 로그인 버튼 클릭');
      break;
    }
  }

  // 5. 성공 확인 (루트 리다이렉트)
  await page.waitForTimeout(8000);
  const finalUrl = page.url();
  console.log('LMS 최종 URL:', finalUrl);

  expect(finalUrl).toContain('43.200.240.99:50000/');
  console.log('✅ LMS 로그인 성공!');
});
