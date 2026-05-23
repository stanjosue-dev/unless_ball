import kaplay from "kaplay";

//     letterbox 
//     stretch   

const k = kaplay({
    width: 1280,
    height: 720,
    letterbox: true,       
  // stretch: true, /* decommentez pour fullscreen */
    background: [0, 0, 0],
});

k.loadRoot("./");
k.loadSprite("bean",     "/sprites/bean.png");
k.loadSprite("desert",   "/sprites/desert.png");
k.loadSprite("space",    "/sprites/space.png");
k.loadSprite("city",     "/sprites/city.png");
k.loadSprite("pillar",   "/sprites/pillar.png");
k.loadSprite("cactus",   "/sprites/cactus.png");
k.loadSprite("bird",     "/sprites/bird.png");
k.loadSprite("alien",    "/sprites/alien.png");
k.loadSprite("plant",    "/sprites/plant.png");
k.loadSprite("asteroid", "/sprites/asteroid.png");
k.loadSprite("guy",      "/sprites/guy.png");
k.loadSprite("car",      "/sprites/car.png");
k.loadSprite("floor",    "/sprites/floor.png");

loadMusic("music", "/examples/sounds/music.mp3");
loadSound("jump",  "/examples/sounds/jump.wav");

// ─────────────────────────────────────────────
//   CONSTANTES RELATIVES À L'ÉCRAN
// ─────────────────────────────────────────────

const FLOOR_H       = 48;
const floorY        = () => height() - FLOOR_H;
const spawnOffscreenX = () => width() + 120;  
const maxX          = () => width() - 10;   

const groundTab = () => {
    const fy = floorY();
    return [fy - 55, fy - 50, fy - 40, fy - 35, fy - 30, fy - 25];
};

const flyTab = () => {
    const h = height();
    return [h * 0.08, h * 0.10, h * 0.13, h * 0.15, h * 0.18, h * 0.42];
};

const platformTab = () => {
    const h = height();
    return [h * 0.42, h * 0.45, h * 0.50, h * 0.55, h * 0.58];
};

// ─────────────────────────────────────────────
//  BIOMES
// ─────────────────────────────────────────────
const biomes = {

    desert: {
        gravity: 1600,
        SPEED: 300,
        background: "desert",
        color: "#FAD5A5",
        enemy:  "cactus",
        enemy1: "pillar",
        enemy2: "bird",
        tab:  groundTab,
        tab1: flyTab,
        enemy2Y() { const t = this.tab1(); return t[Math.floor(Math.random() * t.length)]; },
        val(bean) { music.paused = true; go("lose"); addKaboom(bean.pos); burp(); },
    },

    space: {
        gravity: 400,
        SPEED: 200,
        background: "space",
        color: "#f4fefe",
        enemy:  "alien",
        enemy1: "plant",
        enemy2: "asteroid",
        tab:  groundTab,
        tab1: flyTab,
        enemy2Y() { const t = this.tab1(); return t[Math.floor(Math.random() * t.length)]; },
        val(bean) { music.paused = true; go("lose"); addKaboom(bean.pos); burp(); },
    },

    city: {
        gravity: 1300,
        SPEED: 380,
        background: "city",
        color: "#4e3d28",
        enemy:  "car",
        enemy1: "guy",
        enemy2: "floor",
        tab:  groundTab,
        tab2: platformTab,
        enemy2Y() { const t = this.tab2(); return t[Math.floor(Math.random() * t.length)]; },
        val() { /* planches — pas de défaite */ },
    },

};

// ─────────────────────────────────────────────
// ÉTAT GLOBAL
// ─────────────────────────────────────────────
let SCORE = null, MSCORE = 0, currentBiome = "desert";

const music = play("music", { loop: true, paused: true });

// ─────────────────────────────────────────────
// UTILITAIRES PARTAGÉS
// ─────────────────────────────────────────────

