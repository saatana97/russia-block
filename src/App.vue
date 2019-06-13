<template>
	<div id="app" @keydown="handleKeydown">
		<div class="boxs" :style="{width:this.width+'px',height:this.height+'px'}">
			<div
				class="box"
				v-for="(box,i) in boxs.flat()"
				:key="i"
				:class="{active:box}"
				:style="{...boxStyle,backgroundColor:box?box:'transparent'}"
			></div>
		</div>
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
			speed: 100,
			current: null,
			clearId: null
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
		handleKeydown(e) {
			console.info(e);
		},
		restart() {
			clearInterval(this.clearId);
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
			const update = this.update.bind(this);
			this.clearId = setInterval(() => {
				update();
			}, this.speed);
		},
		update() {
			if (this.status === 0) {
				let temp = this.current.clone();
				temp.move(0, 1);
				if (this.collision(temp)) {
					this.blocks.push(this.current);
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
			} else {
				// alert("游戏结束，本局得分" + this.scope);
				this.restart();
			}
		},
		tryClear() {},
		collision(block) {
			const _this = this;
			let find = this.blocks.find(item => {
				let res = block.collision(item);
				return res;
			});
			find = !!find;
			if (!find) {
				let arr = block.worldPosition();
				let bound = arr.every(item => {
					return (
						item[0] >= 0 &&
						item[0] < _this.row &&
						item[1] >= 0 &&
						item[1] < _this.col
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
		remove(block) {
			if (block instanceof Block) {
				let arr = block.worldPosition();
				arr.forEach(item => {
					this.blocks[item[0]][item[1]] = 0;
				});
			}
		},
		store() {
			if (this.scope > this.best) {
				this.best = localStorage.best = this.scope;
			}
		}
	},
	computed: {
		boxs() {
			let res = [];
			for (let i = 0; i < this.row; i++) {
				res.push(new Array(this.col).fill(0));
			}
			let arr = [...this.blocks];
			if (this.current) {
				arr.push(this.current);
			}
			arr.forEach(item => {
				let arr = item.worldPosition();
				arr.forEach(box => {
					res[box[0]][box[1]] = item.color;
				});
			});
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
		this.position = position || [0, 0];
		this.color = color || "red";
	}
	clone() {
		return new Block(
			JSON.parse(JSON.stringify(this.boxs)),
			[...this.position],
			this.color
		);
	}
	move(x, y) {
		this.position = [this.position[0] + x, this.position[1] + y];
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
		let res = [],
			x = this.position[0],
			y = this.position[1];
		this.boxs.forEach((row, rowIndex) => {
			row.forEach((col, colIndex) => {
				if (col === 1) {
					res.push([rowIndex + y, colIndex + x]);
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
		}
	}
}
</style>
