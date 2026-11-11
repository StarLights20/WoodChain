import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Color } from 'three'

type FurnitureType = 'cabinet' | 'table' | 'shelf'

export default function Furniture3D({ type, woodColor }: { type: FurnitureType; woodColor: string }) {
  return (
    <Canvas camera={{ position: [3.8, 2.8, 4.8], fov: 40 }} dpr={[1, 1.5]}>
      <ambientLight intensity={1.4} />
      <directionalLight position={[4, 6, 5]} intensity={2} />
      <directionalLight position={[-4, 3, -3]} intensity={0.75} />
      <FurnitureModel type={type} woodColor={woodColor} />
      <OrbitControls makeDefault target={[0, 0.9, 0]} minDistance={3} maxDistance={8} enablePan={false} />
    </Canvas>
  )
}

function FurnitureModel({ type, woodColor }: { type: FurnitureType; woodColor: string }) {
  const baseColor = new Color(woodColor)
  const wood = baseColor.clone().multiplyScalar(0.88).getStyle()
  const lightWood = baseColor.clone().multiplyScalar(1.15).getStyle()
  const darkWood = baseColor.clone().multiplyScalar(0.68).getStyle()

  if (type === 'cabinet') {
    return (
      <group>
        <mesh position={[0, 0.12, 0]} castShadow receiveShadow><boxGeometry args={[1.42, 0.18, 0.72]} /><meshStandardMaterial color={darkWood} /></mesh>
        <mesh position={[0, 1.08, 0]} castShadow receiveShadow><boxGeometry args={[1.34, 1.76, 0.62]} /><meshStandardMaterial color={wood} /></mesh>
        <mesh position={[0, 2, 0]} castShadow><boxGeometry args={[1.48, 0.12, 0.74]} /><meshStandardMaterial color={lightWood} /></mesh>
        {[-0.34, 0.34].map((x) => (
          <group key={x}>
            <mesh position={[x, 1.08, 0.37]} castShadow><boxGeometry args={[0.65, 1.6, 0.045]} /><meshStandardMaterial color={woodColor} /></mesh>
            <mesh position={[x < 0 ? -0.1 : 0.1, 1.08, 0.405]}><cylinderGeometry args={[0.018, 0.018, 0.12, 12]} /><meshStandardMaterial color="#554333" metalness={0.45} roughness={0.35} /></mesh>
          </group>
        ))}
        {[-0.52, 0.52].map((x) => <mesh key={x} position={[x, 0.04, 0]}><boxGeometry args={[0.1, 0.08, 0.12]} /><meshStandardMaterial color={darkWood} /></mesh>)}
      </group>
    )
  }

  if (type === 'table') {
    return (
      <group>
        <mesh position={[0, 1.02, 0]} castShadow receiveShadow><boxGeometry args={[2, 0.16, 1.2]} /><meshStandardMaterial color={lightWood} /></mesh>
        <mesh position={[0, 0.86, 0]}><boxGeometry args={[1.74, 0.2, 0.92]} /><meshStandardMaterial color={wood} /></mesh>
        {[-0.82, 0.82].flatMap((x) => [-0.43, 0.43].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 0.42, z]} castShadow><boxGeometry args={[0.13, 0.84, 0.13]} /><meshStandardMaterial color={darkWood} /></mesh>
        )))}
      </group>
    )
  }

  return (
    <group>
      {[-0.7, 0.7].map((x) => <mesh key={x} position={[x, 1.02, 0]} castShadow><boxGeometry args={[0.13, 2.04, 0.42]} /><meshStandardMaterial color={wood} /></mesh>)}
      {[0.08, 0.68, 1.28, 1.88].map((y) => (
        <mesh key={y} position={[0, y, 0]} castShadow receiveShadow><boxGeometry args={[1.52, 0.12, 0.48]} /><meshStandardMaterial color={lightWood} /></mesh>
      ))}
      <mesh position={[0, 1.02, -0.21]}><boxGeometry args={[1.28, 1.9, 0.035]} /><meshStandardMaterial color={darkWood} /></mesh>
    </group>
  )
}
