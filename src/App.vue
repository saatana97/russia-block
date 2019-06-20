<template>
	<div id="app" @click="handleSwipeUp">
		<v-touch
			@swipeleft="handleSwipeLeft"
			@swiperight="handleSwipeRight"
			@swipedown="handleSwipeDown"
			@swipeup="handleSwipeUp"
		>
			<div class="boxs" :style="{width:this.width+'px',height:this.height+'px'}">
				<div
					class="box"
					v-for="(box,i) in boxs.flat()"
					:key="i"
					:class="{active:box}"
					:style="{...boxStyle,backgroundColor:box?box:'transparent'}"
				></div>
			</div>
		</v-touch>
		<div class="next">
			<div v-for="(item,i) in next" :key="i" :style="nextBoxsStyle">
				<div
					class="box"
					v-for="(box,j) in item.boxs.flat()"
					:key="j"
					:class="{active:box}"
					:style="{...boxStyle,backgroundColor:box?item.color:'transparent'}"
				></div>
			</div>
			<p>本局得分 {{scope}}</p>
			<p>历史最佳 {{best}}</p>
			<button v-if="status===0" @click="status = 1">点击暂停</button>
			<button v-if="status===1" @click="status = 0">点击继续</button>
			<button v-if="status===2" @click="restart">重新开始</button>
		</div>
		<div class="info">
			<p>♥♥♥最爱小怂怂的土鸡</p>
		</div>
	</div>
</template>

<script>
export default {
	name: "App",
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
			clock: 0
		};
	},
	mounted() {
		this.size = Math.floor(window.screen.availWidth / 14);
		this.width = this.size * 10;
		this.height = this.width * 2;
		this.best = localStorage.best || 0;
		this.restart();
	},
	methods: {
		handleSwipeUp(e) {
			let temp = this.current.clone();
			temp.rotate();
			if (!this.collision(temp)) {
				this.current.rotate();
			}
		},
		handleSwipeDown(e) {
			let row = 0,
				temp = this.current.clone();
			do {
				temp.move(0, 1);
				row++;
			} while (!this.collision(temp));
			this.current.move(0, row - 1);
		},
		handleSwipeLeft(e) {
			let temp = this.current.clone();
			temp.move(-1, 0);
			if (!this.collision(temp)) {
				this.current.move(-1, 0);
			}
		},
		handleSwipeRight(e) {
			let temp = this.current.clone();
			temp.move(1, 0);
			if (!this.collision(temp)) {
				this.current.move(1, 0);
			}
		},
		restart() {
			clearInterval(this.clearId);
			this.lasttime = 0;
			this.status = 0;
			this.store();
			this.scope = 0;
			this.next = [
				Block.instance(Block.randomType()),
				Block.instance(Block.randomType()),
				Block.instance(Block.randomType())
			];
			this.current = Block.instance(Block.randomType());
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
					if (this.collision(temp)) {
						this.current.worldPosition().forEach(item => {
							this.blocks[item[1]][item[0]] = this.current.color;
						});
						this.current = this.next.shift();
						this.next.push(Block.instance(Block.randomType()));
						if (this.collision(this.current)) {
							this.status = 2;
						} else {
							this.tryClear();
						}
					} else {
						this.current.move(0, 1);
					}
				}
			} else if (this.status === 2) {
				alert("游戏结束，本局得分" + this.scope);
				this.restart();
			}
		},
		tryClear() {
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
				}
			}
		},
		collision(block) {
			const _this = this;
			let arr = block.worldPosition();
			let find = false;
			try {
				find = !arr.every(item => {
					return _this.blocks[item[1]][item[0]] === 0;
				});
			} catch (e) {
				find = true;
			}
			find = !!find;
			if (!find) {
				let bound = arr.every(item => {
					return (
						item[1] >= 0 &&
						item[1] < _this.row &&
						item[0] >= 0 &&
						item[0] < _this.col
					);
				});
				find = !bound;
			}
			return find;
		},
		push(block) {
			let res = false;
			if (block instanceof Block) {
				if (this.collision(block)) {
					this.status = 2;
				} else {
					this.blocks.push(block);
					res = true;
				}
			}
			return res;
		},
		store() {
			if (this.scope > this.best) {
				this.best = localStorage.best = this.scope;
			}
		}
	},
	computed: {
		boxs() {
			let res = [...this.blocks];
			if (this.current) {
				this.current.worldPosition().forEach(item => {
					res[item[1]] = [...res[item[1]]];
					res[item[1]][item[0]] = this.current.color;
				});
			}
			return res;
		},
		boxStyle() {
			return {
				width: this.size + "px",
				height: this.size + "px"
			};
		},
		nextBoxsStyle() {
			return {
				width: this.size * 4 + "px",
				height: this.size * 4 + "px"
			};
		}
	}
};
class Block {
	constructor(boxs, position, color) {
		this.boxs = boxs || [
			[0, 0, 0, 0],
			[0, 0, 0, 0],
			[0, 0, 0, 0],
			[0, 0, 0, 0]
		];
		position = position || [0, 0];
		this.x = position[0];
		this.y = position[1];
		this.color = color || "red";
	}
	clone() {
		return new Block(
			JSON.parse(JSON.stringify(this.boxs)),
			[this.x, this.y],
			this.color
		);
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
		arr.forEach(item => {
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
				return target.find(temp => item.join(",") === temp.join(","));
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
		let type = "IOTZSLJ".split("");
		let index = Math.round(Math.random() * (type.length - 1));
		return type[index];
	}
	static instance(type, position) {
		let boxs = null,
			color = null;
		switch (type) {
			case "I":
				boxs = [[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0]];
				color = "brown";
				break;
			case "O":
				boxs = [[0, 0, 0, 0], [0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0]];
				color = "steelblue";
				break;
			case "T":
				boxs = [[0, 0, 0, 0], [0, 1, 0, 0], [1, 1, 1, 0], [0, 0, 0, 0]];
				color = "sienna";
				break;
			case "Z":
				boxs = [[0, 0, 0, 0], [0, 1, 1, 0], [0, 0, 1, 1], [0, 0, 0, 0]];
				color = "violet";
				break;
			case "S":
				boxs = [[0, 0, 0, 0], [0, 0, 1, 1], [0, 1, 1, 0], [0, 0, 0, 0]];
				color = "darkorange";
				break;
			case "L":
				boxs = [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 1, 0], [0, 0, 0, 0]];
				color = "aquamarine";
				break;
			case "J":
				boxs = [[0, 0, 1, 0], [0, 0, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0]];
				color = "slateblue";
				break;
			default:
				throw new Error("unknow block type : " + type);
		}
		return new Block(boxs, position, color);
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
			.boxs {
				background-color: seagreen;
				float: left;
				display: flex;
				flex-wrap: wrap;
				border: 1px outset #ccc;
			}
			.next {
				float: right;
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
				&.active {
					border-style: outset;
				}
			}
			.info {
				position: fixed;
				right: 0;
				bottom: 0;
				p {
					color: indianred;
					text-align: right;
				}
			}
		}
	}
}
</style>
