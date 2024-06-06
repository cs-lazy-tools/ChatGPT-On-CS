import ua from 'universal-analytics';

// 这里使用了 Google Analytics 的跟踪 ID，如果不使用，可以直接注释掉相关代码，Mock 掉相关函数
const trackingID = 'UA-XXXXXXXXX-X';
const visitor = ua(trackingID);

export function sendEvent(
  category: string,
  action: string,
  label: string,
  value: string | number,
) {
  visitor.event(category, action, label, value).send();
}

// 预制事件：打开按钮
export function trackButtonClick(buttonName: string) {
  sendEvent('UI Interaction', 'Click', `Button: ${buttonName}`, 1);
}

// 预制事件：多选框
export function trackCheckboxChange(checkboxName: string, value: string[]) {
  sendEvent(
    'UI Interaction',
    'Change',
    `Checkbox: ${checkboxName}`,
    value.join(','),
  );
}

// 预制事件：打开页面
export function trackPageView(pageName: string) {
  sendEvent('Navigation', 'Open', `Page: ${pageName}`, 1);
}
