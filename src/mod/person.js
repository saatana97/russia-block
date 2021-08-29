import Player from './player';
/**
 * 真人玩家
 */
export class Person extends Player {
    constructor(control) {
        super('Person');
        control.init(this);
    }
}
/**
 * 控制器
 */
export class Control {
    constructor(up, right, down, left) {
        this.up = up;
        this.right = right;
        this.down = down;
        this.left = left;
    }
    init(player) {
        window.addEventListener(
            'keydown',
            function(e) {
                if (player.current) {
                    switch (e.key) {
                        case this.up:
                            player.current.transform(player.boxes);
                            break;
                        case this.right:
                            player.current.right(player.boxes);
                            break;
                        case this.down:
                            player.current.done(player.boxes);
                            break;
                        case this.left:
                            player.current.left(player.boxes);
                            break;
                    }
                }
            }.bind(this)
        );
    }
}
