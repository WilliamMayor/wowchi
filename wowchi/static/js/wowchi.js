function Realm(name) {
    var self = this;
    self.name = name;
}
function Criterion(details) {
    var self = this;
    self.details = details;

    self.id = details.id;
    self.quantity = details.quantity;
    self.description = details.description;
    self.max = details.max;
    self.is_completed = ko.observable(false);
}
function Achievement(category, details) {
    var self = this;

    self.category= category;
    self.details = details;
    self.id = details.id;
    self.title = details.title;
    self.description = details.description;
    self.icon_18 = "http://media.blizzard.com/wow/icons/18/" + details.icon + ".jpg";
    self.icon_36 = "http://media.blizzard.com/wow/icons/36/" + details.icon + ".jpg";
    self.icon_56 = "http://media.blizzard.com/wow/icons/56/" + details.icon + ".jpg";
    self.wowhead = "http://www.wowhead.com/achievement=" + self.id;
    self.reward = details.reward;
    self.accountWide = details.accountWide;
    self.criteria = _.map(details.criteria, function(c) {
        return new Criterion(c);
    });
    self.is_completed = ko.observable(false);
    self.is_exploring = ko.pureComputed(function() {
        return self.category.explore() && self.category.explore().id === self.id;
    });
    self.explore = function() {
        if (self.is_exploring()) {
            self.category.explore(null);    
        } else {
            self.category.explore(self);
        }
    };
    self.explore_in_queue = function() {
        self.category.scroll_to(true);
        self.category.open_recursively();
        self.category.explore(self);
    };
    self.remove_from_queue = function() {
        wowchi.queue.remove(self);
        if (wowchi.explore() && wowchi.explore().id === self.id) {
            wowchi.explore(null);    
        }
    };
    self.add_to_queue = function() {
        if (self.can_add_to_queue()) {
            wowchi.queue.push(self);
        }
    };
    self.can_add_to_queue = ko.pureComputed(function() {
        return !self.is_completed() && self.is_not_in_queue();
    });
    self.is_not_in_queue = ko.pureComputed(function() {
        return wowchi.queue.indexOf(self) === -1;
    });
}
function Category(details, parent) {
    var self = this;
    self.details = details;
    self.parent = parent;

    self.id = details.id;
    self.name = details.name;
    self.achievements = _.map(details.achievements, function(a) {
        return new Achievement(self, a);
    });
    self.categories = _.map(details.categories, function(c) {
        return new Category(c, self);
    });
    self.explore = ko.observable();
    self.is_opened = ko.observable(false);
    self.scroll_to = ko.observable(false);

    self.expand = function() {
        self.is_opened(!self.is_opened());
    };
    self.afterRenderExplore = function(elements) {
        if (self.scroll_to()) {
            $(elements).parents("li").scrollintoview();
            self.scroll_to(false);
        }
    };
    self.open_recursively = function() {
        self.is_opened(true);
        if (self.parent) {
            self.parent.open_recursively();
        }
    };
}

