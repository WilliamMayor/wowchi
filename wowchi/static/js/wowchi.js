var Locale = function(country, locale, host) {
    this.country = country;
    this.locale = locale;
    this.host = host;
};
var Realm = function(name) {
    this.name = name;
};
var Criterion = function(id, quantity) {
    this.id = id;
    this.quantity = quantity;
};
var wowchi = {
    locales: [
        new Locale('USA', 'en_US', 'http://us.battle.net'),
        new Locale('Mexico', 'es_MX', 'http://us.battle.net'),
        new Locale('Brazil', 'pt_BR', 'http://us.battle.net'),
        new Locale('UK', 'en_GB', 'http://eu.battle.net'),
        new Locale('Spain', 'es_ES', 'http://eu.battle.net'),
        new Locale('France', 'fr_FR', 'http://eu.battle.net'),
        new Locale('Russia', 'ru_RU', 'http://eu.battle.net'),
        new Locale('Germany', 'de_DE', 'http://eu.battle.net'),
        new Locale('Portugal', 'pt_PT', 'http://eu.battle.net'),
        new Locale('Italy', 'it_IT', 'http://eu.battle.net'),
        new Locale('Korea', 'ko_KR', 'http://kr.battle.net'),
        new Locale('Taiwan', 'zh_TW', 'http://tw.battle.net'),
        new Locale('China', 'zh_CN', 'http://www.battlenet.com.cn')
    ],
    races: [
        {
            id: 1,
            mask: 1,
            side: "alliance",
            name: "Human"
        }, {
            id: 1,
            mask: 1,
            side: "alliance",
            name: "Human"
        }, {
            id: 2,
            mask: 2,
            side: "horde",
            name: "Orc"
        }, {
            id: 2,
            mask: 2,
            side: "horde",
            name: "Orc"
        }, {
            id: 3,
            mask: 4,
            side: "alliance",
            name: "Dwarf"
        }, {
            id: 3,
            mask: 4,
            side: "alliance",
            name: "Dwarf"
        }, {
            id: 4,
            mask: 8,
            side: "alliance",
            name: "Night Elf"
        }, {
            id: 4,
            mask: 8,
            side: "alliance",
            name: "Night Elf"
        }, {
            id: 5,
            mask: 16,
            side: "horde",
            name: "Undead"
        }, {
            id: 5,
            mask: 16,
            side: "horde",
            name: "Undead"
        }, {
            id: 6,
            mask: 32,
            side: "horde",
            name: "Tauren"
        }, {
            id: 6,
            mask: 32,
            side: "horde",
            name: "Tauren"
        }, {
            id: 7,
            mask: 64,
            side: "alliance",
            name: "Gnome"
        }, {
            id: 7,
            mask: 64,
            side: "alliance",
            name: "Gnome"
        }, {
            id: 8,
            mask: 128,
            side: "horde",
            name: "Troll"
        }, {
            id: 8,
            mask: 128,
            side: "horde",
            name: "Troll"
        }, {
            id: 9,
            mask: 256,
            side: "horde",
            name: "Goblin"
        }, {
            id: 10,
            mask: 512,
            side: "horde",
            name: "Blood Elf"
        }, {
            id: 11,
            mask: 1024,
            side: "alliance",
            name: "Draenei"
        }, {
            id: 11,
            mask: 1024,
            side: "alliance",
            name: "Draenei"
        }, {
            id: 22,
            mask: 2097152,
            side: "alliance",
            name: "Worgen"
        }, {
            id: 24,
            mask: 8388608,
            side: "neutral",
            name: "Pandaren"
        }, {
            id: 25,
            mask: 16777216,
            side: "alliance",
            name: "Pandaren"
        }, {
            id: 26,
            mask: 33554432,
            side: "horde",
            name: "Pandaren"
    }],
    classes: [
        {
            id: 3,
            mask: 4,
            powerType: "focus",
            name: "Hunter"
        }, {
            id: 4,
            mask: 8,
            powerType: "energy",
            name: "Rogue"
        }, {
            id: 1,
            mask: 1,
            powerType: "rage",
            name: "Warrior"
        }, {
            id: 2,
            mask: 2,
            powerType: "mana",
            name: "Paladin"
        }, {
            id: 7,
            mask: 64,
            powerType: "mana",
            name: "Shaman"
        }, {
            id: 8,
            mask: 128,
            powerType: "mana",
            name: "Mage"
        }, {
            id: 5,
            mask: 16,
            powerType: "mana",
            name: "Priest"
        }, {
            id: 6,
            mask: 32,
            powerType: "runic-power",
            name: "Death Knight"
        }, {
            id: 11,
            mask: 1024,
            powerType: "mana",
            name: "Druid"
        }, {
            id: 9,
            mask: 256,
            powerType: "mana",
            name: "Warlock"
        }, {
            id: 10,
            mask: 512,
            powerType: "energy",
            name: "Monk"
    }],
    working: ko.observable(false),
    locale: ko.observable(),
    realm: ko.observable(),
    realms: ko.observableArray(),
    character_name: ko.observable(),
    character_class: ko.observable(7),
    character_race: ko.observable(2),
    exploring: ko.observable(),
    completed: ko.observableArray(),
    criteria: ko.observableArray(),
    available: ko.observableArray(),
    queue: ko.observableArray(),
    opened: ko.observableArray()
};