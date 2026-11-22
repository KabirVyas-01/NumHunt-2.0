import React, { useRef, useState } from 'react';
import ArcheryArena from '../components/ArcheryArena';

/**
 * HomeScreen for Stage 2 prototype displaying the live 3D Archery Arena
 * along with temporary developer controls to test outcomes and impact elevations.
 */
export default function HomeScreen() {
  const arenaRef = useRef(null);
  const [selectedColor, setSelectedColor] = useState('Red');
  const [differenceOffset, setDifferenceOffset] = useState(25);
  const [lastFeedback, setLastFeedback] = useState(null);

  const colors = [
    { name: 'Red', label: 'P1 Red', hex: '#EF4444' },
    { name: 'Green', label: 'P2 Green', hex: '#10B981' },
    { name: 'Blue', label: 'P3 Blue', hex: '#3B82F6' },
    { name: 'Yellow', label: 'P4 Yellow', hex: '#F59E0B' }
  ];

  const handleShoot = (outcome) => {
    let diff = 0;
    if (outcome === 'higher') diff = Number(differenceOffset) || 25;
    if (outcome === 'lower') diff = -(Number(differenceOffset) || 25);
    if (outcome === 'correct') diff = 0;

    if (arenaRef.current) {
      arenaRef.current.shoot(outcome, diff, selectedColor);
    }
  };

  const handleReset = () => {
    if (arenaRef.current) {
      arenaRef.current.reset();
    }
    setLastFeedback(null);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#0a0d14',
      color: '#f3f4f6'
    }}>
      {/* Top Header */}
      <header style={{
        padding: '1rem 1.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            margin: 0,
            background: 'linear-gradient(135deg, #ffffff 40%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            NumHunt 2.0
          </h1>
          <span style={{
            padding: '0.2rem 0.6rem',
            borderRadius: '999px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase'
          }}>
            Stage 2: 3D Archery Prototype
          </span>
        </div>

        {/* Player Colour Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Archer Accent:</span>
          {colors.map(c => (
            <button
              key={c.name}
              onClick={() => setSelectedColor(c.name)}
              style={{
                backgroundColor: selectedColor === c.name ? c.hex : 'rgba(255, 255, 255, 0.06)',
                color: selectedColor === c.name ? '#ffffff' : '#94a3b8',
                border: `1px solid ${selectedColor === c.name ? c.hex : 'rgba(255, 255, 255, 0.15)'}`,
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
      </header>

      {/* Main 3D Canvas Area */}
      <div style={{
        flex: 1,
        position: 'relative',
        width: '100%',
        minHeight: '480px',
        backgroundColor: '#05070a'
      }}>
        <ArcheryArena
          ref={arenaRef}
          playerColor={selectedColor}
          onFeedbackReady={(shot) => setLastFeedback(shot)}
        />

        {/* Feedback Banner Overlay */}
        {lastFeedback && (
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '0.6rem 1.5rem',
            borderRadius: '8px',
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            border: `1px solid ${
              lastFeedback.outcome === 'correct' ? '#10b981' :
              lastFeedback.outcome === 'higher' ? '#ef4444' : '#3b82f6'
            }`,
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '1rem',
            letterSpacing: '0.04em',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            zIndex: 5
          }}>
            {lastFeedback.outcome === 'correct' && '🎯 BULLSEYE! Correct Hit!'}
            {lastFeedback.outcome === 'higher' && `🏹 HIGHER! (Diff: +${lastFeedback.difference}) - Hit Above Bullseye`}
            {lastFeedback.outcome === 'lower' && `🏹 LOWER! (Diff: ${lastFeedback.difference}) - Hit Below Bullseye`}
          </div>
        )}
      </div>

      {/* Developer Controls Bar (outside canvas) */}
      <footer style={{
        padding: '1.25rem 2rem',
        background: '#0d1117',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '0.8rem',
            color: '#64748b',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Developer Shot Controls:
          </span>

          <button
            onClick={() => handleShoot('higher')}
            style={{
              padding: '0.6rem 1.2rem',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            Shoot Higher (Above)
          </button>

          <button
            onClick={() => handleShoot('correct')}
            style={{
              padding: '0.6rem 1.2rem',
              backgroundColor: '#059669',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            Shoot Correct (Bullseye)
          </button>

          <button
            onClick={() => handleShoot('lower')}
            style={{
              padding: '0.6rem 1.2rem',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            Shoot Lower (Below)
          </button>

          <button
            onClick={handleReset}
            style={{
              padding: '0.6rem 1.2rem',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: '#94a3b8',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            Reset Scene
          </button>
        </div>

        {/* Difference offset test slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Impact Offset Diff: <strong style={{ color: '#ffffff' }}>{differenceOffset}</strong>
          </label>
          <input
            type="range"
            min="5"
            max="500"
            step="5"
            value={differenceOffset}
            onChange={(e) => setDifferenceOffset(Number(e.target.value))}
            style={{ width: '130px', cursor: 'pointer' }}
          />
        </div>
      </footer>
    </div>
  );
}
