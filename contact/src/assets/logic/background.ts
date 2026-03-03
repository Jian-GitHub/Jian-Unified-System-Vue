import {Application, Assets, Container, DisplacementFilter, Sprite, type WRAP_MODE} from 'pixi.js'

const backgroundInit = async () => {
    // Create a new application
    const app = new Application();
    // Initialize the application
    await app.init({ resizeTo: window }).catch(console.error);


    document.getElementById('background').appendChild(app.canvas)


    // Load the bunny texture
    await Assets.load([
        {alias: 'displacement_map', src: '/assets/img/displacement_map.png'},
        {alias: 'bg', src: '/assets/img/bg.jpg'},
    ]).catch(console.error);

    const backgroundImage = new Sprite(Sprite.from('bg'));
    backgroundImage.anchor.set(0.5);
    backgroundImage.position.set(app.screen.width / 2, app.screen.height / 2);

    const container = new Container();
    container.addChild(backgroundImage);
    app.stage.addChild(container);

    const displacementSprite = Sprite.from("displacement_map");
    displacementSprite.texture.source.addressMode = "repeat";
    const displacementFilter = new DisplacementFilter({
        sprite: displacementSprite,
        scale: 30,
    })
    container.addChild(displacementSprite);
    container.filters = [displacementFilter];

    // Listen for animate update
    app.ticker.add((time) => {
        displacementSprite.x++;
    });
}

export { backgroundInit };