function Wowchi() {
    var self = this;
    
    self.working = ko.observable(0);
    self.more_work = function() {
        self.working(self.working() + 1);
    };
    self.less_work = function() {
        self.working(self.working() - 1);
    };

    self.locales = locales;
    self.races = races;
    self.classes = classes;
    self.locale = ko.observable();
    self.realms = ko.observableArray();
    self.realm = ko.observable();
    self.character_name = ko.observable();
    self.character_class = ko.observable(7);
    self.character_race = ko.observable(2);
    self.completed = ko.observableArray();
    self.criteria = ko.observableArray();
    self.available = ko.observableArray();
    self.queue = ko.observableArray();
    self.explore = ko.observable();
    self.character_class_faction = ko.computed(function() {
        var race_id = self.character_race();
        var class_faction = "";
        var race = _.find(self.races, function(possible) {
            return possible.id === race_id;
        });
        if (race) {
            class_faction = race.side + " ";
        }
        var class_id = self.character_class();
        var _class = _.find(self.classes, function(possible) {
            return possible.id === class_id;
        });
        if (_class) {
            class_faction += _class.name.toLowerCase();
        }
        return class_faction;
    });
    self.find_realms = function() {
        var l = self.locale();
        if (!l) {
            return;
        }
        self.more_work();
        $.ajax({
            url: self.locale().host + "/api/wow/realm/status?jsonp=?&locale=" + self.locale().locale,
            dataType: "jsonp",
            jsonp: "jsonp",
            jsonpCallback: "jsonpCallback"
        }).done(function(data, textStatus, jqXHR) {
            self.realms(_.map(data.realms, function(r) {
                return new Realm(r.name);
            }));
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.error(jqXHR, textStatus, errorThrown);
            message.error("There was an error fetching realm data, please try again");
        }).always(function(data_jqXHR, textStatus, jqXHR_errorThrown) {
            self.less_work();
        });
    };
    self.find_available = function() {
        var l = self.locale();
        var r = self.realm();
        var n = self.character_name();
        if (!(l && r && n)) {
            return;
        }
        Rollbar.configure({
          payload: {
            person: {
                id: l.locale + ":" + r.name + ":" + n
            }
          }
        });
        Rollbar.info("User finding data");
        self.more_work();
        $.ajax({
            url: l.host + "/api/wow/data/character/achievements?jsonp=?&locale=" + l.locale,
            dataType: "jsonp",
            jsonp: "jsonp",
            jsonpCallback: "jsonpCallback"
        }).done(function(data, textStatus, jqXHR) {
            self.available(_.map(data.achievements, function(a) {
                return new Category(a);
            }));
            self.find_completed();
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.error(jqXHR, textStatus, errorThrown);
            message.error("There was an error fetching global achivement data, please try again");
        }).always(function() {
            self.less_work();
        });
    };
    self.find_completed = function() {
        var l = self.locale();
        var r = self.realm();
        var n = self.character_name();
        if (!(l && r && n)) {
            return;
        }
        self.more_work();
        $.ajax({
            url: l.host + "/api/wow/character/" + r.name + "/" + n + "?jsonp=?&fields=achievements&locale=" + l.locale,
            dataType: "jsonp",
            jsonp: "jsonp",
            jsonpCallback: "jsonpCallback"
        }).done(function(data, textStatus, jqXHR) {
            self.character_class(data.class);
            self.character_race(data.race);
            self.completed(data.achievements.achievementsCompleted);
            self.criteria(data.achievements.criteria);
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.error(jqXHR, textStatus, errorThrown);
            message.error("There was an error fetching character achivement data, please try again");
        }).always(function() {
            self.less_work();
        });
    };
    self.find_achievement = function(aid, categories) {
        if (!categories) {
            categories = self.available();
        }
        var a;
        _.find(categories, function(category) {
            a = _.find(category.achievements, function(achievement) {
                return achievement.id === aid;
            });
            if (!a && category.categories) {
                a = self.find_achievement(aid, category.categories);
            }
            if (a) {
                return true;
            }
        });
        return a;
    };
    self.find_criterion = function(cid, categories) {
        if (!categories) {
            categories = self.available();
        }
        var c;
        _.find(categories, function(category) {
             _.find(category.achievements, function(achievement) {
                c = _.find(achievement.criteria, function(criterion) {
                    return criterion.id === cid;
                });
                if (c) {
                    return true;
                }
            });
            if (!c && category.categories) {
                c = self.find_criterion(cid, category.categories);
            }
            if (c) {
                return true;
            }
        });
        return c;
    };
    self.queue_explore = function(achievement) {
        if (self.explore() && self.explore().id === achievement.id) {
            self.explore(null);    
        } else {
            self.explore(achievement);
        }
    };
    self.update_complete = function() {
        _.each(self.completed(), function(aid) {
            var a = self.find_achievement(aid);
            if (a) {
                a.is_completed(true);
            }
        });
    };
    self.update_criteria = function() {
        _.each(self.criteria(), function(cid) {
            var c = self.find_criterion(cid);
            if (c) {
                c.is_completed(true);
            }
        });
    };
    self.load = function() {
        if ('localStorage' in window && window.localStorage !== null) {
            var locale = window.localStorage.locale;
            if (locale) {
                var l = _.find(self.locales, function(l) {
                    return l.country === locale;
                });
                if (l) {
                    self.locale(l);
                }
            }
            var realms = window.localStorage.realms;
            if (realms) {
                self.realms(_.map(JSON.parse(realms), function(r) {
                    return new Realm(r.name);
                }));
            }
            var realm = window.localStorage.realm;
            if (realm) {
                var r = _.find(self.realms(), function(r) {
                    return r.name === realm;
                });
                if (r) {
                    self.realm(r);
                }
            }
            var character_name = window.localStorage.character_name;
            if (character_name) {
                self.character_name(character_name);
            }
            var character_race = window.localStorage.character_race;
            if (character_race) {
                self.character_race(JSON.parse(character_race));
            }
            var character_class = window.localStorage.character_class;
            if (character_class) {
                self.character_class(JSON.parse(character_class));
            }
            var available = window.localStorage.available;
            if (available) {
                self.available(_.map(JSON.parse(available), function(a) {
                    return new Category(a);
                }));
            }
            var completed = window.localStorage.completed;
            if (completed) {
                self.completed(JSON.parse(completed));
                self.update_complete();
            }
            var criteria = window.localStorage.criteria;
            if (criteria) {
                self.criteria(JSON.parse(criteria));
                self.update_criteria();
            }
            var queue = window.localStorage.queue;
            if (queue) {
                self.queue(_.map(JSON.parse(queue), function(aid) {
                    return self.find_achievement(aid);
                }));
            }
        }
        self.init_listeners();
    };
    self.init_listeners = function() {
        if ('localStorage' in window && window.localStorage !== null) {
            self.locale.subscribe(function() {
                window.localStorage.locale = self.locale().country;
            });
            self.realms.subscribe(function() {
                window.localStorage.realms = ko.toJSON(self.realms);
            });
            self.realm.subscribe(function() {
                window.localStorage.realm = self.realm().name;
            });
            self.character_name.subscribe(function() {
                window.localStorage.character_name = self.character_name();
            });
            self.character_class.subscribe(function() {
                window.localStorage.character_class = self.character_class();
            });
            self.character_race.subscribe(function() {
                window.localStorage.character_race = self.character_race();
            });
            self.available.subscribe(function() {
                window.localStorage.available = ko.toJSON(_.map(self.available(), function(c) {
                    return c.details;
                }));
            });
            self.completed.subscribe(function() {
                window.localStorage.completed = ko.toJSON(self.completed());
            });
            self.criteria.subscribe(function() {
                window.localStorage.criteria = ko.toJSON(self.criteria());
            });
            self.queue.subscribe(function() {
                window.localStorage.queue = ko.toJSON(_.map(self.queue(), function(a) {
                    return a.id;
                }));
            });
        }
        self.locale.subscribe(self.find_realms);
        self.completed.subscribe(self.update_complete);
        self.criteria.subscribe(self.update_criteria);
    };

    self.load();
}

var wowchi = new Wowchi();
