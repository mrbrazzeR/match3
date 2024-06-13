/* var i = function(e) {
    function t(e) {
        try {
            console.log(e)
        } catch (t) {}
    }
    function i(e, t, i) {
        return e & t | ~e & i
    }
    function s(e, t, i) {
        return i & e | ~i & t
    }
    function n(e, t, i) {
        return e ^ t ^ i
    }
    function a(e, t, i) {
        return t ^ (e | ~i)
    }
    function o(e, t) {
        return e[t + 3] << 24 | e[t + 2] << 16 | e[t + 1] << 8 | e[t]
    }
    function c(e) {
        for (var t = [], i = 0; i < e.length; i++)
            if (e.charCodeAt(i) <= 127)
                t.push(e.charCodeAt(i));
            else
                for (var s = encodeURIComponent(e.charAt(i)).substr(1).split("%"), n = 0; n < s.length; n++)
                    t.push(parseInt(s[n], 16));
        return t
    }
    var r = null;
    if ("string" == typeof e)
        r = c(e);
    else {
        if (e.constructor != Array)
            return t("input data type mismatch"),
            null;
        if (0 === e.length)
            r = e;
        else if ("string" == typeof e[0])
            r = function(e) {
                for (var t = [], i = 0; i < e.length; i++)
                    t = t.concat(c(e[i]));
                return t
            }(e);
        else {
            if ("number" != typeof e[0])
                return t("input data type mismatch"),
                null;
            r = e
        }
    }
    var d = r.length;
    r.push(128);
    var l = r.length % 64;
    if (l > 56) {
        for (var h = 0; h < 64 - l; h++)
            r.push(0);
        l = r.length % 64
    }
    for (h = 0; h < 56 - l; h++)
        r.push(0);
    r = r.concat(function(e) {
        for (var t = [], i = 0; i < 8; i++)
            t.push(255 & e),
            e >>>= 8;
        return t
    }(8 * d));
    var p = 1732584193
      , m = 4023233417
      , u = 2562383102
      , g = 271733878
      , f = 0
      , v = 0
      , L = 0
      , S = 0;
    function y(e, t) {
        return 4294967295 & e + t
    }
    var b = function(e, t, i, s) {
        var n, a, o = S;
        S = L,
        L = v,
        v = y(v, (n = y(f, y(e, y(t, i)))) << (a = s) & 4294967295 | n >>> 32 - a),
        f = o
    };
    for (h = 0; h < r.length / 64; h++) {
        f = p;
        var _ = 64 * h;
        b(i(v = m, L = u, S = g), 3614090360, o(r, _), 7),
        b(i(v, L, S), 3905402710, o(r, _ + 4), 12),
        b(i(v, L, S), 606105819, o(r, _ + 8), 17),
        b(i(v, L, S), 3250441966, o(r, _ + 12), 22),
        b(i(v, L, S), 4118548399, o(r, _ + 16), 7),
        b(i(v, L, S), 1200080426, o(r, _ + 20), 12),
        b(i(v, L, S), 2821735955, o(r, _ + 24), 17),
        b(i(v, L, S), 4249261313, o(r, _ + 28), 22),
        b(i(v, L, S), 1770035416, o(r, _ + 32), 7),
        b(i(v, L, S), 2336552879, o(r, _ + 36), 12),
        b(i(v, L, S), 4294925233, o(r, _ + 40), 17),
        b(i(v, L, S), 2304563134, o(r, _ + 44), 22),
        b(i(v, L, S), 1804603682, o(r, _ + 48), 7),
        b(i(v, L, S), 4254626195, o(r, _ + 52), 12),
        b(i(v, L, S), 2792965006, o(r, _ + 56), 17),
        b(i(v, L, S), 1236535329, o(r, _ + 60), 22),
        b(s(v, L, S), 4129170786, o(r, _ + 4), 5),
        b(s(v, L, S), 3225465664, o(r, _ + 24), 9),
        b(s(v, L, S), 643717713, o(r, _ + 44), 14),
        b(s(v, L, S), 3921069994, o(r, _), 20),
        b(s(v, L, S), 3593408605, o(r, _ + 20), 5),
        b(s(v, L, S), 38016083, o(r, _ + 40), 9),
        b(s(v, L, S), 3634488961, o(r, _ + 60), 14),
        b(s(v, L, S), 3889429448, o(r, _ + 16), 20),
        b(s(v, L, S), 568446438, o(r, _ + 36), 5),
        b(s(v, L, S), 3275163606, o(r, _ + 56), 9),
        b(s(v, L, S), 4107603335, o(r, _ + 12), 14),
        b(s(v, L, S), 1163531501, o(r, _ + 32), 20),
        b(s(v, L, S), 2850285829, o(r, _ + 52), 5),
        b(s(v, L, S), 4243563512, o(r, _ + 8), 9),
        b(s(v, L, S), 1735328473, o(r, _ + 28), 14),
        b(s(v, L, S), 2368359562, o(r, _ + 48), 20),
        b(n(v, L, S), 4294588738, o(r, _ + 20), 4),
        b(n(v, L, S), 2272392833, o(r, _ + 32), 11),
        b(n(v, L, S), 1839030562, o(r, _ + 44), 16),
        b(n(v, L, S), 4259657740, o(r, _ + 56), 23),
        b(n(v, L, S), 2763975236, o(r, _ + 4), 4),
        b(n(v, L, S), 1272893353, o(r, _ + 16), 11),
        b(n(v, L, S), 4139469664, o(r, _ + 28), 16),
        b(n(v, L, S), 3200236656, o(r, _ + 40), 23),
        b(n(v, L, S), 681279174, o(r, _ + 52), 4),
        b(n(v, L, S), 3936430074, o(r, _), 11),
        b(n(v, L, S), 3572445317, o(r, _ + 12), 16),
        b(n(v, L, S), 76029189, o(r, _ + 24), 23),
        b(n(v, L, S), 3654602809, o(r, _ + 36), 4),
        b(n(v, L, S), 3873151461, o(r, _ + 48), 11),
        b(n(v, L, S), 530742520, o(r, _ + 60), 16),
        b(n(v, L, S), 3299628645, o(r, _ + 8), 23),
        b(a(v, L, S), 4096336452, o(r, _), 6),
        b(a(v, L, S), 1126891415, o(r, _ + 28), 10),
        b(a(v, L, S), 2878612391, o(r, _ + 56), 15),
        b(a(v, L, S), 4237533241, o(r, _ + 20), 21),
        b(a(v, L, S), 1700485571, o(r, _ + 48), 6),
        b(a(v, L, S), 2399980690, o(r, _ + 12), 10),
        b(a(v, L, S), 4293915773, o(r, _ + 40), 15),
        b(a(v, L, S), 2240044497, o(r, _ + 4), 21),
        b(a(v, L, S), 1873313359, o(r, _ + 32), 6),
        b(a(v, L, S), 4264355552, o(r, _ + 60), 10),
        b(a(v, L, S), 2734768916, o(r, _ + 24), 15),
        b(a(v, L, S), 1309151649, o(r, _ + 52), 21),
        b(a(v, L, S), 4149444226, o(r, _ + 16), 6),
        b(a(v, L, S), 3174756917, o(r, _ + 44), 10),
        b(a(v, L, S), 718787259, o(r, _ + 8), 15),
        b(a(v, L, S), 3951481745, o(r, _ + 36), 21),
        p = y(p, f),
        m = y(m, v),
        u = y(u, L),
        g = y(g, S)
    }
    return function(e, t, i, s) {
        for (var n, a, o, c = "", r = 0, d = 0, l = 3; l >= 0; l--)
            r = 255 & (d = arguments[l]),
            r <<= 8,
            r |= 255 & (d >>>= 8),
            r <<= 8,
            r |= 255 & (d >>>= 8),
            r <<= 8,
            c += (a = void 0,
            o = void 0,
            a = ((n = r |= d >>>= 8) >>> 24).toString(16),
            o = (16777215 & n).toString(16),
            "00".substr(0, 2 - a.length) + a + "000000".substr(0, 6 - o.length) + o);
        return c
    }(g, u, m, p).toUpperCase()
};
module.exports = {
    leaderboardName: "three_squirrels",
    getListData: function(e, t) {
        var i = new XMLHttpRequest;
        i.onreadystatechange = function() {
            if (4 == i.readyState)
                if (i.status >= 200 && i.status < 400) {
                    var e = i.responseText;
                    try {
                        var s = JSON.parse(e);
                        0 != s.code ? t && t(null) : t && t(s)
                    } catch (n) {
                        t && t(null)
                    }
                } else
                    t && t(null)
        }
        ,
        i.open("GET", "https://leaderboard.centwiapp.com/get.fcg?leaderboard=" + this.leaderboardName + "&uid=" + e, !0),
        i.send()
    },
    setScore: function(e, t, i, s) {
        var n = new XMLHttpRequest;
        n.onreadystatechange = function() {
            if (4 == n.readyState)
                if (n.status >= 200 && n.status < 400) {
                    var e = n.responseText;
                    try {
                        var t = JSON.parse(e);
                        0 != t.code ? s && s(!1) : s && (cc.log(t),
                        s(!0, t))
                    } catch (i) {
                        s && s(!1)
                    }
                } else
                    s && s(!1)
        }
        ,
        n.open("GET", "https://leaderboard.centwiapp.com/submit.fcg?" + this.getUserInfoParams(e, t, i), !0),
        n.send()
    },
    getUserInfoParams: function(e, t, s) {
        var n = JSON.parse(t)
          , a = i(e + "" + s + this.leaderboardName + "ffjoffrey100times").toLowerCase();
        return "uid=" + e + "&name=" + n.name + "&avatar=" + n.avatar + "&score=" + s + "&leaderboard=" + this.leaderboardName + "&token=" + a
    }
}
 */