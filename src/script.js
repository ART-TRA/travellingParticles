import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Clock, Vector3 } from 'three'
import * as dat from 'dat.gui'
// import image from './images/map.jpg'
import image from './images/map2.jpg'

import vertexShader from './shaders/test/vertex.glsl'
import fragmentShader from './shaders/test/fragment.glsl'

let mouse = new THREE.Vector2(0, 0)
const clock = new Clock()

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 1, 4000)
camera.position.set(0, 1, 640)
scene.add(camera)
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true //плавность вращения камеры

const renderer = new THREE.WebGLRenderer({
  canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) //ограничение кол-ва рендеров в завис-ти от плотности пикселей
// renderer.setClearColor('#1f1f25', 1)
// renderer.physicallyCorrectLights = true;
// renderer.outputEncoding = THREE.sRGBEncoding;

window.addEventListener('resize', () => {
  //update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  //update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  //update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

const pointLight = new THREE.PointLight('#1cc3ff', 20.0, 200, 1)
// scene.add(pointLight)

const ambientLight = new THREE.AmbientLight('#ffffff', 0.7)
scene.add(ambientLight)

window.addEventListener('mousemove', (event) => {
  mouse = {
    x: event.clientX / window.innerWidth - 0.5,
    y: event.clientY / window.innerHeight - 0.5,
  }

  pointLight.position.set(mouse.x * window.innerWidth + 0.5, -mouse.y * window.innerHeight + 0.5, 10)
})

//------------------------------------------------------------------------------------------------------
let svg = []
let lines = []
let max

const getData = () => {
  // svg = [...document.querySelectorAll('.cls-1')] //массив всех svg map1
  // svg = [...document.querySelectorAll('.cls-2')] //массив всех svg map2
  svg = [...document.querySelectorAll('.cls-3')] //массив всех svg map3
  svg.forEach((path, index) => {
    let lineLength = path.getTotalLength() //длина svg
    let numberOfLinePoints = Math.floor(lineLength/5) //кол-во точек на линию
    let points = []

    for (let i = 0; i < numberOfLinePoints; ++i) {
      let pointAt = lineLength * i / numberOfLinePoints
      let pointCoord = path.getPointAtLength(pointAt)
      //отвечают за рассеяность точек в линии
      let randomX = (Math.random() - 0.5)*2
      let randomY = (Math.random() - 0.5)*2
      //для центрир-я отнимаются половины ширины и высоты svg
      points.push(new THREE.Vector3(pointCoord.x - 1024 + randomX, pointCoord.y - 512 + randomY, 0))
    }

    lines.push({
      id: index,
      path: path,
      length: lineLength,
      number: numberOfLinePoints,
      points: points,
      currentPosition: 0,
      speed: 1
    })
  })
}
getData()

const geometry = new THREE.BufferGeometry()
const dotsPerLine = 80 //кол-во точек в линии
max = lines.length * dotsPerLine
const positions = new Float32Array(max * 3)
const opacity = new Float32Array(max)

for (let i = 0; i < max; ++i) {
  opacity.set([Math.random()/5], i)
  positions.set([Math.random()*dotsPerLine, Math.random()*1000, 0], i*3)
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
geometry.setAttribute('opacity', new THREE.BufferAttribute(opacity, 1))

const updateParticles = () => {
  let j = 0
  lines.forEach(line => {
    line.currentPosition += line.speed
    line.currentPosition = line.currentPosition % line.number

    for (let i = 0; i < dotsPerLine; ++i, ++j) {
      const randomSpeed = Math.floor(Math.random() * (3 - 1) + 1) //забавное мерцание при 3
      let index = (line.currentPosition * randomSpeed + i) % line.number
      let point = line.points[index]
      positions.set([point.x, point.y, point.z], j*3)
      opacity.set([i/1000], j)
    }
  })

  geometry.attributes.position.array = positions
  geometry.attributes.position.needsUpdate = true
}

const material = new THREE.ShaderMaterial({
  side: THREE.DoubleSide,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  uniforms: {
    uTime: {value: 0},
    uMouse: {value: new THREE.Vector2(mouse.x, mouse.y)}
  }
})

const particle = new THREE.Points(geometry, material)
scene.add(particle)

let texture = new THREE.TextureLoader().load(image)
texture.flipY = false

let map = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(2048, 1024, 1, 1),
  new THREE.MeshPhysicalMaterial({
    color: '#111111',
    map: texture
  })
)

map.position.z = -6
scene.add(map)

//---------------------------------------------------------------------------------------------------------

const tick = () => {
  const elapsedTime = clock.getElapsedTime()
  material.uniforms.uTime.value = elapsedTime
  updateParticles()
  //Update controls
  // controls.update() //если включён Damping для камеры необходимо её обновлять в каждом кадре

  renderer.render(scene, camera)
  window.requestAnimationFrame(tick)
}

tick()