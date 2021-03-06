var PackRoller = (function () {
    function PackRoller(rootElement, bottomScroller) {
        this.rootElement = rootElement;
        this.bottomScroller = bottomScroller;
        // TODO: Check probabilityChange numbers. Check if can pack be rolled for 0% (is probability incremented after rolling for pack?).
        this.probability = 0.0;
        this.packs = 0;
        this.wins = 0;
        this.games = 0;
        this.packsByRarity = [0, 0, 0, 0, 0];
        this.winRatio = 0.5;
        this.streak = 0;
        this.minStreak = 0;
        this.maxStreak = 0;
        this.probabilityChangeWin = 0.03;
        this.probabilityChangeLose = 0.025;
        this.probabilityByRarity = [0.33, 0.615, 0.839, 0.964, 1];
        this.hoursPerGame = 0.5;
        this.raritySettings = [
            { name: "Common", color: "#000000" },
            { name: "Uncommon", color: "#57db2e" },
            { name: "Rare", color: "#3176de" },
            { name: "Epic", color: "#e034e0" },
            { name: "Legendary", color: "#e39236" }
        ];
        this.interval = 1000;
        this.intervalChange = 0.91;
    }
    PackRoller.prototype.roll = function () {
        this.games += 1;
        this.streak += 1;
        var winRoll = Math.random();
        var wonTheMatch = winRoll <= this.winRatio;
        if (wonTheMatch) {
            this.wins += 1;
            var packRoll = Math.random();
            if (packRoll <= this.probability) {
                // won the pack
                this.packs += 1;
                var rarityRoll = Math.random();
                var n;
                for (n = 0; n < this.probabilityByRarity.length; n++) {
                    if (rarityRoll <= this.probabilityByRarity[n]) {
                        break;
                    }
                }
                this.packsByRarity[n] += 1;
                var rar = this.raritySettings[n];
                this.probability = this.probabilityChangeWin; // reset to 3
                if (this.minStreak == 0 || this.streak < this.minStreak) {
                    this.minStreak = this.streak;
                }
                if (this.maxStreak == 0 || this.streak > this.maxStreak) {
                    this.maxStreak = this.streak;
                }
                this.streak = 0;
                this.addMessage("Won the game and got a " + rar.name + " alpha pack!", rar.color);
                this.clear();
            }
            else {
                this.probability += this.probabilityChangeWin;
                this.addMessage("Won the game, but didn't get pack.", "#7d7d7d");
            }
        }
        else {
            this.probability += this.probabilityChangeLose;
            this.addMessage("Lost the game.", "#c93636");
        }
    };
    PackRoller.prototype.clear = function () {
        var _this = this;
        this.interval *= this.intervalChange;
        if (this.interval < 1) {
            this.interval = 1;
        }
        clearInterval(this.timer);
        this.timer = setTimeout(function () {
            _this.rootElement.innerHTML = "";
            _this.updateStats();
            _this.run();
        }, this.interval * 2.5);
    };
    PackRoller.prototype.addMessage = function (msg, color) {
        var el = document.createElement('p');
        el.textContent = this.streak + ". " + msg + " New alpha pack chance: " + (this.probability * 100.0).toFixed(2) + "%.";
        el.style.color = color;
        this.bottomScroller.check();
        this.rootElement.appendChild(el);
        this.bottomScroller.scroll();
        this.updateStats();
    };
    PackRoller.prototype.run = function () {
        var _this = this;
        this.timer = setInterval(function () { return _this.roll(); }, this.interval);
    };
    PackRoller.prototype.updateStats = function () {
        document.getElementById("games").innerText = "Games played: " + this.games;
        document.getElementById("wins").innerText = "Games won: " + this.wins;
        document.getElementById("packs").innerText = "Alpha packs won: " + this.packs;
        document.getElementById("packsPerGames").innerText = "Packs/game: " + (this.packs / this.games).toFixed(2);
        document.getElementById("averageWins").innerText = "Average amount of wins for pack: " + (this.wins / this.packs).toFixed(2);
        document.getElementById("averageGames").innerText = "Average amount of games for pack: " + (this.games / this.packs).toFixed(2);
        document.getElementById("minStreak").innerText = "Min streak for pack: " + this.minStreak;
        document.getElementById("maxStreak").innerText = "Max streak for pack: " + this.maxStreak;
        document.getElementById("hoursPlayed").innerText = "Hours played: " + (this.games * this.hoursPerGame);
        document.getElementById("hoursPerPack").innerText = "Hours of ranked for a pack: " + ((this.games * this.hoursPerGame) / this.packs).toFixed(2);
        document.getElementById("hoursPerLegendary").innerText = "Hours of ranked for a legendary: " + ((this.games * this.hoursPerGame) / this.packsByRarity[4]).toFixed(2);
        for (var n = 0; n < this.raritySettings.length; n++) {
            var el = document.getElementById("rarity" + n);
            el.innerText = this.raritySettings[n].name + ": " + this.packsByRarity[n];
            el.style.color = this.raritySettings[n].color;
        }
        var winlossratio = Number(document.getElementById("input_winlossratio").value);
        this.winRatio = winlossratio / (1 + winlossratio);
        document.getElementById("winratio").innerText = "Win probability: " + (this.winRatio * 100.0).toFixed(1) + "%";
        document.getElementById("interval").innerText = "Interval: " + this.interval.toFixed(0) + ((this.interval > 1) ? " (It gets faster :)" : " (Look at it go! :)");
    };
    return PackRoller;
}());
var BottomScroller = (function () {
    function BottomScroller(rootElement) {
        this.rootElement = rootElement;
    }
    BottomScroller.prototype.check = function () {
        var out = this.rootElement;
        // allow 1px inaccuracy by adding 1
        this.isScrolledToBottom = out.scrollHeight - out.clientHeight <= out.scrollTop + 1;
    };
    BottomScroller.prototype.scroll = function () {
        var out = this.rootElement;
        if (this.isScrolledToBottom) {
            out.scrollTop = out.scrollHeight - out.clientHeight;
        }
    };
    return BottomScroller;
}());
window.onload = function () {
    var rootElement = document.getElementById("content");
    var bottomScroller = new BottomScroller(rootElement);
    var packRoller = new PackRoller(rootElement, bottomScroller);
    packRoller.run();
};
