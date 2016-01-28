//
// Globals
//
var canvas;
var width = window.innerWidth - 50;
var height = window.innerHeight - 100;

var scene;
var camera;
var rt1, rt2; // rt: render target
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
// Mouse
//
function onMouseDown(e)
{
    var ev = e ? e : window.event;
    
    var rect = canvas.getBoundingClientRect();
    var mouseX = e.clientX - rect.left;
    var mouseY = e.clientY - rect.top;
    
    var str = "K/F = "
        + (0.1 * mouseX / width).toString()
        + "/"
        + (0.25 * (1 - mouseY / height)).toString();
    document.getElementById('spanPosition').textContent = str;
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
        tPrev: { type: "t", value: rt1 },
        randomStart: { type: "i", value: 0 },
        randomSeed: { type: "f", value: 0.0 },
        feed: { type: "f", value: 0.0367 },
        kill: { type: "f", value: 0.0649 },
        diff: { type: "v2", value: new THREE.Vector2(d_a, d_b) }
    };
              
    scene = new THREE.Scene();

    camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 1, 1000 );
    camera.position.z = 1;

    var geometry = new THREE.PlaneGeometry( 2, 2, 1 );
    
    // -----------
    // フィードバックエフェクト用にレンダーターゲットを2つ用意
    // rt1 と rt2
    rt1 = new THREE.WebGLRenderTarget( width, height, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, type: THREE.FloatType } );
    rt2 = new THREE.WebGLRenderTarget( width, height, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, type: THREE.FloatType  } );
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
    renderer.setSize( width, height );

    //
    canvas = renderer.domElement;
    canvas.onmousedown = onMouseDown;
    
    // resolution を FS へ送る
    uniforms1.resolution.value.x = canvas.width;
    uniforms1.resolution.value.y = canvas.height;
    
    //
    document.body.appendChild( renderer.domElement );
}

function tick()
{
    uniforms1.time.value += clockSpeed * clock.getDelta();
}

function animate()
{
    if(!stop)
    {
        requestAnimationFrame( animate );
    }
    
    tick();
    
    renderer.render( scene, camera );
    
    for (var i = 0; i < 13; ++i)
    {
        renderer.render( scene, camera, rt1, true );
        
        var temp = rt2;
        rt2 = rt1;
        rt1 = temp;
        uniforms1.tPrev.value = rt2;
    }
}
