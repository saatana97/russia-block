<template>
    <div id="app">
        <div class="stop" v-if="game.status === 0">
            游戏暂停
            <button @click="game.start()">继续游戏</button>
        </div>
        <div class="player" v-for="(player, p) in game.player" :key="p">
            <div class="gameover" v-if="player.status === 0">
                <p>游戏结束</p>
                <button @click="game.reset()">重新开始</button>
            </div>
            <div class="info">
                <p class="name">NAME：{{ player.name }}</p>
                <p class="name">LINE：{{ player.line }}</p>
                <p class="name">LEVEL：{{ player.level }}</p>
                <h1 class="score">SCORE：{{ player.score }}</h1>
            </div>
            <div class="game">
                <div class="scene" :style="{ width: config.col * config.size + 'px' }">
                    <div
                        class="box"
                        :class="{ active: calcBoxActive(player, i) }"
                        v-for="(item, i) in config.col * config.row"
                        :key="i"
                        :style="{ width: config.size + 'px', height: config.size + 'px', backgroundColor: calcBoxColor(player, i) }"
                    ></div>
                </div>
                <div class="next">
                    <div class="container" v-for="(item, index) in game.next" :key="index" :style="{ width: item.boxes.length * config.size + 'px' }">
                        <div class="box" :class="{ active: box > 0 }" v-for="(box, b) in item.boxes.flat()" :key="b" :style="{ width: config.size + 'px', height: config.size + 'px', backgroundColor: color[box - 1] }"></div>
                    </div>
                </div>
            </div>
        </div>
        <p class="tips">按空格键暂停游戏</p>
    </div>
</template>

<script>
import Auther from '@/mod/auther';
import { Person, Control } from '@/mod/person';
import { Shape, Game } from '@/lib/core';
export default {
    name: 'App',
    data() {
        return {
            config: {
                row: 20,
                col: 12,
                size: 40,
            },
            game: new Game(),
        };
    },
    computed: {
        color() {
            return Shape.color;
        },
    },
    created() {
        this.game.init(this.config);
        window.addEventListener(
            'keypress',
            function(e) {
                if (e.key === ' ') {
                    this.game.stop();
                }
            }.bind(this)
        );
    },
    mounted() {
        // 添加玩家，Person为真人玩家，Control设置键位
        this.game.add(new Person(new Control('ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft')));
        // Auther是AI玩家，自定义AI需要早mod下面编写AI类并继承Player，通过实现Player的onFetch函数进行逻辑操作
        this.game.add(new Auther());
        this.game.reset();
    },
    methods: {
        calcBoxColor(player, i) {
            let res = 'transparent';
            let value = player.boxes.flat()[i];
            if (value) {
                res = this.color[value - 1];
            }
            if (player.current) {
                let index = player.current.contain([i % this.config.col, Math.floor(i / this.config.col)]);
                if (index !== undefined) {
                    res = this.color[index];
                }
            }
            return res;
        },
        calcBoxActive(player, i) {
            let res = player.boxes.flat()[i] > 0;
            if (player.current) {
                if (player.current.contain([i % this.config.col, Math.floor(i / this.config.col)]) !== undefined) {
                    res = true;
                }
            }
            return res;
        },
    },
};
</script>

<style lang="scss">
@keyframes scale {
    0% {
        transform: scale(0.8);
    }
    100% {
        transform: scale(1.2);
    }
}
* {
    margin: 0;
    padding: 0;
    translate: all 0.3s;
}
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    width: 100vw;
    height: 100vh;
    background-color: #2c3e50;
    color: white;
    display: flex;
    justify-content: center;
    .stop {
        z-index: 999;
        position: fixed;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        font-size: 36px;
        color: brown;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        button {
            padding: 10px 20px;
            margin-top: 30px;
            background-color: brown;
            color: white;
            border: none;
            outline: none;
            border-radius: 5px;
            cursor: pointer;
        }
    }
    .player {
        position: relative;
        + .player {
            margin-left: 50px;
        }
        .gameover {
            position: absolute;
            background-color: rgba(255, 255, 255, 0.7);
            color: brown;
            font-size: 36px;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            button {
                padding: 10px 20px;
                margin-top: 30px;
                background-color: brown;
                color: white;
                border: none;
                outline: none;
                border-radius: 5px;
                cursor: pointer;
            }
        }
        .info {
            display: flex;
            justify-content: space-around;
            align-items: center;
            .score {
                animation: scale 1s linear 0s infinite alternate;
            }
        }
        .game {
            display: flex;
            margin: 10px 0;
        }
        .container {
            border: 2px solid gray;
            background-color: rgba(0, 0, 0, 0.3);
            display: flex;
            flex-wrap: wrap;
            margin-left: 10px;
            + .container {
                margin-top: 10px;
            }
        }
        .scene {
            border: 2px solid gray;
            background-color: rgba(0, 0, 0, 0.3);
            display: flex;
            flex-wrap: wrap;
            + .scene {
                margin-left: 20px;
            }
        }
        .box {
            border: 0.1px solid rgba(255, 255, 255, 0.1);
            box-sizing: border-box;
            &.active {
                border: 2px outset white;
            }
        }
    }
    .tips {
        position: fixed;
        bottom: 20px;
        font-size: 24px;
    }
}
</style>
