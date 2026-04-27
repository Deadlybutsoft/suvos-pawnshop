export function Lighting() {
  return (
    <>
      {/* High intensity ambient light to ensure a bright, cheerful baseline */}
      <ambientLight intensity={5.0} color="#ffffff" />

      {/* Main white overhead light to contrast with the dark walls */}
      <pointLight
        position={[0, 3.5, 0]}
        intensity={140}
        distance={20}
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      {/* Fill light for the front entrance area */}
      <pointLight
        position={[0, 2.5, 3.5]}
        intensity={90}
        distance={15}
        color="#f0f9ff"
      />

      {/* Focused spotlight on the counter area for clear interactions */}
      <pointLight
        position={[0, 2.8, -1.5]}
        intensity={120}
        distance={12}
        color="#ffffff"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Fun colorful bounce lights to add pop to the bright theme */}
      {/* Sky blue accent bounce from the left */}
      <pointLight
        position={[-3, 2, 1]}
        intensity={70}
        distance={10}
        color="#38bdf8"
      />

      {/* Pink accent bounce from the right */}
      <pointLight
        position={[3, 2, 1]}
        intensity={70}
        distance={10}
        color="#f472b6"
      />

      {/* Back wall pop of light */}
      <pointLight
        position={[0, 2.5, -3.8]}
        intensity={60}
        distance={8}
        color="#fbbf24"
      />
    </>
  );
}
