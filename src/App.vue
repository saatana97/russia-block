<template>
    <div id="app" @keyup="handleKeydown">
        <v-touch @swipeleft="handleSwipeLeft" @swiperight="handleSwipeRight" @swipedown="handleSwipeDown" @swipeup="handleSwipeUp">
            <div class="boxs" @click="handleSwipeUp" :style="{ width: this.width + 'px', height: this.height + 'px' }">
                <div class="box" v-for="(box, i) in boxs.flat()" :key="i" :class="{ active: box }" :style="{ ...boxStyle, backgroundColor: box ? box : 'transparent' }"></div>
            </div>
        </v-touch>
        <div class="next">
            <div v-for="(item, i) in next" :key="i" :style="nextBoxsStyle">
                <div class="box" v-for="(box, j) in item.boxs.flat()" :key="j" :class="{ active: box }" :style="{ ...boxStyle, backgroundColor: box ? item.color : 'transparent' }"></div>
            </div>
            <p>本局得分 {{ scope }}</p>
            <p>历史最佳 {{ best }}</p>
            <button v-if="status === 0" @click="status = 1">点击暂停</button>
            <button v-if="status === 1" @click="status = 0">点击继续</button>
            <button v-if="status === 2" @click="restart">重新开始</button>
            <button @click="auto = !auto">{{ auto ? '我自己玩' : '开挂模式' }}</button>
        </div>
        <div class="info">
            <p>点击/上划 = 变形</p>
            <p>左滑/右滑 = 移动</p>
            <p>下滑 = 下落</p>
            <p>贴边时可能会无法变形哦</p>
        </div>
    </div>
</template>

