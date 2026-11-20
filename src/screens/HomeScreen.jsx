import React from 'react';

/**
 * Temporary Home Screen placeholder for NumHunt 2.0 foundation.
 * Full screen designs & state management will follow in subsequent stages.
 */
export default function HomeScreen() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <div style={{
        maxWidth: '680px',
        padding: '2.5rem',
        borderRadius: '16px',
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{
          display: 'inline-block',
          padding: '0.35rem 1rem',
          borderRadius: '999px',
          background: 'rgba(239, 68, 68, 0.15)',
          color: '#f87171',
          fontSize: '0.85rem',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: '1rem',
          border: '1px solid rgba(239, 68, 68, 0.3)'
        }}>
          Foundation Setup
        </div>

        <h1 style={{
          fontSize: '3rem',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          margin: '0.5rem 0',
          background: 'linear-gradient(135deg, #ffffff 40%, #9ca3af 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          NumHunt 2.0
        </h1>

        <p style={{
          fontSize: '1.15rem',
          color: '#9ca3af',
          margin: '1rem 0 2rem',
          lineHeight: 1.6
        }}>
          Cinematic 3D Archery-Themed Number Guessing Game.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginTop: '1.5rem',
          textAlign: 'left'
        }}>
          <div style={{
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <div style={{ fontSize: '0.8rem', color: '#6b7280', textTransform: 'uppercase' }}>Mode 1</div>
            <div style={{ fontWeight: 600, marginTop: '0.25rem' }}>Single Player</div>
            <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Levels 1 & 2</div>
          </div>

          <div style={{
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <div style={{ fontSize: '0.8rem', color: '#6b7280', textTransform: 'uppercase' }}>Mode 2</div>
            <div style={{ fontWeight: 600, marginTop: '0.25rem' }}>Tournament</div>
            <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>2–4 Player Pass & Play</div>
          </div>

          <div style={{
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <div style={{ fontSize: '0.8rem', color: '#6b7280', textTransform: 'uppercase' }}>Mode 3</div>
            <div style={{ fontWeight: 600, marginTop: '0.25rem' }}>Head-to-Head Duel</div>
            <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>1v1 Secret PVP</div>
          </div>
        </div>

        <div style={{
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          fontSize: '0.85rem',
          color: '#6b7280'
        }}>
          Three.js Scene Engine &bull; React UI &bull; Vitest Suite Verified
        </div>
      </div>
    </div>
  );
}
