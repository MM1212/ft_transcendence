import { Typography } from '@mui/joy';
import publicPath from '@utils/public';

export default function LobbyPongButton({
  label,
  src,
}: {
  label: string;
  src: string;
}) {
  return (
    <>
      <img
        src={publicPath(src)}
        alt={src}
        width="200" // Specify the desired width
        height="70" // Specify the desired height
      />
      <Typography
        component="span"
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontWeight: 'bold',
          fontFamily: 'chivo',
          fontSize: '0.8rem',
          width: '100%',
          textAlign: 'center',
        }}
        textTransform="uppercase"
      >
        {label}
      </Typography>
    </>
  );
}
