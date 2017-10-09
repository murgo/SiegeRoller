class PackRoller {
    probability: number = 0.0;
    packs: number = 0;
    wins: number = 0;
    games: number = 0;
    packsByRarity = [ 0, 0, 0, 0, 0 ];
    winRatio: number = 0.5;
    streak: number = 0;
    minStreak: number = 0;
    maxStreak: number = 0;

    probabilityChangeWin: number = 0.035;
    probabilityChangeLose: number = 0.025;
    probabilityByRarity = [ 0.33, 0.615, 0.839, 0.964, 1 ];

    raritySettings = [
        { name: "Common", color: "#000000" },
        { name: "Uncommon", color: "#57db2e" },
        { name: "Rare", color: "#3176de" },
        { name: "Epic", color: "#e034e0" },
        { name: "Legendary", color: "#e39236" } ];

    interval: number = 1000;
    intervalChange: number = 0.92;
    timer: number;

    constructor(public rootElement: HTMLElement, public bottomScroller : BottomScroller) {
    }

    roll() {
        this.games += 1;
        this.streak += 1;

        var wonRoll = Math.random();
        var wonTheMatch = wonRoll <= this.winRatio;

        if (wonTheMatch) {
            this.probability += this.probabilityChangeWin;
            this.wins += 1;

            var packRoll = Math.random();
            if (packRoll <= this.probability) {
                // won the pack
                this.packs += 1;

                var rarityRoll = Math.random();
                var n: number;
                for (n = 0; n < this.probabilityByRarity.length; n++) {
                    if (rarityRoll <= this.probabilityByRarity[n]) {
                        break;
                    }
                }
                this.packsByRarity[n] += 1;
                var rar = this.raritySettings[n];
                this.addMessage("Won the game and got a " + rar.name + " alpha pack!", rar.color);

                this.probability = 0;
                if (this.minStreak == 0 || this.streak < this.minStreak) {
                    this.minStreak = this.streak;
                }
                if (this.maxStreak == 0 || this.streak > this.maxStreak) {
                    this.maxStreak = this.streak;
                }
                this.streak = 0;

                this.clear();
            } else {
                this.addMessage("Won the game, but didn't get pack.", "#7d7d7d");
            }
        } else {
            this.probability += this.probabilityChangeLose;
            this.addMessage("Lost the game.", "#c93636")
        }
    }

    clear() {
        this.interval *= this.intervalChange;
        if (this.interval < 1) {
            this.interval = 1;
        }

        clearInterval(this.timer);

        this.timer = setTimeout(() => {
            this.rootElement.innerHTML = "";
            this.updateStats();
            this.run();
        }, this.interval * 2);
    }

    addMessage(msg: string, color: string) {
        var el = document.createElement('p');
        el.textContent = msg + " Current probability: " + (this.probability * 100.0).toFixed(2) + "%.";
        el.style.color = color;
        this.bottomScroller.check();
        this.rootElement.appendChild(el);
        this.bottomScroller.scroll();
        this.updateStats();
    }

    run() {
        this.timer = setInterval(() => this.roll(), this.interval);
    }

    updateStats() {
        document.getElementById("games").innerText = "Games played: " + this.games;
        document.getElementById("wins").innerText = "Games won: " + this.wins;
        document.getElementById("packs").innerText = "Packs won: " + this.packs;
        document.getElementById("packsPerGames").innerText = "Packs/games: " + (this.packs / this.games).toFixed(2);
        document.getElementById("averageWins").innerText = "Average amount of wins for pack: " + (this.wins / this.packs).toFixed(2);
        document.getElementById("averageGames").innerText = "Average amount of games for pack: " + (this.games / this.packs).toFixed(2);
        document.getElementById("minStreak").innerText = "Min streak for pack: " + this.minStreak;
        document.getElementById("maxStreak").innerText = "Max games for pack: " + this.maxStreak;

        for (let n = 0; n < this.raritySettings.length; n++) {
            let el = document.getElementById("rarity" + n);
            el.innerText = this.raritySettings[n].name + ": " + this.packsByRarity[n];
            el.style.color = this.raritySettings[n].color;
        }

        this.winRatio = Number((<HTMLInputElement>document.getElementById("input_winratio")).value);
        document.getElementById("interval").innerText = "Interval: " + this.interval;
    }
}

class BottomScroller {
    isScrolledToBottom: boolean;

    constructor(public rootElement: HTMLElement) {

    }

    check() {
        var out = this.rootElement;
        // allow 1px inaccuracy by adding 1
        this.isScrolledToBottom = out.scrollHeight - out.clientHeight <= out.scrollTop + 1;
    }

    scroll() {
        var out = this.rootElement;
        if(this.isScrolledToBottom) {
            out.scrollTop = out.scrollHeight - out.clientHeight;
        }
    }
}

window.onload = () => {
    var rootElement = document.getElementById("content");
    var bottomScroller = new BottomScroller(rootElement);

    var packRoller = new PackRoller(rootElement, bottomScroller);
    packRoller.run();
};
