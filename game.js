// Create the canvas

//var canvasPlayer = document.getElementById("canvasPlayer");
//var ctxPlayer = canvasPlayer.getContext("2d");
//canvasPlayer.width = 160;
//canvasPlayer.height = 120;

var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 1200;
canvas.height = 580;
document.body.appendChild(canvas);

var canvasp = document.createElement("canvas");
var ctxp = canvasp.getContext("2d");
canvasp.width = 160;
canvasp.height = 120;
document.body.appendChild(canvasp);

//List of images to preload
var gameImageList = {bgImage: 'images/bgA.png', repeatBGImage: 'images/bgB.png', uiBgImage: 'images/bgUI.png', portraitImage: 'images/akariportraitstd.png',
heroImage: 'images/akari.png', heroStandImage: 'images/akariStand.png', heroStandLeftImage: 'images/akariStandLeft.png',
heroAtkImage: 'images/akariAttack1.png', heroGdImage: 'images/akaridodge.png', heroJmpImage: 'images/akaridodge.png',
heroImageLeft: 'images/akariLeft.png', heroRunImageRight: 'images/akariRun.png', heroRunImageLeft: 'images/akariRunLeft.png',
heroAtkImageLeft: 'images/akariAttackLeft1.png', heroGdImageLeft: 'images/akaridodgeLeft.png', heroJmpImageLeft: 'images/akaridodgeLeft.png',
monsterImage: 'images/fuyuna.png', monsterImageRight: 'images/fuyunaTurn.png', monsterHitbox: 'images/lf.png', projectileImage: 'images/projectile.png',
enemyImage: 'images/enemy.png', enemyImageTurn: 'images/enemyTurn.png', enemyAtkImage: 'images/enemyAtk.png', enemyAtkImageTurn: 'images/enemyAtkTurn.png'};

var selectImages = {selAkari: 'images/selAkari.png', selSeira: 'images/selSeira.png', selLuna: 'images/selLuna.png', selGinka: 'images/selGinka.png',
selBG: 'images/charSelBG.jpg'};
var welcomeImages = {geneiLogo: 'images/geneiLogo.png', bg1: 'images/bg/bg1.jpg', bg2: 'images/bg/bg2.jpg', bg3: 'images/bg/bg3.jpg', bg4: 'images/bg/bg4.jpg',
bg5: 'images/bg/bg5.jpg', bg6: 'images/bg/bg6.jpg', bg7: 'images/bg/bg7.jpg', bg8: 'images/bg/bg8.jpg', bg9: 'images/bg/bg9.jpg'};

var gameImages = {}; //Contains the images to use in the level after loading them
var backgrounds = [];

var gameInterval;

//Game variables//////////////////////////
var then = 0;

var gamePaused = false;
var pauseStart = false;
var playingLevel = false;

var isLeft = false;
var isRight = true;
var isRunning = false;
var animating = false;
var highScore = 0;
var currHighScore;

//Background scrolling
var BGoffset = 0;
var scrollingBG = false;
var totalMapWidth = 2000;

//Hero variables
var playerHurt = false;
var heroHealth = 60;
var currHeroHealth;
var heroMaxHealth = 60;
var playerAttacked = false;
var heroAP = 0;
var currHeroAP;
var heroMaxAP = 30;

var attack = false;
var guard = false;
var isFalling = false;
var isJumping = false;

//Debug
var showHitboxes = false;

//Keys
var attackA = 90;
var attackB = 88;
var leftKey = 37;
var rightKey = 39;
var upKey = 38;
var downKey = 40;
var showHitbox = 81;
var pauseKey = 80;

//Attack vars
var attackcooldown = 0; //cooldown between attacks
var attackstart = true; //set to true at the very start of every attack
var attackframe = 0; //the current frame of the animation
var hitDone = false; //so it hits once every time

//Attack data handlers
var spritesInfo = []; //Saves the info of the hero's attacks
var enemySpritesInfo = [];
var currentSpriteData; //Sets the current attack being used
var attackIndex = 0;

//Data handler
var dataLoaded = false;

//Animation handlers
var animFrame = 0;

//Projectile vars
var projectilesNow = []; //Contains the projectiles on the screen
var projectileSent = false;

var damageIndicatorsNow = []; //Holds the damage indicators showing right now

// Handle keyboard controls
var keysDown = {};

// Game objects
var hero = {
	speed: 250 // movement in pixels per second
};
var monster = {speed: 125, hitbox: [[81, 13, 168, 273], [43, 20, 142, 282]]};
var monstersCaught = 0;

var mapEnemies = [];

//Base enemy structure
var enemy = function (imageL, imageR, hp, startX, speed, hitbox, detectionRange, spriteData) {
	this.imageL = imageL;
	this.imageR = imageR;
	this.hp = hp;
	this.x = startX;
	this.y = canvas.height - imageL.height;
	this.startX = startX;
	this.startY = canvas.height - imageL.height;
	this.speed = speed;
	this.hitbox = hitbox;
	this.facing = 0;
	this.width = imageL.width;
	this.height = imageL.height;
	this.isDead = false;
	this.hurt = false;
	this.walk = true;
	this.detectionRange = detectionRange;
	this.attack = false;
	this.spriteData = spriteData;
	this.currentSprite;
	this.currentFrame = 0;
	this.attackDone = false;
};

function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function preloadImages(sources, callback) {
	var images = {};
	var loadedImages = 0;
	var numImages = 0;//sources.length;
	
	for(var src in sources) {
		numImages++;
	}
	
	for(var src in sources) {
		images[src] = new Image();

		images[src].onload = function() {
			if(++loadedImages >= numImages) {
				callback(images);
			}
		};
		
		images[src].src = sources[src];
	}
}

function loadScript(url, callback)
{
    // Adding the script tag to the head as suggested before
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
    script.onreadystatechange = callback;
    script.onload = callback;

    // Fire the loading
    head.appendChild(script);
}