/** Crée un bouton kaplay centré sur p */
function makeButton(txt, p, f, w = 240, h = 80) {
    const btn = add([
        rect(w, h, { radius: 8 }),
        pos(p),
        area(),
        scale(1),
        anchor("center"),
        outline(4),
    ]);
    btn.add([
        text(txt, { size: 22 }),
        anchor("center"),
        color(0, 0, 0),
    ]);
    btn.onHoverUpdate(() => {
        btn.color = hsl2rgb((time()) % 1, 0.6, 0.7);
        btn.scale = vec2(1.15);
        setCursor("pointer");
    });
    btn.onHoverEnd(() => {
        btn.scale = vec2(1);
        btn.color = rgb();
    });
    btn.onClick(f);
    return btn;
}

function switchBiome(newBiome, back, floor) {
    currentBiome = newBiome;
    setGravity(biomes[currentBiome].gravity);
    back.use(sprite(biomes[currentBiome].background, { width: width(), height: height() }));
    floor.use(color(biomes[currentBiome].color));
}

function addTouchControls(bean, biomeRef) {
    const bw   = 110;
    const bh   = 70;
    const base = height() - FLOOR_H - bh / 2 - 10;
    const alpha = 0.45;

    const leftBtn = add([
        rect(bw, bh, { radius: 10 }),
        pos(bw / 2 + 10, base),
        anchor("center"),
        color(200, 200, 200),
        opacity(alpha),
        area(),
        z(10),
    ]);
    leftBtn.add([text("←", { size: 32 }), anchor("center"), color(0, 0, 0)]);

    const rightBtn = add([
        rect(bw, bh, { radius: 10 }),
        pos(bw + bw / 2 + 25, base),
        anchor("center"),
        color(200, 200, 200),
        opacity(alpha),
        area(),
        z(10),
    ]);
    rightBtn.add([text("→", { size: 32 }), anchor("center"), color(0, 0, 0)]);

    const jumpBtn = add([
        rect(bw, bh, { radius: 10 }),
        pos(width() - bw / 2 - 10, base),
        anchor("center"),
        color(200, 200, 200),
        opacity(alpha),
        area(),
        z(10),
    ]);
    jumpBtn.add([text("␣ Saut", { size: 24 }), anchor("center"), color(0, 0, 0)]);

    const downBtn = add([
        rect(bw, bh, { radius: 10 }),
        pos(width() - bw - bw / 2 - 25, base),
        anchor("center"),
        color(200, 200, 200),
        opacity(alpha),
        area(),
        z(10),
    ]);
    downBtn.add([text("↓ Vite", { size: 24 }), anchor("center"), color(0, 0, 0)]);

    onUpdate(() => {
        if (leftBtn.isHovering())  bean.move(-biomes[currentBiome].SPEED, 0);
        if (rightBtn.isHovering()) bean.move( biomes[currentBiome].SPEED, 0);
        if (downBtn.isHovering() && !bean.isGrounded())
            bean.move(0, biomes[currentBiome].SPEED);
    });

    jumpBtn.onClick(() => {
        if (bean.isGrounded()) { bean.jump(); play("jump"); }
    });
}

// ─────────────────────────────────────────────
//  SCÈNE : MENU
// ─────────────────────────────────────────────
scene("menu", () => {
    music.paused = true;
    setBackground(135, 62, 132);

    add([
        text("Bienvenue sur Endless Ball\nmon tout premier jeu <3\nAmusez-vous !", { size: 26 }),
        pos(width() / 2, height() * 0.18),
        anchor("center"),
    ]);

    add([
        text("made by Stan.", { size: 18 }),
        pos(width() - 20, height() - 20),
        anchor("botright"),
        scale(0.8),
    ]);

    makeButton("Start",           vec2(width() * 0.38, height() * 0.5), () => go("game"));
    makeButton("Tutoriel\n(FR)", vec2(width() * 0.62, height() * 0.5), () => go("tuto"));
});

