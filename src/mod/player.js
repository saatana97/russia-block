/**
 * 玩家
 */
export default class Player {
    constructor(name) {
        // 昵称
        this.name = name;
        // 分数
        this.score = 0;
        // 消除行数
        this.line = 0;
        // 游戏等级
        this.level = 1;
        // 方块容器
        this.boxes = [];
        // 状态 0游戏结束 1正常
        this.status = 1;
        // 当前操作方块
        this.current = null;
    }
    /**
     * 获取到新的操作方块
     * @param {Array} next 备选方块列表（多玩家公用，上限为3个或者游戏人数）
     * 当前操作方块 this.current
     * 方块容器 this.boxes
     * 变形 transform(this.boxes)
     * 左移 left(this.boxes)
     * 右移 right(this.boxes)
     * 直接到底 down(this.boxes) 到底后不能移动去填补空缺
     */
    onFetch(next) {
        console.info(`${this.name}拿到了新方块：${this.current.type}，预备列表还剩：${next.map((item) => item.type).join(' ')}`);
    }
}
