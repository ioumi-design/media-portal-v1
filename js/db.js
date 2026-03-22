/* ── Media Portal DB — shared data module ─────────────────────────────
   Loads media-portal-db.json once, caches in memory.
   Cart and favorites are persisted in localStorage.
──────────────────────────────────────────────────────────────────────── */
(function (global) {
  var _db = null;
  var _promise = null;

  function _load() {
    if (_db) return Promise.resolve(_db);
    if (_promise) return _promise;
    _promise = fetch('./media-portal-db.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        _db = data[0];
        _promise = null;
        return _db;
      });
    return _promise;
  }

  /* ── localStorage helpers ───────────────────────────────────────── */
  function _getCart() {
    try { return JSON.parse(localStorage.getItem('mp_cart') || '[]'); } catch (e) { return []; }
  }
  function _saveCart(ids) {
    try { localStorage.setItem('mp_cart', JSON.stringify(ids)); } catch (e) {}
  }
  function _getFavs() {
    try { return JSON.parse(localStorage.getItem('mp_favs') || '[]'); } catch (e) { return []; }
  }
  function _saveFavs(ids) {
    try { localStorage.setItem('mp_favs', JSON.stringify(ids)); } catch (e) {}
  }

  /* ── Public API ─────────────────────────────────────────────────── */
  var DB = {

    /* Assets */
    getAssets: function () {
      return _load().then(function (db) { return db.assets; });
    },
    getAsset: function (id) {
      return _load().then(function (db) {
        return db.assets.find(function (a) { return a.id === id; }) || null;
      });
    },

    /* Search */
    searchAssets: function (query, filters) {
      return _load().then(function (db) {
        var assets = db.assets.slice();
        if (query && query.trim()) {
          var q = query.trim().toLowerCase();
          assets = assets.filter(function (a) {
            return (a.title && a.title.toLowerCase().indexOf(q) >= 0)
              || (a.description && a.description.toLowerCase().indexOf(q) >= 0)
              || (a.brand && a.brand.toLowerCase().indexOf(q) >= 0)
              || (a.smartTags && a.smartTags.some(function (t) { return t.toLowerCase().indexOf(q) >= 0; }));
          });
        }
        if (filters) {
          if (filters.format) assets = assets.filter(function (a) { return a.format === filters.format; });
          if (filters.brand) assets = assets.filter(function (a) { return a.brand === filters.brand; });
          if (filters.brandCategory) assets = assets.filter(function (a) { return a.brandCategory === filters.brandCategory; });
          if (filters.channel) assets = assets.filter(function (a) { return a.channelScope === filters.channel; });
        }
        return assets;
      });
    },

    /* Collections */
    getCollections: function () {
      return _load().then(function (db) { return db.collections; });
    },
    getCollection: function (id) {
      return _load().then(function (db) {
        return db.collections.find(function (c) { return c.id === id; }) || null;
      });
    },
    createCollection: function (title, description) {
      return _load().then(function (db) {
        var now = new Date().toISOString().split('T')[0];
        var col = {
          id: 'col-' + Date.now(),
          title: title,
          description: description || '',
          thumbnail: null,
          assetIds: [],
          assetCount: 0,
          createdBy: db.currentUser.id,
          createdAt: now,
          updatedAt: now
        };
        db.collections.push(col);
        return col;
      });
    },
    updateCollection: function (id, data) {
      return _load().then(function (db) {
        var col = db.collections.find(function (c) { return c.id === id; });
        if (col) {
          if (data.title !== undefined) col.title = data.title;
          if (data.description !== undefined) col.description = data.description;
          col.updatedAt = new Date().toISOString().split('T')[0];
        }
        return col;
      });
    },
    deleteCollection: function (id) {
      return _load().then(function (db) {
        db.collections = db.collections.filter(function (c) { return c.id !== id; });
      });
    },
    addToCollection: function (assetId, collectionId) {
      return _load().then(function (db) {
        var col = db.collections.find(function (c) { return c.id === collectionId; });
        if (col && col.assetIds.indexOf(assetId) < 0) {
          col.assetIds.push(assetId);
          col.assetCount = col.assetIds.length;
        }
      });
    },
    removeFromCollection: function (assetId, collectionId) {
      return _load().then(function (db) {
        var col = db.collections.find(function (c) { return c.id === collectionId; });
        if (col) {
          col.assetIds = col.assetIds.filter(function (x) { return x !== assetId; });
          col.assetCount = col.assetIds.length;
        }
      });
    },

    /* Current user */
    getCurrentUser: function () {
      return _load().then(function (db) { return db.currentUser; });
    },

    /* Filters metadata */
    getFilters: function () {
      return _load().then(function (db) { return db.filters; });
    },

    /* Cart (localStorage) */
    getCart: _getCart,
    addToCart: function (id) {
      var c = _getCart();
      if (c.indexOf(id) < 0) { c.push(id); _saveCart(c); }
    },
    removeFromCart: function (id) {
      _saveCart(_getCart().filter(function (x) { return x !== id; }));
    },
    isInCart: function (id) { return _getCart().indexOf(id) >= 0; },
    getCartCount: function () { return _getCart().length; },

    /* Favorites (localStorage) */
    getFavorites: _getFavs,
    addFavorite: function (id) {
      var f = _getFavs();
      if (f.indexOf(id) < 0) { f.push(id); _saveFavs(f); }
    },
    removeFavorite: function (id) {
      _saveFavs(_getFavs().filter(function (x) { return x !== id; }));
    },
    isFavorited: function (id) { return _getFavs().indexOf(id) >= 0; }
  };

  global.DB = DB;
})(window);
