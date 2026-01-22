// ==UserScript==
// @name         Tải Ảnh Bìa HD
// @namespace    CoverTool.By.Tui
// @version      2.0
// @description  Pigupdate, cập nhật thêm 1 lô web mới cụ thể là 12 web
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
// @match        *://reader.novel.qq.com/detail/*
// @match        *://read.douban.com/column/*
// @match        *://read.douban.com/ebook/*
// @match        *://*.xxsy.net/book/*
// @match        *://wenxue.iqiyi.com/book/*
// @match        *://*.hanwujinian.com/book/*
// @match        *://*.gongzicp.com/novel-*
// @match        *://*.yuedu.163.com/source/*
// @match        *://www.youdubook.com/bookdetail/*
// @match        *://*.lcread.com/bookpage/*
// @match        *://book.sfacg.com/Novel/*
// @match        *://www.shubl.com/book/book_detail/*
// @match        *://www.myrics.com/novels/*
// @grant        GM_download
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @license      MIT
// @updateURL    https://raw.githubusercontent.com/hikikomori1870-bit/DownloadHD-novel-covers/main/tai-anh-bia.user.js
// @downloadURL  https://raw.githubusercontent.com/hikikomori1870-bit/DownloadHD-novel-covers/main/tai-anh-bia.user.js
// ==/UserScript==

