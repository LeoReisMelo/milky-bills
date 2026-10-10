
import { FooterContainer } from "./Footer.styles";

export function Footer() {
  return (
    <FooterContainer>
      <span>© {new Date().getFullYear()} Milky Bills</span>
      <span>Personal Finance, Simplified.</span>
    </FooterContainer>
  );
}