import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { ArcherySceneManager } from '../three/scene/archerySceneManager.js';

/**
 * Reusable Archery Arena 3D Component for NumHunt 2.0.
 * Supports onImpact callback fired when the arrow strikes its destination.
 */
const ArcheryArena = forwardRef(function ArcheryArena(
  {
    playerColor = 'Red',
    onImpact,
    style = {},
    className = ''
  },
  ref
) {
  const containerRef = useRef(null);
  const sceneManagerRef = useRef(null);
  const onImpactRef = useRef(onImpact);

  // Keep latest onImpact callback reference fresh
  useEffect(() => {
    onImpactRef.current = onImpact;
  }, [onImpact]);

  useEffect(() => {
    if (!containerRef.current) return;

    const manager = new ArcherySceneManager(containerRef.current, {
      playerColor,
      onImpact: (shotData) => {
        if (onImpactRef.current) {
          onImpactRef.current(shotData);
        }
      }
    });
    sceneManagerRef.current = manager;

    return () => {
      if (sceneManagerRef.current) {
        sceneManagerRef.current.dispose();
        sceneManagerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setPlayerColor(playerColor);
    }
  }, [playerColor]);

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
