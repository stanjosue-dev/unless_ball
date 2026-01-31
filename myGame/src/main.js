import kaplay from "kaplay"; // import "kaplay/global"; // pour utiliser sans le prefix k.

const k = kaplay();
k.loadRoot("./"); // une bonne idée pour la publication Itch.io
k.loadSprite("bean", "/sprites/bean.png");
k.loadSprite("desert", "/sprites/desert.png");
k.loadSprite("space", "/sprites/space.png");
k.loadSprite("city", "/sprites/city.png");
k.loadSprite("pillar", "/sprites/pillar.png");
k.loadSprite("cactus", "/sprites/cactus.png");
k.loadSprite("bird", "/sprites/bird.png");
k.loadSprite("alien", "/sprites/alien.png");
k.loadSprite("plant", "/sprites/plant.png");
k.loadSprite("asteroid", "/sprites/asteroid.png");
k.loadSprite("guy", "/sprites/guy.png");
k.loadSprite("car", "/sprites/car.png");
k.loadSprite("floor", "/sprites/floor.png");

loadMusic("music", "/examples/sounds/music.mp3");
loadSound("jump", "/examples/sounds/jump.wav");

const biomes = {

	desert : {
		gravity: 1600,
		SPEED: 300,
		background: "desert",
		color: "#FAD5A5",
		enemy: "cactus",
		enemy1: "pillar",
		enemy2: "bird",
		tab: [ 490 , 495, 505 , 510 , 515, 520],
		tab1: [ 60, 70, 90 , 100, 110, 300],
		enemy2Y: function() {

			return this.tab1[Math.floor( Math.random() * this.tab1.length )] ;

		},
		val: function(bean) {

			music.paused = true;
			go("lose");
			addKaboom(bean.pos);
			burp()

		}
	},


	space : {
		gravity: 400,
		SPEED: 200,
		background: "space",
		color: "#f4fefe",
		enemy: "alien",
		enemy1: "plant",
		enemy2: "asteroid",
		tab: [ 490 , 495, 505 , 510 , 515, 520],
		tab1: [ 60, 70, 90 , 100, 110, 300],
		enemy2Y: function() {

		return this.tab1[Math.floor( Math.random() * this.tab1.length )] ;

		}, 
		val: function(bean) {

			music.paused = true;
			go("lose");
			addKaboom(bean.pos);
			burp();

		}
	},


	city : {
		gravity: 1300,
		SPEED: 380,
		background: "city",
		color: "#4e3d28",
		enemy: "car",
		enemy1: "guy",
		enemy2: "floor",
		tab: [ 490 , 495, 505 , 510 , 515, 520],
		tab2: [ 300, 320, 360, 390, 400],
		enemy2Y: function() {

		return this.tab2[Math.floor( Math.random() * this.tab2.length )] ;

		}, 
		val: function() {

			// Rien

		},
	},


};


let SCORE = null, MSCORE = 0, currentBiome = "desert";

const music = play("music", {
    loop: true,
	paused: true,
});






/** MENU **/

scene("menu", () => {

	music.paused = true;

	add([
		text(`
	Bienvenue sur Endless Ball mon tout premier jeu <3
			 			Amusez-vous !`),
		pos(200,20)
	]);

	add([
		text('\nmade by Stan.\n'),
		pos(1120,520),
		scale(0.8)
	]);

	setBackground(135, 62, 132);

	function addButton(txt, p, f) {

	const btn = add([
		rect(240, 80, { radius: 8 }),
		pos(p),
		area(),
		scale(1),
		anchor("center"),
		outline(4),
	])
	btn.add([
		text(txt),
		anchor("center"),
		color(0, 0, 0),
	])
	btn.onHoverUpdate(() => {
		const t = time() * 10
		btn.color = hsl2rgb((t / 10) % 1, 0.6, 0.7)
		btn.scale = vec2(1.2)
		setCursor("pointer")
	})
	btn.onHoverEnd(() => {
		btn.scale = vec2(1)
		btn.color = rgb()
	})
	btn.onClick(f)
	return btn
};

	addButton("Start", vec2(500, 320), () => go("game"))
	addButton("Tutoriel \n(french)", vec2(867, 320), () => go("tuto"))

});






/** GAME **/

