import { ImageResponse } from 'next/og'
 
// Route segment config
export const runtime = 'edge'
 
// Image metadata
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'
 
// Image generation
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          color: 'white',
        }}
      >
        <div
          style={{
            fontSize: 120,
            background: 'rgba(255, 255, 255, 0.1)',
            width: 200,
            height: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            marginBottom: 40,
            fontWeight: 'bold',
          }}
        >
          S
        </div>
        <div style={{ fontSize: 80, fontWeight: 'bold', marginBottom: 20 }}>
          SENIAT DataFiscal
        </div>
        <div style={{ fontSize: 40, opacity: 0.8 }}>
          Sistema de Gestión Fiscal
        </div>
      </div>
    ),
    // ImageResponse options
    {
      // For convenience, we can re-use the exported icons size metadata
      // config to also set the ImageResponse's width and height.
      ...size,
    }
  )
} 