import {SimpleGUI} from "./SimpleGUI";
//import {ThreeJSView} from "core/src/ThreeJSView";
//import {GIJSView} from "core/src/GIJSView";
import {ThreeJSView, GIJSView, MathUtils} from "xrenderer";
import Matrix3 = THREE.Matrix3;
import {Thread} from "xrenderer";
/**
 * Created by Nidin Vinayakan on 27-02-2016.
 */
export class ThreeMFExample extends SimpleGUI {

    private threeJSView:ThreeJSView;
    private giJSView:GIJSView;
    private model;

    constructor() {
        super();

        Thread.workerUrl = "../modules/xrenderer/workers/trace-worker-bootstrap.js";

        this.i_width = 2560 / 4;
        this.i_height = 1440 / 4;
    }

    onInit() {
        var self = this;

        this.threeJSView = new ThreeJSView(this.i_width, this.i_height, this.webglOutput, this.appContainer);
        this.giJSView = new GIJSView(this.i_width, this.i_height, this.giOutput);

        //var ambient = new THREE.AmbientLight(0x5C5C5C);
        //this.threeJSView.scene.add(ambient);
        var directionalLight = new THREE.DirectionalLight(0xffeedd, 1);
        directionalLight.castShadow = true;
        directionalLight.position.set(0, 1, 0);
        this.threeJSView.scene.add(directionalLight);

        var color = 0xffeedd;

        var geometry:any = new THREE.SphereGeometry(5, 32, 32);
        var material:any = new THREE.MeshBasicMaterial({color: 0xffffff});
        var sphere = new THREE.Mesh(geometry, material);

        var pointLight1 = new THREE.PointLight(0xffffff, 1, 300);
        pointLight1.position.set(0, 100, 100);
        pointLight1.add(sphere.clone());
        this.threeJSView.scene.add(pointLight1);

        var pointLight2 = new THREE.PointLight(0xffffff, 1, 300);
        pointLight2.position.set(10, 1000, 0);
        pointLight2.add(sphere.clone());
        this.threeJSView.scene.add(pointLight2);

        var pointLight3 = new THREE.PointLight(0xffffff, 1, 300);
        pointLight3.position.set(-100, -100, -100);
        pointLight3.add(sphere.clone());
        this.threeJSView.scene.add(pointLight3);

        /*var pointLight = new THREE.PointLight(color, 1, 30);
        pointLight.position.set(5, 5, 0);
        pointLight.castShadow = true;
        pointLight.shadow.camera["near"] = 1;
        pointLight.shadow.camera["far"] = 300;
        pointLight.shadow.bias = 0.01;
        this.threeJSView.scene.add(pointLight);*/

        // texture
        var manager = new THREE.LoadingManager();
        manager.onProgress = function (item, loaded, total) {
            console.log(item, loaded, total);
        };

        var onProgress = function (xhr) {
            if (xhr.lengthComputable) {
                var percentComplete = xhr.loaded / xhr.total * 100;
                console.log(Math.round(percentComplete) + '% downloaded');
            }
        };

        var onError = function (xhr) {
        };

        geometry = new THREE.PlaneGeometry(100, 100);
        material = new THREE.MeshPhongMaterial({color: 0xffffff});
        var mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.set(MathUtils.radians(-90), 0, 0);
        //mesh.position.set(0, -.5, 0);
        mesh.castShadow = false;
        mesh.receiveShadow = true;
        //this.threeJSView.scene.add(mesh);

        var loader = new THREE["ThreeMFLoader"]();
        loader.load( '../models/3mf/cube_gears.3mf', function ( object ) {
            self.model = object;
            self.model.castShadow = true;
            self.model.receiveShadow = false;
            /*object.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    //child.material.color = new THREE.Color(0xff0000);
                    //child.material.ior = 1.3;
                    //child.material.tint = 0.5;
                    //child.material.gloss = MathUtils.radians(15);
                    child.material.transparent = false;
                    //child.castShadow = true;
                    child.receiveShadow = false;
                }
            });*/
            self.threeJSView.scene.add(object);
            self.giJSView.setThreeJSScene(self.threeJSView.scene, function () {
                self.giJSView.updateCamera(self.threeJSView.camera);
                if (self._tracing.value) {
                    self.giJSView.toggleTrace(true);
                }
            });
            self.render();
        } );

        /*var loader = new THREE["OBJLoader"](manager);
        //loader.load('../../models/suzanne.obj', function (object) {
            loader.load('../models/teapot.obj', function (object) {
            //loader.load('../../models/stanford-dragon.obj', function (object) {
            //loader.load('../models/emerald.obj', function (object) {

            self.model = object;
            self.model.castShadow = true;
            self.model.receiveShadow = false;
            object.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    child.material.color = new THREE.Color(0xff0000);
                    child.material.ior = 1.3;
                    //child.material.tint = 0.5;
                    //child.material.gloss = MathUtils.radians(15);
                    child.material.transparent = false;
                    //child.castShadow = true;
                    child.receiveShadow = false;
                }
            });
            self.threeJSView.scene.add(object);
            self.giJSView.setThreeJSScene(self.threeJSView.scene, function () {
                self.giJSView.updateCamera(self.threeJSView.camera);
                if (self._tracing.value) {
                    self.giJSView.toggleTrace(true);
                }
            });
            self.render();
        }, onProgress, onError);*/

        
        this.threeJSView.onCameraChange = function (camera) {
            self.giJSView.updateCamera(camera);
            if (self._tracing.value && self.giJSView.dirty) {
                //self.giJSView.toggleTrace(true);
            }
        };
        this.render();

        this.threeJSView.controls.onMouseDown = (event) => {
            this.toggleGI(false);
            if(!this._tracing.value && this._gi.value){
                this._gi.click();
            }
        };
        this.threeJSView.controls.onMouseUp = (event) => {
            if (this._tracing.value && this._gi.value){
                this.toggleGI(true);
            }
        };
        this.threeJSView.controls.onMouseWheel = (event) => {
            if (this._tracing.value && this._gi.value){
                this.toggleGI(true);
            }
        };
    }

    render() {
        this.threeJSView.render();
    }

    //configure GUI
    toggleGI(newValue) {
        super.toggleGI(newValue);
        if (newValue) {
            if (!this._tracing.value && !this.traceInitialized) {
                this._tracing.click();
                this.traceInitialized = true;
            }
            if (this._tracing.value && this.giJSView.dirty) {
                this.giJSView.toggleTrace(newValue);
            }
        }
    }

    toggleTrace(newValue:boolean) {
        this.giJSView.toggleTrace(newValue);
    }
}
