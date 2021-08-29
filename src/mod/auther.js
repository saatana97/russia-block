import Player from './player';
/**
 * AI玩家
 */
export default class Auther extends Player {
    constructor() {
        super('Auther');
        console.info("I'm Auther");
    }
    onFetch(next) {
        // 这里进行方块操作
    }
}
