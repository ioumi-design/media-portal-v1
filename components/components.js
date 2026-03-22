/* ═══════════════════════════════════════════════════════════════════════════
   Accor Media Portal – Shared Component Library (JS)
   Provides: account popover, snackbar, and shared modals (download,
   share collection, edit collection, delete collection, create collection).
   All shared modals are injected into <body> on DOMContentLoaded.

   API: window.MP.snackbar / MP.download / MP.shareCollection /
        MP.editCollection / MP.deleteCollection / MP.createCollection
   ═══════════════════════════════════════════════════════════════════════════ */

(function (window) {
  'use strict';

  var MP = window.MP = {};

  /* ── SVG constants ──────────────────────────────────────────────────────── */
  var CLOSE_SVG = '<svg width="16" height="16" viewBox="0 0 15.5 15.5" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M15.2803 1.28033C15.5732 0.987437 15.5732 0.512563 15.2803 0.21967C14.9874 -0.0732233 14.5126 -0.0732233 14.2197 0.21967L7.75 6.68934L1.28033 0.21967C0.987437 -0.0732233 0.512564 -0.0732233 0.219671 0.21967C-0.0732227 0.512563 -0.0732227 0.987437 0.219671 1.28033L6.68934 7.75L0.21967 14.2197C-0.0732233 14.5126 -0.0732234 14.9874 0.21967 15.2803C0.512562 15.5732 0.987437 15.5732 1.28033 15.2803L7.75 8.81066L14.2197 15.2803C14.5126 15.5732 14.9874 15.5732 15.2803 15.2803C15.5732 14.9874 15.5732 14.5126 15.2803 14.2197L8.81066 7.75L15.2803 1.28033Z" fill="currentColor"/></svg>';

  var WARN_SVG = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566z"/><path fill="white" d="M7.002 12v-1.5h2V12h-2zm0-3V5.5h2V9h-2z"/></svg>';

  var CHECK_SVG = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#117846"/><path d="M5.833 10l2.917 2.917 5.417-5.834" stroke="#fff" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var MAIL_SVG = '<svg width="18" height="18" viewBox="0 0 12 9.33333" fill="none" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M1 1.62272V8.33333H11V1.62272L6.32925 5.70962C6.14074 5.87457 5.85926 5.87457 5.67075 5.70962L1 1.62272ZM10.1931 1H1.80692L6 4.66895L10.1931 1ZM0 .666667C0 .298477.298477 0 .666667 0H11.3333C11.7015 0 12 .298477 12 .666667V8.66667C12 9.03486 11.7015 9.33333 11.3333 9.33333H.666667C.298477 9.33333 0 9.03486 0 8.66667V.666667Z" fill="currentColor"/></svg>';

  var DL_SVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3v12M8 11l4 4 4-4M5 21h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var TRASH_SVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var COLL_ICON_SVG = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* ── HTML builders ──────────────────────────────────────────────────────── */
  function closeBtn(onclickFn) {
    return (
      '<div class="modal__header-row">' +
        '<button class="modal__close-btn" type="button" aria-label="Close" onclick="' + onclickFn + '">' +
          CLOSE_SVG +
        '</button>' +
      '</div>'
    );
  }

  /* ── Inject shared modal HTML ───────────────────────────────────────────── */
  function injectModals() {
    var wrapper = document.createElement('div');
    wrapper.id = 'mp-modals';
    wrapper.innerHTML =

      /* ── Snackbar ─────────────────────────────────────────────── */
      '<div class="snackbar" id="mp-snackbar" hidden role="status">' +
        '<span class="snackbar__icon" aria-hidden="true">' + CHECK_SVG + '</span>' +
        '<p class="snackbar__text" id="mp-snackbar-text"></p>' +
        '<button class="snackbar__link" type="button" id="mp-snackbar-undo" hidden>Undo</button>' +
        '<button class="snackbar__close" type="button" aria-label="Dismiss" onclick="MP.snackbar.dismiss()">' +
          '<svg width="14" height="14" viewBox="0 0 15.5 15.5" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M15.2803 1.28033C15.5732 0.987437 15.5732 0.512563 15.2803 0.21967C14.9874 -0.0732233 14.5126 -0.0732233 14.2197 0.21967L7.75 6.68934L1.28033 0.21967C0.987437 -0.0732233 0.512564 -0.0732233 0.219671 0.21967C-0.0732227 0.512563 -0.0732227 0.987437 0.219671 1.28033L6.68934 7.75L0.21967 14.2197C-0.0732233 14.5126 -0.0732234 14.9874 0.21967 15.2803C0.512562 15.5732 0.987437 15.5732 1.28033 15.2803L7.75 8.81066L14.2197 15.2803C14.5126 15.5732 14.9874 15.5732 15.2803 15.2803C15.5732 14.9874 15.5732 14.5126 15.2803 14.2197L8.81066 7.75L15.2803 1.28033Z" fill="currentColor"/></svg>' +
        '</button>' +
      '</div>' +

      /* ── Download options ─────────────────────────────────────── */
      '<div class="modal-overlay" id="mp-modal-download" hidden role="dialog" aria-modal="true">' +
        '<div class="modal modal--wide">' +
          closeBtn('MP.download.close()') +
          '<h2 class="modal__title">Download options</h2>' +
          '<div id="mp-dl-error-summary" class="modal__banner--error" hidden></div>' +
          '<div class="modal__body modal__body--flush" style="border:1px solid var(--color-outline-low);border-radius:8px;padding:20px 16px;gap:16px;">' +
            '<div id="mp-dl-images-section" class="modal-dl-section" hidden>' +
              '<div class="modal-dl-section__head">Images</div>' +
              '<div class="modal-dl-image-top">' +
                '<label class="modal-dl-check"><input type="checkbox" id="mp-dl-selall" /><span>Select all</span></label>' +
                '<label class="modal-dl-check"><input type="checkbox" id="mp-dl-original" /><span>Original</span></label>' +
              '</div>' +
              '<div class="modal-dl-check-grid" id="mp-dl-ratio-grid"></div>' +
            '</div>' +
            '<div id="mp-dl-other-section" class="modal-dl-section">' +
              '<div class="modal-dl-section__head">Logos, Documents, Videos, Presentations</div>' +
              '<label class="modal-dl-check">' +
                '<input type="checkbox" id="mp-dl-other-original" checked disabled />' +
                '<span>Original</span>' +
              '</label>' +
            '</div>' +
          '</div>' +
          '<div class="modal-dl-section" style="margin-top:16px;margin-bottom:0;">' +
            '<p class="modal-terms__title">Terms of Use and Intellectual Property Rights Compliance</p>' +
            '<p class="modal-terms">By downloading content from the Accor Media Portal, you agree to use it solely in accordance with Accor\'s brand guidelines and applicable licensing terms. You may not redistribute, resell, or alter assets in ways that misrepresent Accor brands. Commercial use may require additional clearance.</p>' +
            '<label class="modal-dl-check modal-dl-check--top">' +
              '<input type="checkbox" id="mp-dl-terms" />' +
              '<span>I accept the terms of use and agree to respect the intellectual property rights associated with the content(s)/asset(s).</span>' +
            '</label>' +
          '</div>' +
          '<div class="modal__footer">' +
            '<button class="modal__btn-outline" type="button" onclick="MP.download.close()">Cancel</button>' +
            '<button class="modal__btn-primary" type="button" onclick="MP.download._confirm()">' +
              'Download ' + DL_SVG +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>' +

      /* ── Share collection ─────────────────────────────────────── */
      '<div class="modal-overlay" id="mp-modal-share-coll" hidden role="dialog" aria-modal="true">' +
        '<div class="modal modal--wide">' +
          closeBtn('MP.shareCollection.close()') +
          '<h2 class="modal__title">Share collection</h2>' +
          '<div id="mp-share-coll-error" class="modal__banner--error" hidden>' +
            WARN_SVG +
            '<strong>Please enter at least one e-mail address.</strong>' +
          '</div>' +
          '<div class="modal__body">' +
            '<div class="modal-share-split">' +
              '<div class="modal-share-split__col">' +
                '<h3>Collection</h3>' +
                '<div class="modal-share-split__row">' +
                  COLL_ICON_SVG +
                  '<span id="mp-share-coll-name"></span>' +
                '</div>' +
              '</div>' +
              '<div class="modal-share-split__col">' +
                '<h3>Recipients</h3>' +
                '<div class="modal__field">' +
                  '<label class="modal__field-label" for="mp-share-coll-email">E-mail address</label>' +
                  '<input class="modal__input" id="mp-share-coll-email" type="text" placeholder="Comma delimited list of e-mail addresses" autocomplete="email" />' +
                '</div>' +
                '<div class="modal__field">' +
                  '<label class="modal__field-label modal__field-label--opt" for="mp-share-coll-msg">Message (optional)</label>' +
                  '<textarea class="modal__textarea" id="mp-share-coll-msg" placeholder="Message"></textarea>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="modal__footer">' +
            '<button class="modal__btn-outline" type="button" onclick="MP.shareCollection.close()">Cancel</button>' +
            '<button class="modal__btn-primary" type="button" onclick="MP.shareCollection._send()">' +
              'Share via mail ' + MAIL_SVG +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>' +

      /* ── Edit collection ──────────────────────────────────────── */
      '<div class="modal-overlay" id="mp-modal-edit-coll" hidden role="dialog" aria-modal="true">' +
        '<div class="modal">' +
          closeBtn('MP.editCollection.close()') +
          '<h2 class="modal__title">Edit collection</h2>' +
          '<div id="mp-edit-coll-error" class="modal__banner--error" hidden>' +
            WARN_SVG +
            '<strong>Please enter a collection title.</strong>' +
          '</div>' +
          '<div class="modal__body">' +
            '<div class="modal__form">' +
              '<div class="modal__field">' +
                '<label class="modal__field-label" for="mp-edit-coll-title">Collection name</label>' +
                '<input class="modal__input" id="mp-edit-coll-title" type="text" placeholder="Collection name" maxlength="100" />' +
              '</div>' +
              '<div class="modal__field">' +
                '<label class="modal__field-label modal__field-label--opt" for="mp-edit-coll-desc">Description (optional)</label>' +
                '<textarea class="modal__textarea" id="mp-edit-coll-desc" placeholder="Description 380 characters max" maxlength="380"></textarea>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="modal__footer">' +
            '<button class="modal__btn-outline" type="button" onclick="MP.editCollection.close()">Cancel</button>' +
            '<button class="modal__btn-primary" type="button" onclick="MP.editCollection._confirm()">Save changes</button>' +
          '</div>' +
        '</div>' +
      '</div>' +

      /* ── Delete collection ────────────────────────────────────── */
      '<div class="modal-overlay" id="mp-modal-delete-coll" hidden role="dialog" aria-modal="true">' +
        '<div class="modal">' +
          closeBtn('MP.deleteCollection.close()') +
          '<h2 class="modal__title" id="mp-delete-coll-title">Delete this collection?</h2>' +
          '<p id="mp-delete-coll-body" style="font-size:16px;line-height:24px;color:var(--color-on-surface-mid);"></p>' +
          '<div class="modal__footer" style="padding-top:24px;">' +
            '<button class="modal__btn-outline" type="button" onclick="MP.deleteCollection.close()">Cancel</button>' +
            '<button class="modal__btn-danger" type="button" onclick="MP.deleteCollection._confirm()">' +
              'Yes, delete ' +
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>' +

      /* ── Cart ─────────────────────────────────────────────────── */
      '<div class="modal-overlay" id="mp-modal-cart" hidden role="dialog" aria-modal="true">' +
        '<div class="modal modal--wide">' +
          closeBtn('MP.cart.close()') +
          '<div class="mp-cart-header">' +
            '<h2 class="modal__title">Cart</h2>' +
            '<button class="mp-cart-clear-link" type="button" id="mp-cart-clear-btn" onclick="MP.cart._clearAll()">' +
              TRASH_SVG + ' Clear cart' +
            '</button>' +
          '</div>' +
          '<div class="modal__body" id="mp-cart-list"></div>' +
          '<div class="modal__footer">' +
            '<button class="modal__btn-outline" type="button" onclick="MP.cart._shareMail()">' +
              'Share via mail ' + MAIL_SVG +
            '</button>' +
            '<button class="modal__btn-primary" type="button" id="mp-cart-dl-btn" onclick="MP.cart._downloadAll()">' +
              'Download cart ' + DL_SVG +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>' +

      /* ── Create collection ────────────────────────────────────── */
      '<div class="modal-overlay" id="mp-modal-create-coll" hidden role="dialog" aria-modal="true">' +
        '<div class="modal">' +
          closeBtn('MP.createCollection.close()') +
          '<h2 class="modal__title">Create a new collection</h2>' +
          '<div id="mp-create-coll-error" class="modal__banner--error" hidden>' +
            WARN_SVG +
            '<strong>Please enter a collection title.</strong>' +
          '</div>' +
          '<div class="modal__body">' +
            '<div class="modal__form">' +
              '<div class="modal__field">' +
                '<label class="modal__field-label" for="mp-create-coll-title">Collection title</label>' +
                '<input class="modal__input" id="mp-create-coll-title" type="text" placeholder="Type name of the collection" maxlength="100" />' +
              '</div>' +
              '<div class="modal__field">' +
                '<label class="modal__field-label modal__field-label--opt" for="mp-create-coll-desc">Description (optional)</label>' +
                '<textarea class="modal__textarea" id="mp-create-coll-desc" placeholder="Description of the collection" maxlength="380"></textarea>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="modal__footer">' +
            '<button class="modal__btn-outline" type="button" onclick="MP.createCollection.close()">Close</button>' +
            '<button class="modal__btn-primary" type="button" onclick="MP.createCollection._save()">Create</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(wrapper);
  }

  /* ── Account popover ────────────────────────────────────────────────────── */
  window.toggleAccountPopover = function () {
    var popover = document.getElementById('account-popover');
    var btn = document.getElementById('account-btn');
    if (!popover) return;
    var isOpen = !popover.hidden;
    popover.hidden = isOpen;
    if (btn) btn.setAttribute('aria-expanded', String(!isOpen));
  };
  document.addEventListener('click', function (e) {
    var popover = document.getElementById('account-popover');
    var btn = document.getElementById('account-btn');
    if (popover && !popover.hidden &&
        !popover.contains(e.target) &&
        !(btn && btn.contains(e.target))) {
      popover.hidden = true;
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }
  });

  /* ── Snackbar ───────────────────────────────────────────────────────────── */
  var _snackbarTimer = null;

  MP.snackbar = {
    show: function (text, opts) {
      opts = opts || {};
      var bar = document.getElementById('mp-snackbar');
      var undoBtn = document.getElementById('mp-snackbar-undo');
      if (!bar) return;
      document.getElementById('mp-snackbar-text').textContent = text;
      if (opts.undo && opts.onUndo) {
        undoBtn.hidden = false;
        undoBtn.onclick = function () { opts.onUndo(); MP.snackbar.dismiss(); };
      } else {
        undoBtn.hidden = true;
        undoBtn.onclick = null;
      }
      if (_snackbarTimer) clearTimeout(_snackbarTimer);
      bar.hidden = false;
      requestAnimationFrame(function () { bar.classList.add('is-visible'); });
      _snackbarTimer = setTimeout(MP.snackbar.dismiss, opts.duration || 3000);
    },
    dismiss: function () {
      var bar = document.getElementById('mp-snackbar');
      if (!bar) return;
      if (_snackbarTimer) clearTimeout(_snackbarTimer);
      _snackbarTimer = null;
      bar.classList.remove('is-visible');
      setTimeout(function () { bar.hidden = true; }, 300);
      var u = document.getElementById('mp-snackbar-undo');
      if (u) { u.hidden = true; u.onclick = null; }
    }
  };

  /* ── Download modal ─────────────────────────────────────────────────────── */
  var _dlCallbacks = {};

  function _initDlRatios() {
    var grid = document.getElementById('mp-dl-ratio-grid');
    if (!grid || grid.dataset.inited === '1') return;
    var ratios = ['1:1', '3:2', '4:3', '6:5', '8:10', '9:16', '11:5', '13:5', '16:9'];
    grid.innerHTML = ratios.map(function (r) {
      return '<label class="modal-dl-check"><input type="checkbox" class="mp-dl-ratio" /><span>' + r + '</span></label>';
    }).join('');
    grid.dataset.inited = '1';
    var selAll = document.getElementById('mp-dl-selall');
    var orig = document.getElementById('mp-dl-original');
    function allInputs() {
      var a = [orig];
      document.querySelectorAll('.mp-dl-ratio').forEach(function (x) { a.push(x); });
      return a;
    }
    function syncSelAll() {
      selAll.checked = allInputs().every(function (i) { return i.checked; });
    }
    selAll.addEventListener('change', function () {
      var on = selAll.checked;
      allInputs().forEach(function (inp) { inp.checked = on; });
    });
    orig.addEventListener('change', syncSelAll);
    grid.addEventListener('change', syncSelAll);
  }

  function _dlClearErrors() {
    var el = document.getElementById('mp-dl-error-summary');
    if (el) { el.hidden = true; el.innerHTML = ''; }
  }

  function _dlShowErrors(imgErr, termsErr, hasImgSection) {
    _dlClearErrors();
    var msgImg = 'Please select at least one size for the images.';
    var msgTerms = 'Agreement to the legal rights and conditions is required.';
    var needImg = hasImgSection && imgErr;
    var needTerms = termsErr;
    var el = document.getElementById('mp-dl-error-summary');
    if (!el) return;
    el.hidden = false;
    if (needImg && needTerms) {
      el.innerHTML = WARN_SVG + '<div><strong>2 errors have occured.</strong><ul><li>' + msgImg + '</li><li>' + msgTerms + '</li></ul></div>';
    } else if (needImg) {
      el.innerHTML = WARN_SVG + ' <strong>' + msgImg + '</strong>';
    } else if (needTerms) {
      el.innerHTML = WARN_SVG + ' <strong>' + msgTerms + '</strong>';
    }
  }

  function _dlReset() {
    _dlClearErrors();
    var selAll = document.getElementById('mp-dl-selall');
    var orig = document.getElementById('mp-dl-original');
    var terms = document.getElementById('mp-dl-terms');
    if (selAll) selAll.checked = false;
    if (orig) orig.checked = false;
    if (terms) terms.checked = false;
    document.querySelectorAll('.mp-dl-ratio').forEach(function (c) { c.checked = false; });
  }

  MP.download = {
    open: function (opts) {
      opts = opts || {};
      _dlCallbacks.onSuccess = opts.onSuccess || null;
      _dlReset();
      _initDlRatios();
      document.getElementById('mp-dl-images-section').hidden = !opts.hasImages;
      document.getElementById('mp-dl-other-section').hidden = !opts.hasOther;
      document.getElementById('mp-modal-download').hidden = false;
    },
    close: function () {
      document.getElementById('mp-modal-download').hidden = true;
      _dlCallbacks.onSuccess = null;
    },
    _confirm: function () {
      var hasImgSection = !document.getElementById('mp-dl-images-section').hidden;
      var imgOk = true;
      if (hasImgSection) {
        var o = document.getElementById('mp-dl-original').checked;
        var anyR = false;
        document.querySelectorAll('.mp-dl-ratio').forEach(function (c) { if (c.checked) anyR = true; });
        imgOk = o || anyR;
      }
      var termsOk = document.getElementById('mp-dl-terms').checked;
      if (!imgOk || !termsOk) {
        _dlShowErrors(!imgOk, !termsOk, hasImgSection);
        return;
      }
      var cb = _dlCallbacks.onSuccess;
      MP.download.close();
      if (cb) cb();
    }
  };

  /* ── Share collection modal ─────────────────────────────────────────────── */
  var _shareCb = null;

  MP.shareCollection = {
    open: function (collName, onSend) {
      _shareCb = onSend || null;
      document.getElementById('mp-share-coll-name').textContent = collName || '';
      document.getElementById('mp-share-coll-email').value = '';
      document.getElementById('mp-share-coll-msg').value = '';
      document.getElementById('mp-share-coll-error').hidden = true;
      document.getElementById('mp-modal-share-coll').hidden = false;
    },
    close: function () {
      document.getElementById('mp-modal-share-coll').hidden = true;
      _shareCb = null;
    },
    _send: function () {
      var email = document.getElementById('mp-share-coll-email').value.trim();
      if (!email) {
        document.getElementById('mp-share-coll-error').hidden = false;
        return;
      }
      var cb = _shareCb;
      MP.shareCollection.close();
      if (cb) cb();
    }
  };

  /* ── Edit collection modal ──────────────────────────────────────────────── */
  var _editCb = null;

  MP.editCollection = {
    open: function (title, desc, onConfirm) {
      _editCb = onConfirm || null;
      document.getElementById('mp-edit-coll-title').value = title || '';
      document.getElementById('mp-edit-coll-desc').value = desc || '';
      document.getElementById('mp-edit-coll-error').hidden = true;
      document.getElementById('mp-modal-edit-coll').hidden = false;
    },
    close: function () {
      document.getElementById('mp-modal-edit-coll').hidden = true;
      _editCb = null;
    },
    _confirm: function () {
      var title = document.getElementById('mp-edit-coll-title').value.trim();
      if (!title) {
        document.getElementById('mp-edit-coll-error').hidden = false;
        return;
      }
      var desc = document.getElementById('mp-edit-coll-desc').value.trim();
      var cb = _editCb;
      MP.editCollection.close();
      if (cb) cb(title, desc);
    }
  };

  /* ── Delete collection modal ────────────────────────────────────────────── */
  var _deleteCb = null;

  MP.deleteCollection = {
    open: function (opts) {
      opts = opts || {};
      _deleteCb = opts.onConfirm || null;
      var titleEl = document.getElementById('mp-delete-coll-title');
      var bodyEl = document.getElementById('mp-delete-coll-body');
      if (titleEl) titleEl.textContent = opts.title || 'Delete this collection?';
      if (bodyEl) bodyEl.textContent = opts.body || 'You are about to permanently delete this collection. The assets inside will not be deleted.';
      document.getElementById('mp-modal-delete-coll').hidden = false;
    },
    close: function () {
      document.getElementById('mp-modal-delete-coll').hidden = true;
      _deleteCb = null;
    },
    _confirm: function () {
      var cb = _deleteCb;
      MP.deleteCollection.close();
      if (cb) cb();
    }
  };

  /* ── Create collection modal ────────────────────────────────────────────── */
  var _createCb = null;

  MP.createCollection = {
    open: function (onSave) {
      _createCb = onSave || null;
      document.getElementById('mp-create-coll-title').value = '';
      document.getElementById('mp-create-coll-desc').value = '';
      document.getElementById('mp-create-coll-error').hidden = true;
      document.getElementById('mp-modal-create-coll').hidden = false;
    },
    close: function () {
      document.getElementById('mp-modal-create-coll').hidden = true;
      _createCb = null;
    },
    _save: function () {
      var title = document.getElementById('mp-create-coll-title').value.trim();
      if (!title) {
        document.getElementById('mp-create-coll-error').hidden = false;
        return;
      }
      var desc = document.getElementById('mp-create-coll-desc').value.trim();
      var cb = _createCb;
      MP.createCollection.close();
      if (cb) cb(title, desc);
    }
  };

  /* ── Cart modal ─────────────────────────────────────────────────────────── */
  // Cart uses sessionStorage (same key as db.js) — auto-cleared each new tab/session
  var SS_CART_KEY = 'mp_cart';
  var _cartItems = [];

  function _lsGetCart() {
    try { return JSON.parse(sessionStorage.getItem(SS_CART_KEY) || '[]'); } catch (e) { return []; }
  }
  function _lsSaveCart(ids) {
    try { sessionStorage.setItem(SS_CART_KEY, JSON.stringify(ids)); } catch (e) {}
  }

  function _initCart() {
    // sessionStorage is empty on every new tab/session — no manual clearing needed.
    // Also clear any stale localStorage cart data left from old code.
    try { localStorage.removeItem('mp_cart'); } catch (e) {}
    var ids = _lsGetCart();
    _cartItems = ids.map(function(id) {
      return { id: id, name: id, type: 'Asset', size: '', color: '#e8e4f0' };
    });
  }

  function _cartSync() {
    var n = _lsGetCart().length;
    var clearBtn = document.getElementById('mp-cart-clear-btn');
    var dlBtn = document.getElementById('mp-cart-dl-btn');
    if (clearBtn) clearBtn.hidden = (n === 0);
    if (dlBtn) dlBtn.disabled = (n === 0);
    document.querySelectorAll('.cart-badge').forEach(function (b) { b.textContent = n; });
  }

  MP.cart = {
    open: function () {
      MP.cart._render();
      document.getElementById('mp-modal-cart').hidden = false;
    },
    close: function () {
      document.getElementById('mp-modal-cart').hidden = true;
    },
    _render: function () {
      var listEl = document.getElementById('mp-cart-list');
      if (!listEl) return;
      _cartSync();
      if (_cartItems.length === 0) {
        listEl.innerHTML = '<div class="mp-cart-empty">Your cart is empty.</div>';
        return;
      }
      listEl.innerHTML = _cartItems.map(function (item) {
        return (
          '<div class="mp-cart-item" data-id="' + item.id + '">' +
            '<div class="mp-cart-item__thumb" style="background:' + item.color + '"></div>' +
            '<span class="mp-cart-item__name">' + item.name + '</span>' +
            '<span class="mp-cart-item__license">Unlicensed</span>' +
            '<button class="mp-cart-item__remove-link" type="button" ' +
              'onclick="MP.cart._remove(\'' + item.id + '\')">Remove</button>' +
          '</div>'
        );
      }).join('');
    },
    _remove: function (id) {
      _cartItems = _cartItems.filter(function (i) { return i.id !== id; });
      _lsSaveCart(_cartItems.map(function(i) { return i.id; }));
      MP.cart._render();
    },
    _clearAll: function () {
      _cartItems = [];
      _lsSaveCart([]);
      MP.cart._render();
    },
    _shareMail: function () {
      MP.cart.close();
      MP.shareCollection.open('Cart', function () {
        MP.snackbar.show('Mail is sent with success.');
      });
    },
    _downloadAll: function () {
      var hasImages = _cartItems.some(function (i) { return i.type === 'Image'; });
      var hasOther  = _cartItems.some(function (i) { return i.type !== 'Image'; });
      MP.cart.close();
      MP.download.open({
        hasImages: hasImages,
        hasOther: hasOther,
        onSuccess: function () { MP.snackbar.show('Download started.'); }
      });
    }
  };

  /* ── Init on DOM ready ──────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    injectModals();
    _initCart();
    setTimeout(_cartSync, 0);
  });

})(window);
