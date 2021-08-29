/**
 * 方块
 */
export class Shape {
    constructor(type) {
        // 类型，对应Shape.list中的枚举值
        this.type = type;
        // 方块模型
        this.boxes = Shape.model[Shape.list.indexOf(type)];
        // 上次更新前的模型
        this.last = [];
        // 坐标X
        this.x = 0;
        // 坐标Y
        this.y = 0;
    }
    /**
     * 顺时针变形
     * @param {Array} container 玩家的方块容器，用于碰撞检测
     * @returns 是否变形成功
     */
    transform(container) {
        let arr = [],
            res = true;
        for (let i = 0; i < this.boxes.length; i++) {
            arr.push([...this.boxes].reverse().map((row) => row[i]));
        }
        this.last = this.boxes;
        this.boxes = arr;
        if (this.bound(container).collision) {
            this.boxes = this.last;
            res = false;
        }
        return res;
    }
    /**
     * 左移
     * @param {Arrya} container 玩家的方块容器，用于碰撞检测
     * @returns 是否左移成功
     */
    left(container) {
        let res = false;
        let bound = this.bound(container);
        if (bound.left > 0) {
            this.x--;
            res = true;
        }
        return res;
    }
    /**
     * 右移
     * @param {Arrya} container 玩家的方块容器，用于碰撞检测
     * @returns 是否右移成功
     */
    right(container) {
        let res = false;
        let bound = this.bound(container);
        if (bound.right > 0) {
            this.x++;
            res = true;
        }
        return res;
    }
    /**
     * 直接下落到最底部
     * @param {Arrya} container 玩家的方块容器，用于碰撞检测
     */
    done(container) {
        while (this.bound(container).bottom > 0) {
            this.y++;
        }
    }
    /**
     * 碰撞检测
     * @param {Arrya} container 玩家的方块容器
     * @returns 是否发生碰撞
     */
    collision(container) {
        let res = this.boxes.find(
            function(row, y) {
                return row.find(
                    function(box, x) {
                        return box > 0 && container.length > this.y + y && container[this.y + y][this.x + x];
                    }.bind(this)
                );
            }.bind(this)
        );
        return !!res;
    }
    /**
     * 方块边界碰撞检测
     * @param {Arrya} container 玩家的方块容器
     * @returns Obj{} collision是否发生碰撞 left左侧距离 right右侧距离 bottom底部距离  距离为0时表示即将发生碰撞，大于0时表示方块边缘距离容器边缘距离
     * @todo 待优化
     */
    bound(container) {
        let row = container.length,
            col = container[0].length;
        let maxY =
            this.boxes.length -
            1 -
            [...this.boxes].reverse().findIndex((row) => {
                return !row.every((box) => box === 0);
            }) +
            this.y;
        let xs = [];
        for (let x = 0; x < this.boxes.length; x++) {
            if (!this.boxes.map((row) => row[x]).every((box) => box === 0)) {
                xs.push(this.x + x);
            }
        }
        let left = xs[0],
            right = col - 1 - xs[xs.length - 1],
            bottom = row - 1 - maxY;
        let clone = this.clone();
        if (left > 0) {
            clone.x--;
            if (clone.collision(container)) {
                left = 0;
            }
            clone.x++;
        }
        if (right > 0) {
            clone.x++;
            if (clone.collision(container)) {
                right = 0;
            }
            clone.x--;
        }
        if (bottom > 0) {
            clone.y++;
            if (clone.collision(container)) {
                bottom = 0;
            }
            clone.y--;
        }
        return { collision: this.collision(container) || left < 0 || right >= col || bottom >= row, left, right, bottom };
    }
    /**
     * 检测方块是否包含指定坐标点
     * @param {Array} point [x,y]
     * @returns 是否包含
     */
    contain(point) {
        let res = this.boxes.find((row, y) => {
            return row.find((box, x) => {
                return box > 0 && point[0] === this.x + x && point[1] === this.y + y;
            });
        });
        if (res) {
            res = Shape.list.indexOf(this.type);
        }
        return res;
    }
    /**
     * 克隆
     * @returns 克隆体
     */
    clone() {
        let news = new Shape(this.type);
        news.boxes = JSON.parse(JSON.stringify(this.boxes));
        news.last = JSON.parse(JSON.stringify(this.last));
        news.x = this.x;
        news.y = this.y;
        return news;
    }
}
/**
 * 方块类型列表
 */
Shape.list = ['O', 'I', 'L', 'J', 'T', 'Z', 'S'];
/**
 * 方块颜色列表
 */
Shape.color = ['brown', 'red', 'blue', 'green', 'chocolate', 'purple', 'gold'];
/**
 * 方块模型列表
 */