<script>
export default {
    name: 'App',
    components: {},
    data() {
        return {
            col: 10,
            row: 20,
            width: 0,
            height: 0,
            size: 0,
            status: 0,
            scope: 0,
            best: 0,
            next: [],
            blocks: [],
            speed: 1000,
            current: null,
            clearId: null,
            lasttime: 0,
            clock: 0,
            auto: true,
        };
    },
    mounted() {
        window.addEventListener('error', (e) => alert('error' + e.message));
        window.addEventListener('resize', (e) => {
            window.location.reload();
        });
        if (window.innerWidth < window.innerHeight) {
            this.size = Math.floor(window.innerWidth / (this.col + 4));
            this.width = this.size * this.col;
            this.height = this.size * this.row;
        } else {
            this.size = Math.floor(window.innerHeight / this.row);
            this.width = this.size * this.col;
            this.height = this.size * this.row;
        }
        this.best = localStorage.best || 0;
        this.restart();
    },
    methods: {
        handleKeydown(e) {
            alert(e.key);
        },
        handleSwipeUp(e) {
            let res = false;
            let temp = this.current.clone();
            temp.rotate();
            if (!this.collision(temp, this.blocks)) {
                this.current.rotate();
                res = true;
            }
            return res;
        },
        handleSwipeDown(e) {
            let row = 0,
                temp = this.current.clone();
            do {
                temp.move(0, 1);
                row++;
            } while (!this.collision(temp, this.blocks));
            this.current.move(0, --row);
            return row;
        },
        handleSwipeLeft(e) {
            let res = false;
            let temp = this.current.clone();
            temp.move(-1, 0);
            if (!this.collision(temp, this.blocks)) {
                this.current.move(-1, 0);
                res = true;
            }
            return res;
        },
        handleSwipeRight(e) {
            let res = false;
            let temp = this.current.clone();
            temp.move(1, 0);
            if (!this.collision(temp, this.blocks)) {
                this.current.move(1, 0);
                res = true;
            }
            return res;
        },
        handleRobot() {
            Robot.cancel();
            Robot.action(
                this.current,
                this.next,
                [...this.blocks].map((item) => [...item]),
                this.collision.bind(this),
                this.handleSwipeUp.bind(this),
                this.handleSwipeLeft.bind(this),
                this.handleSwipeRight.bind(this),
                this.handleSwipeDown.bind(this)
            );
        },
        restart() {
            clearInterval(this.clearId);
            this.lasttime = 0;
            this.status = 0;
            this.store();
            this.scope = 0;
            this.next = [Block.instance(Block.randomType()), Block.instance(Block.randomType()), Block.instance(Block.randomType())];
            this.current = Block.instance(Block.randomType());
            this.current.x = Math.floor(this.col / 2) - 2;
            this.blocks = [];
            for (let row = 0; row < this.row; row++) {
                this.blocks.push(new Array(this.col).fill(0));
            }
            this.lasttime = 0;
            this.clock = 0;
            this.update(0);
        },
        update(timestamp) {
            let update = this.update.bind(this);
            this.clearId = requestAnimationFrame(update);
            this.clock += timestamp - this.lasttime;
            this.lasttime = timestamp;
            if (this.status === 0) {
                if (this.clock >= this.speed) {
                    this.clock %= this.speed;
                    let temp = this.current.clone();
                    temp.move(0, 1);
                    if (this.collision(temp, this.blocks)) {
                        this.current.worldPosition().forEach((item) => {
                            this.blocks[item[1]][item[0]] = this.current.color;
                        });
                        this.current = this.next.shift();
                        this.current.x = Math.floor(this.col / 2) - 2;
                        this.next.push(Block.instance(Block.randomType()));
                        if (this.collision(this.current, this.blocks)) {
                            this.status = 2;
                        } else {
                            this.clear();
                        }
                    } else {
                        this.current.move(0, 1);
                    }
                }
            } else if (this.status === 2) {
                alert('游戏结束，本局得分' + this.scope);
                this.restart();
            }
        },
        clear() {
            for (let row = this.row - 1; row >= 0; row--) {
                let fill = true;
                for (let col = 0; col <= this.col; col++) {
                    fill &= this.blocks[row][col] !== 0;
                }
                if (fill) {
                    this.scope++;
                    this.speed = Math.max(1000 - this.scope, 100);
                    this.blocks.splice(row, 1);
                    this.blocks.unshift(new Array(this.col).fill(0));
                    row++;
                }
            }
        },
        collision(block, boxs) {
            let arr = block.worldPosition();
            let find = false;
            try {
                find = !arr.every((item) => {
                    return boxs[item[1]][item[0]] === 0;
                });
            } catch (e) {
                find = true;
            }
            find = !!find;
            if (!find) {
                let bound = arr.every((item) => {
                    return item[1] >= 0 && item[1] < boxs.length && item[0] >= 0 && item[0] < boxs[0].length;
                });
                find = !bound;
            }
            return find;
        },
        store() {
            if (this.scope > this.best) {
                this.best = localStorage.best = this.scope;
            }
        },
    },
    watch: {
        auto(value) {
            value && this.handleRobot();
        },
        current(value) {
            this.auto && this.handleRobot();
        },
    },
    computed: {
        boxs() {
            let res = [...this.blocks];
            if (this.current) {
                this.current.worldPosition().forEach((item) => {
                    res[item[1]] = [...res[item[1]]];
                    res[item[1]][item[0]] = this.current.color;
                });
            }
            return res;
        },
        boxStyle() {
            return {
                width: this.size + 'px',
                height: this.size + 'px',
            };
        },
        nextBoxsStyle() {
            return {
                width: this.size * 4 + 'px',
                height: this.size * 4 + 'px',
            };
        },
    },
};
class Block {
    constructor(boxs, position, color, type) {
        this.boxs = boxs || [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ];
        position = position || [0, 0];
        this.x = position[0];
        this.y = position[1];
        this.color = color;
        this.type = type;
    }
    clone() {
        return new Block(JSON.parse(JSON.stringify(this.boxs)), [this.x, this.y], this.color, this.type);
    }
    removeRow(row) {
        row -= this.y;
        if (row === this.boxs.length - 1) {
            this.boxs.pop();
        } else {
            this.boxs[row] = [0, 0, 0, 0];
        }
    }
    relative(row) {
        let arr = this.worldPosition();
        let center = false,
            top = true,
            bottom = true;
        arr.forEach((item) => {
            top &= item[1] < row;
            center |= item[1] === row;
            bottom &= item[1] > row;
        });
        return { top, center, bottom };
    }
    rotate() {
        let res = [];
        this.boxs.reverse().forEach((row, rowIndex) => {
            res.push([]);
            row.forEach((col, colIndex) => {
                res[rowIndex][colIndex] = this.boxs[colIndex][rowIndex];
            });
        });
        this.boxs = res;
    }
    move(x, y) {
        this.x += x;
        this.y += y;
    }
    collision(target) {
        let res = false;
        if (target instanceof Block) {
            let self = this.worldPosition();
            target = target.worldPosition();
            let find = self.find((item, index) => {
                return target.find((temp) => item.join(',') === temp.join(','));
            });
            res = !!find;
        }
        return res;
    }
    worldPosition() {
        let res = [];
        this.boxs.forEach((row, rowIndex) => {
            row.forEach((col, colIndex) => {
                if (col !== 0) {
                    res.push([colIndex + this.x, rowIndex + this.y]);
                }
            });
        });
        return res;
    }
    static randomType() {
        let type = 'IIOTZSLJ'.split('');
        let index = Math.round(Math.random() * (type.length - 1));
        return type[index];
    }
    static instance(type, position) {
        let boxs = null,
            color = null;
        switch (type) {
            case 'I':
                boxs = [
                    [0, 0, 0, 0],
                    [0, 0, 0, 0],
                    [1, 1, 1, 1],
                    [0, 0, 0, 0],
                ];
                color = 'brown';
                break;
            case 'O':
                boxs = [
                    [0, 0, 0, 0],
                    [0, 1, 1, 0],
                    [0, 1, 1, 0],
                    [0, 0, 0, 0],
                ];
                color = 'steelblue';
                break;
            case 'T':
                boxs = [
                    [0, 0, 0, 0],
                    [0, 1, 0, 0],
                    [1, 1, 1, 0],
                    [0, 0, 0, 0],
                ];
                color = 'sienna';
                break;
            case 'Z':
                boxs = [
                    [0, 0, 0, 0],
                    [0, 1, 1, 0],
                    [0, 0, 1, 1],
                    [0, 0, 0, 0],
                ];
                color = 'violet';
                break;
            case 'S':
                boxs = [
                    [0, 0, 0, 0],
                    [0, 0, 1, 1],
                    [0, 1, 1, 0],
                    [0, 0, 0, 0],
                ];
                color = 'darkorange';
                break;
            case 'L':
                boxs = [
                    [0, 1, 0, 0],
                    [0, 1, 0, 0],
                    [0, 1, 1, 0],
                    [0, 0, 0, 0],
                ];
                color = 'aquamarine';
                break;
            case 'J':
                boxs = [
                    [0, 0, 1, 0],
                    [0, 0, 1, 0],
                    [0, 1, 1, 0],
                    [0, 0, 0, 0],
                ];
                color = 'slateblue';
                break;
            default:
                throw new Error('unknow block type : ' + type);
        }
        return new Block(boxs, position, color, type);
    }
}
function sleep(time) {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
}
class Task {
    constructor(name, invoke, cancel) {
        this.name = name;
        this.invokeFn = invoke;
        this.cancelFn = cancel;
        this.invoked = false;
    }
    invoke() {
        if (!this.invoked) {
            this.invokeFn();
            this.invoked = true;
        }
    }
    cancel() {
        if (this.invoked) {
            this.cancelFn();
            this.invoked = false;
        }
    }
}
class Robot {
    static time = 0;
    static analysis(block, boxs, collision) {
        let count = 0,
            row = boxs.length,
            col = boxs[0].length,
            res = [];
        block = block.clone();
        boxs = [...boxs].map((item) => [...item]);
        for (; count < 4; count++) {
            let gap = 0,
                obstacle = 0,
                max = Number.MAX_VALUE,
                fill = 0,
                bound = 0;
            do {
                block.y++;
                if (collision(block, boxs)) {
                    block.y--;
                    break;
                }
            } while (true);
            let all = [...boxs].map((item) => [...item]),
                arr = block.worldPosition(),
                overrange = false;
            for (let index in arr) {
                let item = arr[index];
                bound = Math.max(bound, Math.abs(item[0] - col / 2));
                try {
                    all[item[1]][item[0]] = block.color;
                } catch (e) {
                    overrange = true;
                    break;
                }
            }
            if (!overrange && !collision(block, boxs)) {
                all.forEach((row, rowIndex) => {
                    if (row.every((box, colIndex) => box !== 0)) {
                        fill++;
                    }
                    row.forEach((box, colIndex) => {
                        if (box === 0) {
                            let obs = 0;
                            all.filter((item, index) => index < rowIndex).forEach((item, index) => {
                                if (item[colIndex] !== 0) {
                                    obs++;
                                }
                            });
                            if (obs !== 0) {
                                obstacle += obs;
                                gap++;
                            }
                        } else {
                            max = Math.min(max, rowIndex);
                        }
                    });
                });
                let BASE = col;
                let power = fill * BASE * 0.5;
                // power += (max / row) * BASE * 0.6;
                // power += (1 - gap / col) * BASE * 0.3;
                // power += (1 - obstacle / row) * BASE * 0.049;
                power += (max / row) * BASE * 0.45;
                power += (1 - gap / col) * BASE * 0.3;
                power += (1 - obstacle / row) * BASE * 0.04;
                power += (bound / (col / 2)) * BASE * 0.01;
                power += (block.y / row) * BASE * 0.2;
                res.push({
                    power,
                    count,
                    gap,
                    obstacle,
                    max,
                    fill,
                    x: block.x,
                    y: block.y,
                });
            } else {
                res.push({
                    power: 0,
                });
            }
            block.rotate();
        }
        return res;
    }
    static policy(resolutions, pick) {
        pick = pick !== false;
        resolutions = resolutions
            .filter((item) => item.power > 0)
            .sort((prev, next) => {
                let res = next.power - prev.power;
                return res;
            });
        return pick ? resolutions[0] : resolutions;
    }
    static validation(block, boxs, collision, resolution) {
        block = block.clone();
        let tasks = [],
            res = [];
        for (let i = 0; i < resolution.count; i++) {
            tasks.push(
                new Task('transfer', block.rotate.bind(block), () => {
                    block.rotate();
                    block.rotate();
                    block.rotate();
                })
            );
        }
        let x = resolution.x,
            y = resolution.y;
        let left = () => {
                block.x--;
            },
            right = () => {
                block.x++;
            };
        for (let i = 0; i < Math.abs(block.x - x); i++) {
            if (block.x < x) {
                tasks.push(new Task('right', right, left));
            } else {
                tasks.push(new Task('left', left, right));
            }
        }
        let rollback = 0,
            i = 0;
        while (!tasks.every((item) => item.invoked)) {
            if (rollback === tasks.filter((item) => !item.invoked).length) {
                break;
            }
            let task = tasks[i++];
            if (task) {
                if (task.invoked) {
                    continue;
                }
                task.invoke();
                if (collision(block, boxs)) {
                    task.cancel();
                    rollback++;
                } else {
                    res.push(task.name);
                    rollback = 0;
                }
            } else {
                i = 0;
                rollback = 0;
            }
        }
        if (rollback === 0) {
            block.x = x;
            let distance = y - block.y;
            for (let i = 0; i < distance; i++) {
                block.y++;
                if (collision(block, boxs)) {
                    rollback = -1;
                    break;
                }
            }
        }
        return rollback === 0 ? res : false;
    }
    static async action(block, next, boxs, collision, transfer, left, right, done) {
        let time = Robot.time,
            tempBlock = block.clone();

        let resolutions = [];
        for (let colIndex = -3; colIndex < boxs[0].length + 3; colIndex++) {
            tempBlock.x = colIndex;
            let resolution = Robot.policy(Robot.analysis(tempBlock, boxs, collision), false);
            resolutions.push.apply(resolutions, resolution);
        }
        resolutions = Robot.policy(resolutions, false);

        for (let index in resolutions) {
            let resolution = resolutions[index];
            let res = Robot.validation(block, boxs, collision, resolution);
            if (res) {
                console.info(tempBlock.type, resolution, res);
                for (let i = 0; Robot.time === time && i < res.length; i++) {
                    let task = res[i];
                    switch (task) {
                        case 'left':
                            left();
                            break;
                        case 'right':
                            right();
                            break;
                        case 'transfer':
                            transfer();
                            break;
                        default:
                            throw new Error('未知指令：' + task);
                    }
                    await sleep(300);
                }
                if (res.length === 0) {
                    await sleep(500);
                }
                Robot.time === time && done();
                break;
            }
        }
    }
    static cancel() {
        Robot.time++;
    }
}
</script>
<style lang="scss">
html {
    width: 100%;
    height: 100%;
    * {
        margin: 0;
        padding: 0;
        position: relative;
    }
    body {
        width: 100%;
        height: 100%;
        #app {
            color: white;
            background-color: black;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            .boxs {
                background-color: seagreen;
                display: flex;
                flex-wrap: wrap;
                border: 1px outset #ccc;
            }
            .next {
                display: flex;
                flex-direction: column;
                > div {
                    display: flex;
                    flex-wrap: wrap;
                    border: 1px outset #ccc;
                    background-color: skyblue;
                    margin-bottom: 10%;
                }
                button {
                    border: none;
                    outline: none;
                    padding: 1% 5%;
                    margin: 2% 0;
                    border-radius: 5px;
                    background: brown;
                    color: white;
                }
            }
            .box {
                width: 10px;
                height: 10px;
                border: 1px solid gray;
                box-sizing: border-box;
                transition: background-color 0.05s, border-style 0.05s;
                &.active {
                    border-style: outset;
                }
            }
            .info {
                width: 98%;
                position: fixed;
                right: 2%;
                bottom: 2%;
                p {
                    color: indianred;
                    // text-align: center;
                    &:last-child {
                        text-align: right;
                        margin-top: 2%;
                    }
                }
            }
        }
    }
}
</style>
