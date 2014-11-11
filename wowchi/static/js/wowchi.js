function Realm(name) {
    var self = this;
    self.name = name;
}
function Criterion(details) {
    var self = this;

    self.id = details.id;
    self.quantity = details.quantity;
    self.description = details.description;
    self.max = details.max;
}
function Achievement(category, details) {
    var self = this;

    self.category= category;
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
    self.is_completed = false;
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
}
function Category(details) {
    var self = this;

    self.id = details.id;
    self.name = details.name;
    self.achievements = _.map(details.achievements, function(a) {
        return new Achievement(self, a);
    });
    self.categories = _.map(details.categories, function(c) {
        return new Category(c);
    });
    self.explore = ko.observable();
    self.is_opened = ko.observable(false);

    self.expand = function() {
        self.is_opened(!self.is_opened());
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
    self.locale = ko.observable(self.locales[0]);
    self.realms = ko.observableArray();
    self.realm = ko.observable();
    self.character_name = ko.observable();
    self.character_class = ko.observable(7);
    self.character_race = ko.observable(2);
    self.completed = ko.observableArray();
    self.criteria = ko.observableArray();
    self.available = ko.observableArray();
    self.queue = ko.observableArray();
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
            console.log(data);
            self.character_class(data.class);
            self.character_race(data.race);
            self.completed(data.achievements.achievementsCompleted);
            self.criteria(_.map(data.achievements.criteria, function(c) {
                return new Criterion(c);
            }));
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.error(jqXHR, textStatus, errorThrown);
            message.error("There was an error fetching character achivement data, please try again");
        }).always(function() {
            self.less_work();
        });
    };
    self.load = function() {
        self.realm.subscribe(function() {
            self.character_name("Vized");
            self.find_available();
        });

        self.locale(self.locales[3]);
    };


    self.locale.subscribe(self.find_realms);
    self.load();
}

var wowchi = new Wowchi();
