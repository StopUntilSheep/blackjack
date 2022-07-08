const deck = (() => {

    const activeDeck = [];

    const suits = ["spades", "diamonds", "clubs", "hearts"];
    const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

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

    // Clear the deck of all cards.
    const clear = () => {
        activeDeck.length = 0;
    }

    return ({
        activeDeck,
        generate,
        shuffle,
        clear
    });

})();





const player = (() => {

    const name = "player";

    const hand = [];

    // Clear the hand of all cards.
    const clearHand = () => {
        hand.length = 0;

    }

    const getScore = () => {
        let score = 0;
        let countOfAces = 0;
        hand.forEach((elem) => {
            if (elem.Value === "A") {
                score += 11;
                countOfAces += 1;
            }
            else if (["2", "3", "4", "5", "6", "7", "8", "9"].includes(elem.Value)) { score += parseInt(elem.Value); }
            else { score += 10; }
        });

        // CHECKS FOR ACES THAT ARE CAUSING A BUST!
        for (let i = 0; i < countOfAces; i++) {
            if (game.logic.checkForBust(score)) {
                score = score - 10;
            }
        }

        return score;
    }

    return ({
        name,
        hand,
        getScore,
        clearHand
    })

})()





const dealer = (() => {

    const name = "dealer";

    const hand = [];

    // Clear the hand of all cards.
    const clearHand = () => {
        hand.length = 0;
    }

    const getScore = () => {
        let score = 0;
        hand.forEach((elem) => {
            if (elem.Value === "A") { score += 11; }
            else if (["2", "3", "4", "5", "6", "7", "8", "9"].includes(elem.Value)) { score += parseInt(elem.Value); }
            else { score += 10; }
        });
        if (game.logic.checkForBust(score) && hand[hand.length - 1].Value === "A") {
            score = score - 10;
        }
        return score;
    }

    return ({
        name,
        hand,
        getScore,
        clearHand
    })

})()





const animations = (() => {

    const convertStringToHTML = (str) => {
        let parser = new DOMParser();
        let doc = parser.parseFromString(str, 'text/html');
        return doc.body.childNodes[0];
    }

    const getCardHTMLElement = (faceup, cardName) => {
        if (faceup === 0) {
            return convertStringToHTML(allCards["back"]);
        } else {
            return convertStringToHTML(allCards[cardName]);
        }
    }

    const dealCard = (recipient, cardName, faceup) => {

        const displayCard = (card, recipient) => {

            let tableArea = document.getElementById(`cards-${recipient}`);
            tableArea.append(card);
            nodes = tableArea.querySelectorAll('.card');
            last = nodes[nodes.length - 1];
            last.style.setProperty('--random-1', Math.random() * 2);           // 0 to 3
            last.style.setProperty('--random-2', Math.random() * 24 - 12);     // -12 to 12 

        }

        let card = getCardHTMLElement(faceup, cardName);
        displayCard(card, recipient);

        let timeout = 400;

        return ({
            displayCard,
            timeout
        })

    }

    const flipFaceDownCard = () => {

        let tableArea = document.getElementById('cards-dealer');
        let nodes = tableArea.querySelectorAll('.card');
        let cardName = `${dealer.hand[0].Value}-${dealer.hand[0].Suit}`;

        let first = nodes[0];
        first.remove();

        tableArea.prepend(convertStringToHTML(allCards[cardName]));

        nodes = tableArea.querySelectorAll('.card');
        first = nodes[0];
        first.style.setProperty('--random-1', Math.random() * 2);           // 0 to 3
        first.style.setProperty('--random-2', Math.random() * 24 - 12);     // -12 to 12 

        return 400;         // delay for subsequent functions to allow time for this animation to complete

    }

    return ({
        convertStringToHTML,
        getCardHTMLElement,
        dealCard,
        flipFaceDownCard
    })

})()






const sound = (() => {

    const whoosh1 = () => {
        const audio = new Audio("whoosh-1.mp3");
        audio.play();
    }

    const whoosh2 = () => {
        const audio = new Audio("whoosh-2.mp3");
        audio.play();
    }

    return ({
        whoosh1,
        whoosh2
    })

})()






