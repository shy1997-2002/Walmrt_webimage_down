(function() {
    console.log("Walmart Zipper: Collecting URLs...");

    const imageUrls = new Set(); 
    const REQUIRED_PREFIX = "https://i5.walmartimages.com/asr/";

    try {
        const scriptData = document.getElementById('__NEXT_DATA__');
        if (!scriptData) throw new Error("未找到页面核心数据 (__NEXT_DATA__)");

        const jsonData = JSON.parse(scriptData.textContent);

        // 递归查找图片链接
        function findImagesInObject(obj) {
            if (!obj || typeof obj !== 'object') return;
            if (obj.imageInfo && Array.isArray(obj.imageInfo.allImages)) {
                obj.imageInfo.allImages.forEach(img => {
                    if (img.url && img.url.startsWith(REQUIRED_PREFIX)) {
                        let cleanUrl = img.url.split('?')[0];
                        imageUrls.add(cleanUrl);
                    }
                });
            }
            Object.values(obj).forEach(child => {
                if (typeof child === 'object') findImagesInObject(child);
            });
        }
        findImagesInObject(jsonData);

    } catch (e) {
        alert("解析失败: " + e.message);
        return;
    }

    const urlArray = Array.from(imageUrls);
    
    if (urlArray.length > 0) {
        // 获取商品名作为 zip 文件名
        let productTitle = document.title.split(' - ')[0].trim();
        productTitle = productTitle.replace(/[\\/:*?"<>|]/g, "_").substring(0, 50);

        if(confirm(`找到 ${urlArray.length} 张图片。\n准备打包下载为: [ ${productTitle}.zip ]\n是否继续？`)) {
            // 发送给后台，动作为 'download_zip'
            chrome.runtime.sendMessage({
                action: "download_zip",
                urls: urlArray,
                folderName: productTitle
            });
        }
    } else {
        alert("未找到符合要求的 ASR 图片。");
    }
})();