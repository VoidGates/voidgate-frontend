import markUrl from '../assets/logo-mark.svg'
import wordUrl from '../assets/logo-word.svg'

type LogoProps = {
  size?: 'nav' | 'footer'
}

export function Logo({ size = 'nav' }: LogoProps) {
  return (
    <span className={`logo logo--${size}`}>
      <img className="logo__mark" src={markUrl} alt="" />
      <img className="logo__word" src={wordUrl} alt="VoidGate" />
    </span>
  )
}