const game = (() => {

    const boardControl = (() => {

        const dealNewHands = () => {

            setTimeout(() => {

                deck.clear();
                deck.generate();
                deck.shuffle();

                player.clearHand();
                dealer.clearHand();

                setTimeout(() => dealCard(player, 1), 0);
                setTimeout(() => dealCard(dealer, 0), 400);
                setTimeout(() => dealCard(player, 1), 800);
                setTimeout(() => dealCard(dealer, 1), 1200);

            }, clearBoard());         // clearBoard() clears the cards from the board and returns the number of milliseconds it took to do it.
            // Added 400ms so that there is a little gap between clearing the board and dealing the new cards.

            return 1600;

        }

        const dealCard = (recipient, state) => {

            let card = deck.activeDeck.splice(0, 1);
            let cardName = `${card[0]["Value"]}-${card[0]["Suit"]}`;
            recipient.hand.push(...card);
            card["State"] = state;

            setTimeout(() => {
                interface.info.playerScore.update();
                interface.info.dealerScore.update();
                if (game.logic.checkForBlackjack(recipient.getScore())) {
                    interface.message.blackjack();
                    interface.menu.gameMenu.hide();
                    game.dealerTurn();
                }
                if (game.logic.checkForBust(recipient.getScore())) {
                    interface.message.bust();
                    setTimeout(() => {
                        player.clearHand();
                        dealer.clearHand();
                        interface.info.playerScore.hide();
                        interface.info.dealerScore.hide();
                        interface.menu.gameMenu.hide();
                        interface.menu.betMenu.show();

                    }, clearBoard());
                }
            }, animations.dealCard(recipient.name, cardName, state).timeout);

        }

        const clearBoard = () => {

            const playerCards = document.querySelectorAll("#cards-player .card");
            const dealerCards = document.querySelectorAll("#cards-dealer .card");

            playerCards.forEach((element, index) => {
                setTimeout(() => {
                    sound.whoosh2();
                    element.classList.add("slide-out-bottom");
                }, 100 * index);
            });
            dealerCards.forEach((element, index) => {
                setTimeout(() => {
                    sound.whoosh2();
                    element.classList.add("slide-out-top");
                }, 100 * index);
            });

            setTimeout(() => document.getElementById('cards-player').innerHTML = "", 100 * playerCards.length);
            setTimeout(() => document.getElementById('cards-dealer').innerHTML = "", 100 * dealerCards.length);

            // return number of milliseconds to delay the rest of the code by (adding 400 if cards were cleared to make clear distinction between stages of game)
            let delay = 0;
            if (playerCards.length > 0 || dealerCards.length > 0) {
                delay = 100 * Math.max(playerCards.length, dealerCards.length) + 400;
            }
            return delay;

        }

        return ({
            dealNewHands,
            dealCard,
            clearBoard
        })

    })()

    const logic = (() => {

        const checkForBust = (score) => {
            if (score > 21) {
                return true;
            }
        }

        const checkForBlackjack = (score) => {
            if (score === 21) {
                return true;
            }
        }

        return ({
            checkForBust,
            checkForBlackjack
        })

    })()

    const dealerTurn = () => {

        animations.flipFaceDownCard();

        function myLoop() {                 //  create a loop function
            setTimeout(function () {        //  call a 1s setTimeout when the loop is called


                if (dealer.getScore() <= 16) {
                    boardControl.dealCard(dealer, 1);
                } else {
                    if (player.getScore() > dealer.getScore()) {
                        boardControl.dealCard(dealer, 1);
                    } else {
                        interface.message.stick();
                        setTimeout(() => {
                            player.clearHand();
                            dealer.clearHand();
                            interface.info.playerScore.update();
                            interface.info.dealerScore.update();
                            interface.info.playerScore.hide();
                            interface.info.dealerScore.hide();
                            interface.menu.gameMenu.hide();
                            interface.menu.betMenu.show();
                        }, boardControl.clearBoard());
                        return;
                    }
                }


                if (dealer.getScore() <= 21) {               //  if the score <= 21, call the loop function
                    myLoop();               //  ..  again which will trigger another 
                }                           //  ..  setTimeout()
            }, 1000)
        }

        myLoop();                           //  start the loop

    }

    return ({
        boardControl,
        logic,
        dealerTurn
    })

})()









