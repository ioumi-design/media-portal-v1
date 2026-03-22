/* ── Media Portal DB — shared data module ─────────────────────────────
   Assets:      loaded from media-portal-db.json (read-only base data)
   Collections: initialized from JSON, persisted to localStorage
   Cart & Favorites: persisted to localStorage
──────────────────────────────────────────────────────────────────────── */
(function (global) {
  var _db = null;
  var _promise = null;
  var LS_COLLECTIONS = 'mp_collections';
  var LS_CART        = 'mp_cart';
  var LS_FAVS        = 'mp_favs';

  function _load() {
    if (_db) return Promise.resolve(_db);
    if (_promise) return _promise;
    _promise = fetch('./media-portal-db.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        _db = data[0];
        /* Seed localStorage collections from JSON on first load */
        if (!localStorage.getItem(LS_COLLECTIONS)) {
          try { localStorage.setItem(LS_COLLECTIONS, JSON.stringify(_db.collections)); } catch (e) {}
        }
        _promise = null;
        return _db;
      });
    return _promise;
  }

  /* ── localStorage helpers ─────────────────────────────────────────── */
  function _getCollections() {
    try { return JSON.parse(localStorage.getItem(LS_COLLECTIONS) || 'null') || []; } catch (e) { return []; }
  }
  function _saveCollections(cols) {
    try { localStorage.setItem(LS_COLLECTIONS, JSON.stringify(cols)); } catch (e) {}
  }
  function _getCart() {
    try { return JSON.parse(localStorage.getItem(LS_CART) || '[]'); } catch (e) { return []; }
  }
  function _saveCart(ids) {
    try { localStorage.setItem(LS_CART, JSON.stringify(ids)); } catch (e) {}
  }
  function _getFavs() {
    try { return JSON.parse(localStorage.getItem(LS_FAVS) || '[]'); } catch (e) { return []; }
  }
  function _saveFavs(ids) {
    try { localStorage.setItem(LS_FAVS, JSON.stringify(ids)); } catch (e) {}
  }

  /* ── Public API ──────────────────────────────────────────────────── */
  var DB = {

    /* ── Assets (read-only from JSON) ──────────────────────────────── */
    getAssets: function () {
      return _load().then(function (db) { return db.assets; });
    },
    getAsset: function (id) {
      return _load().then(function (db) {
        return db.assets.find(function (a) { return a.id === id; }) || null;
      });
    },
    searchAssets: function (query, filters) {
      return _load().then(function (db) {
        var assets = db.assets.slice();
        if (query && query.trim()) {
          var q = query.trim().toLowerCase();
          assets = assets.filter(function (a) {
            return (a.title && a.title.toLowerCase().indexOf(q) >= 0)
              || (a.description && a.description.toLowerCase().indexOf(q) >= 0)
              || (a.brand && a.brand.toLowerCase().indexOf(q) >= 0)
              || (a.smartTags && a.smartTags.some(function (t) { return t.toLowerCase().indexOf(q) >= 0; }))
              || (a.tags && a.tags.some(function (t) { return t.toLowerCase().indexOf(q) >= 0; }));
          });
        }
        if (filters) {
          if (filters.format)        assets = assets.filter(function (a) { return a.format === filters.format; });
          if (filters.type)          assets = assets.filter(function (a) { return a.type === filters.type; });
          if (filters.brand)         assets = assets.filter(function (a) { return a.brand === filters.brand; });
          if (filters.brandCategory) assets = assets.filter(function (a) { return a.brandCategory === filters.brandCategory; });
          if (filters.channel)       assets = assets.filter(function (a) { return a.channelScope === filters.channel; });
          if (filters.region)        assets = assets.filter(function (a) { return a.region === filters.region; });
          if (filters.language)      assets = assets.filter(function (a) { return a.language === filters.language; });
          if (filters.license)       assets = assets.filter(function (a) { return a.license === filters.license; });
        }
        return assets;
      });
    },

    /* ── Collections (localStorage) ────────────────────────────────── */
    getCollections: function () {
      return _load().then(function () { return _getCollections(); });
    },
    getCollection: function (id) {
      return _load().then(function () {
        return _getCollections().find(function (c) { return c.id === id; }) || null;
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
          createdBy: db.currentUser ? db.currentUser.id : 'user-004',
          createdAt: now,
          updatedAt: now
        };
        var cols = _getCollections();
        cols.push(col);
        _saveCollections(cols);
        return col;
      });
    },
    updateCollection: function (id, title, description) {
      return _load().then(function () {
        var cols = _getCollections();
        var col = cols.find(function (c) { return c.id === id; });
        if (col) {
          if (title !== undefined && title !== null) col.title = title;
          if (description !== undefined && description !== null) col.description = description;
          col.updatedAt = new Date().toISOString().split('T')[0];
          _saveCollections(cols);
        }
        return col;
      });
    },
    deleteCollection: function (id) {
      return _load().then(function () {
        _saveCollections(_getCollections().filter(function (c) { return c.id !== id; }));
      });
    },
    addAssetToCollection: function (assetId, collectionId) {
      return _load().then(function () {
        var cols = _getCollections();
        var col = cols.find(function (c) { return c.id === collectionId; });
        if (col && col.assetIds.indexOf(assetId) < 0) {
          col.assetIds.push(assetId);
          col.assetCount = col.assetIds.length;
          _saveCollections(cols);
        }
        return col;
      });
    },
    removeAssetFromCollection: function (assetId, collectionId) {
      return _load().then(function () {
        var cols = _getCollections();
        var col = cols.find(function (c) { return c.id === collectionId; });
        if (col) {
          col.assetIds = col.assetIds.filter(function (x) { return x !== assetId; });
          col.assetCount = col.assetIds.length;
          _saveCollections(cols);
        }
        return col;
      });
    },
    /* Aliases for backward compatibility */
    addToCollection: function (assetId, collectionId) {
      return DB.addAssetToCollection(assetId, collectionId);
    },
    removeFromCollection: function (assetId, collectionId) {
      return DB.removeAssetFromCollection(assetId, collectionId);
    },

    /* ── Current user & filters ─────────────────────────────────────── */
    getCurrentUser: function () {
      return _load().then(function (db) { return db.currentUser; });
    },
    getFilters: function () {
      return _load().then(function (db) { return db.filters; });
    },

    /* ── Cart (localStorage) ────────────────────────────────────────── */
    getCart:      _getCart,
    addToCart:    function (id) { var c = _getCart(); if (c.indexOf(id) < 0) { c.push(id); _saveCart(c); } },
    removeFromCart: function (id) { _saveCart(_getCart().filter(function (x) { return x !== id; })); },
    isInCart:     function (id) { return _getCart().indexOf(id) >= 0; },
    getCartCount: function ()   { return _getCart().length; },

    /* ── Favorites (localStorage) ───────────────────────────────────── */
    getFavorites:    _getFavs,
    addFavorite:     function (id) { var f = _getFavs(); if (f.indexOf(id) < 0) { f.push(id); _saveFavs(f); } },
    removeFavorite:  function (id) { _saveFavs(_getFavs().filter(function (x) { return x !== id; })); },
    isFavorited:     function (id) { return _getFavs().indexOf(id) >= 0; },
    /* Alias */
    addToFavorites:    function (id) { DB.addFavorite(id); },
    removeFromFavorites: function (id) { DB.removeFavorite(id); },

    /* ── Heart-fill source of truth: in ANY collection ──────────────── */
    isInAnyCollection: function (id) {
      return _getCollections().some(function (c) { return c.assetIds.indexOf(id) >= 0; });
    }
  };

  global.DB = DB;
})(window);
