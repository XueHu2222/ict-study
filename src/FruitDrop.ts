import Game from './Game.js';

import CanvasRenderer from './CanvasRenderer.js';
import KeyListener from './KeyListener.js';
import Fruit from './Fruit.js';
import Player from './Player.js';
import Spider from './Spider.js';

export default class FruitDrop extends Game {
  private canvas: HTMLCanvasElement;

  private fruit: Fruit[];

  private spiders: Spider[];

  private player: Player;

  private keyListener: KeyListener;

  private score: number;

  private nextItem: number;

  private timeLeft: number;

  public constructor(canvas: HTMLCanvasElement) {
    super();
    this.canvas = canvas;
    this.canvas.height = window.innerHeight;
    this.canvas.width = window.innerWidth;
    this.keyListener = new KeyListener();

    this.score = 0;

    this.timeLeft = 60 * 1000;

    this.nextItem = Math.random() * 500;

    this.spiders = [];
    this.fruit = [];

    this.player = new Player(this.canvas.width, this.canvas.height);
  }

  /**
   * Make a new item that falls from the screen.
   */
  private makeItem(): void {
    if (Math.random() > 0.1) {
      this.fruit.push(new Fruit(this.canvas.width));
    } else {
      this.spiders.push(new Spider(this.canvas.width));
    }
  }

  /**
   * Process all input. Called from the GameLoop.
   */
  public processInput(): void {
    if (this.keyListener.isKeyDown(KeyListener.KEY_LEFT)) {
      this.player.moveLeft();
    }
    if (this.keyListener.isKeyDown(KeyListener.KEY_RIGHT)) {
      this.player.moveRight();
    }
  }

  /**
   * Update game state. Called from the GameLoop
   *
   * @param elapsed time in ms elapsed from the GameLoop
   * @returns true if the game should continue
   */
  public update(elapsed: number): boolean {
    // Deduct the elapsed time from the timeLeft
    this.timeLeft -= elapsed;

    // Loop through all fruit and spiders to update the position
    for (const fruit of this.fruit) {
      fruit.update(elapsed);
    }

    for (const spider of this.spiders) {
      spider.update(elapsed);
    }

    // Update the position of the player
    this.player.update(elapsed);

    // Loop through all fruit and filter out fruit that has either
    // collided with the player, adding points to the score
    // or that has left the bottom of the screen.
    for (let i: number = this.fruit.length - 1; i >= 0; i--) {
      if (this.player.fruitCollided(this.fruit[i])) {
        this.score += this.fruit[i].getScore();
        this.fruit.splice(i, 1);
      }
      if (this.fruit[i].getPosY() > this.canvas.height) {
        this.fruit.splice(i, 1);
      }
    }

    // Loop through all spiders and filter out fruit that has either
    // collided with the player, subtracting points from the player
    // or that has left the bottom of the screen.
    for (let i: number = this.spiders.length - 1; i >= 0; i--) {
      if (this.player.spiderCollided(this.spiders[i])) {
        this.score += this.spiders[i].getScore();
        this.spiders.splice(i, 1);
      }
      if (this.spiders[i].getPosY() > this.canvas.height) {
        this.spiders.splice(i, 1);
      }
    }

    // Subtracts the elapsed from the time timer to see when a new item should be created.
    this.nextItem -= elapsed;
    if (this.nextItem < 0) {
      this.makeItem();
      this.nextItem = Math.random() * 200;
    }

    return !this.isGameOver();
  }

  /**
   * Tests conditions whether game is over. If time left is less than 0
   *
   * @returns True if game is over
   */
  private isGameOver(): boolean {
    return (this.timeLeft < 0);
  }

  /**
   * Render all the elements in the screen.
   */
  public render(): void {
    // Clear the canvas
    CanvasRenderer.clearCanvas(this.canvas);

    // Render the fruit, spiders, and the player
    for (const fruit of this.fruit) {
      fruit.render(this.canvas);
    }
    for (const spider of this.spiders) {
      spider.render(this.canvas);
    }
    this.player.render(this.canvas);

    // Show text on the screen
    CanvasRenderer.writeText(this.canvas, `Score: ${this.score}`, 10, 45, 'left', 'Arial', 32, 'white');
    CanvasRenderer.writeText(this.canvas, `Time: ${Math.round(this.timeLeft / 1000).toString()}`, 10, 85, 'left', 'Arial', 32, 'white');

    if (this.isGameOver()) {
      CanvasRenderer.writeText(this.canvas, 'Game Over', this.canvas.width / 2, this.canvas.height / 2, 'center', 'Arial', 60, 'cyan');
    }
  }
}