// ─────────────────────────────────────────────
//  SCÈNE : GAME
// ─────────────────────────────────────────────
scene("game", () => {
    if (music.paused) music.paused = false;
    SCORE = 0;

    const bean = add([
        sprite("bean"),
        pos(center()),
        area(),
        body(),
    ]);

    const back = add([
        sprite(biomes[currentBiome].background, { width: width(), height: height() }),
        pos(0, 0),
        z(-1),
    ]);

    add([
        text("Espace = sauter  |  ← → = déplacer  |  ↓ = descendre vite", { size: 18 }),
        pos(width() / 2, 16),
        anchor("top"),
    ]);

    // Contrôles clavier
    onKeyDown("right", () => bean.move( biomes[currentBiome].SPEED, 0));
    onKeyDown("left",  () => bean.move(-biomes[currentBiome].SPEED, 0));
    onKeyDown("down",  () => { if (!bean.isGrounded()) bean.move(0, biomes[currentBiome].SPEED); });
    onKeyPress("space", () => { if (bean.isGrounded()) { bean.jump(); play("jump"); } });

    // Sol
    setGravity(biomes[currentBiome].gravity);
    const floor = add([
        rect(width(), FLOOR_H),
        outline(4),
        color(biomes[currentBiome].color),
        area(),
        pos(0, floorY()),
        body({ isStatic: true }),
    ]);

    // Contrôles tactiles mobiles
    addTouchControls(bean);

    // Génération des obstacles
    function spawnPipe() {
        const b   = biomes[currentBiome];
        const sx  = spawnOffscreenX();
        const tab = b.tab();

        // Ennemi 1 : posé au sol (pillar / plant / guy)
        add([
            pos(width(), floorY() - 120),
            sprite(b.enemy1, { width: 80, height: 120 }),
            area(-4),
            move(LEFT, b.SPEED),
            offscreen({ destroy: true }),
            { passed: false },
        ]);

        // Ennemi principal au sol (cactus / alien / car)
        add([
            pos(sx, tab[Math.floor(Math.random() * tab.length)]),
            sprite(b.enemy, { width: 60 }),
            area(-4),
            move(LEFT, b.SPEED),
            offscreen({ destroy: true }),
            "enemy",
            { passed: false },
            z(-1),
        ]);

        // Ennemi 2 volant / plateforme (bird / asteroid / floor-plank)
        add([
            pos(sx, b.enemy2Y()),
            sprite(b.enemy2, { width: 60 }),
            area(-4),
            body({ isStatic: true }),
            move(LEFT, b.SPEED),
            offscreen({ destroy: true }),
            "enemy2",
            { passed: false },
            z(-1),
        ]);
    }

    bean.onCollide("enemy", () => {
        music.paused = true;
        go("lose");
        addKaboom(bean.pos);
        burp();
    });

    bean.onCollide("enemy2", () => biomes[currentBiome].val(bean));

    loop(1.2, () => spawnPipe());

    // Sortie des bords → défaite
    bean.onUpdate(() => {
        if (bean.pos.x <= 0 || bean.pos.x >= maxX()) {
            music.paused = true;
            go("lose");
            addKaboom(bean.pos);
            burp();
        }
    });

    // Score
    const scoreLabel = add([
        text(SCORE, { size: 28 }),
        pos(24, 24),
    ]);

    onUpdate(() => {
        SCORE += 0.1;
        scoreLabel.text = Math.floor(SCORE);

        if (SCORE > 130 && currentBiome === "desert") {
            switchBiome("space", back, floor);
            debug.log("BIENVENUE DANS L'ESPACE");
            debug.log("EVITE LES EXTRA-TERRESTRES ET LES ASTEROIDES !");
        } else if (SCORE > 330 && currentBiome === "space") {
            switchBiome("city", back, floor);
            debug.log("BIENVENUE DANS LA VILLE");
            debug.log("EVITE LES VEHICULES !");
        }
    });
});

// ─────────────────────────────────────────────
//  SCÈNE : LOSE
// ─────────────────────────────────────────────
scene("lose", () => {
    if (Math.floor(SCORE) > MSCORE) MSCORE = SCORE;
    localStorage.setItem("MSCORE", Math.floor(MSCORE));

    setBackground(0, 0, 0);

    add([
        sprite("bean"),
        pos(width() / 2, height() / 2 - height() * 0.18),
        scale(2),
        anchor("center"),
    ]);

    add([
        text("Tu as perdu..", { size: 28 }),
        pos(width() / 2, height() * 0.15),
        anchor("center"),
    ]);

    add([
        text(
            `Score : ${Math.floor(SCORE)}\n\nMeilleur score : ${localStorage.getItem("MSCORE")}`,
            { size: 26 }
        ),
        pos(width() / 2, height() / 2 + height() * 0.1),
        scale(1),
        anchor("center"),
    ]);

    add([
        text("Espace ou clic → rejouer", { size: 18 }),
        pos(width() / 2, height() * 0.88),
        anchor("center"),
        color(160, 160, 160),
    ]);

    function restart() {
        currentBiome = "desert";
        go("game");
        debug.log("BIENVENUE DANS LE DESERT");
        debug.log("EVITEZ LES CACTUS ET LES OISEAUX");
    }

    onClick(restart);
    onKeyPress("space", restart);

    makeButton("Menu", vec2(width() - 90, 45), () => go("menu"), 140, 60);
});

