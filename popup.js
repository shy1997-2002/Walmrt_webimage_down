document.getElementById('startBtn').addEventListener('click', async () => {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = "program working...";

  // 获取当前标签页
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // 执行内容脚本
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js']
  }, () => {
    statusDiv.textContent = "program working, please don't close the webpage...";
  });
});