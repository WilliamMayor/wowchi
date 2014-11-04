wowchi.url = function(endpoint) {
    try {
        return wowchi.locale().host + endpoint + "?jsonp=?&locale=" + wowchi.locale().locale;
    } catch (e) {
        return null;
    }
};
wowchi.achievements = function(wowchi) {
    try {
        return [
            wowchi.locale().host,
            "/api/wow/character/",
            wowchi.realm().name,
            "/",
            wowchi.character_name(),
            "?jsonp=?&fields=achievements&locale=" + wowchi.locale().locale].join("");
    } catch (e) {
        return null;
    }
};
wowchi.find = function() {
    wowchi.working(true);
    $.ajax(wowchi.url("/api/wow/data/character/achievements"), {
        dataType: "jsonp",
        jsonp: "jsonp",
        jsonpCallback: "jsonpCallback"
    }).done(function(data, textStatus, jqXHR) {
        wowchi.available(data.achievements);
        wowchi.find_completed();
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error(jqXHR, textStatus, errorThrown);
        message.error("There was an error fetching global achivement data, please try again");
    });
};
wowchi.find_completed = function() {
    wowchi.working(true);
    $.ajax(wowchi.achievements(wowchi), {
        dataType: "jsonp",
        jsonp: "jsonp",
        jsonpCallback: "jsonpCallback"
    }).done(function(data, textStatus, jqXHR) {
        wowchi.character_class(data.class);
        wowchi.character_race(data.race);
        wowchi.completed(data.achievements.achievementsCompleted);
        wowchi.criteria(_.map(data.achievements.criteria, function(c, i) {
            return new Criterion(c, data.achievements.criteriaQuantity[i]);
        }));
        wowchi.load_queue();
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error(jqXHR, textStatus, errorThrown);
        message.error("There was an error fetching character achivement data, please try again");
    }).always(function(data_jqXHR, textStatus, jqXHR_errorThrown) {
        wowchi.working(false);
    });
};
wowchi.update_realms = function() {
    wowchi.working(true);
    $.ajax(wowchi.url("/api/wow/realm/status"), {
        dataType: "jsonp",
        jsonp: "jsonp",
        jsonpCallback: "jsonpCallback"
    }).done(function(data, textStatus, jqXHR) {
        wowchi.realms(_.map(data.realms, function(r) {
            return new Realm(r.name);
        }));
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error(jqXHR, textStatus, errorThrown);
        message.error("There was an error fetching realm data, please try again");
    }).always(function(data_jqXHR, textStatus, jqXHR_errorThrown) {
        wowchi.working(false);
    });
};
wowchi.queue.subscribe(function() {
    _.each(wowchi.queue(), function(a) {
        if (wowchi.achi_is_completed(a)) {
            wowchi.queue.remove(a);
        }
    });
    wowchi.save_queue();
});
wowchi.locale.subscribe(wowchi.update_realms);

wowchi.save_queue = function() {
    try {
        var key = wowchi.locale().host + "." + wowchi.realm().name + "." + wowchi.character_name() + ".queue";
        localStorage[key] = ko.toJSON(wowchi.queue);
    } catch (e) {

    }
};
wowchi.load_queue = function() {
    try {
        var key = wowchi.locale().host + "." + wowchi.realm().name + "." + wowchi.character_name() + ".queue";
        wowchi.queue(wowchi.find_many(wowchi.available(), JSON.parse(localStorage[key] || '[]')));
    } catch (e) {

    }
};
wowchi.find_obj = function(haystack, needle, key) {
    if (!needle) {
        return null;
    }
    return _.find(haystack, function(l) {
        return l[key] === needle[key];
    });
};
wowchi.find_many = function(haystack, needles) {
    return _.filter(_.map(needles, function(needle) {
        return wowchi.find_achi(haystack, needle);
    }), function(o) {
        return o !== null;
    });
};
wowchi.find_achi = function(all, achi) {
    var i, j;
    if (!achi) {
        return null;
    }
    for (i=0; i<all.length; i++) {
        if (all[i].achievements) {
            for (j=0; j<all[i].achievements.length; j++) {
                if (all[i].achievements[j].id === achi.id) {
                    return all[i].achievements[j];
                }
            }
        }
        if (all[i].criteria) {
            for (j=0; j<all[i].criteria.length; j++) {
                if (all[i].criteria[j].id === achi.id) {
                    return all[i].criteria[j];
                }
            }
        }
    }
    return null;
};
wowchi.load_from_storage = function() {
    if ('localStorage' in window && window.localStorage !== null) {
        wowchi.locale(wowchi.find_obj(wowchi.locales, JSON.parse(localStorage.locale || 'null'), 'locale'));
        wowchi.realms(JSON.parse(localStorage.realms || '[]'));
        wowchi.realm(wowchi.find_obj(wowchi.realms(), JSON.parse(localStorage.realm || 'null'), 'name'));
        wowchi.character_name(JSON.parse(localStorage.character_name || 'null'));
        wowchi.character_class(JSON.parse(localStorage.character_class || '7'));
        wowchi.character_race(JSON.parse(localStorage.character_race || '2'));
        wowchi.available(JSON.parse(localStorage.available || '[]'));
        wowchi.exploring(wowchi.find_achi(wowchi.available(), JSON.parse(localStorage.exploring || 'null')));
        wowchi.completed(JSON.parse(localStorage.completed || '[]'));
        wowchi.criteria(JSON.parse(localStorage.criteria || '[]'));
        wowchi.queue(wowchi.find_many(wowchi.available(), JSON.parse(localStorage.queue || '[]')));

        wowchi.locale.subscribe(function() {
            localStorage.locale = ko.toJSON(wowchi.locale);
        });
        wowchi.realms.subscribe(function() {
            localStorage.realms = ko.toJSON(wowchi.realms);
        });
        wowchi.realm.subscribe(function() {
            localStorage.realm = ko.toJSON(wowchi.realm);
        });
        wowchi.character_name.subscribe(function() {
            localStorage.character_name = ko.toJSON(wowchi.character_name);
        });
        wowchi.character_class.subscribe(function() {
            localStorage.character_class = ko.toJSON(wowchi.character_class);
        });
        wowchi.character_race.subscribe(function() {
            localStorage.character_race = ko.toJSON(wowchi.character_race);
        });
        wowchi.exploring.subscribe(function() {
            localStorage.exploring = ko.toJSON(wowchi.exploring);
        });
        wowchi.available.subscribe(function() {
            localStorage.available = ko.toJSON(wowchi.available);
        });
        wowchi.completed.subscribe(function() {
            localStorage.completed = ko.toJSON(wowchi.completed);
        });
        wowchi.criteria.subscribe(function() {
            localStorage.criteria = ko.toJSON(wowchi.criteria);
        });
    }
};