Shape.model = [
    [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
    ],
    [
        [2, 0, 0, 0],
        [2, 0, 0, 0],
        [2, 0, 0, 0],
        [2, 0, 0, 0],
    ],
    [
        [0, 0, 0, 0],
        [0, 3, 0, 0],
        [0, 3, 0, 0],
        [0, 3, 3, 0],
    ],
    [
        [0, 0, 0, 0],
        [0, 0, 4, 0],
        [0, 0, 4, 0],
        [0, 4, 4, 0],
    ],
    [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 5, 0, 0],
        [5, 5, 5, 0],
    ],
    [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [6, 6, 0, 0],
        [0, 6, 6, 0],
    ],
    [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 7, 7, 0],
        [7, 7, 0, 0],
    ],
];
/**
 * 根据概率规则随机产生方块
 * @param {String} rule 概率规则
 * @returns 随机方块
 */
Shape.random = function(rule = 'OILJTZSI') {
    let arr = rule.split('');
    let index = Math.round(Math.random() * (arr.length - 1));
    return new Shape(arr[index]);
};

/**
 * 游戏引擎
 */
export class Game {
    constructor() {
        // 玩家列表
        this.player = [];
        // 备选方块列表
        this.next = [];
        // 游戏状态 0暂停1运行
        this.status = 0;
        // 游戏速度列表（下落间隔毫秒数）
        this.speed = [1000, 950, 900, 850, 800, 700, 600, 500, 400, 300, 200, 100];
        // 游戏等级列表（达到指定抵消行数升级）
        this.level = [0, 10, 20, 30, 50, 75, 100, 120, 150, 200, 250, 300];
    }
    /**
     * 添加玩家
     * @param {Player}} player
     */
    add(player) {
        this.player.push(player);
    }
    /**
     * 初始化
     * @param {Object} config 配置
     */
    init(config = {}) {
        this.config = config;
    }
    /**
     * 重启游戏
     */
    reset() {
        this.player.forEach(
            function(player) {
                player.status = 1;
                player.timestamp = 0;
                player.boxes = [];
                for (let y = 0; y < this.config.row; y++) {
                    player.boxes.push([]);
                    for (let x = 0; x < this.config.col; x++) {
                        player.boxes[y].push(0);
                    }
                }
            }.bind(this)
        );
        this.start();
        this.update(0);
    }
    /**
     * 继续游戏
     */
    start() {
        this.status = 1;
    }
    /**
     * 暂停游戏
     */
    stop() {
        this.status = 0;
    }
    /**
     * 逻辑循环
     * @param {float} clock 游戏时间刻度（requestAnimation自动累加）
     */
    update(clock) {
        requestAnimationFrame(this.update.bind(this));
        if (this.status) {
            // 补充预备列表
            while (this.next.length < Math.max(3, this.player.length)) {
                this.next.push(Shape.random());
            }
            // 更新玩家状态
            this.player.forEach(
                function(player) {
                    if (player.status) {
                        // 从预备列表提取操作方块
                        if (!player.current) {
                            player.current = this.next.shift();
                            player.onFetch(this.next.map((item) => item.clone()));
                        }
                        // 根据消除行数更新游戏等级
                        let level = [...this.level].reverse().find((lines) => player.line >= lines);
                        if (level !== undefined) {
                            player.level = this.level.indexOf(level) + 1;
                        } else {
                            player.level = this.level.length;
                        }
                        // 容器范围检测
                        let bound = player.current.bound(player.boxes);
                        if (bound.bottom > 0) {
                            // 更新操作方块位置
                            if (clock - player.timestamp >= this.speed[player.level - 1]) {
                                player.current.y++;
                                player.timestamp = clock;
                            }
                        } else if (bound.bottom === 0) {
                            // 操作方块触底
                            player.current.boxes.forEach(
                                function(row, y) {
                                    row.forEach(
                                        function(box, x) {
                                            if (box > 0) {
                                                player.boxes[player.current.y + y][player.current.x + x] = box;
                                            }
                                        }.bind(this)
                                    );
                                }.bind(this)
                            );
                            player.current = null;
                            if (bound.collision) {
                                // 操作方块碰撞
                                player.status = 0;
                            }
                        }
                        // 消除
                        let clear = [];
                        for (let y = 0; y < player.boxes.length; y++) {
                            if (player.boxes[y].every((box) => box > 0)) {
                                player.line++;
                                player.score += clear.length * 10;
                                clear.push(y);
                            }
                        }
                        clear.forEach((y, i) => {
                            player.boxes.splice(y, 1);
                            player.boxes.unshift(row.map((box) => 0));
                        });
                    }
                }.bind(this)
            );
        }
    }
}
