// ==UserScript==
// @name         Tải Ảnh Bìa HD
// @namespace    CoverTool.By.Tui
// @version      1.1
// @description  Phiên bản cập nhật mới bổ sung các web qidian, qimao, qdmm, readnovel, zhongheng, ihuaben, yunqi, shuqi; Các web hongshu, xbanxia, bfaloo, po18 hiện chưa mò ra để tạm đó chờ pb update sau (có tấm ảnh giấu như mèo giấu kít!!)
// @author       Tui
// @icon         https://www.google.com/s2/favicons?sz=64&domain=qidian.com
// @match        *://www.jjwxc.net/onebook.php?novelid=*
// @match        *://fanqienovel.com/page/*
// @match        *://www.ruochu.com/book/*
// @match        *://*.tadu.com/book/*
// @match        *://*.tadu.com/quanben/*
// @match        *://chuangshi.qq.com/*
// @match        *://book.qq.com/*
// @match        *://www.17k.com/book/*
// @match        *://*.qidian.com/book/*
// @match        *://*.qimao.com/shuku/*
// @match        *://*.qimao.com/book/*
// @match        *://*.qdmm.com/book/*
// @match        *://*.readnovel.com/book/*
// @match        *://*.xbanxia.cc/*
// @match        *://www.xbanxia.cc/books/*
// @match        *://*.zongheng.com/detail/*
// @match        *://*.ihuaben.com/book/*
// @match        *://*.ihuaben.com/xiazai/*
// @match        *://*.hongshu.com/book/*
// @match        *://*.hongshu.com/book.html?*
// @match        *://m.hongshu.com/book/*
// @match        *://yunqi.qq.com/detail/*
// @match        *://yunqi.qq.com/detail.html?*
// @match        *://b.faloo.com/*.html*
// @match        *://*.faloo.com/f/*.html*
// @match        *://*.shuqi.com/book/*
// @match        *://*.po18.tw/books/*
// @grant        GM_download
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @license      MIT
// @updateURL    https://raw.githubusercontent.com/hikikomori1870-bit/DownloadHD-novel-covers/main/tai-anh-bia.user.js
// @downloadURL  https://raw.githubusercontent.com/hikikomori1870-bit/DownloadHD-novel-covers/main/tai-anh-bia.user.js
// ==/UserScript==