(function () {
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
      bottom: 160px;
      right: 20px;
      z-index: 2147483647;
      background: linear-gradient(-45deg, #ffc0cb, #e0c3fc, #8ec5fc, #fbc2eb);
      background-size: 300% 300%;
      animation: gradientMove 5s ease infinite, sparkle 2s infinite;
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.8);
      padding: 12px 12px;
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
      user-select: none;
      -webkit-user-select: none;
      touch-action: none;
    }
    #hd-dl-btn:hover {
      transform: translateY(-5px) scale(1.1);
      box-shadow: 0 15px 25px rgba(142, 197, 252, 0.6);
      letter-spacing: 2px;
    }
    #hd-dl-btn:active { transform: scale(0.95); }
    #hd-dl-btn.dragging {
      transition: none !important;
      cursor: grabbing !important;
      opacity: 0.95;
      transform: none !important;
    }
  `);
  const POS_KEY_X = 'CoverTool_btnX';
  const POS_KEY_Y = 'CoverTool_btnY';
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  function applySavedPosition(btn) {
    const x = GM_getValue(POS_KEY_X, null);
    const y = GM_getValue(POS_KEY_Y, null);
    if (typeof x === 'number' && typeof y === 'number') {
      btn.style.right = 'auto';
      btn.style.bottom = 'auto';
      btn.style.left = `${x}px`;
      btn.style.top = `${y}px`;
      requestAnimationFrame(() => {
        const rect = btn.getBoundingClientRect();
        const nx = clamp(rect.left, 0, Math.max(0, window.innerWidth - rect.width));
        const ny = clamp(rect.top, 0, Math.max(0, window.innerHeight - rect.height));
        btn.style.left = `${nx}px`;
        btn.style.top = `${ny}px`;
        GM_setValue(POS_KEY_X, nx);
        GM_setValue(POS_KEY_Y, ny);
      });
    }
  }
  function initDraggable(btn) {
    if (btn.dataset.dragInit === '1') return;
    btn.dataset.dragInit = '1';
    applySavedPosition(btn);
    let dragging = false;
    let pressTimer = null;
    let pointerId = null;
    let startX = 0, startY = 0;
    let startLeft = 0, startTop = 0;
    const LONG_PRESS_MS = 220;
    const MOVE_THRESHOLD = 3;
    const toLeftTopIfNeeded = () => {
      const rect = btn.getBoundingClientRect();
      btn.style.right = 'auto';
      btn.style.bottom = 'auto';
      btn.style.left = `${rect.left}px`;
      btn.style.top = `${rect.top}px`;
      return rect;
    };
    const onPointerDown = (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      pointerId = e.pointerId;
      btn.setPointerCapture(pointerId);
      startX = e.clientX;
      startY = e.clientY;
      const rect = toLeftTopIfNeeded();
      startLeft = rect.left;
      startTop = rect.top;

      dragging = false;
      pressTimer = window.setTimeout(() => {
        dragging = true;
        btn.classList.add('dragging');
      }, LONG_PRESS_MS);
    };
    const onPointerMove = (e) => {
      if (pointerId == null || e.pointerId !== pointerId) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (!dragging && (Math.abs(dx) > MOVE_THRESHOLD || Math.abs(dy) > MOVE_THRESHOLD)) {
        window.clearTimeout(pressTimer);
        pressTimer = null;
        dragging = true;
        btn.classList.add('dragging');
      }
      if (!dragging) return;
      const rect = btn.getBoundingClientRect();
      const newLeft = clamp(startLeft + dx, 0, Math.max(0, window.innerWidth - rect.width));
      const newTop = clamp(startTop + dy, 0, Math.max(0, window.innerHeight - rect.height));
      btn.style.left = `${newLeft}px`;
      btn.style.top = `${newTop}px`;
      e.preventDefault();
      e.stopPropagation();
    };
    const onPointerUp = (e) => {
      if (pointerId == null || e.pointerId !== pointerId) return;
      window.clearTimeout(pressTimer);
      pressTimer = null;
      if (dragging) {
        const rect = btn.getBoundingClientRect();
        const x = clamp(rect.left, 0, Math.max(0, window.innerWidth - rect.width));
        const y = clamp(rect.top, 0, Math.max(0, window.innerHeight - rect.height));
        GM_setValue(POS_KEY_X, x);
        GM_setValue(POS_KEY_Y, y);
        btn.dataset.blockClickOnce = '1';
        setTimeout(() => (btn.dataset.blockClickOnce = '0'), 0);
      }
      dragging = false;
      btn.classList.remove('dragging');
      try { btn.releasePointerCapture(pointerId); } catch (_) {}
      pointerId = null;
    };
    btn.addEventListener('dblclick', (e) => {
      e.preventDefault();
      GM_setValue(POS_KEY_X, null);
      GM_setValue(POS_KEY_Y, null);
      btn.style.left = '';
      btn.style.top = '';
      btn.style.right = '20px';
      btn.style.bottom = '160px';
    });
    window.addEventListener('resize', () => {
      const x = GM_getValue(POS_KEY_X, null);
      const y = GM_getValue(POS_KEY_Y, null);
      if (typeof x !== 'number' || typeof y !== 'number') return;
      const rect = btn.getBoundingClientRect();
      const nx = clamp(rect.left, 0, Math.max(0, window.innerWidth - rect.width));
      const ny = clamp(rect.top, 0, Math.max(0, window.innerHeight - rect.height));
      btn.style.left = `${nx}px`;
      btn.style.top = `${ny}px`;
      GM_setValue(POS_KEY_X, nx);
      GM_setValue(POS_KEY_Y, ny);
    });
    btn.addEventListener('pointerdown', onPointerDown, { passive: false });
    btn.addEventListener('pointermove', onPointerMove, { passive: false });
    btn.addEventListener('pointerup', onPointerUp, { passive: false });
    btn.addEventListener('pointercancel', onPointerUp, { passive: false });
  }
  const log = (msg) => console.log(`[CoverTool] ${msg}`);
  function createBtn(url, filename) {
    if (!url) return;
    let btn = document.getElementById('hd-dl-btn');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'hd-dl-btn';
      document.body.appendChild(btn);
      initDraggable(btn);
      btn.addEventListener('click', (e) => {
        if (btn.dataset.blockClickOnce === '1') {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        const finalUrl = (btn.dataset.dlUrl || '').startsWith('//') ? 'https:' + btn.dataset.dlUrl : (btn.dataset.dlUrl || '');
        const name = btn.dataset.dlName || 'cover.jpg';
        if (!finalUrl) return;
        e.preventDefault();
        GM_download({
          url: finalUrl,
          name,
          saveAs: true,
          onerror: () => window.open(finalUrl, '_blank')
        });
      }, true);
    }
    btn.innerHTML = '<span>📩</span>';
    btn.dataset.dlUrl = url;
    btn.dataset.dlName = filename;
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
        let bookId = window.location.href.match(/book\/(\d+)/)?.[1] ||
                     new URLSearchParams(window.location.search).get('bid');
        if (!bookId) return;
        const isValidImage = (url) => {
            if (!url) return false;
            if (url.includes('nocover') || url.includes('default')) return false;
            return url.includes(bookId);
        };
        let candidateUrl = document.querySelector('meta[property="og:image"]')?.content;
        if (!isValidImage(candidateUrl)) {
            let imgEl = Array.from(document.querySelectorAll('.book-info img, .h5-detail-info img, .book-cover img')).find(img => {
                let src = img.getAttribute('data-src') || img.src;
                return isValidImage(src);
            });
            if (imgEl) candidateUrl = imgEl.getAttribute('data-src') || imgEl.src;
        }
        if (isValidImage(candidateUrl)) {
            let cleanUrl = candidateUrl.split('?')[0];
            let hdUrl = cleanUrl.replace(/(_large|_[sm]|_\d+|_\d+x\d+)(\.(jpg|jpeg|png|webp))$/i, '$2');
            if (hdUrl.startsWith('//')) hdUrl = 'https:' + hdUrl;
            hdUrl = hdUrl.replace('http:', 'https:');
            console.log('[CoverTool] Hongshu Valid HD:', hdUrl);
            createBtn(hdUrl, `hongshu_${bookId}.jpg`);
        } else {
            console.log('[CoverTool] Hongshu: Không tìm thấy ảnh bìa hợp lệ (Chỉ có ảnh mặc định).');
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
    function handleReaderNovelQQ() {
        let rawUrl = document.querySelector('meta[property="og:image"]')?.content ||
                     document.querySelector('.book-cover img')?.src ||
                     document.querySelector('.cover img')?.src ||
                     document.querySelector('.book-img img')?.src;
        if (rawUrl) {
            let cleanUrl = rawUrl.split('?')[0];
            let hdUrl = cleanUrl.replace(/\/(t\d+|t|s|m)_/i, '/o_');
            if (hdUrl.startsWith('//')) hdUrl = 'https:' + hdUrl;
            hdUrl = hdUrl.replace('http:', 'https:');
            let bookId = window.location.href.match(/detail\/(\d+)/)?.[1] || 'reader_qq';
            console.log('[CoverTool] Reader QQ HD:', hdUrl);
            createBtn(hdUrl, `reader_qq_${bookId}.jpg`);
        }
    }
    function handleDoubanRead() {
        let rawUrl = document.querySelector('meta[property="og:image"]')?.content ||
                     document.querySelector('.banner-cover img')?.src ||
                     document.querySelector('.cover img')?.src;
        if (rawUrl) {
            let cleanUrl = rawUrl.split('?')[0];
            let hdUrl = cleanUrl.replace('/normal/', '/retina/');
            if (hdUrl.startsWith('//')) hdUrl = 'https:' + hdUrl;
            hdUrl = hdUrl.replace('http:', 'https:');
            let bookId = window.location.href.match(/(column|ebook)\/(\d+)/)?.[2] || 'douban';
            createBtn(hdUrl, `douban_${bookId}.jpg`);
        }
    }
    function handleXxsy() {
        let metaImg = document.querySelector('meta[property="og:image"]')?.content;
        let imgEl = document.querySelector('#bookImg img') ||
                    document.querySelector('.book-cover img') ||
                    document.querySelector('.book-img-box img') ||
                    document.querySelector('img[src*="xxsy.net/cover/"]') ||
                    document.querySelector('img[src*="qpic.cn/qdbimg/"]');
        let rawUrl = metaImg || imgEl?.getAttribute('data-src') || imgEl?.src;
        if (rawUrl && !rawUrl.includes('base64')) {
            let hdUrl = rawUrl.split('?')[0].replace(/\/\d+(\.[a-z]+)?$/i, '/600');
            if (hdUrl.startsWith('//')) hdUrl = 'https:' + hdUrl;
            hdUrl = hdUrl.replace('http:', 'https:');
            let bookId = window.location.href.match(/book\/(\d+)/)?.[1] || 'xxsy';
            console.log('[CoverTool] XXSY Detected:', hdUrl);
            createBtn(hdUrl, `xxsy_${bookId}.jpg`);
        }
    }
    function handleIqiyi() {
        let imgEl = document.querySelector('.bookBigCover img') ||
                    document.querySelector('.mod-book-cover img') ||
                    document.querySelector('.bookDrawerCover img');
        if (imgEl) {
            let rawUrl = imgEl.src;
            let hdUrl = rawUrl.split('?')[0];
            if (hdUrl.startsWith('//')) hdUrl = 'https:' + hdUrl;
            hdUrl = hdUrl.replace('http:', 'https:');
            let bookId = window.location.href.match(/detail-([a-zA-Z0-9]+)/)?.[1] || 'iqiyi';
            console.log('[CoverTool] iQiyi Link:', hdUrl);
            createBtn(hdUrl, `iqiyi_${bookId}.jpg`);
        }
    }
    function handleHanwujinian() {
        let rawUrl = document.querySelector('meta[property="og:image"]')?.content ||
                     document.querySelector('.book-img img')?.src ||
                     document.querySelector('.detail-img img')?.src;
        if (rawUrl) {
            let hdUrl = rawUrl.split('?')[0];
            if (hdUrl.startsWith('//')) hdUrl = 'https:' + hdUrl;
            hdUrl = hdUrl.replace('http:', 'https:');
            let bookId = window.location.href.match(/book\/(\d+)/)?.[1] || 'hanwujinian';
            createBtn(hdUrl, `hanwujinian_${bookId}.jpg`);
        }
    }
    function handleGongzicp() {
        let imgEl = document.querySelector('.novel_info_cover img') ||
                    document.querySelector('.novel-cover img') ||
                    document.querySelector('.novel_cover img') ||
                    document.querySelector('.header-cover img');
        if (!imgEl) {
            imgEl = Array.from(document.images).find(img =>
                (img.src.includes('file.gongzicp.com') || img.src.includes('oss')) &&
                img.width > 100
            );
        }
        let rawUrl = document.querySelector('meta[property="og:image"]')?.content || imgEl?.src;
        if (rawUrl) {
            let hdUrl = rawUrl.split('?')[0].split('@')[0];
            if (hdUrl.startsWith('//')) hdUrl = 'https:' + hdUrl;
            hdUrl = hdUrl.replace('http:', 'https:');
            let bookId = window.location.href.match(/novel-(\d+)/)?.[1] || 'gongzicp';
            createBtn(hdUrl, `gongzicp_${bookId}.jpg`);
        }
    }
    function handleYuedu163() {
    let rawUrl = '';
    rawUrl = document.querySelector('meta[property="og:image"]')?.content;
    if (!rawUrl) {
      const selectors = [
        '.m-bookintro img',
        '.m-bookcard-cover img',
        '.j-book-cover img',
        '.book-cover img',
        '.cover img'
      ];
      for (let sel of selectors) {
        let img = document.querySelector(sel);
        if (img) {
          rawUrl = img.src || img.getAttribute('data-src');
          break;
        }
      }
    }
    if (!rawUrl) {
      let imgs = Array.from(document.querySelectorAll('img'));
      let target = imgs.find(i =>
        i.src &&
        i.src.includes('nosdn.127.net') &&
        !i.src.includes('avatar') &&
        (i.naturalWidth > 100 || i.width > 100)
      );
      if (target) rawUrl = target.src;
    }
    if (rawUrl) {
      let hdUrl = rawUrl.split('?')[0];
      if (hdUrl.startsWith('//')) hdUrl = 'https:' + hdUrl;
      hdUrl = hdUrl.replace('http:', 'https:');
      let bookId = window.location.href.match(/source\/([a-zA-Z0-9_]+)/)?.[1] || '163_unknown';
      console.log('[CoverTool] 163 URL found:', hdUrl);
      createBtn(hdUrl, `163_${bookId}.jpg`);
    }
  }
    function handleYoudubook() {
    console.log('[CoverTool] Đang quét ảnh Youdubook...');
    let img = Array.from(document.querySelectorAll('img')).find(i => {
       let src = i.src || i.getAttribute('data-src') || '';
       return src.includes('oss.xrzww.com') &&
              !src.includes('mini') &&
              !src.includes('logo') &&
              (i.width > 100 || i.naturalWidth > 100 || i.clientHeight > 150);
    });
    if (img) {
      let rawUrl = img.src || img.getAttribute('data-src');
      console.log('[CoverTool] Đã tìm thấy ảnh:', rawUrl);
      let hdUrl = rawUrl.split('?')[0];
      if (hdUrl.startsWith('http:')) hdUrl = hdUrl.replace('http:', 'https:');
      let bookId = window.location.href.match(/bookdetail\/(\d+)/)?.[1] || 'youdubook';
      createBtn(hdUrl, `youdubook_${bookId}.jpg`);
    }
  }
    function handleLcread() {
    let img = document.querySelector('.brc img');
    if (!img) {
      img = document.querySelector('img[src*="pic.lc1001.com/pic/cover"]');
    }
    if (img) {
      let hdUrl = img.src;
      if (hdUrl.startsWith('//')) hdUrl = 'https:' + hdUrl;
      hdUrl = hdUrl.replace('http:', 'https:');
      console.log('[CoverTool] Lcread Link:', hdUrl);
      let bookId = window.location.href.match(/bookpage\/(\d+)/)?.[1] || 'lcread';

      createBtn(hdUrl, `lcread_${bookId}.jpg`);
    }
  }
    function handleSfacg() {
    let img = document.querySelector('.summary-pic img');
    let rawUrl = img ? img.src : document.querySelector('meta[property="og:image"]')?.content;
    if (rawUrl) {
      let hdUrl = rawUrl.split('?')[0];
      if (hdUrl.startsWith('//')) hdUrl = 'https:' + hdUrl;
      hdUrl = hdUrl.replace('http:', 'https:');
      console.log('[CoverTool] SFACG URL:', hdUrl);
      let bookId = window.location.href.match(/Novel\/(\d+)/)?.[1] || 'sfacg';
      createBtn(hdUrl, `sfacg_${bookId}.jpg`);
    }
  }
    function handleShubl() {
    console.log('[CoverTool] Đang chờ ảnh Shubl hiện ra...');
    let attempts = 0;
    const maxAttempts = 30;
    const checkLoop = setInterval(() => {
      attempts++;
      let rawUrl = '';
      rawUrl = document.querySelector('meta[property="og:image"]')?.content;
      if (!rawUrl) {
        let img = Array.from(document.querySelectorAll('img')).find(i => {
           let src = i.src || i.getAttribute('data-src') || '';
           return src && (src.includes('imageView') || (i.width > 120 && i.height > 150));
        });
        if (img) rawUrl = img.src || img.getAttribute('data-src');
      }
      if (rawUrl) {
        clearInterval(checkLoop);
        let hdUrl = rawUrl.split('?')[0];
        if (hdUrl.startsWith('//')) hdUrl = 'https:' + hdUrl;
        hdUrl = hdUrl.replace('http:', 'https:');
        console.log('[CoverTool] Shubl Found:', hdUrl);
        let bookId = window.location.href.match(/book_detail\/(\d+)/)?.[1] || 'shubl';
        createBtn(hdUrl, `shubl_${bookId}.jpg`);
      }
      if (attempts >= maxAttempts) {
        clearInterval(checkLoop);
      }
    }, 1000);
  }
    function handleMyrics() {
    const processAndCreate = (src) => {
      if (!src) return false;
      let hdUrl = src.split('?')[0];
      if (hdUrl.startsWith('//')) hdUrl = 'https:' + hdUrl;
      hdUrl = hdUrl.replace('http:', 'https:');
      let bookId = window.location.href.match(/novels\/(\d+)/)?.[1] || 'myrics';
      console.log('[CoverTool] Myrics Captured:', hdUrl);
      createBtn(hdUrl, `myrics_${bookId}.jpg`);
      return true;
    };
    let meta = document.querySelector('meta[property="og:image"]');
    if (meta && processAndCreate(meta.content)) return;
    let existImg = document.querySelector('.novel-cover img');
    if (existImg && processAndCreate(existImg.src)) return;
    console.log('[CoverTool] Kích hoạt chế độ phục kích (Observer)...');
    const observer = new MutationObserver((mutations, obs) => {
      let targetImg = document.querySelector('.novel-cover img') ||
                      document.querySelector('img[src*="uploads/novels"]');
      if (targetImg && targetImg.src) {
        if (processAndCreate(targetImg.src)) {
          obs.disconnect();
        }
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
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
    '17k.com': handle17k,
    'reader.novel.qq.com': handleReaderNovelQQ,
    'read.douban.com': handleDoubanRead,
    'xxsy.net': handleXxsy,
    'wenxue.iqiyi.com': handleIqiyi,
    'hanwujinian.com': handleHanwujinian,
    'gongzicp.com': handleGongzicp,
    'yuedu.163.com': handleYuedu163,
    'youdubook.com': handleYoudubook,
    'lcread.com': handleLcread,
    'sfacg.com': handleSfacg,
    'shubl.com': handleShubl,
    'myrics.com': handleMyrics,
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
