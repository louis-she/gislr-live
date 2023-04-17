import SignLanguageRecognition from "./sign-language-recognition";
import * as ReactDOM from "react-dom/client";
import styles from "./index.css?inline";

class SignLanguageRecognitionElement extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.root = ReactDOM.createRoot(this.shadow);
    const styleSheet = new CSSStyleSheet();
    styleSheet.replaceSync(styles);
    this.shadow.adoptedStyleSheets = [styleSheet];
    this.root.render(<SignLanguageRecognition />);
  }

  disconnectedCallback() {
    this.root.unmount();
  }
}

window.customElements.define(
  "sign-language-recognition-element",
  SignLanguageRecognitionElement
);
