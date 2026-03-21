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
  
  // Create realistic road path with more pronounced curves
  let roadPath = `M ${centerX} 0`;
  for (let i = 0; i < milestoneCount + 1; i++) {
    const y = i * segmentHeight;
    const nextY = (i + 1) * segmentHeight;
    
    // Add more pronounced curves alternating left and right
    const curveOffset = i % 2 === 0 ? 25 : -25; // Increased from 15 to 25
    const controlX = centerX + curveOffset;
    const midY = y + segmentHeight / 2;
    
    if (i === 0) {
      roadPath += ` L ${centerX} ${segmentHeight / 4}`;
    } else {
      // Add S-curves for more realistic winding road
      const controlX1 = centerX + (curveOffset * 0.7);
      const controlX2 = centerX + (curveOffset * 0.3);
      roadPath += ` C ${controlX1} ${y + segmentHeight * 0.3} ${controlX2} ${y + segmentHeight * 0.7} ${centerX} ${nextY}`;
    }
  }

  // Road markers positions
  const markers = Array.from({ length: milestoneCount }, (_, i) => ({
    x: centerX,
    y: (i + 0.5) * segmentHeight,
    delay: i * 0.2
  }));

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

        {/* Road Center Line (Dashed yellow) */}
        <motion.path
          d={roadPath}
          stroke="#fbbf24"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="12 8"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, ease: "easeInOut", delay: 0.5 }}
        />

        {/* Road Edge Lines */}
        <motion.path
          d={roadPath}
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          transform="translate(-22, 0)"
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
          transform="translate(22, 0)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.8, ease: "easeInOut", delay: 0.3 }}
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

        {/* Animated Car */}
        <motion.g
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: roadHeight - 100, opacity: 1 }}
          transition={{ 
            duration: 4, 
            delay: 2,
            ease: "easeInOut"
          }}
        >
          {/* Car Body */}
          <rect
            x={centerX - 8}
            y={0}
            width="16"
            height="24"
            rx="3"
            fill="#ef4444"
            stroke="#dc2626"
            strokeWidth="1"
          />
          
          {/* Car Windows */}
          <rect
            x={centerX - 6}
            y={2}
            width="12"
            height="8"
            rx="2"
            fill="#93c5fd"
            opacity="0.8"
          />
          
          {/* Car Wheels */}
          <circle cx={centerX - 4} cy={20} r="2" fill="#1f2937" />
          <circle cx={centerX + 4} cy={20} r="2" fill="#1f2937" />
          
          {/* Headlights */}
          <circle cx={centerX - 3} cy={22} r="1" fill="#fbbf24" />
          <circle cx={centerX + 3} cy={22} r="1" fill="#fbbf24" />
        </motion.g>

        {/* Road Texture (subtle pattern) */}
        <defs>
          <pattern id="roadTexture" patternUnits="userSpaceOnUse" width="4" height="4">
            <rect width="4" height="4" fill="#2a2a2a" />
            <circle cx="2" cy="2" r="0.5" fill="#404040" opacity="0.3" />
          </pattern>
        </defs>
        
        <motion.path
          d={roadPath}
          fill="url(#roadTexture)"
          stroke="none"
          strokeWidth="44"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{ duration: 2.5, ease: "easeInOut", delay: 0.8 }}
        />
      </svg>
    </div>
  );
};

export default RealisticAnimatedRoad;