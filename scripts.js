const suits = ["spades", "diamonds", "clubs", "hearts"];
const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

const button__new_game = document.getElementById("new-game");
const button__hit_me = document.getElementById("hit-me");





const deck = (() => {

    const activeDeck = [];

    // Get a full 52 card deck.
    const generate = () => {
        for (let i = 0; i < suits.length; i++) {
            for (let x = 0; x < values.length; x++) {
                var card = {
                    Value: values[x],
                    Suit: suits[i]
                }
                activeDeck.push(card);
            }
        }
    }

    // Shuffle the deck.
    const shuffle = () => {
        let currentIndex = activeDeck.length, randomIndex;

        // While there remain elements to shuffle.
        while (currentIndex != 0) {

            // Pick a remaining element.
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [activeDeck[currentIndex], activeDeck[randomIndex]] = [
                activeDeck[randomIndex], activeDeck[currentIndex]];
        }
    }

    return ({
        activeDeck,
        generate,
        shuffle
    });

})();





const player = (() => {

    const hand = [];
    const points = 0;

    return ({
        hand,
        points
    })

})()





const dealer = (() => {

    const hand = [];
    const points = 0;

    return ({
        hand,
        points
    })

})()





const gameControl = (() => {

    const startNewGame = () => {
        deck.generate();
        deck.shuffle();

        dealCard(player.hand, 1);
        dealCard(dealer.hand, 0);
        dealCard(player.hand, 1);
        dealCard(dealer.hand, 1);
    }

    const dealCard = (hand, state) => {
        hand.push(...deck.activeDeck.splice(0, 1));
        hand[hand.length - 1]["State"] = state;
    }

    return ({
        startNewGame,
        dealCard
    })

})()





// Button "New Game"
button__new_game.addEventListener("click", function () {
    gameControl.startNewGame();
    console.log(deck.activeDeck);
    console.log(player.hand);
    console.log(dealer.hand);
});

// Button "Hit Me!"
button__hit_me.addEventListener("click", function () {
    gameControl.dealCard(player.hand, 1);
    console.log(player.hand);
});