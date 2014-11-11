wowchi.Category = function(data) {
    var self = this;
    self.data = data;

    self.expand = function() {

    };
};

wowchi.icon = function(name, size) { //18, 36, 56
    if (!size) {
        size = 36;
    }
    return "http://media.blizzard.com/wow/icons/" + size + "/" + name + ".jpg";
};
wowchi.open_category = function(section) {
    if (wowchi.opened.indexOf(section.name) !== -1) {
        wowchi.opened.remove(section.name);
    } else {
        wowchi.opened.push(section.name);
    }
};
wowchi.explore_achi = function(achi) {
    if (wowchi.exploring() === achi) {
        wowchi.exploring(null);
    } else {
        wowchi.exploring(achi);
    }
};
wowchi.close_explore = function() {
    wowchi.exploring(null);
};
wowchi.criterion_met = function(criterion) {
    var earned = _.find(wowchi.criteria(), function(c) { return c.id === criterion.id; });
    if (earned) {
        return earned.quantity >= criterion.max;
    }
    return false;
};
wowchi.add_to_queue = function() {
    wowchi.queue.push(wowchi.exploring());
};
wowchi.remove_from_queue = function(achi) {
    wowchi.queue.remove(achi);
};
wowchi.category_is_opened = function(category) {
    return wowchi.opened.indexOf(category.name) !== -1;
};
wowchi.achi_is_completed = function(achi) {
    return wowchi.completed.indexOf(achi.id) !== -1;
};
wowchi.is_exploring = function(achi) {
    return wowchi.exploring() === achi;
};
wowchi.wowhead_link = function() {
    return 'http://www.wowhead.com/achievement=' + wowchi.exploring().id;
};
wowchi.can_add_to_queue = function() {
    var achi = wowchi.exploring();
    return wowchi.queue.indexOf(achi) === -1 && !wowchi.achi_is_completed(achi);
};
wowchi.character_class_faction = ko.computed(function() {
    var race = wowchi.character_race();
    var faction = _.pluck([_.find(wowchi.races, function(r) {
        return r.id === race;
    })], "side")[0];
    var cc = wowchi.character_class();
    var _class = _.pluck([_.find(wowchi.classes, function(c) {
        return c.id === cc;
    })], "name")[0].toLowerCase();
    return faction + " " + _class;
});