//Detect the collision between 2 hitboxes (a and b), uses 2 points the upper left corner (1) and lower right corner (2)
function detectOverlap(xa1, ya1, xa2, ya2, xb1, yb1, xb2, yb2) {
	if (xa1 <= xb2 && xb1 <= xa2 && ya1 <= yb2 && yb1 <= ya2){
		return true;
	}
	else{
		return false;
	}
}

function objectInView (object){
	return detectOverlap(object.x, object.y, object.x + object.width, object.y + object.height,
						Math.abs(BGoffset), 0, Math.abs(BGoffset) + canvas.width, canvas.height);
}

function hitboxOverlap (enemy, heroFacing, enemyFacing, fixLeft, isAttack){
	var heroHitbox = currentSpriteData.frameData[attackframe];

	if (isAttack){
	return detectOverlap (hero.x + fixLeft + heroHitbox[heroFacing][4], hero.y + heroHitbox[heroFacing][5],
							hero.x + fixLeft + heroHitbox[heroFacing][6], hero.y + heroHitbox[heroFacing][7],
							enemy.x + enemy.hitbox[enemyFacing][0], enemy.y + enemy.hitbox[enemyFacing][1],
							enemy.x + enemy.hitbox[enemyFacing][2], enemy.y + enemy.hitbox[enemyFacing][3]);
	}
	else{
		return detectOverlap (hero.x + fixLeft + heroHitbox[heroFacing][0], hero.y + heroHitbox[heroFacing][1],
							hero.x + fixLeft + heroHitbox[heroFacing][2], hero.y + heroHitbox[heroFacing][3],
							enemy.x + enemy.hitbox[enemyFacing][0], enemy.y + enemy.hitbox[enemyFacing][1],
							enemy.x + enemy.hitbox[enemyFacing][2], enemy.y + enemy.hitbox[enemyFacing][3]);					
	}					
}

function enemyAttackOverlap (enemy, heroFacing, enemyFacing, fixLeft){
	var heroHitbox = currentSpriteData.frameData[attackframe];
	var enemyHitbox = enemy.currentSprite.frameData[enemy.currentFrame];
	
	return detectOverlap (hero.x + fixLeft + heroHitbox[heroFacing][0], hero.y + heroHitbox[heroFacing][1],
							hero.x + fixLeft + heroHitbox[heroFacing][2], hero.y + heroHitbox[heroFacing][3],
							enemy.x + enemyHitbox[enemyFacing][4], enemy.y + enemyHitbox[enemyFacing][5],
							enemy.x + enemyHitbox[enemyFacing][6], enemy.y + enemyHitbox[enemyFacing][7]);									
}

//Loads the framedata for this char and attack, contains hitboxes and attack damage
var retrieveSpriteData = function(){
	spritesInfo = attackList;
	dataLoaded = true;
};

//Loads the frame data for all enemies, the idea is to make a set for each level
var retrieveEnemyData = function(){
	enemySpritesInfo = allEnemies;
};

//Base projectile object
var projectile = function (image, originX, originY, destinationX, destinationY, speed) {
	this.x = originX;
	this.y = originY;
	this.image = image;
	this.width = image.width;
	this.height = image.height;
	this.originX = originX;
	this.originY = originY;
	this.destinationX = destinationX;
	this.destinationY = destinationY;
	this.speed = speed;
};

//Damage indicator object
var damageIndicator = function (originX, originY, damageValue){
	this.x = originX;
	this.y = originY;
	this.baseY = originY;
	this.value = damageValue;
};

var bgMusic = document.getElementById('bgMusic');

addEventListener("keydown", function(e){
	if (!gamePaused){
		keysDown[e.keyCode] = true;
		
		if (e.keyCode == attackA && !animating){
			currentSpriteData = spritesInfo[0];
			attackIndex = 0;
				
			if (attackcooldown === 0) {
				attack = true;
			}
		}

		if (e.keyCode == showHitbox){
			showHitboxes = !showHitboxes;
		}

		if ((e.keyCode == leftKey || e.keyCode == rightKey) && (!attack && !isJumping && !isFalling)){
			currentSpriteData = spritesInfo[1];
			isRunning = true;
		}
	}
	
	if (e.keyCode == pauseKey && playingLevel){
		gamePaused = !gamePaused;
		pauseStart = gamePaused;
		
		if (gamePaused){
			bgMusic.pause();

			for (var prop in keysDown){
				if (keysDown.hasOwnProperty(prop)) {
					delete keysDown[prop];
				}
			}
		}
		else{
			bgMusic.play();
		}
	}
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
	
	if (e.keyCode == attackB){
		projectileSent = false;
	}
}, false);

// init functions
var init = function () {
	currHeroHealth = heroHealth;
	currHighScore = highScore;
	currHeroAP = heroAP;
	hero.x = 100;
	hero.y = canvas.height - 125;
	attack = false;
	
	attackcooldown = 0;
	attackstart = true;
	attackframe = 0;
	hitDone = false;
	animFrame = 0;
	
	BGoffset = 0;

	//Add random monsters
	mapEnemies.push(new enemy(gameImages.enemyImage, gameImages.enemyImageTurn, 20, 500, 5, [[19, 8, 74, 142], [28, 6, 82, 144]], 20, enemySpritesInfo[0]));
	mapEnemies.push(new enemy(gameImages.enemyImage, gameImages.enemyImageTurn, 20, 1000, 5, [[19, 8, 74, 142], [28, 6, 82, 144]], 20, enemySpritesInfo[0]));
	mapEnemies.push(new enemy(gameImages.enemyImage, gameImages.enemyImageTurn, 20, 1500, 5, [[19, 8, 74, 142], [28, 6, 82, 144]], 20, enemySpritesInfo[0]));
	mapEnemies.push(new enemy(gameImages.monsterImage, gameImages.monsterImageRight, 50, 2000,  5, [[81, 13, 168, 273], [43, 20, 142, 282]], 60, undefined));

	bgMusic.addEventListener('ended', function(){
		this.currentTime = 0;
		this.play();
	}, false);

	if (bgMusic.readyState == 4){
		bgMusic.play();
	}
	else{  
		bgMusic.addEventListener('canplay', function(){
			this.currentTime = 0;
			this.play();
		}, false);
	}
};

