var enemyData1 = function(){
	var attack1 = function() {
		this.spriteRight = "images\enemyAtkTurn.png";
		this.spriteLeft = "images\enemyAtk.png";
		this.frameWidth = 100;
		this.frameHeight = 150;
		this.damage = 5;
		this.totalFrames = 2;
		this.frameData = [[[29,5,82,143,75,38,97,71],[18,5,71,143,3,38,25,71]],
			[[29,5,82,143,65,65,100,84],[18,5,71,143,0,65,35,84]],
			[[29,5,82,143,74,70,96,106],[18,5,71,143,4,70,26,106]]];
	}

	this.attackList = [new attack1]
}

var allEnemies = [new enemyData1]
