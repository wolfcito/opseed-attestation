export function BadFrame() {
  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        backgroundColor: 'white',
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <img
        src="https://res.cloudinary.com/guffenix/image/upload/f_auto,q_auto/v1/optimism/initialbg"
        alt="bgattestation"
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.2,
        }}
      />

      <div
        style={{
          fontSize: '48px',
          fontWeight: 'bold',
          margin: '32px 52px 0px 52px',
        }}
      >
        Stay Optimistic
      </div>
      <div
        style={{
          fontSize: '32px',
          color: '#374151',
          margin: '32px 52px 0px 52px',
        }}
      >
        You don't have any attestations yet.
      </div>
    </div>
  )
}
