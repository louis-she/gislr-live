import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path, { resolve } from "path";
import fs from "fs";


function mediapipe_workaround() {
  return {
    name: "mediapipe_workaround",
    load(id) {
      if (path.basename(id) === "holistic.js") {
        let code = fs.readFileSync(id, "utf-8")
        code += "exports.Holistic = Holistic;"
        code += "exports.VERSION = VERSION;"
        code += "exports.POSE_LANDMARKS = POSE_LANDMARKS;"
        code += "exports.HAND_CONNECTIONS = HAND_CONNECTIONS;"
        return { code }
      } else if (path.basename(id) === "drawing_utils.js") {
        let code = fs.readFileSync(id)
        code += "exports.drawConnectors = drawConnectors;"
        code += "exports.drawLandmarks = drawLandmarks;"
        code += "exports.lerp = lerp;"
        return { code }
      } else if (path.basename(id) === "control_utils.js") {
        let code = fs.readFileSync(id, "utf-8")
        code += "exports.ControlPanel = ControlPanel;"
        code += "exports.SourcePicker = SourcePicker;"
        return { code }
      } else {
        return null
      }
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [mediapipe_workaround(), react()],
  define: {
    "process.env": {},
  },
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, "src/lib.jsx"),
      name: "components",
      // the proper extensions will be added
      fileName: "components",
    },
  },
});