(function() {
    'use strict';
    GM_addStyle(`
        @keyframes gradientMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        @keyframes sparkle {
            0% { opacity: 0.6; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.05); text-shadow: 0 0 10px #fff, 0 0 20px #ffb6c1; }
            100% { opacity: 0.6; transform: scale(1); }
        }
        #hd-dl-btn {
            position: fixed;
            bottom: 120px;
            right: 20px;
            z-index: 2147483647;
            background: linear-gradient(-45deg, #ffc0cb, #e0c3fc, #8ec5fc, #fbc2eb);
            background-size: 300% 300%;
            animation: gradientMove 5s ease infinite, sparkle 2s infinite;
            color: white;
            border: 2px solid rgba(255, 255, 255, 0.8);
            padding: 12px 25px;
            font-size: 15px;
            font-weight: bold;
            cursor: pointer;
            border-radius: 50px;
            box-shadow: 0 10px 20px rgba(255, 182, 193, 0.5), inset 0 0 10px rgba(255,255,255,0.5);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 1px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        #hd-dl-btn:hover {
            transform: translateY(-5px) scale(1.1);
            box-shadow: 0 15px 25px rgba(142, 197, 252, 0.6);
            letter-spacing: 2px;
        }
        #hd-dl-btn:active {
            transform: scale(0.95);
        }
        #hd-dl-btn::before {
            content: '✨';
        }
    `);

    const log = (msg) => console.log(`[CoverTool] ${msg}`);
    function createBtn(url, filename) {
        if (!url) return;
        let btn = document.getElementById('hd-dl-btn');
        if (!btn) {
            btn = document.createElement('button');
            btn.id = 'hd-dl-btn';
            document.body.appendChild(btn);
        }
        btn.innerHTML = '<span>Tải Bìa HD</span>';
        btn.onclick = (e) => {
            e.preventDefault();
            let finalUrl = url.startsWith('//') ? 'https:' + url : url;
            GM_download({ url: finalUrl, name: filename, saveAs: true, onerror: () => window.open(finalUrl, '_blank') });
        };
    }
    function handleTadu() {
        let rawUrl = document.querySelector('meta[property="og:image"]')?.content;
        if (!rawUrl) {
            let img = document.querySelector('.bookCover .bookImg img');
            if (img) rawUrl = img.getAttribute('data-src') || img.src;
        }
        if (rawUrl) {
            let cleanUrl = rawUrl.split('?')[0];
            let hdUrl = cleanUrl.replace(/(_[a-zA-Z0-9]+)+(\.[a-zA-Z]+)$/, '$2');
            let bookId = window.location.href.match(/book\/(\d+)/)?.[1] || 'tadu';
            createBtn(hdUrl, `tadu_${bookId}.${hdUrl.split('.').pop()}`);
        }
    }
    function handleQdmm() {
        let img = document.querySelector('#bookImg img');
        let rawUrl = img ? (img.getAttribute('data-src') || img.src) : document.querySelector('meta[property="og:image"]')?.content;
        if (rawUrl) {
            let hdUrl = rawUrl.split('?')[0].replace(/\/\d+(\.webp)?(\.jpg)?$/, '/600');
            let bookId = window.location.href.match(/book\/(\d+)/)?.[1] || 'qdmm';
            createBtn(hdUrl, `qdmm_${bookId}.jpg`);
        }
    }
    function handleReadNovel() {
        let img = document.querySelector('#bookImg img');
        let rawUrl = img ? (img.getAttribute('data-src') || img.src) : document.querySelector('meta[property="og:image"]')?.content;
        if (rawUrl) {
            let hdUrl = rawUrl.split('?')[0].replace(/\/\d+(\.webp)?(\.jpg)?$/, '/600');
            let bookId = window.location.href.match(/book\/(\d+)/)?.[1] || 'readnovel';
            createBtn(hdUrl, `readnovel_${bookId}.jpg`);
        }
    }
    function handleQidian() {
        let img = document.querySelector('#bookImg img') || document.querySelector('.book-img img');
        let rawUrl = img ? (img.getAttribute('data-src') || img.src) : document.querySelector('meta[property="og:image"]')?.content;
        if (rawUrl) {
            let hdUrl = rawUrl.split('?')[0].replace(/\/\d+(\.[a-z0-9]+)?$/i, '/0');
            let bookId = window.location.href.match(/book\/(\d+)/)?.[1] || 'qidian';
            createBtn(hdUrl, `qidian_${bookId}.jpg`);
        }
    }
    function handleXbanxia() {
        let imgEl = document.querySelector('.book-img img');
        let rawUrl = document.querySelector('meta[property="og:image"]')?.content || imgEl?.getAttribute('data-original') || imgEl?.src;
        if (rawUrl && !rawUrl.includes('nocover.jpg')) {
            let hdUrl = rawUrl.split('?')[0].replace('http://', 'https://');
            let bookId = window.location.href.match(/(\d+)\.html/)?.[1] || 'xbanxia';
            createBtn(hdUrl, `xbanxia_${bookId}.jpg`);
        }
    }
    function handleZongheng() {
        let rawUrl = document.querySelector('meta[name="og:image"]')?.content || document.querySelector('meta[property="og:image"]')?.content || document.querySelector('.book-info--coverImage-img')?.src;
        if (rawUrl) {
            let bookId = window.location.href.match(/book\/(\d+)/)?.[1] || 'zongheng';
            createBtn(rawUrl.split('?')[0], `zongheng_${bookId}.jpg`);
        }
    }
    function handleIhuaben() {
        let rawUrl = document.querySelector('meta[property="og:image"]')?.content || document.querySelector('.book-cover-box img')?.src || document.querySelector('.cover-box img')?.src;
        if (rawUrl) {
            let hdUrl = rawUrl.split('?')[0].replace(/(\.(jpg|jpeg|png|webp)).*$/i, '$1')
                              .replace('staticcn.ihuaben.com', 'pic.ihuaben.com')
                              .replace('http://', 'https://');
            let bookId = window.location.href.match(/(\d+)\.html/)?.[1] || 'ihuaben';
            createBtn(hdUrl, `ihuaben_${bookId}.jpg`);
        }
    }
    function handleHongshu() {
        let rawUrl = document.querySelector('meta[property="og:image"]')?.content || document.querySelector('.book-cover img')?.src || document.querySelector('.book-img img')?.src;
        if (rawUrl) {
            let cleanUrl = rawUrl.split('?')[0];
            let hdUrl = cleanUrl.replace(/(_\d+|_[sm])(\.(jpg|jpeg|png|webp))$/i, '_large$2');
            if (!hdUrl.includes('_large')) hdUrl = hdUrl.replace(/(\d+)(\.(jpg|jpeg|png|webp))$/i, '$1_large$2');
            hdUrl = hdUrl.replace('http:', 'https:');
            let bookId = window.location.href.match(/book\/(\d+)/)?.[1] || new URLSearchParams(window.location.search).get('bid') || 'hongshu';
            createBtn(hdUrl, `hongshu_${bookId}.jpg`);
        }
    }
    function handleYunqi() {
        let rawUrl = document.querySelector('meta[property="og:image"]')?.content || document.querySelector('.book-cover img')?.src;
        if (rawUrl) {
            let hdUrl = rawUrl.split('?')[0].replace(/\/(t\d+|t|s)_/i, '/o_').replace('http:', 'https:');
            let bookId = window.location.href.match(/detail\/(\d+)/)?.[1] || 'yunqi';
            createBtn(hdUrl, `yunqi_${bookId}.jpg`);
        }
    }
    function handleQQ() {
        let match = document.body.innerHTML.match(/https?:\/\/[^"'<>\s]*?wfqqreader[^"'<>\s]*?\/cover\/[^"'<>\s]*?(\.webp|\.jpg|\.png)/i);
        if (match) {
            let rawUrl = match[0].replace(/\\u002F/g, '/');
            let hdUrl = rawUrl.replace(/\/t\d+_/, '/o_');
            let bookId = window.location.href.match(/(\d+)(\.html)?$/)?.[1] || 'qq';
            createBtn(hdUrl, `qq_${bookId}.${hdUrl.split('.').pop()}`);
        }
    }
    function handleShuqi() {
        let imgEl = document.querySelector('.view img.cover') || document.querySelector('.infoarea .view img') || document.querySelector('.book-info img');
        let rawUrl = document.querySelector('meta[property="og:image"]')?.content || imgEl?.src || imgEl?.getAttribute('data-src');
        if (rawUrl && !rawUrl.includes('base64')) {
            let hdUrl = rawUrl.split('?')[0].replace('http:', 'https:');
            let bookId = window.location.href.match(/book\/(\d+)/)?.[1] || 'shuqi';
            createBtn(hdUrl, `shuqi_${bookId}.jpg`);
        }
    }
    function handlePO18() {
        let rawUrl = document.querySelector('meta[property="og:image"]')?.content;
        if (!rawUrl) {
            let img = document.querySelector('.book_cover img');
            if (img) rawUrl = img.src;
        }
        if (rawUrl) {
            let hdUrl = rawUrl.split('?')[0].replace('/small/', '/large/');
            let bookId = window.location.href.match(/books\/(\d+)/)?.[1] || 'po18';
            createBtn(hdUrl, `po18_${bookId}.jpg`);
        }
    }
    function handleQimao() {
        let raw = document.querySelector('meta[property="og:image"]')?.content || document.querySelector('.book-info .cover img')?.src || document.querySelector('img[src*="qimao.com/bookimg"]')?.src;
        if (raw) {
            let clean = raw.split('?')[0];
            let hdUrl = clean.replace(/_\d+x\d+(\.[a-z]+)$/i, '$1');
            let bookId = window.location.href.match(/(\d+)\/?$/)?.[1] || 'qimao';
            createBtn(hdUrl, `qimao_${bookId}.jpg`);
        }
    }
    function handleJJWXC() {
        let img = document.querySelector('img.noveldefaultimage') || document.querySelector('div[itemprop="image"] img');
        if (img) {
            let hdUrl = img.src.replace(/_\d+_\d+(\.[a-z]+)$/i, '$1');
            let novelId = new URLSearchParams(window.location.search).get('novelid') || 'jjwxc';
            createBtn(hdUrl, `jjwxc_${novelId}.jpg`);
        }
    }
    function handleRuochu() {
        let rawUrl = document.querySelector('meta[property="og:image"]')?.content;
        if (!rawUrl) {
            let img = Array.from(document.images).find(i => i.src.includes('heiyanimg') && i.src.includes('/book/'));
            if (img) rawUrl = img.src;
        }
        if (rawUrl) {
            let hdUrl = rawUrl.split('?')[0].replace(/(\.jpg).*$/i, '$1');
            let id = window.location.href.match(/book\/(\d+)/)?.[1] || 'ruochu';
            createBtn(hdUrl, `ruochu_${id}.jpg`);
        }
    }
    function handleFanqie() {
        let img = Array.from(document.images).find(i => i.src.includes('/novel-pic/') && i.src.includes('~tplv'));
        if (img) {
            let match = img.src.match(/\/novel-pic\/(.*?)~/);
            if (match) createBtn(`https://p6-novel.byteimg.com/origin/novel-pic/${match[1]}`, `fanqie_${match[1]}.jpg`);
        }
    }
    function handle17k() {
        let rawUrl = document.querySelector('meta[property="og:image"]')?.content;
        if (rawUrl) {
            let bookId = window.location.href.match(/book\/(\d+)/)?.[1] || '17k';
            createBtn(rawUrl.split('?')[0].replace(/(\.jpg).*$/i, '$1'), `17k_${bookId}.jpg`);
        }
    }
    const siteHandlers = {
        'jjwxc.net': handleJJWXC,
        'tadu.com': handleTadu,
        'yunqi.qq.com': handleYunqi,
        'chuangshi.qq.com': handleQQ,
        'book.qq.com': handleQQ,
        'ruochu.com': handleRuochu,
        'qidian.com': handleQidian,
        'qdmm.com': handleQdmm,
        'readnovel.com': handleReadNovel,
        'po18.tw': handlePO18,
        'qimao.com': handleQimao,
        'xbanxia.cc': handleXbanxia,
        'zongheng.com': handleZongheng,
        'ihuaben.com': handleIhuaben,
        'hongshu.com': handleHongshu,
        'shuqi.com': handleShuqi,
        'fanqienovel.com': handleFanqie,
        '17k.com': handle17k
    };
    let lastUrl = '';
    function main() {
        const currentUrl = window.location.href;
        const btn = document.getElementById('hd-dl-btn');
        if (currentUrl === lastUrl && btn) return;
        const host = window.location.hostname;
        const handlerKey = Object.keys(siteHandlers).find(key => host.includes(key));
        if (handlerKey) {
            siteHandlers[handlerKey]();
            lastUrl = currentUrl;
        }
    }
    setInterval(main, 1500);
})();
