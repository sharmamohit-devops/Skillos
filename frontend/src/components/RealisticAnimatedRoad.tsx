import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface RealisticAnimatedRoadProps {
  containerRef: React.RefObject<HTMLDivElement>;
  milestoneCount: number;
}

const RealisticAnimatedRoad = ({ containerRef, milestoneCount }: RealisticAnimatedRoadProps) => {
  const [roadHeight, setRoadHeight] = useState(800);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateHeight = () => {
      if (containerRef.current) {
        const milestoneSection = containerRef.current.querySelector('.milestone-container');
        if (milestoneSection) {
          setRoadHeight(milestoneSection.scrollHeight + 100);
        }
      }
    };

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(containerRef.current);
    updateHeight();

    const timer = setTimeout(updateHeight, 1000);
    return () => {
      resizeObserver.disconnect();
      clearTimeout(timer);
    };
  }, [containerRef, milestoneCount]);

  // Calculate road segments and curves
  const roadWidth = 120;
  const centerX = roadWidth / 2;
  const segmentHeight = Math.max(200, roadHeight / Math.max(1, milestoneCount));
  
  // Create realistic winding road path with S-curves
  let roadPath = `M ${centerX} 0`;
  
  for (let i = 0; i < milestoneCount + 1; i++) {
    const y = i * segmentHeight;
    const nextY = (i + 1) * segmentHeight;
    
    // Create alternating S-curves with varying intensity
    const baseOffset = 30; // Increased curve intensity
    const curveVariation = Math.sin(i * 0.8) * 15; // Add variation to curves
    const leftCurve = i % 2 === 0;
    const curveOffset = leftCurve ? -(baseOffset + curveVariation) : (baseOffset + curveVariation);
    
    if (i === 0) {
      // Start with a gentle curve
      roadPath += ` Q ${centerX + curveOffset * 0.3} ${segmentHeight * 0.3} ${centerX + curveOffset * 0.6} ${segmentHeight * 0.6}`;
    } else {
      // Create smooth S-curves using cubic bezier
      const prevOffset = leftCurve ? (baseOffset + Math.sin((i-1) * 0.8) * 15) : -(baseOffset + Math.sin((i-1) * 0.8) * 15);
      const currentOffset = curveOffset;
      
      // Control points for smooth S-curve transition
      const cp1X = centerX + prevOffset * 0.8;
      const cp1Y = y + segmentHeight * 0.2;
      const cp2X = centerX + currentOffset * 0.8;
      const cp2Y = y + segmentHeight * 0.8;
      const endX = centerX + currentOffset * 0.6;
      const endY = nextY;
      
      roadPath += ` C ${cp1X} ${cp1Y} ${cp2X} ${cp2Y} ${endX} ${endY}`;
    }
  }
  
  // Add final curve to center
  roadPath += ` Q ${centerX + 15} ${roadHeight - 50} ${centerX} ${roadHeight}`;

  // Road markers positions (follow the curved path)
  const markers = Array.from({ length: milestoneCount }, (_, i) => {
    const baseOffset = 30;
    const curveVariation = Math.sin(i * 0.8) * 15;
    const leftCurve = (i + 1) % 2 === 0;
    const xOffset = leftCurve ? -(baseOffset + curveVariation) * 0.6 : (baseOffset + curveVariation) * 0.6;
    
    return {
      x: centerX + xOffset,
      y: (i + 1) * segmentHeight,
      delay: i * 0.2
    };
  });

  return (
    <div className="absolute left-1/2 top-0 -translate-x-1/2 pointer-events-none hidden lg:block">
      <svg
        width={roadWidth}
        height={roadHeight}
        viewBox={`0 0 ${roadWidth} ${roadHeight}`}
        className="drop-shadow-lg"
      >
        {/* Road Base (Asphalt) */}
        <motion.path
          d={roadPath}
          stroke="#2a2a2a"
          strokeWidth="50"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
        />
        
        {/* Road Surface (Lighter gray) */}
        <motion.path
          d={roadPath}
          stroke="#404040"
          strokeWidth="46"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, ease: "easeInOut", delay: 0.1 }}
        />

        {/* Road Center Line (Dashed yellow) with curve-aware spacing */}
        <motion.path
          d={roadPath}
          stroke="#fbbf24"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="15 10"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, ease: "easeInOut", delay: 0.5 }}
        />
        
        {/* Additional center line glow effect */}
        <motion.path
          d={roadPath}
          stroke="#fbbf24"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="15 10"
          fill="none"
          opacity="0.3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, ease: "easeInOut", delay: 0.7 }}
        />

        {/* Road Edge Lines with banking effect */}
        <motion.path
          d={roadPath}
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          transform="translate(-23, 0)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.8, ease: "easeInOut", delay: 0.3 }}
        />
        <motion.path
          d={roadPath}
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          transform="translate(23, 0)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.8, ease: "easeInOut", delay: 0.3 }}
        />
        
        {/* Road shoulder/guardrails on curves */}
        <motion.path
          d={roadPath}
          stroke="#64748b"
          strokeWidth="0.8"
          strokeLinecap="round"
          fill="none"
          transform="translate(-28, 0)"
          strokeDasharray="4 4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3.2, ease: "easeInOut", delay: 0.6 }}
        />
        <motion.path
          d={roadPath}
          stroke="#64748b"
          strokeWidth="0.8"
          strokeLinecap="round"
          fill="none"
          transform="translate(28, 0)"
          strokeDasharray="4 4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3.2, ease: "easeInOut", delay: 0.6 }}
        />

        {/* Mile Markers */}
        {markers.map((marker, index) => (
          <motion.g key={index}>
            {/* Marker Post */}
            <motion.rect
              x={marker.x - 1}
              y={marker.y - 15}
              width="2"
              height="30"
              fill="#64748b"
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              transition={{ delay: marker.delay + 1, duration: 0.3 }}
            />
            
            {/* Marker Sign */}
            <motion.rect
              x={marker.x + 5}
              y={marker.y - 8}
              width="16"
              height="16"
              rx="2"
              fill="#3b82f6"
              stroke="#1e40af"
              strokeWidth="1"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: marker.delay + 1.2, duration: 0.4, type: "spring" }}
            />
            
            {/* Marker Number */}
            <motion.text
              x={marker.x + 13}
              y={marker.y + 1}
              textAnchor="middle"
              fontSize="8"
              fill="white"
              fontWeight="bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: marker.delay + 1.4, duration: 0.3 }}
            >
              {index + 1}
            </motion.text>
          </motion.g>
        ))}

        {/* Animated Car following curved path */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.5 }}
        >
          <motion.g
            animate={{
              offsetDistance: ["0%", "100%"],
              rotate: [0, 5, -5, 3, -3, 0] // Add slight rotation for realistic movement
            }}
            transition={{
              offsetDistance: { 
                duration: 6, 
                delay: 2.5,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "loop"
              },
              rotate: {
                duration: 1.5,
                delay: 2.5,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "reverse"
              }
            }}
            style={{
              offsetPath: `path('${roadPath}')`,
              offsetRotate: "auto"
            }}
          >
            {/* Car Body */}
            <rect
              x={-8}
              y={-12}
              width="16"
              height="24"
              rx="3"
              fill="#ef4444"
              stroke="#dc2626"
              strokeWidth="1"
            />
            
            {/* Car Windows */}
            <rect
              x={-6}
              y={-10}
              width="12"
              height="8"
              rx="2"
              fill="#93c5fd"
              opacity="0.8"
            />
            
            {/* Car Wheels */}
            <circle cx={-4} cy={8} r="2" fill="#1f2937" />
            <circle cx={4} cy={8} r="2" fill="#1f2937" />
            
            {/* Headlights */}
            <circle cx={-3} cy={10} r="1" fill="#fbbf24" />
            <circle cx={3} cy={10} r="1" fill="#fbbf24" />
            
            {/* Car Shadow */}
            <ellipse
              cx={0}
              cy={15}
              rx="10"
              ry="3"
              fill="#000000"
              opacity="0.2"
            />
          </motion.g>
        </motion.g>

        {/* Road Texture (subtle pattern) */}
        <defs>
          <pattern id="roadTexture" patternUnits="userSpaceOnUse" width="4" height="4">
            <rect width="4" height="4" fill="#2a2a2a" />
            <circle cx="2" cy="2" r="0.5" fill="#404040" opacity="0.3" />
          </pattern>
          
          {/* Gradient for road depth */}
          <linearGradient id="roadGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1a1a1a" />
            <stop offset="50%" stopColor="#404040" />
            <stop offset="100%" stopColor="#1a1a1a" />
          </linearGradient>
        </defs>
        
        {/* Road with gradient for 3D effect */}
        <motion.path
          d={roadPath}
          fill="url(#roadGradient)"
          stroke="none"
          strokeWidth="44"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.8 }}
          transition={{ duration: 2.5, ease: "easeInOut", delay: 0.8 }}
        />
        
        {/* Side vegetation and landscape elements */}
        {Array.from({ length: Math.floor(milestoneCount / 2) }, (_, i) => {
          const y = (i * 2 + 1) * segmentHeight;
          const leftSide = i % 2 === 0;
          const treeX = leftSide ? 15 : roadWidth - 15;
          
          return (
            <motion.g key={`tree-${i}`}>
              {/* Tree trunk */}
              <motion.rect
                x={treeX - 2}
                y={y - 5}
                width="4"
                height="15"
                fill="#8b4513"
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 1 }}
                transition={{ delay: 3 + i * 0.3, duration: 0.5 }}
              />
              
              {/* Tree foliage */}
              <motion.circle
                cx={treeX}
                cy={y - 8}
                r="8"
                fill="#22c55e"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.8 }}
                transition={{ delay: 3.2 + i * 0.3, duration: 0.6, type: "spring" }}
              />
              
              {/* Grass patches */}
              <motion.ellipse
                cx={treeX}
                cy={y + 8}
                rx="12"
                ry="3"
                fill="#16a34a"
                opacity="0.6"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 0.6 }}
                transition={{ delay: 3.5 + i * 0.3, duration: 0.4 }}
              />
            </motion.g>
          );
        })}
        
        {/* Road reflectors/cat eyes */}
        {Array.from({ length: milestoneCount * 3 }, (_, i) => {
          const y = (i + 1) * (segmentHeight / 3);
          return (
            <motion.circle
              key={`reflector-${i}`}
              cx={centerX}
              cy={y}
              r="1"
              fill="#fbbf24"
              opacity="0.8"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.8 }}
              transition={{ delay: 2 + i * 0.1, duration: 0.2 }}
            />
          );
        })}
      </svg>
    </div>
  );
};

export default RealisticAnimatedRoad;