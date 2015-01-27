var attack1 = function() {
	this.spriteRight = "images/akariAttack1.png";
	this.spriteLeft = "images/akariAttackLeft1.png";
	this.frameWidth = 160;
	this.frameHeight = 120;
	this.damage = 5;
	this.totalFrames = 4;
	this.frameData = [[[35,3,88,108,101,0,141,21],[66,3,119,108,17,0,55,21]],
		[[35,3,88,108,105,14,146,32],[66,3,119,108,9,13,53,30]],
		[[35,3,88,108,108,27,152,43],[66,3,119,108,5,28,50,43]],
		[[35,3,88,108,107,49,149,65],[66,3,119,108,6,48,50,65]],
		[[35,3,88,108,105,58,141,85],[66,3,119,108,13,57,53,84]]];
}

var attack2 = function() {
	this.spriteRight = "images/akariRun.png";
	this.spriteLeft = "images/akariRunLeft.png";
	this.frameWidth = 130;
	this.frameHeight = 145;
	this.damage = 0;
	this.totalFrames = 7;
	this.frameData = [[[51,17,117,145,0,0,0,0],[13,17,79,145,0,0,0,0]],
		[[51,17,117,145,0,0,0,0],[13,17,79,145,0,0,0,0]],
		[[51,17,117,145,0,0,0,0],[13,17,79,145,0,0,0,0]],
		[[51,17,117,145,0,0,0,0],[13,17,79,145,0,0,0,0]],
		[[51,17,117,145,0,0,0,0],[13,17,79,145,0,0,0,0]],
		[[51,17,117,145,0,0,0,0],[13,17,79,145,0,0,0,0]],
		[[51,17,117,145,0,0,0,0],[13,17,79,145,0,0,0,0]],
		[[51,17,117,145,0,0,0,0],[13,17,79,145,0,0,0,0]]];
}

var attack3 = function() {
	this.spriteRight = "images/akariStand.png";
	this.spriteLeft = "images/akariStandLeft.png";
	this.frameWidth = 100;
	this.frameHeight = 120;
	this.damage = 0;
	this.totalFrames = 4;
	this.frameData = [[[41,1,97,120,0,0,0,0],[4,0,60,120,0,0,0,0]],
		[[41,1,97,120,0,0,0,0],[4,0,60,120,0,0,0,0]],
		[[41,1,97,120,0,0,0,0],[4,0,60,120,0,0,0,0]],
		[[41,1,97,120,0,0,0,0],[4,0,60,120,0,0,0,0]],
		[[41,1,97,120,0,0,0,0],[4,0,60,120,0,0,0,0]]];
}

var attackList = [new attack1,new attack2,new attack3]