function clearContainers(){
	mapEnemies.length = 0;
	projectilesNow.length = 0;
	damageIndicatorsNow.length = 0;
}

// Reset the game when the player catches a monster
var reset = function () {
	//Reset player to starting area
	if(playerHurt){
		heroHealth = 60;
		currHeroHealth = heroHealth;
		heroAP = 0;
		currHeroAP = heroAP;
		monstersCaught = highScore;
		
		if(highScore >= currHighScore){
			currHighScore = highScore;
			monstersCaught = 0;
		}
		else{
			monstersCaught = 0;
		}

		hero.x = 100;
		hero.y = canvas.height - 125;

		playerHurt = false;
	}
};

// Update game objects
var update = function (modifier) {

	//Input handlers
	if (leftKey in keysDown) { // Player holding left
		if (hero.x === 0 && BGoffset < 0){
			scrollingBG = true;
			BGoffset += hero.speed * modifier;
			if (BGoffset > 0){
				BGoffset = 0;
			}
		}
		else{
			scrollingBG = false;
			hero.x -= hero.speed * modifier;
		}
		isLeft = true;
		isRight = false;
	}

	if (rightKey in keysDown) { // Player holding right
		if (hero.x >= 200 && BGoffset > - totalMapWidth){
			scrollingBG = true;
			BGoffset -= hero.speed * modifier;
		}
		else{
			scrollingBG = false;
			hero.x += hero.speed * modifier;
		}
		isLeft = false;
		isRight = true;
	}

	if ((leftKey in keysDown || rightKey in keysDown) && (!attack && !isJumping && !isFalling)){ //Player is running, side indifferent
		currentSpriteData = spritesInfo[1];
		isRunning = true;
	}
	else if (!gamePaused){
		isRunning = false;
	}

	if (upKey in keysDown && !isFalling) { // Player holding up
		hero.y -= hero.speed * modifier;
		isJumping = true;
	}
	else{
		isFalling = true;
		isJumping = false;
	}

	if (downKey in keysDown) { // Player holding down
		guard = true;
		heroReady = false;
		heroReadyLeft = false;
	}
	else{
		guard = false;
	}

	if (attackB in keysDown && currHeroAP >= 1){ //player secondary attack key
		if (!projectileSent){
			if (isRight){	
				projectilesNow.push(new projectile(gameImages.projectileImage, (hero.x - BGoffset) + (gameImages.heroImage.width/2),
				hero.y + (gameImages.heroImage.height/2), canvas.width + totalMapWidth + 100, hero.y + (gameImages.heroImage.height/2), 20));
			}
			else{
				projectilesNow.push(new projectile(gameImages.projectileImage, (hero.x - BGoffset) + (gameImages.heroImage.width/2),
				hero.y + (gameImages.heroImage.height/2), -100, hero.y + (gameImages.heroImage.height/2), 20));
			}
			projectileSent = true;
			--heroAP;
			currHeroAP = heroAP;
		}
	}
	
	if (!attack && !isRunning){
		currentSpriteData = spritesInfo[2];
	}
	
	
	//bounding box border for left side
	if(hero.x <= 0){
		hero.x = 0;
	}

	//bounding box for right side 
	if (hero.x  >= 1080){
		hero.x = 1080;
	} 
    
	
	//jump physics
	if(hero.y <= 330){
		hero.y == 230;
		isFalling = true;
	}

	if(hero.y <= 330 || hero.y >= 465){
		hero.y == hero.y;
		isFalling = true;
	}

	if (hero.y + 125 >= canvas.height){
		hero.y + 125 == canvas.height;
		isFalling = false;
	} 

	if(isFalling && !gamePaused){
		hero.y += (hero.speed / 2) * modifier;
	}
};

//the loop for the attack animation
function attackLoop() {
	if (attack){
		if (attackstart) {  
			//when starting a new attack set its length in frames and cooldown time
			attackframe = 0; //start frame
			attackcooldown = 3; //time between attacks
			attackstart = false;
			currentSpriteData = spritesInfo[attackIndex];
		}
		else{
			//attack loop
			if (attackframe == currentSpriteData.totalFrames) {
				//attack animation ended
				attack = false;
				animating = false;
				hitDone = false;		

				//we're standing still now
				currentSpriteData = spritesInfo[2];

				if (attackcooldown === 0 || !(attackA in keysDown)){
					//reset attack after cooldown
					attackframe = 0;
					attackstart = true;
				}
				else{
					//count back cooldown
					--attackcooldown;
				}
			}
			else{
					//attacking, move animation frames
					animating = true;
					++attackframe;
					currentSpriteData = spritesInfo[attackIndex];
			}
		}
	}
	else{
		if (attackcooldown > 0){
			--attackcooldown;
		}
	}
}

//the loop for other animations
var animationLoop = function(){
	if((!attack && currentSpriteData)){
		if(animFrame >= currentSpriteData.totalFrames){
			animFrame = 0;
		}
		else{
			++animFrame;
		}
	}
};

