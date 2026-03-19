import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function ThreeBackground() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    const w = mount.clientWidth
    const h = mount.clientHeight

    // Scene
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100)
    camera.position.z = 5

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)

    // Particles
    const count = 1800
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 20
    }
    const particleGeo = new THREE.BufferGeometry()
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const particleMat = new THREE.PointsMaterial({
      size: 0.03,
      color: 0x7c3aed,
      transparent: true,
      opacity: 0.6,
    })
    scene.add(new THREE.Points(particleGeo, particleMat))

    // Torus knot — main hero object
    const torusGeo = new THREE.TorusKnotGeometry(1.2, 0.35, 180, 32, 2, 3)
    const torusMat = new THREE.MeshStandardMaterial({
      color: 0x6d28d9,
      metalness: 0.7,
      roughness: 0.2,
      wireframe: false,
    })
    const torus = new THREE.Mesh(torusGeo, torusMat)
    torus.position.set(3.8, 0, 0)
    scene.add(torus)

    // Floating icosahedra
    const icoGeo = new THREE.IcosahedronGeometry(0.3, 0)
    const icoMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      metalness: 0.5,
      roughness: 0.3,
      wireframe: true,
    })
    const icos = []
    const icoData = [
      [-4, 2, -1], [-3.5, -1.5, 0.5], [4.5, -2, -0.5],
      [-2, 3, -2], [2.5, 2.5, -1],
    ]
    for (const [x, y, z] of icoData) {
      const m = new THREE.Mesh(icoGeo, icoMat)
      m.position.set(x, y, z)
      m.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0)
      scene.add(m)
      icos.push(m)
    }

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.4))
    const point1 = new THREE.PointLight(0x7c3aed, 4, 20)
    point1.position.set(2, 3, 3)
    scene.add(point1)
    const point2 = new THREE.PointLight(0xc084fc, 3, 20)
    point2.position.set(-3, -2, 2)
    scene.add(point2)

    // Resize
    const onResize = () => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    // Mouse parallax
    let mouseX = 0, mouseY = 0
    const onMouse = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2
      mouseY = -(e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouse)

    // Animation
    let frameId
    const timer = new THREE.Timer()
    const animate = () => {
      frameId = requestAnimationFrame(animate)
      timer.update()
      const t = timer.getElapsed()

      torus.rotation.x = t * 0.3
      torus.rotation.y = t * 0.5

      icos.forEach((ico, i) => {
        ico.rotation.x = t * (0.2 + i * 0.05)
        ico.rotation.y = t * (0.3 + i * 0.04)
        ico.position.y = icoData[i][1] + Math.sin(t * 0.5 + i) * 0.3
      })

      // Parallax camera drift
      camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.02
      camera.position.y += (mouseY * 0.3 - camera.position.y) * 0.02
      camera.lookAt(scene.position)

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMouse)
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  return (
    <div
      ref={mountRef}
      className="three-bg absolute inset-0 z-0 pointer-events-none"
      style={{ opacity: 'var(--c-canvas-opacity)', transition: 'opacity 0.4s ease' }}
    />
  )
}
