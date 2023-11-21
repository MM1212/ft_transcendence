import { SvgIcon, SvgIconProps } from '@mui/joy';

export default function Logo42Icon(props: SvgIconProps): JSX.Element {
  return (
    <SvgIcon {...props} viewBox="0 -200 960 960">
      <polygon
        id="polygon5"
        points="32,412.6 362.1,412.6 362.1,578 526.8,578 526.8,279.1 197.3,279.1 526.8,-51.1 362.1,-51.1   32,279.1 "
      />
      <polygon id="polygon7" points="597.9,114.2 762.7,-51.1 597.9,-51.1 " />
      <polygon
        id="polygon9"
        points="762.7,114.2 597.9,279.1 597.9,443.9 762.7,443.9 762.7,279.1 928,114.2 928,-51.1 762.7,-51.1 "
      />
      <polygon id="polygon11" points="928,279.1 762.7,443.9 928,443.9 " />
    </SvgIcon>
  );
}