//Projectile loop
var moveProjectiles = function(){
	for (var index = 0; index < projectilesNow.length; ++index) {
		thisProj = projectilesNow[index];
		
		//Calculate the trajectory (a straight line between the origin and destination)
		//Please note the projectile doesn't move from start to destination, but instead moves
		//from start "towards" the destination until it hits something or goes outside the screen
		var projDirection = 0;
		if (thisProj.originX < thisProj.destinationX){
			thisProj.x += thisProj.speed;
		}
		else{
			thisProj.x -= thisProj.speed;
			projDirection = 1;
		}
		
		if (thisProj.destinationY == thisProj.originY){
			thisProj.y = thisProj.originY;
		}
		else{
			var m = (thisProj.destinationY - thisProj.originY) / (thisProj.destinationX - thisProj.originX);
			thisProj.y = (m * (thisProj.x - thisProj.originX)) + thisProj.originY;
		}

		for (var enemyIndex = 0; enemyIndex < mapEnemies.length; ++enemyIndex) {
			var thisEnemy = mapEnemies[enemyIndex];
			if(objectInView(thisEnemy)){
						
				var facingMonsterData = thisEnemy.facing;
			
				if (detectOverlap(thisProj.x, thisProj.y, thisProj.x + thisProj.width, thisProj.y + thisProj.height, 
								thisEnemy.x + thisEnemy.hitbox[facingMonsterData][0], thisEnemy.y + thisEnemy.hitbox[facingMonsterData][1],
								thisEnemy.x + thisEnemy.hitbox[facingMonsterData][2], thisEnemy.y + thisEnemy.hitbox[facingMonsterData][3])){
					if(thisEnemy.hp <= 0){
						thisEnemy.isDead = true;
						
						delete thisEnemy;
						mapEnemies.splice(enemyIndex, 1);
					}
					else{
						++monstersCaught;
						--thisEnemy.hp;
						thisEnemy.hurt = true;
						damageIndicatorsNow.push (new damageIndicator(thisEnemy.x + 10, thisEnemy.y + 10, 1));
					}
								
					delete thisProj;
					projectilesNow.splice(enemyIndex, 1);
					
					return;
				}
			}
		}
		
		//If the projectile goes outside the screen delete it
		if(!objectInView(thisProj)){
			delete thisProj;
			projectilesNow.splice(index, 1);
		}
	}
};

var enemyLoop = function(){
	for (var index = 0; index < mapEnemies.length; ++index) {
		var thisEnemy = mapEnemies[index];
		
		if(objectInView(thisEnemy)){
		
			var facingMonsterData = thisEnemy.facing; //0=right 1=left
			var heroAttackHitbox = currentSpriteData.frameData[attackframe];
			var facingHeroData;
			var fixLeft = 0;
			
			//Hero direction to data index
			if (isRight){
				facingHeroData = 0;
				fixLeft = -BGoffset;
			}
			else{
				facingHeroData = 1;
				fixLeft = -60 - BGoffset;
			}
			
			if(attack && thisEnemy.hp >= 1 && dataLoaded && !isRunning){
			
				//Detect attack collision
				if (hitboxOverlap (thisEnemy, facingHeroData, facingMonsterData, fixLeft, true) && !hitDone){
					++monstersCaught;
					thisEnemy.hp -= currentSpriteData.damage;
					currMonsterHealth = thisEnemy.hp;
					thisEnemy.hurt = true;
					hitDone = true;

					damageIndicatorsNow.push(new damageIndicator(thisEnemy.x + 10, thisEnemy.y + 10, currentSpriteData.damage));

					if(heroAP <= 29){
						++heroAP;
						currHeroAP = heroAP;
					}
					else{
						currHeroAP = 30;
					}
				}
			}
			else if(attack && thisEnemy.hp <= 0){
				thisEnemy.isDead = true;
				playerHurt = false;
				
				delete thisEnemy;
				mapEnemies.splice(index, 1);
				//reset();
			}
			else {
				thisEnemy.isDead = false;
				attack = false;
				thisEnemy.hurt = false;
			}

			//Enemy Movement
			if(!thisEnemy.isDead && !thisEnemy.hurt){
				thisEnemy.walk = true;
			}
			else{
				thisEnemy.walk = false;
			}

			if(thisEnemy.x <= thisEnemy.startX - 80){
				thisEnemy.facing = 0;
			}

			if(thisEnemy.x >= thisEnemy.startX + 80){
				thisEnemy.facing = 1;
			}
			
			var modifier = 1;
			
			if(thisEnemy.facing == 1){
				modifier = modifier * -1;
			}	

			if(thisEnemy.walk){
				thisEnemy.x += (thisEnemy.speed / 2) * modifier;
			}
			
			//Enemy Range Detection
			var enemyAtkDist = (thisEnemy.x + thisEnemy.detectionRange) - (hero.x - BGoffset); //+ 60) - (hero.x - BGoffset);
			
			if(enemyAtkDist >= 20 && enemyAtkDist <= 250){
				thisEnemy.startX = thisEnemy.x;
				thisEnemy.facing = 1;
				//enemyInRange = true;
			}
			else if(enemyAtkDist<= -20 && enemyAtkDist >= -250){
				thisEnemy.startX = monster.x;
				thisEnemy.facing = 0;
				//enemyInRange = true;
			}
			else{
				//enemyInRange = false;
			}
			
			var enemyInAtkRange;
			//Enemy Attack Range 
			if(enemyAtkDist >= 20 && enemyAtkDist <= 180){
				thisEnemy.startX = thisEnemy.x;
				thisEnemy.facing = 1;
				enemyInAtkRange = true;
			}
			else if(enemyAtkDist <= -20 && enemyAtkDist >= -180){
				thisEnemy.startX = thisEnemy.x;
				thisEnemy.facing = 0;
				enemyInAtkRange = true;
			}
			else{
				enemyInAtkRange = false;
			}
			
			if (enemyInAtkRange && !thisEnemy.attack && thisEnemy.spriteData){
				if (getRandomInt(1, 100) > 90){ //10%ppoi
					thisEnemy.attack = true;
					thisEnemy.currentFrame = 0;
					thisEnemy.currentSprite = thisEnemy.spriteData.attackList[0];
				}
			}
			
			//enemy attack loop
			if (thisEnemy.attack){
				if (thisEnemy.currentFrame >= thisEnemy.currentSprite.totalFrames){
					thisEnemy.currentFrame = 0;
					thisEnemy.attack = false;
					thisEnemy.attackDone = false;
				}
				else{
					thisEnemy.currentFrame += 1;
				}
				if (enemyAttackOverlap(thisEnemy, facingHeroData, facingMonsterData, fixLeft) && !thisEnemy.attackDone){
					damageIndicatorsNow.push (new damageIndicator(hero.x - BGoffset + 10, hero.y + 10, 5));
					thisEnemy.attackDone = true;
				}
			}
			
			// enemy collision
			if (isRight){
				fixLeft = -BGoffset;
			}
			else{
				fixLeft = -60 - BGoffset;
			}
			
			if (currentSpriteData){
				if (heroAttackHitbox){
					if (hitboxOverlap (thisEnemy, facingHeroData, facingMonsterData, fixLeft, false)){
						--heroHealth;
						currHeroHealth = heroHealth;
						playerAttacked = true;
					}
					else{
						playerAttacked = false;
					}
					
					if(heroHealth <= 0){
						playerHurt = true;
						highScore = monstersCaught;
						reset();
						playerAttacked = false;
					}
				}
			}
		}
	}
	
	if (mapEnemies.length === 0){
		clearInterval(gameInterval);
		bgMusic.pause();
		showClearScreen();
	}
};

