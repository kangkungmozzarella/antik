import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

// Puding, the Puding theme's own character: a custard pudding with a caramel cap.
// Its colours are part of the character, so they do not follow the theme tokens.
const ink = '#4a3424';

export function Mascot({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessible={false}>
      <Ellipse cx={50} cy={87} rx={40} ry={7} fill="#ffffff" stroke={ink} strokeWidth={3} />
      <Path d="M24 84C22 70 26 48 32 36Q50 28 68 36C74 48 78 70 76 84Q50 90 24 84Z" fill="#ffd76a" stroke={ink} strokeWidth={3} strokeLinejoin="round" />
      <Path d="M32 36Q50 26 68 36C70 42 66 47 62 44C58 50 54 44 50 47C46 51 42 45 38 47C33 49 30 43 32 36Z" fill="#b8621b" stroke={ink} strokeWidth={3} strokeLinejoin="round" />
      <Ellipse cx={42} cy={35} rx={4} ry={1.8} fill="#ffffff" opacity={0.55} />
      <Ellipse cx={41} cy={62} rx={3} ry={4} fill={ink} />
      <Ellipse cx={59} cy={62} rx={3} ry={4} fill={ink} />
      <Circle cx={42} cy={60.5} r={1} fill="#ffffff" />
      <Circle cx={60} cy={60.5} r={1} fill="#ffffff" />
      <Ellipse cx={33} cy={69} rx={5} ry={3} fill="#ff9fb0" opacity={0.8} />
      <Ellipse cx={67} cy={69} rx={5} ry={3} fill="#ff9fb0" opacity={0.8} />
      <Path d="M46 68Q50 72 54 68" fill="none" stroke={ink} strokeWidth={2.5} strokeLinecap="round" />
    </Svg>
  );
}
