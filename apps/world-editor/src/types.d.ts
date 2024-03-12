import { Editor } from "./engine/editor";

declare global {
  interface Window {
    editor?: Editor;
  }
}
