(function () {
  'use strict';

  /* ------------------------------------------------ 코드 복사 */

  // 학교 노트북은 http:// 로 접속하는 경우가 많아 navigator.clipboard 가 없을 수 있다.
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(fallbackCopy.bind(null, text));
    }
    return fallbackCopy(text);
  }

  function fallbackCopy(text) {
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-1000px';
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, ta.value.length);
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      ok ? resolve() : reject(new Error('copy failed'));
    });
  }

  document.addEventListener('click', function (event) {
    var button = event.target.closest('[data-copy-target]');
    if (!button) return;
    var source = document.querySelector(button.getAttribute('data-copy-target'));
    if (!source) return;

    var hint = document.querySelector('[data-copy-hint]');
    var originalLabel = button.dataset.originalLabel || button.textContent;
    button.dataset.originalLabel = originalLabel;

    copyText(source.innerText).then(
      function () {
        button.textContent = '✅ 복사했어요!';
        if (hint) {
          hint.textContent = 'Arduino 프로그램으로 가서 Ctrl + V를 눌러주세요.';
          hint.classList.add('ok');
        }
        setTimeout(function () {
          button.textContent = button.getAttribute('data-copy-again') || originalLabel;
        }, 1600);
      },
      function () {
        if (hint) {
          hint.textContent = '복사가 안 됐어요. 아래 코드를 직접 드래그해서 복사해 주세요.';
          hint.classList.remove('ok');
        }
        var range = document.createRange();
        range.selectNodeContents(source);
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      }
    );
  });

  /* ------------------------------------------------ 열기/닫기 */

  document.addEventListener('click', function (event) {
    var button = event.target.closest('[data-toggle]');
    if (!button) return;
    var target = document.querySelector(button.getAttribute('data-toggle'));
    if (!target) return;
    var open = target.classList.toggle('hidden') === false;
    var alt = button.getAttribute('data-toggle-label');
    if (alt) {
      var current = button.textContent;
      button.textContent = alt;
      button.setAttribute('data-toggle-label', current);
    }
    if (open) target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  /* ------------------------------------------------ 삭제 확인 */

  document.addEventListener('submit', function (event) {
    var message = event.target.getAttribute('data-confirm');
    if (message && !window.confirm(message)) event.preventDefault();
  });

  /* ------------------------------------------------ 학생 이름 + 제출 */

  var SEAT_KEY = 'arduinoClass.studentName';
  var seatInput = document.getElementById('studentName');
  var helpForm = document.getElementById('helpform');

  function readSeat() {
    try { return window.localStorage.getItem(SEAT_KEY) || ''; } catch (e) { return ''; }
  }
  function writeSeat(value) {
    try { window.localStorage.setItem(SEAT_KEY, value); } catch (e) { /* 저장 못해도 그냥 진행 */ }
  }

  if (seatInput) {
    var saved = readSeat();
    var savedLine = document.getElementById('namesaved');
    if (saved && !seatInput.value) {
      seatInput.value = saved;
      if (savedLine) {
        savedLine.classList.remove('hidden');
        savedLine.innerHTML = '';
        savedLine.appendChild(document.createTextNode(saved + ' 학생으로 기억하고 있어요.'));
        var change = document.createElement('button');
        change.type = 'button';
        change.textContent = '이름 바꾸기';
        change.addEventListener('click', function () {
          seatInput.value = '';
          seatInput.focus();
          savedLine.classList.add('hidden');
        });
        savedLine.appendChild(change);
      }
    } else {
      seatInput.focus();
    }
  }

  if (helpForm) {
    var codeArea = document.getElementById('helpcode');
    helpForm.addEventListener('submit', function (event) {
      var seat = (seatInput.value || '').trim();
      var code = (codeArea.value || '').trim();
      var message = '';
      if (!seat) message = '이름을 입력해 주세요!';
      else if (!code) message = '코드를 먼저 붙여넣어 주세요!';
      if (message) {
        event.preventDefault();
        showFormError(helpForm, message);
        (message.indexOf('이름') === 0 ? seatInput : codeArea).focus();
        return;
      }
      writeSeat(seat);
    });
  }

  function showFormError(form, message) {
    var box = form.parentNode.querySelector('.error.js');
    if (!box) {
      box = document.createElement('p');
      box.className = 'error js';
      form.parentNode.insertBefore(box, form);
    }
    box.textContent = message;
    box.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* ------------------------------------------------ 내 질문 답변 보기 */

  var TOKEN_KEY = 'arduinoClass.myTokens';
  var OLD_TOKEN_KEY = 'arduinoClass.myToken';
  var TOKEN_SHAPE = /^[0-9a-f]{24}$/;

  function readTokens() {
    try {
      var raw = window.localStorage.getItem(TOKEN_KEY);
      var list = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(list)) list = [];
      var old = window.localStorage.getItem(OLD_TOKEN_KEY);
      if (old && list.indexOf(old) < 0) list.push(old);
      return list.filter(function (t, index) {
        return TOKEN_SHAPE.test(t) && list.indexOf(t) === index;
      });
    } catch (e) {
      return [];
    }
  }

  function rememberToken(token) {
    if (!TOKEN_SHAPE.test(token)) return;
    try {
      var list = readTokens();
      // 예전 질문을 다시 열어도 최신 질문으로 바뀌지 않는다.
      if (list.indexOf(token) < 0) list.unshift(token);
      window.localStorage.setItem(TOKEN_KEY, JSON.stringify(list.slice(0, 20)));
    } catch (e) { /* 저장 못해도 그냥 진행 */ }
  }

  // 제출 완료 화면과 답변 화면에서 내 열쇠를 기억해 둔다.
  var tokenHolder = document.querySelector('[data-my-token]');
  if (tokenHolder) rememberToken(tokenHolder.getAttribute('data-my-token'));

  var banner = document.getElementById('answerbanner');
  var myTokens = banner ? readTokens() : [];
  var answerBack = null;

  function showBanner(token, answered) {
    banner.setAttribute('data-state', answered ? 'answered' : 'waiting');
    banner.className = answered ? 'answerbanner ok' : 'answerbanner';
    banner.textContent = '';
    var text = document.createElement('span');
    text.textContent = answered ? '💬 선생님 답변이 왔어요!' : '🙋 보낸 질문을 선생님이 확인하고 있어요.';
    var link = document.createElement('a');
    link.className = 'btn';
    link.href = '/my/' + token;
    link.textContent = answered ? '답변 보기' : '내 질문 보기';
    banner.appendChild(text);
    banner.appendChild(link);
  }

  function checkAnswers() {
    Promise.all(myTokens.map(function (token) {
      return fetch('/my/' + token + '/status', { cache: 'no-store' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (data) {
          return data ? { token: token, answered: data.answered, createdAt: data.createdAt } : null;
        })
        .catch(function () { return null; });
    })).then(function (items) {
      items = items.filter(Boolean).sort(function (a, b) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      // 예전 답변보다 가장 최근에 보낸 질문 상태를 우선한다.
      if (items.length) {
        showBanner(items[0].token, items[0].answered);
        if (answerBack) answerBack.href = '/my/' + items[0].token;
      }
    });
  }

  // 화면 아래 "선생님, 안 돼요" 옆에도 다시 볼 수 있는 버튼을 둔다.
  var answerSlot = document.getElementById('myanswer');
  if (answerSlot) {
    var recent = readTokens()[0];
    if (recent) {
      answerBack = document.createElement('a');
      answerBack.className = 'big ghost';
      answerBack.href = '/my/' + recent;
      answerBack.textContent = '💬 내 질문 답변 보기';
      answerSlot.appendChild(answerBack);
    }
  }

  if (myTokens.length) checkAnswers();

  // 기억된 질문을 최신순으로 모아 코드와 답변을 한 묶음으로 보여준다.
  var historyBox = document.querySelector('[data-my-history]');
  var historyTimer = null;

  function loadMyHistory() {
    if (!historyBox) return;
    var tokens = readTokens();
    var current = historyBox.getAttribute('data-current-token');
    if (TOKEN_SHAPE.test(current) && tokens.indexOf(current) < 0) tokens.unshift(current);

    Promise.all(tokens.map(function (token) {
      return fetch('/my/' + token + '/card', { cache: 'no-store' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .catch(function () { return null; });
    })).then(function (items) {
      items = items.filter(Boolean).sort(function (a, b) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      if (!items.length) return;

      historyBox.innerHTML = items.map(function (item) { return item.html; }).join('');
      var labels = historyBox.querySelectorAll('.qsequence');
      labels.forEach(function (label, index) {
        label.textContent = String(items.length - index) + '번째 질문';
      });

      if (historyTimer) window.clearTimeout(historyTimer);
      if (items.some(function (item) { return !item.answered; })) {
        historyTimer = window.setTimeout(loadMyHistory, 15000);
      }
    }).catch(function () {
      // 네트워크가 잠깐 끊겨도 서버에서 먼저 그려준 현재 질문은 그대로 남긴다.
    });
  }

  if (historyBox) loadMyHistory();

  /* ------------------------------------------------ 연결 그림 업로드 (관리자) */

  var fileInput = document.getElementById('wiringFile');
  if (fileInput) {
    var hiddenField = document.getElementById('wiringImage');
    var preview = document.getElementById('wiringPreview');
    var previewImg = document.getElementById('wiringPreviewImg');
    var removeButton = document.getElementById('wiringRemove');
    var MAX_SIDE = 1600;

    fileInput.addEventListener('change', function () {
      var file = fileInput.files && fileInput.files[0];
      if (!file) return;
      if (file.type.indexOf('image/') !== 0) {
        window.alert('그림 파일만 올릴 수 있어요.');
        fileInput.value = '';
        return;
      }
      var reader = new FileReader();
      reader.onload = function () {
        var image = new Image();
        image.onload = function () {
          var scale = Math.min(1, MAX_SIDE / Math.max(image.width, image.height));
          var canvas = document.createElement('canvas');
          canvas.width = Math.round(image.width * scale);
          canvas.height = Math.round(image.height * scale);
          var ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          var dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          // 줄여도 오히려 커지면 원본을 쓴다 (작은 PNG 등)
          if (String(reader.result).length < dataUrl.length && String(reader.result).length < 2000000) {
            dataUrl = String(reader.result);
          }
          hiddenField.value = dataUrl;
          previewImg.src = dataUrl;
          preview.classList.remove('hidden');
        };
        image.src = String(reader.result);
      };
      reader.readAsDataURL(file);
    });

    if (removeButton) {
      removeButton.addEventListener('click', function () {
        hiddenField.value = '';
        previewImg.removeAttribute('src');
        preview.classList.add('hidden');
        fileInput.value = '';
      });
    }
  }

  /* ------------------------------------------------ 코드 입력창에서 Tab */

  var codeTextarea = document.querySelector('textarea.mono');
  if (codeTextarea) {
    codeTextarea.addEventListener('keydown', function (event) {
      if (event.key !== 'Tab') return;
      event.preventDefault();
      var start = codeTextarea.selectionStart;
      var end = codeTextarea.selectionEnd;
      codeTextarea.value = codeTextarea.value.slice(0, start) + '  ' + codeTextarea.value.slice(end);
      codeTextarea.selectionStart = codeTextarea.selectionEnd = start + 2;
    });
  }
})();
