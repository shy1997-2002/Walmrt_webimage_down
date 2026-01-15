// 1. 引入 JSZip 库 (必须确保 jszip.min.js 在同级目录)
importScripts('jszip.min.js');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "download_zip") {
    
    const zipName = request.folderName || "walmart_images";
    const urls = request.urls;
    
    // 创建 JSZip 实例
    const zip = new JSZip();
    
    // 创建一个文件夹 (可选，如果你想压缩包里还有一层文件夹)
    const imgFolder = zip.folder(zipName);

    console.log(`开始打包 ${urls.length} 张图片...`);

    // 2. 并行下载所有图片
    // 使用 Promise.all 等待所有图片下载完成
    const downloadPromises = urls.map((url, index) => {
      return fetch(url)
        .then(response => {
            if (!response.ok) throw new Error("Network error");
            return response.blob(); // 获取图片的二进制数据
        })
        .then(blob => {
            // 生成文件名: image_1.jpg
            let ext = url.split('.').pop().split('?')[0] || "jpg";
            if(ext.length > 4) ext = "jpg";
            
            const filename = `image_${index + 1}.${ext}`;
            
            // 将文件添加到 ZIP 包中
            imgFolder.file(filename, blob);
        })
        .catch(err => console.error("下载失败:", url, err));
    });

    // 3. 所有图片添加完毕后，生成 ZIP 并下载
    Promise.all(downloadPromises).then(() => {
        console.log("所有图片下载完毕，正在压缩...");
        
        zip.generateAsync({type: "base64"}) // 生成 base64 格式
        .then(function(content) {
            
            // 构建 Data URL
            const zipUrl = "data:application/zip;base64," + content;
            
            // 触发下载
            chrome.downloads.download({
                url: zipUrl,
                filename: `${zipName}.zip`,
                conflictAction: "uniquify"
            });
            
            console.log("ZIP 下载已触发！");
        });
    });
  }
});