// Draw everything
var render = function () {
    ctx.drawImage(gameImages.bgImage, 0, 100);
    ctx.drawImage(gameImages.uiBgImage, 0, 0);
    ctx.drawImage(gameImages.portraitImage, 13, 13);
  
	//Scrolls the background, the only problem is the image's width has to be bigger than the canvas width
	var imgTotal = parseInt(Math.abs(BGoffset) / gameImages.repeatBGImage.width, 10);
	var widthDiff = Math.abs(BGoffset) - (gameImages.repeatBGImage.width * imgTotal);

	ctx.drawImage(gameImages.repeatBGImage, -widthDiff, 100, gameImages.repeatBGImage.width, gameImages.repeatBGImage.height);
	ctx.drawImage(gameImages.repeatBGImage, gameImages.repeatBGImage.width - widthDiff, 100, gameImages.repeatBGImage.width, gameImages.repeatBGImage.height);

	//Right Facing
	if(isRight){
		if(isRunning && !isFalling && !isJumping){ //Running
			ctx.drawImage(gameImages.heroRunImageRight, 0, 145 * animFrame, 130, 145, hero.x, hero.y - 25, 130, 145);

			//Draw hitbox
			if (showHitboxes){
				heroHitbox = currentSpriteData.frameData[animFrame];
				ctx.drawImage(gameImages.monsterHitbox, 0, 0, 16, 18, hero.x + heroHitbox[0][0], hero.y - 25 + heroHitbox[0][1],
				heroHitbox[0][2] - heroHitbox[0][0],  heroHitbox[0][3] - heroHitbox[0][1]);
			}
		}
		else if (attack) {
			//Draw hitbox
			if (showHitboxes){
				heroAttackHitbox = currentSpriteData.frameData[attackframe];
				ctx.drawImage(gameImages.projectileImage, 0, 0, 16, 18, hero.x + heroAttackHitbox[0][4], hero.y + heroAttackHitbox[0][5],
				heroAttackHitbox[0][6] - heroAttackHitbox[0][4],  heroAttackHitbox[0][7] - heroAttackHitbox[0][5]);

				ctx.drawImage(gameImages.monsterHitbox, 0, 0, 16, 18, hero.x + heroAttackHitbox[0][0], hero.y + heroAttackHitbox[0][1],
				heroAttackHitbox[0][2] - heroAttackHitbox[0][0],  heroAttackHitbox[0][3] - heroAttackHitbox[0][1]);
			}

			//Each frame is 160x120, offset height by frame number * 120
			ctx.drawImage(gameImages.heroAtkImage, 0, 120 * attackframe, 160, 120, hero.x, hero.y, 160, 120);
		}
		else if (guard) {
			ctx.drawImage(gameImages.heroGdImage, hero.x, hero.y);
		}
		else if (isJumping) {
			ctx.drawImage(gameImages.heroJmpImage, hero.x, hero.y);
		}
		else{
			ctx.drawImage(gameImages.heroStandImage, 0, currentSpriteData.frameHeight * animFrame, currentSpriteData.frameWidth, currentSpriteData.frameHeight, hero.x, hero.y, currentSpriteData.frameWidth, currentSpriteData.frameHeight);

			if (showHitboxes){
				heroHitbox = currentSpriteData.frameData[animFrame];
				ctx.drawImage(gameImages.monsterHitbox, 0, 0, 16, 18, hero.x + heroHitbox[0][0], hero.y + heroHitbox[0][1],
				heroHitbox[0][2] - heroHitbox[0][0],  heroHitbox[0][3] - heroHitbox[0][1]);
			}
		}
	}

	//Left Facing
	if(isLeft){
		if(isRunning && !isFalling && !isJumping){ //Running
			ctx.drawImage(gameImages.heroRunImageLeft, 0, 145 * animFrame, 130, 145, hero.x, hero.y - 25, 130, 145);

			//Draw hitbox
			if (showHitboxes){
				heroHitbox = currentSpriteData.frameData[animFrame];
				ctx.drawImage(gameImages.monsterHitbox, 0, 0, 16, 18, hero.x + heroHitbox[1][0], hero.y - 25 + heroHitbox[1][1],
				heroHitbox[1][2] - heroHitbox[1][0],  heroHitbox[1][3] - heroHitbox[1][1]);
			}
		}
		else if (attack) {
			//Draw hitbox
			if (showHitboxes){
				heroAttackHitbox = currentSpriteData.frameData[attackframe];
				ctx.drawImage(gameImages.projectileImage, 0, 0, 16, 18, hero.x - 60 + heroAttackHitbox[1][4], hero.y + heroAttackHitbox[1][5],
				heroAttackHitbox[1][6] - heroAttackHitbox[1][4],  heroAttackHitbox[1][7] - heroAttackHitbox[1][5]);

				ctx.drawImage(gameImages.monsterHitbox, 0, 0, 16, 18, hero.x - 60 + heroAttackHitbox[1][0], hero.y + heroAttackHitbox[1][1],
				heroAttackHitbox[1][2] - heroAttackHitbox[1][0],  heroAttackHitbox[1][3] - heroAttackHitbox[1][1]);
			}

			//Each frame is 160x120, offset height by frame number * 120
			ctx.drawImage(gameImages.heroAtkImageLeft, 0, 120 * attackframe, 160, 120, hero.x - 60, hero.y, 160, 120);
		}

		else if (guard) {
			ctx.drawImage(gameImages.heroGdImageLeft, hero.x, hero.y);
		}

		else if (isJumping) {
			ctx.drawImage(gameImages.heroJmpImageLeft, hero.x, hero.y);
		}
		else { //Not doing anything
			ctx.drawImage(gameImages.heroStandLeftImage, 0, currentSpriteData.frameHeight * animFrame, currentSpriteData.frameWidth, currentSpriteData.frameHeight, hero.x, hero.y, currentSpriteData.frameWidth, currentSpriteData.frameHeight);
			
			//Draw hitbox
			if (showHitboxes){
				heroHitbox = currentSpriteData.frameData[animFrame];
				ctx.drawImage(gameImages.monsterHitbox, 0, 0, 16, 18, hero.x + heroHitbox[1][0], hero.y + heroHitbox[1][1],
				heroHitbox[1][2] - heroHitbox[1][0],  heroHitbox[1][3] - heroHitbox[1][1]);
			}
		}
	}
  
	//Above are the static elements, save their positions
	ctx.save();
	//Now translate the canvas position by the offset and draw the moving elements
	ctx.translate(BGoffset,0);
    
	//Projectiles
	for (var index = 0; index < projectilesNow.length; ++index) {
		thisProj = projectilesNow[index];
		ctx.drawImage(thisProj.image, thisProj.x, thisProj.y);
	}
  
	//Damage indicators
	for (var index = 0; index < damageIndicatorsNow.length; ++index) {
		thisIndicator = damageIndicatorsNow[index];
		ctx.fillStyle = "rgb(250, 0, 0)";
		ctx.font = "bold 30px Helvetica";
		ctx.textAlign = "left";
		ctx.textBaseline = 'top';
		thisIndicator.y -= 5;
		ctx.fillText(thisIndicator.value, thisIndicator.x, thisIndicator.y);
		if (thisIndicator.y == thisIndicator.baseY - 35){
			delete thisIndicator;
			damageIndicatorsNow.splice(index, 1);
		}
	}

	//Enemies
	for (var index = 0; index < mapEnemies.length; ++index) {
		thisEnemy = mapEnemies[index];
		if (objectInView(thisEnemy)){
			if (thisEnemy.facing === 0){
				if (thisEnemy.attack){
					ctx.drawImage(gameImages.enemyAtkImageTurn, 0, 150 * thisEnemy.currentFrame, 100, 150, thisEnemy.x, thisEnemy.y, 100, 150);
				}
				else{
					ctx.drawImage(thisEnemy.imageR, thisEnemy.x, thisEnemy.y);
				}
			}
			else{
				if (thisEnemy.attack){
					ctx.drawImage(gameImages.enemyAtkImage, 0, 150 * thisEnemy.currentFrame, 100, 150, thisEnemy.x, thisEnemy.y, 100, 150);
				}
				else{
					ctx.drawImage(thisEnemy.imageL, thisEnemy.x, thisEnemy.y);
				}
			}
			
			ctx.fillStyle = "rgb(250, 250, 250)";
			ctx.font = "12px Helvetica";
			ctx.textAlign = "left";
			ctx.textBaseline = 'top';
			ctx.fillText(thisEnemy.hp, thisEnemy.x, thisEnemy.y + 20);
			
			//Draw hitbox
			if (showHitboxes){
				if (thisEnemy.facing === 0){
					ctx.drawImage(gameImages.monsterHitbox, 0, 0, 16, 18, thisEnemy.x + thisEnemy.hitbox[1][0], thisEnemy.y + thisEnemy.hitbox[1][1],
									thisEnemy.hitbox[1][2] - thisEnemy.hitbox[1][0],  thisEnemy.hitbox[1][3] - thisEnemy.hitbox[1][1]);
				}
				else{
					ctx.drawImage(gameImages.monsterHitbox, 0, 0, 16, 18, thisEnemy.x + thisEnemy.hitbox[0][0], thisEnemy.y + thisEnemy.hitbox[0][1],
									thisEnemy.hitbox[0][2] - thisEnemy.hitbox[0][0],  thisEnemy.hitbox[0][3] - thisEnemy.hitbox[0][1]);
				}
			}
		}
	}
	
	//The above are moving elements
	//Get the drawing offset back to normal
	ctx.restore();
	//Static objects below this point, these could go before the save instruction anyway...

	// Points
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "15px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Points: " + monstersCaught, 140, 75);

	// High Score
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("High Score: " + currHighScore, 13, 155);

	// Debug
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "12px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Press Q to show hitboxes", 13, 138);
	ctx.fillText("Press P for pause menu", 163, 138);

	//Hero Name
	ctx.fillStyle = "rgb(250, 125, 50)";
	ctx.font = "20px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = 'top';
	ctx.fillText("Akari", 140, 15);

	//Hero HP
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "15px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = 'top';
	ctx.fillText("HP: " + currHeroHealth + "/" + heroMaxHealth, 140, 45);

	//Hero AP
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "15px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = 'top';
	ctx.fillText("AP: " + currHeroAP + "/" + heroMaxAP, 140, 60);

	if (gamePaused){ //Show the menu
		ctx.save();
		
		ctx.globalAlpha = 0.6;
		
		ctx.rect(0,0,canvas.width,canvas.height);
		ctx.fillStyle="black";
		ctx.fill();
		
		ctx.restore();
		
		var resumeText = "Resume game";
		var exitText = "Exit to title";
		
		var resumeMeasure;
		var exitMeasure;
	
		ctx.fillStyle = "rgb(250, 250, 250)";
		ctx.font = "35px Helvetica";
		ctx.textAlign = "center";
		ctx.textBaseline = "center";
		
		resumeMeasure = ctx.measureText(resumeText);
		ctx.fillText(resumeText, canvas.width / 2, 200);
	
		exitMeasure = ctx.measureText(exitText);
		ctx.fillText(exitText, canvas.width / 2, 250);
		
		if (pauseStart){
			var mouseMoveHandler = function(e){
				var mouseX = 0;
				var mouseY = 0;
				
				if (e.layerX || e.layerX === 0) { //Firefox fix
					mouseX = e.layerX;
					mouseY = e.layerY;
				}
				else{
					mouseX = e.offsetX;
					mouseY = e.offsetY;
				}
				
				var resumeLeft = (canvas.width / 2) - (resumeMeasure.width / 2);
				var exitLeft = (canvas.width / 2) - (exitMeasure.width / 2);
				
				if (detectOverlap(resumeLeft, 200, resumeLeft + resumeMeasure.width, 235, mouseX, mouseY, mouseX + 1, mouseY + 1)){
					e.target.style.cursor = 'pointer';
				}
				else if (detectOverlap(exitLeft, 250, exitLeft + exitMeasure.width, 285, mouseX, mouseY, mouseX + 1, mouseY + 1)){
					e.target.style.cursor = 'pointer';
				}
				else{
					e.target.style.cursor = 'default';
				}
			};
			
			var clickHandler = function (e){
				var mouseX = 0;
				var mouseY = 0;
			
				if (e.layerX || e.layerX === 0) { //Firefox fix
					mouseX = e.layerX;
					mouseY = e.layerY;
				}
				else{
					mouseX = e.offsetX;
					mouseY = e.offsetY;
				}
				
				var resumeLeft = (canvas.width / 2) - (resumeMeasure.width / 2);
				var exitLeft = (canvas.width / 2) - (exitMeasure.width / 2);
				
				if (detectOverlap(resumeLeft, 200, resumeLeft + resumeMeasure.width, 235, mouseX, mouseY, mouseX + 1, mouseY + 1)){
					canvas.removeEventListener("click", clickHandler, false);
					canvas.removeEventListener("mousemove", mouseMoveHandler, false);
					
					e.target.style.cursor = 'default';
					
					gamePaused = false;
					bgMusic.play();
				}
				else if (detectOverlap(exitLeft, 250, exitLeft + exitMeasure.width, 285, mouseX, mouseY, mouseX + 1, mouseY + 1)){
					canvas.removeEventListener("click", clickHandler, false);
					canvas.removeEventListener("mousemove", mouseMoveHandler, false);
					
					e.target.style.cursor = 'default';
					playerHurt = true;
					
					init();
					reset();
					clearContainers();
					clearInterval(gameInterval);
					
					gamePaused = false;
					playingLevel = false;
					
					bgMusic.pause();
					
					showLoadingScreen();
					preloadImages(welcomeImages, welcomeScreen);
				}
				else{
					e.target.style.cursor = 'default';
				}
			};
			
			canvas.addEventListener("click", clickHandler, false);
			canvas.addEventListener("mousemove", mouseMoveHandler, false);
			
			pauseStart = false;
		}
	}
	
	if (currentSpriteData && false){
		//Debug
		ctx.fillStyle = "rgb(250, 250, 250)";
		ctx.font = "14px Helvetica";
		ctx.textAlign = "left";
		ctx.textBaseline = 'top';
		ctx.fillText("Debug: " + " Pause: " + gamePaused, 282, 138); 
	}
};

