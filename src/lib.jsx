import SignLanguageRecognition from "./sign-language-recognition";
import * as ReactDOM from "react-dom/client";
import "./index.css"

class SignLanguageRecognitionElement extends HTMLElement {
  connectedCallback() {
    this.root = ReactDOM.createRoot(this);
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