scene("game", () => {

	if ( music.paused === true ) {
	 music.paused = false ;
	};

SCORE = 0 ;

	//ajout objets
const bean = add([
    sprite("bean"),
    pos(center()),
    area(),
    body(),

]);


const back = add([
    sprite(biomes[currentBiome].background, {
        width: width(),
        height: height(),
    }),
    pos(0,0),
    z(-1),
]);


add([
	text("Appuie sur espace pour sauter"),
    pos(120,0),
]);


	//mouvement 
onKeyDown("right", () => {
	bean.move(biomes[currentBiome].SPEED, 0)
})
onKeyDown("left", () => {
	bean.move(-biomes[currentBiome].SPEED, 0)
})
onKeyDown("down", () => {
	bean.move(0, biomes[currentBiome].SPEED)
})


	//gravite
setGravity(biomes[currentBiome].gravity);
const floor = add([
	rect(width(), 48),
	outline(4),
	color(biomes[currentBiome].color),
	area(),
	pos(0, height() - 48),
	body({ isStatic: true }),
]); 

onKeyPress("space", () => {
    if ( bean.isGrounded() ) {
        bean.jump() ;
		play("jump")
    }
});

onKeyDown("down", () => {
	if ( !bean.isGrounded() ) {
        bean.move(0, biomes[currentBiome].SPEED)
    }
});


	//obstacles 
	function spawnPipe() {

		const b = biomes[currentBiome];

		add([
            pos(width() , 480),
            sprite(b.enemy1, {
				width: 80,
				height: 120,
			}),
			area(-4),
			move(LEFT, b.SPEED),
			offscreen({ destroy: true }),
			// give it tags to easier define behaviors see below
			{ passed: false },
		])

		add([
            pos(1500 , b.tab[Math.floor(Math.random() * b.tab.length)]),
            sprite(b.enemy, {
				width: 60,
				}),
			area(-4),
			move(LEFT, b.SPEED),
			offscreen({ destroy: true }),
			"enemy",
			{ passed: false },
			z(-1),
		])

		add([
            pos(1500 , b.enemy2Y()),
            sprite(b.enemy2, {
				width: 60,
				}),
			area(-4),
			body({ isStatic: true }),
			move(LEFT, b.SPEED),
			offscreen({ destroy: true }),
			"enemy2",
			{ passed: false },
			z(-1),
		])};

    	bean.onCollide("enemy", () => {
		music.paused = true ;
		go("lose");
		addKaboom(bean.pos);
		burp() ; 
	    });

		bean.onCollide("enemy2", () => {
		biomes[currentBiome].val(bean) ;
	    });
	
        loop(1.2, () => {
		spawnPipe()
	    });

		bean.onUpdate(() => {
	if (bean.pos.x <= 0 || bean.pos.x >= 1300 ) {
		music.paused = true ;
		go("lose")
		addKaboom(bean.pos)
		burp();
	}
});


	//score 
	const scoreLabel = add([
		text(SCORE),
		pos(24, 24),
	]);

	onUpdate(() => {
		
		SCORE+=0.1
		scoreLabel.text = Math.floor(SCORE) ;

	if (SCORE > 130 && currentBiome === "desert" ) {

    currentBiome = "space" ;
	setGravity(biomes[currentBiome].gravity) ;
	back.use(
	sprite(biomes[currentBiome].background, {
        width: width(),
        height: height(),

    })) ;

	floor.use(
		color(biomes[currentBiome].color)
	);

	debug.log("EVITE LES EXTRA-TERRESTRE ET LES ASTEROIDES !")
	debug.log("BIENVENUE DANS L'ESPACE") ;

	} else if (SCORE > 330 && currentBiome === "space") {

	currentBiome = "city" ;
	setGravity(biomes[currentBiome].gravity) ;
	back.use(
	sprite(biomes[currentBiome].background, {
        width: width(),
        height: height(),

    })) ;

	floor.use(
		color(biomes[currentBiome].color)
	);

	debug.log("EVITE LES VEHICULES !")
	debug.log("BIENVENUE DANS LA VILLE") ;

	};

})});






/** LOSE **/

scene("lose", () => {

	if ( Math.floor(SCORE) > MSCORE ){
		MSCORE = SCORE ;
	};

	localStorage.setItem('MSCORE', Math.floor(MSCORE)) ;

	setBackground(0, 0, 0)
	add([
		sprite("bean"),
		pos(width() / 2, height() / 2 - 108),
		scale(2),
		anchor("center"),
	])

	add([
		text(`	Score : ${Math.floor(SCORE)}

	Meilleur score : ${localStorage.getItem('MSCORE')}`),
		pos(width() / 2, height() / 2 + 108),
		scale(1),
		anchor("center"),
	])

	add([text("Tu as perdu..")])
    onClick(() => {
		currentBiome = "desert" ;
		go("game") ;
		debug.log("EVITEZ LES CACTUS ET LES OISEAUX")
		debug.log("BIENVENUE DANS LE DESERT")
	});

    onKeyPress("space",  () => {
		currentBiome = "desert" ;
		go("game") ;
		debug.log("EVITEZ LES CACTUS ET LES OISEAUX")
		debug.log("BIENVENUE DANS LE DESERT")

})

	function addButton(txt, p, f) {

	const btn = add([
		rect(100, 80, { radius: 8 }),
		pos(p),
		area(),
		scale(1),
		anchor("center"),
		outline(4),
	])
	btn.add([
		text(txt),
		anchor("center"),
		color(0, 0, 0),
	])
	btn.onHoverUpdate(() => {
		const t = time() * 10
		btn.color = hsl2rgb((t / 10) % 1, 0.6, 0.7)
		btn.scale = vec2(1.2)
		setCursor("pointer")
	})
	btn.onHoverEnd(() => {
		btn.scale = vec2(1)
		btn.color = rgb()
	})
	btn.onClick(f)
	return btn
};

	addButton("Menu", vec2(1300,50), () => go("menu"))

});






