// ==UserScript==
// @name         Tải Ảnh Bìa HD
// @namespace    CoverTool.By.Tui
// @version      1.0
// @description  fix tùm lum tá lả đm mấy con web chống trộm
// @author       Tui
// @icon         https://www.google.com/s2/favicons?sz=64&domain=jjwxc.net
// @match        *://www.jjwxc.net/onebook.php?novelid=*
// @match        *://fanqienovel.com/page/*
// @match        *://www.ruochu.com/book/*
// @match        *://*.tadu.com/book/*
// @match        *://*.tadu.com/quanben/*
// @match        *://chuangshi.qq.com/*
// @match        *://book.qq.com/*
// @match        *://www.17k.com/book/*
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
            GM_download({ url: url, name: filename, saveAs: true, onerror: () => window.open(url, '_blank') });
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

    function handleJJWXC() {
        let img = document.querySelector('img.noveldefaultimage') || document.querySelector('div[itemprop="image"] img');
        if (img) {
            let hdUrl = img.src.replace(/_\d+_\d+(\.[a-z]+)$/i, '$1');
            let novelId = new URLSearchParams(window.location.search).get('novelid') || 'jjwxc';
            createBtn(hdUrl, `jjwxc_${novelId}.jpg`);
        }
    }
    function handleQQ() {
        let match = document.body.innerHTML.match(/https?:\/\/[^"'<>\s]*?wfqqreader[^"'<>\s]*?\/cover\/[^"'<>\s]*?(\.webp|\.jpg|\.png)/i);
        if (match) {
            let rawUrl = match[0].replace(/\\u002F/g, '/');
            if (rawUrl.startsWith('//')) rawUrl = 'https:' + rawUrl;
            let hdUrl = rawUrl.replace(/\/t\d+_/, '/o_');
            let bookId = window.location.href.match(/(\d+)(\.html)?$/)?.[1] || 'qq';
            createBtn(hdUrl, `qq_${bookId}.${hdUrl.split('.').pop()}`);
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
    function handleOthers() {
        const host = window.location.hostname;
        if (host.includes('fanqienovel')) {
             let img = Array.from(document.images).find(i => i.src.includes('/novel-pic/') && i.src.includes('~tplv'));
             if (img) {
                 let match = img.src.match(/\/novel-pic\/(.*?)~/);
                 if (match) createBtn(`https://p6-novel.byteimg.com/origin/novel-pic/${match[1]}`, `fanqie.jpg`);
             }
        } else if (host.includes('17k')) {
            let rawUrl = document.querySelector('meta[property="og:image"]')?.content;
            if (rawUrl) createBtn(rawUrl.split('?')[0].replace(/(\.jpg).*$/i, '$1'), '17k.jpg');
        }
    }
    function main() {
        const host = window.location.hostname;
        if (host.includes('jjwxc.net')) handleJJWXC();
        else if (host.includes('tadu.com')) handleTadu();
        else if (host.includes('qq.com')) handleQQ();
        else if (host.includes('ruochu.com')) handleRuochu();
        else handleOthers();
    }
    setInterval(main, 1000);

})();
