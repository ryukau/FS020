//
// Globals
//
var width = window.innerWidth - 50;
var height = window.innerHeight - 100;

var scene;
var camera;
var rtTemp, rt1, rt2, rt3, rt4; // rt: render target
var uniforms1;
var renderer;

var stop = false;
var clock;
var clockSpeed = 1.0;

clock = new THREE.Clock();

init();
animate();

//
// UI
//

function onButtonResetClick()
{
    uniforms1.time.value = 0.0;
    uniforms1.randomStart.value = false;
}

function onButtonRandomClick()
{
    uniforms1.time.value = 0.0;
    uniforms1.randomSeed.value = Math.random() * 256;
    uniforms1.randomStart.value = true;
}

function onButtonStopClick()
{
    var buttonReverse = document.getElementById('buttonStop');
    if(!stop)
    {
        buttonReverse.value = "Play";
        stop = true;
    }
    else
    {
        buttonReverse.value = "Stop";
        stop = false;
        
        clock.getDelta();
        requestAnimationFrame( animate );
    }
}

function setInputValue(elem, value)
{
    elem.value = value;
    elem.oninput();
}

function onButtonChangeRuleClick()
{
    setInputValue(document.getElementById('numberDiffA'), Math.random());
    setInputValue(document.getElementById('numberDiffB'), Math.random());
    
    onButtonResetClick();
    refreshSpanRule();
}

function onInputNumberDiffA(value)
{
    uniforms1.diff.value.x = value;
}

function onInputNumberDiffB(value)
{
    uniforms1.diff.value.y = value;
}

function onInputNumberDeltaTime(value)
{
    uniforms1.dt.value = value;
}

//
// three.js
//
function setupScreen()
{
    var dt = document.getElementById('numberDeltaTime').value;
    var d_a = document.getElementById('numberDiffA').value;
    var d_b = document.getElementById('numberDiffB').value;
    
    uniforms1 = { 
        time: { type: "f", value: 0.0 },
        dt: { type: "f", value: dt},
        resolution: { type: "v2", value: new THREE.Vector2() },
        tPrev1: { type: "t", value: rt1 },
        tPrev2: { type: "t", value: rt2 },
        tPrev3: { type: "t", value: rt3 },
        tPrev4: { type: "t", value: rt4 },
        randomStart: { type: "i", value: 0 },
        randomSeed: { type: "f", value: 0.0 },
        diff: { type: "v2", value: new THREE.Vector2(d_a, d_b) }
    };
              
    scene = new THREE.Scene();

    camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 1, 1000 );
    camera.position.z = 1;

    var geometry = new THREE.PlaneGeometry( 2, 2, 1 );
    
    // -----------
    // フィードバックエフェクト用にレンダーターゲットを用意
    rtTemp = new THREE.WebGLRenderTarget( width, height, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, type: THREE.FloatType } );
    rt1 = new THREE.WebGLRenderTarget( width, height, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, type: THREE.FloatType } );
    // -----------
    
    var material = new THREE.ShaderMaterial(
        {
            uniforms: uniforms1,
            vertexShader: document.getElementById( 'vertexShader' ).textContent,
            fragmentShader: document.getElementById( 'fragmentShader' ).textContent
        });
    var mesh = new THREE.Mesh( geometry, material );
    
    scene.add( mesh );
}

function setupFrontScreen()
{
    var screenMaterial = new THREE.ShaderMaterial(
        {
            uniforms: uniforms1,
            vertexShader: document.getElementById( 'vertexShader' ).textContent,
            fragmentShader: document.getElementById( 'FSScreen' ).textContent
        });
}

function init()
{
    setupScreen();
    
    // 画面へのレンダラ
    renderer = new THREE.WebGLRenderer();
    //renderer.setClearColor(0xffffff, 1);
    renderer.setSize( width, height );
    //renderer.autoClear = false;

    // resolution を FS へ送る
    var canvas = renderer.domElement;
    uniforms1.resolution.value.x = canvas.width;
    uniforms1.resolution.value.y = canvas.height;
    
    document.body.appendChild( renderer.domElement );
}

function tick()
{
    var dt = clockSpeed * clock.getDelta();
    uniforms1.time.value += dt;
    //uniforms1.dt.value = dt;
}

function animate()
{
    if(!stop)
    {
        requestAnimationFrame( animate );
    }
    
    tick();
    
    renderer.render( scene, camera );
    
    for (var i = 0; i < 8; ++i)
    {
        renderer.render( scene, camera, rtTemp, true );
        
        var temp = rt1;
        rt1 = rtTemp;
        rtTemp = temp;
        uniforms1.tPrev1.value = rt1;
        uniforms1.tPrev2.value = rt2;
        uniforms1.tPrev3.value = rt3;
        uniforms1.tPrev4.value = rt4;
    }
}