const interface = (() => {

    const info = (() => {

        const playerBank = (() => {

            let bankBalance;

            const playerBank = document.getElementById("player-bank");
            const bankBalanceInput = document.querySelector("#player-bank .value input");

            const show = () => {
                playerBank.classList.remove("slide-from-top");
                playerBank.classList.add("slide-from-top");
            }

            const hide = () => {
                playerBank.classList.remove("slide-from-top");
                playerBank.classList.add("slide-out-top");
            }

            return ({
                bankBalance,
                bankBalanceInput,
                show,
                hide
            })

        })()

        const playerScore = (() => {

            const playerScoreElement = document.getElementById("player-score");
            const playerScoreInput = document.querySelector("#player-score .value input");

            const show = () => {
                playerScoreElement.classList.remove("slide-out-right");
                playerScoreElement.classList.add("slide-from-right");
                return 200;
            }

            const hide = () => {
                playerScoreElement.classList.remove("slide-from-right");
                playerScoreElement.classList.add("slide-out-right");
                return 200;
            }

            const update = () => {
                playerScoreInput.value = player.getScore();
            }

            return ({
                show,
                hide,
                update
            })

        })()

        const dealerScore = (() => {

            const dealerScoreElement = document.getElementById("dealer-score");
            const dealerScoreInput = document.querySelector("#dealer-score .value input");

            const show = () => {
                dealerScoreElement.classList.remove("slide-out-right");
                dealerScoreElement.classList.add("slide-from-right");
                return 200;
            }

            const hide = () => {
                dealerScoreElement.classList.remove("slide-from-right");
                dealerScoreElement.classList.add("slide-out-right");
                return 200;
            }

            const update = () => {
                dealerScoreInput.value = dealer.getScore();
            }

            return ({
                show,
                hide,
                update
            })

        })()

        return ({
            playerBank,
            playerScore,
            dealerScore
        })

    })()

    const menu = (() => {

        const gameMenu = (() => {

            const gameMenu = document.getElementById("game-menu");
            const gameMenu__newGame = document.getElementById("new-game");
            const gameMenu__hitMe = document.getElementById("hit-me");
            const gameMenu__stick = document.getElementById("stick");

            gameMenu__newGame.addEventListener("click", function () {
                interface.menu.gameMenu.hide();
                interface.menu.betMenu.show();
                interface.info.playerBank.show();
            });

            gameMenu__hitMe.addEventListener("click", function () {
                game.boardControl.dealCard(player, 1);
            });

            gameMenu__stick.addEventListener("click", function () {
                interface.menu.gameMenu.hide();
                game.dealerTurn();
            });

            const show = () => {
                gameMenu.classList.remove("slide-out-bottom");
                gameMenu.classList.add("slide-from-bottom");
            }

            const hide = () => {
                gameMenu.classList.remove("slide-from-bottom");
                gameMenu.classList.add("slide-out-bottom");
            }

            const newGame = (() => {

                const show = () => {
                    gameMenu__newGame.classList.add("show");
                }

                const hide = () => {
                    gameMenu__newGame.classList.remove("show");
                }

                return ({
                    show,
                    hide
                })

            })()

            const hitMe = (() => {

                const show = () => {
                    gameMenu__hitMe.classList.add("show");
                }

                const hide = () => {
                    gameMenu__hitMe.classList.remove("show");
                }

                return ({
                    show,
                    hide
                })

            })()

            const stick = (() => {

                const show = () => {
                    gameMenu__stick.classList.add("show");
                }

                const hide = () => {
                    gameMenu__stick.classList.remove("show");
                }

                return ({
                    show,
                    hide
                })

            })()

            return ({
                newGame,
                hitMe,
                stick,
                show,
                hide
            })

        })()

        const betMenu = (() => {

            const betScaler = document.getElementById("bet-scaler");
            const betAmount = document.getElementById("bet-amount");
            const placeBet = document.getElementById("place-bet");
            const betAmountInput = document.querySelector("#bet-amount .value input");
            const parent = document.querySelector('#bet-scaler--inner-bg');
            const draggable = document.querySelector('#bet-scaler--handle');
            const fill = document.querySelector('#bet-scaler--inner-fill');

            const EventListeners = (() => {

                placeBet.addEventListener("click", function () {

                    setTimeout(() => {

                        setTimeout(() => {

                            setTimeout(() => {

                                interface.menu.gameMenu.show();
                                interface.menu.gameMenu.newGame.hide();
                                interface.menu.gameMenu.hitMe.show();
                                interface.menu.gameMenu.stick.show();

                            }, game.boardControl.dealNewHands());

                        }, Math.max(interface.info.playerScore.show(), interface.info.dealerScore.show()));

                    }, hide());

                });

                betAmountInput.addEventListener("click", function () {
                    this.select();
                });

                betAmountInput.addEventListener("input", function () {
                    validateBetAmount();
                    updateBetSliderHandle(100 - ((this.value / bankBalance) * 100));
                    updateBetSliderFill((this.value / bankBalance) * 100);
                });

            })()

            const SliderFunctionality = (() => {

                var dragging = false;

                function moveStart(e) {
                    e.preventDefault();
                    dragging = true;
                }

                function moveEnd(e) {
                    e.preventDefault();
                    dragging = false;
                }

                function moving(e) {
                    e.preventDefault();
                    var parentRect = parent.getBoundingClientRect();
                    if (dragging) {
                        //while mouse is in bounds (top + bottom)
                        if ((e.clientY >= parentRect.top) && (e.clientY <= parentRect.bottom)) {
                            percentage = ((e.clientY - parentRect.top) / parentRect.height) * 100;
                            updateBetSliderHandle(percentage);
                            updateBetSliderFill(100 - percentage);
                            betPercentage = 100 - percentage;
                        } else {
                            //if mouse went out of bounds in Vertical dir (bottom)
                            if (e.clientY >= parentRect.bottom) {
                                updateBetSliderHandle(100);
                                updateBetSliderFill(0);
                                betPercentage = 0;
                            }
                            //if mouse went out of bounds in Vertical dir (top)
                            if (e.clientY <= parentRect.top) {
                                updateBetSliderHandle(0);
                                updateBetSliderFill(100);
                                betPercentage = 100;
                            }
                        }
                        updateBetAmount(betPercentage);
                    }
                }

                function updateBetAmount(betPercentage) {
                    betAmountInput.value = parseFloat(Math.round(interface.info.playerBank.bankBalance * betPercentage) / 100).toFixed(2);
                }

                draggable.addEventListener('mousedown', moveStart);
                document.addEventListener('mousemove', moving);
                document.addEventListener('mouseup', moveEnd);

            })()

            const show = () => {
                betScaler.classList.remove("slide-out-right");
                betScaler.classList.add("slide-from-right");

                betAmount.classList.remove("slide-out-bottom");
                betAmount.classList.add("slide-from-bottom");

                return 200;
            }

            const hide = () => {
                betScaler.classList.remove("slide-from-right");
                betScaler.classList.add("slide-out-right");

                betAmount.classList.remove("slide-from-bottom");
                betAmount.classList.add("slide-out-bottom");

                return 200;
            }

            const updateBetSliderHandle = (top) => {
                draggable.style.top = `${top}%`;
            }

            const updateBetSliderFill = (height) => {
                fill.style.height = `${height}%`;
            }

            const validateBetAmount = () => {
                if (betAmountInput.value == "") { betAmountInput.value = parseFloat(0.00).toFixed(2); }
                if (betAmountInput.value > bankBalance) { betAmountInput.value = parseFloat(bankBalance).toFixed(2); }
                if (betAmountInput.value < 0) { betAmountInput.value = parseFloat(0.00).toFixed(2); }
            }

            return ({
                EventListeners,
                SliderFunctionality,
                betAmountInput,
                show,
                hide,
                updateBetSliderHandle,
                updateBetSliderFill,
                validateBetAmount
            })

        })()

        return ({
            gameMenu,
            betMenu
        })

    })()

    const message = (() => {

        const stick = () => {

            alert("Stick!");

        }

        const bust = () => {

            alert("Bust!");

        }

        const blackjack = () => {

            alert("Blackjack!");

        }

        return ({
            stick,
            bust,
            blackjack
        })

    })()

    return ({
        info,
        menu,
        message
    })

})()









window.onload = () => {

    interface.info.playerBank.bankBalance = 500;
    interface.info.playerBank.bankBalanceInput.value = parseFloat(interface.info.playerBank.bankBalance).toFixed(2);
    interface.menu.betMenu.betAmountInput.value = parseFloat(0).toFixed(2);
    interface.menu.gameMenu.show();
    interface.menu.gameMenu.newGame.show();

}