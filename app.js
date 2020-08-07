let PLAYER_HEALTH = 100;
let PLAYER_MANA = 100;
let MONSTER_HEALTH = 1000;
let MANA_POTIONS = 2;
let GAME_IS_RUNNING = false;
let SHIELD_UP = true;
let ACTIVE_SHIELD = false;
let TURNS = [];

new Vue({
  el: '#app',
  data: {
    playerHealth: PLAYER_HEALTH,
    playerMana: PLAYER_MANA,
    monsterHealth: MONSTER_HEALTH,
    manaPotions: MANA_POTIONS,
    gameIsRunning: GAME_IS_RUNNING,
    shieldUp: SHIELD_UP,
    activeShield: ACTIVE_SHIELD,
    turns: TURNS,
  },
  watch: {
    // Chance de soigner le monstre lorsqu'il y a un changement sur sa vie
    monsterHealth: function () {
      if (!this.gameIsRunning) {
        return;
      }
      chanceToHeal = Math.random() * 10;
      if (chanceToHeal < 0.5) {
        if (this.monsterHealth < 900) {
          this.monsterHealth += 100;
          this.turns.unshift({
            isPlayer: false,
            text: 'Le monstre a récupéré 100PV en se soignant !',
          });
        } else {
          this.monsterHealth = 1000;
          this.turns.unshift({
            isPlayer: false,
            text: 'Le monstre a récupéré 100PV en se soignant !',
          });
        }
      }
    },
    // Lorsque le jeu est lancé, le monstre attaque toutes les 0.5 secondes et la mana du joueur se regénère de 15 toutes les 2 secondes
    gameIsRunning: function () {
      if (this.gameIsRunning) {
        let vm = this;
        let attacksInterval = setInterval(function () {
          if (!vm.gameIsRunning) {
            clearInterval(attacksInterval);
          } else {
            vm.monsterAttacks();
          }
        }, 500);
        let manaInterval = setInterval(function () {
          if (!vm.gameIsRunning) {
            clearInterval(manaInterval);
          } else {
            if (vm.playerMana < 85) {
              vm.playerMana += 15;
            } else if (vm.playerMana >= 85) {
              vm.playerMana = 100;
            }
          }
        }, 2000);
      }
    },
    // Lorsque le bouclier est activé, il reste actif pendant 5 secondes.
    activeShield: function () {
      if (this.shieldUp) {
        this.shieldUp = false;
        let shieldTimer = 5;
        let vm = this;
        let shieldTimerInterval = setInterval(function () {
          if (shieldTimer > 0) {
            shieldTimer--;
          } else if (shieldTimer <= 0) {
            vm.activeShield = false;
            clearInterval(shieldTimerInterval);
          }
        }, 1000);
      }
    },
  },
  methods: {
    // Début de la partie
    startGame: function () {
      this.gameIsRunning = true;
      this.playerHealth = PLAYER_HEALTH;
      this.monsterHealth = MONSTER_HEALTH;
      this.manaPotions = MANA_POTIONS;
      this.playerMana = PLAYER_MANA;
      this.shieldUp = SHIELD_UP;
      this.activeShield = ACTIVE_SHIELD;
      this.turns = TURNS;
    },
    // Attaque du joueur
    attack: function () {
      this.playerMana -= 10;
      if (this.chanceToHit()) {
        let damage = this.calculateDamage(10, 125);
        if (!this.chanceToDodge()) {
          this.monsterHealth -= damage;
          this.addLog('vous avez frappé le monstre de ' + damage, true);
        } else {
          this.addLog('le monstre a esquivé votre attaque, la honte! ', false);
        }
        if (this.checkWin()) {
          return;
        }
      } else {
        this.addLog('vous avez raté votre attaque... Pas de chance', true);
      }
    },
    // Le joueur bois une potion de mana
    drinkMana: function () {
      if (this.manaPotions > 0) {
        if (this.playerMana < 50) {
          this.playerMana += 50;
        } else if (this.playerMana >= 50) {
          this.playerMana = 100;
        }
        this.addLog(
          'Vous avez bu une potion de mana, le combat continu!',
          true
        );
        this.manaPotions -= 1;
      }
    },
    // Le joueur se soigne
    heal: function () {
      if (this.playerHealth <= 90) {
        this.playerHealth += 10;
      } else {
        this.playerHealth = 100;
      }
      this.playerMana -= 10;
      this.addLog('vous vous êtes soigné de 10PV, trop fort!', true);
    },
    // Le joueur abandonne la partie
    giveUp: function () {
      this.gameIsRunning = false;
      this.turns = [];
    },
    // Attaque du monstre
    monsterAttacks: function () {
      if (this.activeShield) {
        this.addLog(
          'vous avez un bouclier, le monstre ne peut pas vous toucher. le looser !',
          false
        );
        return;
      }
      if (this.chanceToHit()) {
        if (!this.chanceToDodge()) {
          let damage = this.calculateDamage(5, 12);
          this.playerHealth -= damage;
          this.addLog('le monstre vous a cogné de ' + damage, false);
          this.checkWin();
        } else {
          this.addLog("vous avez esquivé l'attaque du monstre! ", true);
        }
      } else {
        this.addLog('le monstre a raté son attaque, trop facile!', false);
      }
    },
    // Le joueur active son seul et unique bouclier
    shield: function () {
      if (this.shieldUp) {
        this.activeShield = true;
      }
    },
    // Rentourne un certain montant de dégat en fonction du min et du max
    calculateDamage: function (min, max) {
      return Math.max(Math.floor(Math.random() * max) + 1, min);
    },
    // Vérifie si le joueur ou le monstre est mort
    checkWin: function () {
      if (this.monsterHealth <= 0) {
        if (confirm('Vous avez gagné! On recommence ?')) {
          this.startGame();
        } else {
          this.gameIsRunning = false;
        }
        return true;
      } else if (this.playerHealth <= 0) {
        if (confirm('You avez perdu! Revanche ?')) {
          this.startGame();
        } else {
          this.gameIsRunning = false;
        }
        return true;
      }
      return false;
    },
    // Calcul la probabilité de réussir son attaque
    chanceToHit: function () {
      if (Math.floor(Math.random() * 10) > 2) {
        return true;
      }

      return false;
    },
    // Calcul la probabilité d'esquiver une attaque
    chanceToDodge: function () {
      if (Math.floor(Math.random() * 10) < 2) {
        return true;
      }
      return false;
    },
    // Ajoute un message
    addLog: function (message, isPlayer) {
      this.turns.unshift({
        isPlayer: isPlayer,
        text: message,
      });
    },
  },
});