// The main game loop
var main = function () {
	var now = Date.now();
	var delta = now - then;

	update(delta / 1000);

	if (!gamePaused){
		enemyLoop();
		attackLoop();
		animationLoop();
		moveProjectiles();
	}

	render();

	then = now;
};

var musicFadeInterval;

//Handler for the character selection screen
function characterSelectScreen (images){
	hideLoadingScreen();
	
	ctx.rect(0,0,canvas.width,canvas.height);
	ctx.fillStyle="black";
	ctx.fill();
	
	ctx.drawImage(images.selBG, 0, 0);
	
	ctx.fillStyle = "rgb(255, 255, 255)";
	ctx.font = "35px Helvetica";
	ctx.textAlign = "center";
	ctx.textBaseline = "top";
	ctx.fillText("Character select", canvas.width / 2, 25);
	
	var baseWidth = images.selAkari.width;
	var baseHeight = images.selAkari.height;
	var baseLeft = ((canvas.width - ((baseWidth + 10) * 4)) - 10) / 2;
	
	ctx.drawImage(images.selAkari, baseLeft, 80);
	ctx.drawImage(images.selSeira, baseLeft + baseWidth + 10, 80);
	ctx.drawImage(images.selLuna, baseLeft + (baseWidth * 2) + 20, 80);
	ctx.drawImage(images.selGinka, baseLeft + (baseWidth * 3) + 30, 80);
	
	var mouseMoveHandler = function(e){
		var mouseX = 0;
		var mouseY = 0;
		
		if (e.layerX || e.layerX === 0) { //Firefox fix
			mouseX = e.layerX;
			mouseY = e.layerY;
		}
		else{
			mouseX = e.offsetX;
			mouseY = e.offsetY;
		}
		
		if (detectOverlap(baseLeft, 80, baseLeft + baseWidth, 80 + baseHeight, mouseX, mouseY, mouseX + 1, mouseY + 1)){
				e.target.style.cursor = 'pointer';
			}
		else{
				e.target.style.cursor = 'default';
		}
	};
	
	var clickHandler = function (e){
		if (e.layerX || e.layerX === 0) { //Firefox fix
			mouseX = e.layerX;
			mouseY = e.layerY;
		}
		else{
			mouseX = e.offsetX;
			mouseY = e.offsetY;
		}
	
		if (detectOverlap(baseLeft, 80, baseLeft + baseWidth, 80 + baseHeight, mouseX, mouseY, mouseX + 1, mouseY + 1)){ //Click Akari
				canvas.removeEventListener("click", clickHandler, false);
				canvas.removeEventListener("mousemove", mouseMoveHandler, false);
				
				musicFadeInterval = setInterval(musicFadeOut, 50);
				msMusicElement.removeEventListener('canplay', msMusicPlay, false);
				e.target.style.cursor = 'default';
				
				//Show the loading screen
				showLoadingScreen();
				//Preload the images for the game and start
				preloadImages(gameImageList, gameStarter);
		}
	};
	
	canvas.addEventListener("mousemove", mouseMoveHandler, false);
	canvas.addEventListener("click", clickHandler, false);
}