/** TUTORIEL **/

scene("tuto", ()=>{

SCORE = 0 ;
const bean = add([
    sprite("bean"),
    pos(center()),
    area(),
    body(),]);
const back = add([
    sprite(biomes[currentBiome].background, {
        width: width(),
        height: height(),
    }),
    pos(0,0),
    z(-1),]);
onKeyDown("right", () => {bean.move(biomes[currentBiome].SPEED, 0)})
onKeyDown("left", () => {bean.move(-biomes[currentBiome].SPEED, 0)})
onKeyDown("down", () => {bean.move(0, biomes[currentBiome].SPEED)})
setGravity(biomes[currentBiome].gravity);
const floor = add([
	rect(width(), 48),
	outline(4),
	color(biomes[currentBiome].color),
	area(),
	pos(0, height() - 48),
	body({ isStatic: true }),]);
add([
	text(`
	Règles du jeu :

essayez de faire le score le plus élevé possible tout en
évitent les obstacles sur votre chemin(le désert , l'espace et la ville)

servez vous des fleches directionnelles :

"gauches" et "droite" pour vous déplacer
"espace" pour sauter.




***Tips 😉😉 :
dans le desert évitez uniquement les cactus et ces sales oiseaux,
dans l'espace évitez les aliens et les astéroides,
dans la ville évitez les voitures mais aidez vous des planches.
dans le tutoriel les enemis sont descativés!
en vous rapprochant trop des bordures vous perdez.
N' hésitez pas à utiliser la touche directionnelle "bas" pour redescendre plus vite	
		`),
    pos(100,1),
	scale(0.5),])
onKeyPress("space", () => {
    if ( bean.isGrounded() ) {
        bean.jump() ;
		play("jump")}});
onKeyDown("down", () => {
	if (!bean.isGrounded()){bean.move(0, biomes[currentBiome].SPEED)}});
bean.onUpdate(() => {
	if (bean.pos.x <= 0 || bean.pos.x >= 1300 ) {
		go("lose")
		addKaboom(bean.pos)
		burp();}});
function spawnPipe() {
const b = biomes[currentBiome];

		add([
            pos(width() , 480),
            sprite(b.enemy1, {
				width: 80,
				height: 120,}),
			area(-4),
			move(LEFT, b.SPEED),
			offscreen({ destroy: true }),
			{ passed: false },])
		add([
            pos(1500 , b.tab[Math.floor(Math.random() * b.tab.length)]),
            sprite(b.enemy, {width: 60,}),
			area(-4),
			move(LEFT, b.SPEED),
			offscreen({ destroy: true }),
			"enemy",
			{ passed: false },
			z(-1),])
		add([
            pos(1500 , b.enemy2Y()),
            sprite(b.enemy2, {width: 60,}),
			area(-4),
			body({ isStatic: true }),
			move(LEFT, b.SPEED),
			offscreen({ destroy: true }),
			"enemy2",
			{ passed: false },
			z(-1),])};       	
        loop(1.5, () => {spawnPipe()});
	const scoreLabel = add([
		text(SCORE),
		pos(24, 24),]);
	onUpdate(() => {
		SCORE+=0.1
		scoreLabel.text = Math.floor(SCORE) ;
	if (SCORE > 80 && currentBiome === "desert" ) {
    currentBiome = "space" ;
	setGravity(biomes[currentBiome].gravity) ;
	back.use(sprite(biomes[currentBiome].background, {
        width: width(),
        height: height(),}));
	floor.use(color(biomes[currentBiome].color));
	} else if (SCORE > 180 && currentBiome === "space") {
	currentBiome = "city";
	setGravity(biomes[currentBiome].gravity) ;
	back.use(sprite(biomes[currentBiome].background, {
        width: width(),
        height: height(),}));
	floor.use(color(biomes[currentBiome].color))};

})});


go("menu") ;

