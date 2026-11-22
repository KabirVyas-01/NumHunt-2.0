import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { ArcherySceneManager } from '../three/scene/archerySceneManager.js';

/**
 * Reusable Archery Arena 3D Component for NumHunt 2.0.
 * 
 * Cleanly handles:
 * - Canvas lifecycle and WebGL mounting
 * - Proper cleanup & memory disposal on unmount
 * - Resize listeners
 * - External shot trigger commands via ref or callbacks
 */
const ArcheryArena = forwardRef(function ArcheryArena(
  {
    playerColor = 'Red',
    onFeedbackReady,
    style = {},
    className = ''
  },
  ref
) {
  const containerRef = useRef(null);
  const sceneManagerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Three.js scene manager
    const manager = new ArcherySceneManager(containerRef.current, {
      playerColor,
      onFeedbackReady
    });
    sceneManagerRef.current = manager;

    return () => {
      if (sceneManagerRef.current) {
        sceneManagerRef.current.dispose();
        sceneManagerRef.current = null;
      }
    };
  }, []);

  // Update player color if prop changes
  useEffect(() => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setPlayerColor(playerColor);
    }
  }, [playerColor]);

  // Expose imperative control methods for parent game controller / dev controls
  useImperativeHandle(ref, () => ({
    shoot: (outcome, difference, color = playerColor) => {
      if (sceneManagerRef.current) {
        sceneManagerRef.current.triggerShot(outcome, difference, color);
      }
    },
    reset: () => {
      if (sceneManagerRef.current) {
        sceneManagerRef.current.resetScene();
      }
    },
    setPlayerColor: (color) => {
      if (sceneManagerRef.current) {
        sceneManagerRef.current.setPlayerColor(color);
      }
    }
  }));

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
    />
  );
});

export default ArcheryArena;