//A loop for fading out the music
var musicFadeOut = function(){
	msMusicElement.volume -= 0.06;
	
	if (msMusicElement.volume <= 0.1){
		clearInterval (musicFadeInterval);
		msMusicElement.pause();
	}
};

//Starts the game after the character select
function gameStarter(images){
	playingLevel = true;
	hideLoadingScreen();
	gameImages = images;
	init();
	playerHurt = true;
	reset();
	then = Date.now();
	gameInterval = setInterval(main, 50);
}

//The loading screen handlers
var loadingScreenInterval;

function showLoadingScreen(){
	var currBG = getRandomInt(0, 8);
	loadingScreenInterval = setInterval(function(){
	ctx.rect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "black";
	ctx.fill();
	
	if (backgrounds.length > 0){
		ctx.drawImage(backgrounds[currBG], 0, 0);
	}
	
	ctx.fillStyle = "rgb(255, 255, 255)";
	ctx.font = "15px Helvetica";
	ctx.textAlign = "right";
	ctx.textBaseline = "top";
	ctx.fillText("Loading", canvas.width - 15, canvas.height - 25);
	},50);
}

function hideLoadingScreen(){
	clearInterval(loadingScreenInterval);
}

//The stage clear screen
var clearScreenInterval;
var timeStart = 0;
var clearAlpha = 0;