// ─────────────────────────────────────────────
//  SCÈNE : TUTORIEL
// ─────────────────────────────────────────────
scene("tuto", () => {
    SCORE = 0;

    const bean = add([sprite("bean"), pos(center()), area(), body()]);

    const back = add([
        sprite(biomes[currentBiome].background, { width: width(), height: height() }),
        pos(0, 0),
        z(-1),
    ]);

    setGravity(biomes[currentBiome].gravity);

    const floor = add([
        rect(width(), FLOOR_H),
        outline(4),
        color(biomes[currentBiome].color),
        area(),
        pos(0, floorY()),
        body({ isStatic: true }),
    ]);

    const tutoScale = Math.min(width() / 1280, height() / 720);
    add([
        text(
            `Règles du jeu
─────────────────────────────────────
But : score le plus élevé possible en traversant
le désert, l'espace et la ville.

Touches :
  ← → : se déplacer
  Espace : sauter
  ↓ : descendre rapidement

Astuces 😉
  Désert : évite cactus & oiseaux
  Espace : évite aliens & astéroïdes
  Ville  : évite voitures, utilise les planches
  Trop près des bords → défaite
  (Les ennemis sont désactivés ici !)`,
            { size: 20 }
        ),
        pos(width() / 2, height() / 2),
        anchor("center"),
        scale(tutoScale),
    ]);

    onKeyDown("right", () => bean.move( biomes[currentBiome].SPEED, 0));
    onKeyDown("left",  () => bean.move(-biomes[currentBiome].SPEED, 0));
    onKeyDown("down",  () => { if (!bean.isGrounded()) bean.move(0, biomes[currentBiome].SPEED); });
    onKeyPress("space", () => { if (bean.isGrounded()) { bean.jump(); play("jump"); } });

    addTouchControls(bean);

    bean.onUpdate(() => {
        if (bean.pos.x <= 0 || bean.pos.x >= maxX()) {
            go("lose");
            addKaboom(bean.pos);
            burp();
        }
    });

    function spawnPipe() {
        const b   = biomes[currentBiome];
        const sx  = spawnOffscreenX();
        const tab = b.tab();

        add([pos(width(), floorY() - 120), sprite(b.enemy1, { width: 80, height: 120 }),
             area(-4), move(LEFT, b.SPEED), offscreen({ destroy: true }), { passed: false }]);

        add([pos(sx, tab[Math.floor(Math.random() * tab.length)]),
             sprite(b.enemy, { width: 60 }),
             area(-4), move(LEFT, b.SPEED), offscreen({ destroy: true }),
             "enemy", { passed: false }, z(-1)]);

        add([pos(sx, b.enemy2Y()), sprite(b.enemy2, { width: 60 }),
             area(-4), body({ isStatic: true }), move(LEFT, b.SPEED),
             offscreen({ destroy: true }), "enemy2", { passed: false }, z(-1)]);
    }

    loop(1.5, () => spawnPipe());

    const scoreLabel = add([text(SCORE, { size: 28 }), pos(24, 24)]);

    onUpdate(() => {
        SCORE += 0.1;
        scoreLabel.text = Math.floor(SCORE);

        if (SCORE > 80 && currentBiome === "desert") {
            switchBiome("space", back, floor);
        } else if (SCORE > 180 && currentBiome === "space") {
            switchBiome("city", back, floor);
        }
    });
});

// ─────────────────────────────────────────────
// DÉMARRAGE
// ─────────────────────────────────────────────
go("menu");