function showClearScreen(){
	playingLevel = false;
	
	timeStart = Date.now();
	
	clearScreenInterval = setInterval(function(){
	ctx.globalAlpha = clearAlpha;
	
	ctx.rect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle="black";
	ctx.fill();
	
	ctx.fillStyle = "rgb(255, 255, 255)";
	ctx.font = "50px Helvetica";
	ctx.textAlign = "center";
	ctx.textBaseline = "center";
	ctx.fillText("Stage clear", canvas.width / 2, canvas.height / 2);
	
	if (clearAlpha >= 1){
		clearAlpha = 1;
	}
	else{
		clearAlpha += 0.1;
	}
	
	if ((Date.now() - timeStart) >= 3000){
		hideClearScreen();
	}
	
	},50);
}

function hideClearScreen(){
	clearInterval(clearScreenInterval);
	showLoadingScreen();
	//Preload images for welcome screen
	preloadImages(welcomeImages, welcomeScreen);
}

//Handler for the op music
var msMusicElement;
var msMusicPlay = function (){
		msMusicElement.currentTime = 0;
		msMusicElement.play();
};

//The welcome screen definition and loop
var welcomeScreen = function(images){
	hideLoadingScreen();

	if (backgrounds.length === 0){
		backgrounds.push(images.bg1, images.bg2, images.bg3, images.bg4, images.bg5, images.bg6, images.bg7, images.bg8, images.bg9);
	}
	
	msMusicElement = document.getElementById('msMusic');
	
	if (msMusicElement.readyState == 4){
		msMusicElement.volume = 1;
		msMusicElement.currentTime = 0;
		msMusicElement.play();
	}
	else{
		msMusicElement.addEventListener('canplay', msMusicPlay, false);
	}
	
	ctx.rect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle="black";
	ctx.fill();
	
	var currTitleAlpha = 0;
	var currSubAlpha = 0;
	var tmStart = Date.now();
	var alphaMod = 1;
	
	//The welcome screen animation
	var welcomeInterval = setInterval(function(){
		
		var tmNow = Date.now();
		var tmDelta = tmNow - tmStart;
		var tmMod = tmDelta / 1000;
	
		if (currTitleAlpha < 1){
			currTitleAlpha += 0.3 * tmMod;
		}
		else if (currTitleAlpha > 1){
			currTitleAlpha = 1;
		}
		
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		ctx.rect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle="black";
		ctx.fill();
		
		ctx.save();
		
		ctx.globalAlpha = currTitleAlpha;
		ctx.drawImage(images.geneiLogo, (canvas.width - images.geneiLogo.width) / 2, 80);
		
		ctx.fillStyle = "rgb(255, 255, 255)";
		ctx.font = "25px Helvetica";
		ctx.textAlign = "left";
		ctx.textBaseline = "top";
		ctx.fillText("Gen'ei o Kakeru Taiyou Game for /a/", (canvas.width - images.geneiLogo.width) / 2, 80 + images.geneiLogo.height + 10);
		
		ctx.restore();

		if (currSubAlpha >= 1){
			alphaMod = -1;
		}
		else if (currSubAlpha <= 0){
			alphaMod = 1;
		}
		
		currSubAlpha += 0.4 * tmMod * alphaMod;
		
		if (currSubAlpha < 0){
			currSubAlpha = 0;
		}
		
		ctx.save();
		
		ctx.globalAlpha = currSubAlpha;
		
		ctx.fillStyle = "rgb(255, 255, 255)";
		ctx.font = "30px Helvetica";
		ctx.textAlign = "center";
		ctx.textBaseline = "top";
		ctx.fillText("Click on the screen to continue", canvas.width / 2, canvas.height - 50);
		
		ctx.restore();
		
		tmStart = Date.now();
	}, 50);
	
	var keyPressHandler = function(){
		canvas.removeEventListener("click", keyPressHandler, false);
		clearInterval(welcomeInterval);
		showLoadingScreen();
		preloadImages(selectImages, characterSelectScreen);
	};
	
	canvas.addEventListener("click", keyPressHandler, false);
};

// Let's play this game!/////////////////////
loadScript("akari.js", retrieveSpriteData);
loadScript("enemy1.js", retrieveEnemyData);

//Show the loading screen
showLoadingScreen();
//Preload images for welcome screen
preloadImages(welcomeImages, welcomeScreen);
